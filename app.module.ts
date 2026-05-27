import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BoardroomBlocksModule } from "./modules/boardroom-blocks/boardroom-blocks.module";
import { BoardroomsModule } from "./modules/boardrooms/boardrooms.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AmenitiesModule } from "./modules/amenities/amenities.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SystemSettingsModule } from "./modules/system-settings/system-settings.module";
import { UsersModule } from "./modules/users/users.module";
import { DatabaseModule } from "./database/database.module";
import { JwtAuthGuard } from "./shared/guards/jwt-auth.guard";
import { RolesGuard } from "./shared/guards/roles.guard";
import * as Joi from "joi";
import { ConfigService } from "@nestjs/config";
 
@Module({
  imports: [
    ConfigModule.forRoot({
  envFilePath: ".env.example",
  isGlobal: true,
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },
  validationSchema: Joi.object({
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
 
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
 
    JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
 
    FRONTEND_URL: Joi.string().required(),
  }),
}),
 
    TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: "postgres",
    host: configService.get<string>("DATABASE_HOST"),
    port: configService.get<number>("DATABASE_PORT"),
    username: configService.get<string>("DATABASE_USER"),
    password: configService.get<string>("DATABASE_PASSWORD"),
    database: configService.get<string>("DATABASE_NAME"),
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: true,
    migrations: [__dirname + "/database/migrations/*{.ts,.js}"],
  }),
}),
 
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    BoardroomsModule,
    AmenitiesModule,
    BookingsModule,
    BoardroomBlocksModule,
    NotificationsModule,
    AuditLogsModule,
    DashboardModule,
    SystemSettingsModule,
  ],
 
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
 
export class AppModule {}
 