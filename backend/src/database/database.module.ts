import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Amenity } from "../modules/amenities/amenity.entity";
import { Boardroom } from "../modules/boardrooms/boardroom.entity";
import { Permission } from "../modules/permissions/permission.entity";
import { Role } from "../modules/roles/role.entity";
import { SystemSetting } from "../modules/system-settings/system-setting.entity";
import { User } from "../modules/users/user.entity";
import { StartupSeederService } from "./startup-seeder.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      User,
      Amenity,
      Boardroom,
      SystemSetting,
    ]),
  ],
  providers: [StartupSeederService],
})
export class DatabaseModule {}
