import { BadRequestException } from "@nestjs/common";

export class FluentValidator {
  private readonly errors: string[] = [];

  require(condition: boolean, message: string): this {
    if (!condition) this.errors.push(message);
    return this;
  }

  requireValue(value: unknown, message: string): this {
    return this.require(value !== undefined && value !== null && value !== "", message);
  }

  requireDateOrder(start: Date, end: Date, message: string): this {
    return this.require(!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start, message);
  }

  throwIfInvalid(): void {
    if (this.errors.length > 0) {
      throw new BadRequestException(this.errors);
    }
  }
}
