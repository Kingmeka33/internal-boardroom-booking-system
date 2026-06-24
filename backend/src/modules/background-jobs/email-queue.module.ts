import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { EmailQueueName } from "./email-job.constants";

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST") || "localhost",
          port: Number(config.get<string>("REDIS_PORT") || 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: EmailQueueName.Email,
    }),
  ],
  exports: [BullModule],
})
export class EmailQueueModule {}
