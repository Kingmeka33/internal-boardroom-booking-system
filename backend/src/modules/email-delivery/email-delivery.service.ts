import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as https from "https";
import * as net from "net";
import * as tls from "tls";
import { LessThanOrEqual, Repository } from "typeorm";
import { AuditLog } from "../audit-logs/audit-log.entity";
import { Notification } from "../notifications/notification.entity";
import { User } from "../users/user.entity";
import { EmailDeliveryConfigurationResponseDto } from "./dto/email-delivery-configuration-response.dto";
import { EmailDeliveryLogResponseDto } from "./dto/email-delivery-log-response.dto";
import { EmailDeliveryLog } from "./email-delivery-log.entity";

type BookingEmailInput = {
  recipient?: string;
  recipientName?: string;
  subject: string;
  body: string;
  type: string;
  metadata?: Record<string, unknown>;
};

const MAILJET_SECRET_PLACEHOLDERS = [
  "REPLACE_WITH_MAILJET_SECRET_KEY",
  "REPLACE_WITH_YOUR_MAILJET_SECRET_KEY",
  "MAILJET_SECRET_KEY_HERE",
];

const SENDER_PLACEHOLDERS = [
  "boardroom-system@localhost",
  "REPLACE_WITH_VERIFIED_MAILJET_SENDER_EMAIL",
];

@Injectable()
export class EmailDeliveryService {
  private readonly logger = new Logger(EmailDeliveryService.name);

