import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Amenity } from "../modules/amenities/amenity.entity";
import { AuditLog } from "../modules/audit-logs/audit-log.entity";
import { BoardroomBlock } from "../modules/boardroom-blocks/boardroom-block.entity";
import { Boardroom } from "../modules/boardrooms/boardroom.entity";
import { Booking } from "../modules/bookings/booking.entity";
import { Notification } from "../modules/notifications/notification.entity";
import { Permission } from "../modules/permissions/permission.entity";
import { Role } from "../modules/roles/role.entity";
import { SystemSetting } from "../modules/system-settings/system-setting.entity";
import { User } from "../modules/users/user.entity";

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "boardroom_password",
  database: process.env.DATABASE_NAME || "boardroom_booking_db",
  entities: [
    User,
    Role,
    Permission,
    Boardroom,
    Amenity,
    Booking,
    BoardroomBlock,
    Notification,
    AuditLog,
    SystemSetting,
  ],
  migrations: ["src/database/migrations/*.ts"],
});
