import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Amenity } from "../modules/amenities/amenity.entity";
import { Boardroom } from "../modules/boardrooms/boardroom.entity";
import { Permission } from "../modules/permissions/permission.entity";
import { Role } from "../modules/roles/role.entity";
import { SystemSetting } from "../modules/system-settings/system-setting.entity";
import { User } from "../modules/users/user.entity";
import { RoleName } from "../shared/enums/role-name.enum";

/**
 * Seeds baseline records required for local testing and first startup.
 *
 * This fixes the registration issue where the backend expected an EMPLOYEE
 * role to already exist before a new employee could register.
 */
@Injectable()
export class StartupSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupSeederService.name);

  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissions: Repository<Permission>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Amenity) private readonly amenities: Repository<Amenity>,
    @InjectRepository(Boardroom)
    private readonly boardrooms: Repository<Boardroom>,
    @InjectRepository(SystemSetting)
    private readonly settings: Repository<SystemSetting>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedRoles();
    await this.seedPermissions();
    await this.seedSettings();
    await this.seedAmenities();
    await this.seedSampleBoardrooms();
    await this.seedTestUsers();

    this.logger.log("Baseline seed data verified successfully");
  }

  private async seedRoles(): Promise<void> {
    const roles = [
      {
        name: RoleName.EMPLOYEE,
        description: "Standard internal user who books rooms.",
      },
      {
        name: RoleName.FACILITIES_MANAGER,
        description: "Operational user responsible for room readiness.",
      },
      {
        name: RoleName.ADMIN,
        description: "Business administrator for boardrooms and governance.",
      },
      {
        name: RoleName.SUPER_ADMIN,
        description: "System owner with full access.",
      },
    ];

    for (const role of roles) {
      const existing = await this.roles.findOne({ where: { name: role.name } });

      if (!existing) {
        await this.roles.save(
          this.roles.create({
            ...role,
            isSystemRole: true,
          }),
        );
      }
    }
  }

  private async seedPermissions(): Promise<void> {
    const permissions = [
      "VIEW_BOARDROOMS",
      "CREATE_BOOKING",
      "EDIT_OWN_BOOKING",
      "CANCEL_OWN_BOOKING",
      "VIEW_ALL_BOOKINGS",
      "APPROVE_BOOKINGS",
      "CANCEL_ANY_BOOKING",
      "MANAGE_BOARDROOMS",
      "MANAGE_USERS",
      "VIEW_AUDIT_LOGS",
      "MANAGE_SETTINGS",
    ];

    for (const code of permissions) {
      const existing = await this.permissions.findOne({ where: { code } });

      if (!existing) {
        await this.permissions.save(
          this.permissions.create({
            code,
            description: code.replaceAll("_", " ").toLowerCase(),
          }),
        );
      }
    }
  }

  private async seedSettings(): Promise<void> {
    const settings = [
      {
        key: "DEFAULT_MINIMUM_BOOKING_MINUTES",
        value: "15",
        description: "Minimum allowed booking duration.",
      },
      {
        key: "DEFAULT_MAXIMUM_BOOKING_MINUTES",
        value: "240",
        description: "Maximum allowed booking duration.",
      },
      {
        key: "ALLOW_WEEKEND_BOOKINGS",
        value: "false",
        description: "Controls weekend booking availability.",
      },
      {
        key: "ALLOW_AFTER_HOURS_BOOKINGS",
        value: "false",
        description: "Controls booking outside room operating hours.",
      },
      {
        key: "BOOKING_REMINDER_MINUTES_BEFORE",
        value: "15",
        description: "Reminder timing before booking start.",
      },
      {
        key: "AUTO_COMPLETE_BOOKINGS",
        value: "true",
        description: "Automatically mark elapsed approved bookings as completed.",
      },
      {
        key: "AUTO_MARK_NO_SHOW",
        value: "false",
        description: "Future check-in based no-show automation option.",
      },
      {
        key: "REQUIRE_APPROVAL_FOR_EXTERNAL_MEETINGS",
        value: "true",
        description: "Approval rule for external meetings.",
      },
    ];

    for (const setting of settings) {
      const existing = await this.settings.findOne({
        where: { key: setting.key },
      });

      if (!existing) {
        await this.settings.save(this.settings.create(setting));
      }
    }
  }

  private async seedAmenities(): Promise<void> {
    const amenities = [
      ["Projector", "Room has a projector", "projector"],
      ["TV", "Room has a TV screen", "tv"],
      ["Whiteboard", "Room has a whiteboard", "edit"],
      ["Video Conferencing", "Room supports video conferencing", "video"],
      ["Wi-Fi", "Wireless internet available", "wifi"],
      ["Sound System", "Room has a sound system", "speaker"],
    ];

    for (const [name, description, icon] of amenities) {
      const existing = await this.amenities.findOne({ where: { name } });

      if (!existing) {
        await this.amenities.save(
          this.amenities.create({
            name,
            description,
            icon,
            isActive: true,
          }),
        );
      }
    }
  }

  private async seedSampleBoardrooms(): Promise<void> {
    const count = await this.boardrooms.count();

    if (count > 0) {
      return;
    }

    await this.boardrooms.save([
      this.boardrooms.create({
        name: "Executive Boardroom",
        code: "EXEC-01",
        description: "Large executive room for formal meetings.",
        location: "Head Office",
        floor: "5",
        building: "Main Building",
        capacity: 16,
        isActive: true,
        isBookable: true,
        requiresApproval: true,
        openingTime: "08:00",
        closingTime: "17:00",
        minimumBookingMinutes: 15,
        maximumBookingMinutes: 240,
        bufferTimeBeforeMinutes: 10,
        bufferTimeAfterMinutes: 10,
      }),
      this.boardrooms.create({
        name: "Collaboration Room",
        code: "COLLAB-01",
        description: "Medium room for team planning sessions.",
        location: "Head Office",
        floor: "2",
        building: "Main Building",
        capacity: 8,
        isActive: true,
        isBookable: true,
        requiresApproval: false,
        openingTime: "08:00",
        closingTime: "17:00",
        minimumBookingMinutes: 15,
        maximumBookingMinutes: 180,
        bufferTimeBeforeMinutes: 0,
        bufferTimeAfterMinutes: 0,
      }),
    ]);
  }

  private async seedTestUsers(): Promise<void> {
    const superAdminRole = await this.roles.findOne({
      where: { name: RoleName.SUPER_ADMIN },
    });

    const adminRole = await this.roles.findOne({
      where: { name: RoleName.ADMIN },
    });

    const facilitiesRole = await this.roles.findOne({
      where: { name: RoleName.FACILITIES_MANAGER },
    });

    const employeeRole = await this.roles.findOne({
      where: { name: RoleName.EMPLOYEE },
    });

    if (!superAdminRole || !adminRole || !facilitiesRole || !employeeRole) {
      return;
    }

    await this.createUserIfMissing({
      firstName: "System",
      lastName: "Admin",
      email: "admin@boardroom.com",
      password: "Admin123!",
      department: "Administration",
      jobTitle: "System Administrator",
      role: superAdminRole,
    });

    await this.createUserIfMissing({
      firstName: "Boardroom",
      lastName: "Admin",
      email: "boardroom.admin@boardroom.com",
      password: "Admin123!",
      department: "Administration",
      jobTitle: "Boardroom Administrator",
      role: adminRole,
    });

    await this.createUserIfMissing({
      firstName: "Facilities",
      lastName: "Manager",
      email: "facilities@boardroom.com",
      password: "Facilities123!",
      department: "Facilities",
      jobTitle: "Facilities Manager",
      role: facilitiesRole,
    });

    await this.createUserIfMissing({
      firstName: "Demo",
      lastName: "Employee",
      email: "employee@boardroom.com",
      password: "Employee123!",
      department: "Operations",
      jobTitle: "Coordinator",
      role: employeeRole,
    });
  }

  private async createUserIfMissing(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department: string;
    jobTitle: string;
    role: Role;
  }): Promise<void> {
    const existing = await this.users.findOne({ where: { email: input.email } });

    if (existing) {
      return;
    }

    await this.users.save(
      this.users.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: await bcrypt.hash(input.password, 10),
        department: input.department,
        jobTitle: input.jobTitle,
        role: input.role,
        isActive: true,
      }),
    );
  }
}