  constructor(
    @InjectRepository(EmailDeliveryLog)
    private readonly logs: Repository<EmailDeliveryLog>,
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async findAll(query: Record<string, string> = {}): Promise<EmailDeliveryLogResponseDto[]> {
    const qb = this.logs
      .createQueryBuilder("email")
      .orderBy("email.createdAt", "DESC");

    if (query.status) qb.andWhere("email.status = :status", { status: query.status });
    if (query.type) qb.andWhere("email.type = :type", { type: query.type });
    if (query.recipient) {
      qb.andWhere("email.recipient ILIKE :recipient", {
        recipient: `%${query.recipient}%`,
      });
    }

    return EmailDeliveryLogResponseDto.collection(await qb.getMany());
  }

  configurationStatus(): EmailDeliveryConfigurationResponseDto {
    const enabled = this.emailEnabled();
    const mode = this.deliveryMode();
    const fromAddress = this.fromAddress();
    const apiKeyConfigured = Boolean(this.mailjetApiKey());
    const secretKeyConfigured = this.hasRealMailjetSecret();
    const fromAddressLooksValid = this.looksLikeEmail(fromAddress);
    const issues: string[] = [];

    if (!enabled) {
      issues.push("EMAIL_ENABLED is not true, so emails are only recorded in the database.");
    }

    if (mode === "mailjet") {
      if (!apiKeyConfigured) {
        issues.push("EMAIL_MAILJET_API_KEY is missing.");
      }
      if (!secretKeyConfigured) {
        issues.push("EMAIL_MAILJET_SECRET_KEY is missing or still set to the placeholder.");
      }
      if (!fromAddressLooksValid || SENDER_PLACEHOLDERS.includes(fromAddress)) {
        issues.push(
          "EMAIL_FROM must be a real sender email address that is verified in Mailjet.",
        );
      }
    }

    if (mode === "smtp" && !this.config.get<string>("EMAIL_SMTP_HOST")) {
      issues.push("EMAIL_SMTP_HOST is required when EMAIL_DELIVERY_MODE=smtp.");
    }

    return {
      enabled,
      mode,
      fromAddress,
      fromAddressLooksValid,
      apiKeyConfigured,
      secretKeyConfigured,
      deliveryReady: issues.length === 0,
      issues,
    };
  }

  async sendBookingEmail(input: BookingEmailInput): Promise<EmailDeliveryLogResponseDto | null> {
    if (!input.recipient) return null;

    const log = await this.logs.save(
      this.logs.create({
        recipient: input.recipient,
        recipientName: input.recipientName,
        subject: input.subject,
        body: input.body,
        type: input.type,
        status: "PENDING",
        attempts: 0,
        metadata: input.metadata,
        nextAttemptAt: new Date(),
      }),
    );

    return EmailDeliveryLogResponseDto.fromEntity(await this.attemptDelivery(log.id));
  }

  async retryFailed(
    id: string,
    actor?: User | null,
  ): Promise<EmailDeliveryLogResponseDto> {
    const log = await this.logs.findOne({ where: { id } });
    if (!log) throw new NotFoundException("Email delivery log not found");
    if (log.status === "SENT") {
      throw new BadRequestException("This email has already been sent");
    }

    await this.recordEmailAudit(actor, "EMAIL_DELIVERY_RETRY_REQUESTED", log, {
      previousStatus: log.status,
      previousAttempts: log.attempts,
      lastError: log.lastError,
    });
    await this.notifyOperationalUsers(
      "Email resend requested",
      `A resend was requested for ${log.type} to ${log.recipient}.`,
      "EMAIL_DELIVERY_RETRY_REQUESTED",
      {
        emailDeliveryLogId: log.id,
        recipient: log.recipient,
        type: log.type,
        requestedByUserId: actor?.id,
      },
    );

    log.status = "PENDING";
    log.nextAttemptAt = new Date();
    await this.logs.save(log);
    const retried = await this.attemptDelivery(id, actor);

    await this.notifyOperationalUsers(
      retried.status === "SENT" ? "Email resend succeeded" : "Email resend failed",
      `${retried.type} resend to ${retried.recipient} finished with status ${retried.status}.`,
      retried.status === "SENT"
        ? "EMAIL_DELIVERY_RETRY_SUCCEEDED"
        : "EMAIL_DELIVERY_RETRY_FAILED",
      {
        emailDeliveryLogId: retried.id,
        recipient: retried.recipient,
        type: retried.type,
        status: retried.status,
        lastError: retried.lastError,
      },
    );

    return EmailDeliveryLogResponseDto.fromEntity(retried);
  }

  async retryDueFailures(actor?: User | null): Promise<EmailDeliveryLogResponseDto[]> {
    const due = await this.logs.find({
      where: {
        status: "FAILED",
        nextAttemptAt: LessThanOrEqual(new Date()),
      },
      order: { createdAt: "ASC" },
    });

    const retried: EmailDeliveryLog[] = [];
    for (const log of due) {
      if (log.attempts < this.maxRetries()) {
        await this.recordEmailAudit(actor, "EMAIL_DELIVERY_RETRY_REQUESTED", log, {
          previousStatus: log.status,
          previousAttempts: log.attempts,
          lastError: log.lastError,
          retrySource: actor ? "manual" : "automatic",
        });
        await this.notifyOperationalUsers(
          "Email retry started",
          `${log.type} to ${log.recipient} is being retried.`,
          "EMAIL_DELIVERY_RETRY_REQUESTED",
          {
            emailDeliveryLogId: log.id,
            recipient: log.recipient,
            type: log.type,
            retrySource: actor ? "manual" : "automatic",
            requestedByUserId: actor?.id,
          },
        );
        retried.push(await this.attemptDelivery(log.id, actor));
      }
    }

    return EmailDeliveryLogResponseDto.collection(retried);
  }

  async hasDeliveryForMetadata(
    type: string,
    key: string,
    value: string,
  ): Promise<boolean> {
    const count = await this.logs
      .createQueryBuilder("email")
      .where("email.type = :type", { type })
      .andWhere("email.status IN (:...statuses)", {
        statuses: ["PENDING", "SENT"],
      })
      .andWhere(`email.metadata ->> :key = :value`, { key, value })
      .getCount();
    return count > 0;
  }

  async hasAnyDeliveryForMetadata(
    type: string,
    key: string,
    value: string,
  ): Promise<boolean> {
    const count = await this.logs
      .createQueryBuilder("email")
      .where("email.type = :type", { type })
      .andWhere(`email.metadata ->> :key = :value`, { key, value })
      .getCount();
    return count > 0;
  }

  private async attemptDelivery(
    id: string,
    actor?: User | null,
  ): Promise<EmailDeliveryLog> {
    const log = await this.logs.findOne({ where: { id } });
    if (!log) throw new NotFoundException("Email delivery log not found");

    log.attempts += 1;

    try {
      if (!this.emailEnabled()) {
        log.status = "SENT";
        log.sentAt = new Date();
        log.lastError = undefined;
        log.nextAttemptAt = undefined;
        log.metadata = {
          ...(log.metadata || {}),
          deliveryMode: "disabled-log",
          note: "EMAIL_ENABLED is not true, so this delivery was recorded only.",
        };
        const saved = await this.logs.save(log);
        await this.recordEmailAudit(actor, "EMAIL_DELIVERY_RECORDED_ONLY", saved, {
          reason: "EMAIL_ENABLED is not true",
        });
        return saved;
      }

      const mode = this.deliveryMode();
      if (mode === "mailjet") {
        await this.sendViaMailjet(log);
        log.status = "SENT";
        log.sentAt = new Date();
        log.lastError = undefined;
        log.nextAttemptAt = undefined;
        log.metadata = { ...(log.metadata || {}), deliveryMode: mode };
        const saved = await this.logs.save(log);
        await this.recordEmailAudit(actor, "EMAIL_DELIVERY_SENT", saved);
        return saved;
      }

      if (mode !== "smtp") {
        log.status = "SENT";
        log.sentAt = new Date();
        log.lastError = undefined;
        log.nextAttemptAt = undefined;
        log.metadata = { ...(log.metadata || {}), deliveryMode: mode };
        const saved = await this.logs.save(log);
        await this.recordEmailAudit(actor, "EMAIL_DELIVERY_SENT", saved);
        return saved;
      }

      await this.sendViaSmtp(log);
      log.status = "SENT";
      log.sentAt = new Date();
      log.lastError = undefined;
      log.nextAttemptAt = undefined;
      const saved = await this.logs.save(log);
      await this.recordEmailAudit(actor, "EMAIL_DELIVERY_SENT", saved);
      return saved;
    } catch (error) {
      log.status = "FAILED";
      log.lastError = error instanceof Error ? error.message : String(error);
      log.nextAttemptAt =
        log.attempts < this.maxRetries()
          ? new Date(Date.now() + this.retryDelayMinutes() * 60000)
          : undefined;
      const saved = await this.logs.save(log);
      await this.recordEmailAudit(actor, "EMAIL_DELIVERY_FAILED", saved, {
        error: saved.lastError,
      });
      await this.notifyOperationalUsers(
        "Email delivery failed",
        `${saved.type} to ${saved.recipient} failed: ${saved.lastError}`,
        "EMAIL_DELIVERY_FAILED",
        {
          emailDeliveryLogId: saved.id,
          recipient: saved.recipient,
          type: saved.type,
          status: saved.status,
          attempts: saved.attempts,
          lastError: saved.lastError,
          nextAttemptAt: saved.nextAttemptAt,
        },
      );
      return saved;
    }
  }

  private async sendViaMailjet(log: EmailDeliveryLog): Promise<void> {
    const apiKey = this.mailjetApiKey();
    const secretKey = this.mailjetSecretKey();
    const from = this.fromAddress();
    const fromName =
      this.config.get<string>("EMAIL_FROM_NAME") || "Internal Boardroom Booking";

    if (!apiKey) {
      throw new Error("EMAIL_MAILJET_API_KEY is required when EMAIL_DELIVERY_MODE=mailjet");
    }
    if (!secretKey || MAILJET_SECRET_PLACEHOLDERS.includes(secretKey)) {
      throw new Error("EMAIL_MAILJET_SECRET_KEY is required when EMAIL_DELIVERY_MODE=mailjet");
    }
    if (!this.looksLikeEmail(from) || SENDER_PLACEHOLDERS.includes(from)) {
      throw new Error(
        "EMAIL_FROM must be a real sender email address that is verified in Mailjet",
      );
    }

    const body = JSON.stringify({
      Messages: [
        {
          From: {
            Email: from,
            Name: fromName,
          },
          To: [
            {
              Email: log.recipient,
              Name: log.recipientName || log.recipient,
            },
          ],
          Subject: log.subject,
          TextPart: log.body,
        },
      ],
    });

    const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
    const responseBody = await this.sendHttpsRequest(
      {
        hostname: "api.mailjet.com",
        path: "/v3.1/send",
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      body,
    );
    this.assertMailjetSuccess(responseBody);
  }

  private sendHttpsRequest(
    options: https.RequestOptions,
    body: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let responseBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          const statusCode = response.statusCode || 0;
          if (statusCode >= 200 && statusCode < 300) {
            resolve(responseBody);
            return;
          }
          reject(
            new Error(
              `Mailjet returned HTTP ${statusCode}: ${responseBody || response.statusMessage}`,
            ),
          );
        });
      });

      request.setTimeout(15000, () => {
        request.destroy(new Error("Mailjet request timed out"));
      });
      request.on("error", reject);
      request.write(body);
      request.end();
    });
  }

  private assertMailjetSuccess(responseBody: string): void {
    if (!responseBody) return;
    try {
      const parsed = JSON.parse(responseBody) as {
        Messages?: Array<{
          Status?: string;
          Errors?: Array<{ ErrorMessage?: string; ErrorCode?: string }>;
        }>;
      };
      const failed = (parsed.Messages || []).find(
        (message) => message.Status && message.Status !== "success",
      );
      if (!failed) return;

      const errorText = (failed.Errors || [])
        .map((error) => error.ErrorMessage || error.ErrorCode)
        .filter(Boolean)
        .join("; ");
      throw new Error(`Mailjet delivery failed: ${errorText || failed.Status}`);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Mailjet")) {
        throw error;
      }
    }
  }

  private async sendViaSmtp(log: EmailDeliveryLog): Promise<void> {
    const host = this.config.get<string>("EMAIL_SMTP_HOST");
    const from = this.config.get<string>("EMAIL_FROM") || "boardroom-system@localhost";
    if (!host) {
      throw new Error("EMAIL_SMTP_HOST is required when EMAIL_ENABLED=true");
    }

    const secure = this.booleanEnv("EMAIL_SMTP_SECURE", false);
    const port = Number(this.config.get<string>("EMAIL_SMTP_PORT")) || (secure ? 465 : 25);
    const username = this.config.get<string>("EMAIL_SMTP_USER");
    const password = this.config.get<string>("EMAIL_SMTP_PASSWORD");

    const socket = await this.openSmtpSocket(host, port, secure);
    try {
      await this.readSmtpResponse(socket, [220]);
      await this.smtpCommand(socket, `EHLO ${this.config.get<string>("EMAIL_SMTP_HELO") || "localhost"}`, [250]);

      if (username && password) {
        await this.smtpCommand(socket, "AUTH LOGIN", [334]);
        await this.smtpCommand(socket, Buffer.from(username).toString("base64"), [334]);
        await this.smtpCommand(socket, Buffer.from(password).toString("base64"), [235]);
      }

      await this.smtpCommand(socket, `MAIL FROM:<${from}>`, [250]);
      await this.smtpCommand(socket, `RCPT TO:<${log.recipient}>`, [250, 251]);
      await this.smtpCommand(socket, "DATA", [354]);
      socket.write(`${this.formatMessage(from, log)}\r\n.\r\n`);
      await this.readSmtpResponse(socket, [250]);
      await this.smtpCommand(socket, "QUIT", [221]);
    } finally {
      socket.end();
    }
  }

  private openSmtpSocket(
    host: string,
    port: number,
    secure: boolean,
  ): Promise<net.Socket | tls.TLSSocket> {
    return new Promise((resolve, reject) => {
      const socket = secure
        ? tls.connect({ host, port, servername: host })
        : net.connect({ host, port });
      socket.setEncoding("utf8");
      socket.setTimeout(15000);
      socket.once("connect", () => resolve(socket));
      socket.once("secureConnect", () => resolve(socket));
      socket.once("timeout", () => reject(new Error("SMTP connection timed out")));
      socket.once("error", reject);
    });
  }

  private smtpCommand(
    socket: net.Socket | tls.TLSSocket,
    command: string,
    expectedCodes: number[],
  ): Promise<string> {
    socket.write(`${command}\r\n`);
    return this.readSmtpResponse(socket, expectedCodes);
  }

  private readSmtpResponse(
    socket: net.Socket | tls.TLSSocket,
    expectedCodes: number[],
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer = "";
      const onData = (chunk: string | Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const finalLine = lines.find((line) => /^\d{3}\s/.test(line));
        if (!finalLine) return;

        socket.off("data", onData);
        socket.off("error", onError);
        const code = Number(finalLine.substring(0, 3));
        if (!expectedCodes.includes(code)) {
          reject(new Error(`SMTP returned ${finalLine}`));
          return;
        }
        resolve(buffer);
      };
      const onError = (error: Error) => {
        socket.off("data", onData);
        reject(error);
      };
      socket.on("data", onData);
      socket.once("error", onError);
    });
  }

  private formatMessage(from: string, log: EmailDeliveryLog): string {
    const safeSubject = log.subject.replace(/\r?\n/g, " ");
    return [
      `From: ${from}`,
      `To: ${log.recipient}`,
      `Subject: ${safeSubject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      log.body,
    ].join("\r\n");
  }

  private emailEnabled(): boolean {
    return this.booleanEnv("EMAIL_ENABLED", false);
  }

  private deliveryMode(): string {
    return (this.config.get<string>("EMAIL_DELIVERY_MODE") || "smtp").toLowerCase();
  }

  private fromAddress(): string {
    return this.config.get<string>("EMAIL_FROM") || "boardroom-system@localhost";
  }

  private mailjetApiKey(): string | undefined {
    return (
      this.config.get<string>("EMAIL_MAILJET_API_KEY") ||
      this.config.get<string>("MAILJET_API_KEY")
    );
  }

  private mailjetSecretKey(): string | undefined {
    return (
      this.config.get<string>("EMAIL_MAILJET_SECRET_KEY") ||
      this.config.get<string>("MAILJET_SECRET_KEY")
    );
  }

  private hasRealMailjetSecret(): boolean {
    const secret = this.mailjetSecretKey();
    return Boolean(secret && !MAILJET_SECRET_PLACEHOLDERS.includes(secret));
  }

  private looksLikeEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private async recordEmailAudit(
    actor: User | null | undefined,
    action: string,
    log: EmailDeliveryLog,
    extra?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.auditLogs.save(
        this.auditLogs.create({
          actorUserId: actor?.id,
          action,
          entityName: "EmailDeliveryLog",
          entityId: log.id,
          after: {
            recipient: log.recipient,
            subject: log.subject,
            type: log.type,
            status: log.status,
            attempts: log.attempts,
            lastError: log.lastError,
            nextAttemptAt: log.nextAttemptAt,
            sentAt: log.sentAt,
            metadata: log.metadata,
            ...(extra || {}),
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `Failed to record email audit log: ${error.message}`
          : "Failed to record email audit log",
      );
    }
  }

  private async notifyOperationalUsers(
    title: string,
    message: string,
    type: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const users = await this.users
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .where("role.name IN (:...roles)", {
          roles: ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"],
        })
        .andWhere("user.isActive = true")
        .getMany();

      for (const user of users) {
        await this.notifications.save(
          this.notifications.create({ user, title, message, type, metadata }),
        );
      }
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `Failed to create email delivery notification: ${error.message}`
          : "Failed to create email delivery notification",
      );
    }
  }

  private maxRetries(): number {
    return Number(this.config.get<string>("EMAIL_MAX_RETRIES")) || 3;
  }

  private retryDelayMinutes(): number {
    return Number(this.config.get<string>("EMAIL_RETRY_DELAY_MINUTES")) || 5;
  }

  private booleanEnv(key: string, fallback: boolean): boolean {
    const value = this.config.get<string>(key);
    if (value === undefined || value === null || value === "") return fallback;
    return ["true", "yes", "1"].includes(value.toLowerCase());
  }
}
