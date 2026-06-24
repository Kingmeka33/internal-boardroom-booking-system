import dataSource from "../data-source";
import * as bcrypt from "bcrypt";

async function seed() {
  await dataSource.initialize();

  await dataSource.query(`
    INSERT INTO roles(name, description, "isSystemRole") VALUES
    ('EMPLOYEE', 'Standard internal user who books rooms', true),
    ('FACILITIES_MANAGER', 'Operational user responsible for room readiness', true),
    ('ADMIN', 'Business administrator for boardroom governance', true),
    ('SUPER_ADMIN', 'System owner with full access', true)
    ON CONFLICT(name) DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO permissions(code, description) VALUES
    ('BOARDROOM_VIEW', 'View active boardrooms'),
    ('BOOKING_CREATE_OWN', 'Create own booking'),
    ('BOOKING_CANCEL_OWN', 'Cancel own booking'),
    ('BOOKING_VIEW_ALL', 'View all bookings'),
    ('BOOKING_APPROVE_REJECT', 'Approve or reject bookings'),
    ('BOARDROOM_MANAGE', 'Manage boardrooms'),
    ('USER_MANAGE', 'Manage users and roles'),
    ('AUDIT_VIEW', 'View audit logs'),
    ('SETTINGS_MANAGE', 'Manage system settings')
    ON CONFLICT(code) DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO amenities(name, description, icon) VALUES
    ('Projector', 'Room has projector', 'projector'),
    ('TV', 'Room has TV screen', 'tv'),
    ('Whiteboard', 'Room has whiteboard', 'edit'),
    ('Video Conferencing', 'Video conferencing available', 'video'),
    ('Wi-Fi', 'Wireless internet available', 'wifi'),
    ('Sound System', 'Room has sound system', 'speaker')
    ON CONFLICT(name) DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO system_settings(key, value, description) VALUES
    ('DEFAULT_MINIMUM_BOOKING_MINUTES', '15', 'Minimum allowed booking duration'),
    ('DEFAULT_MAXIMUM_BOOKING_MINUTES', '240', 'Maximum allowed booking duration'),
    ('ALLOW_WEEKEND_BOOKINGS', 'false', 'Controls weekend booking availability'),
    ('ALLOW_AFTER_HOURS_BOOKINGS', 'false', 'Controls booking outside room operating hours'),
    ('BOOKING_REMINDER_MINUTES_BEFORE', '15', 'Reminder timing before booking start'),
    ('AUTO_COMPLETE_BOOKINGS', 'true', 'Automatically mark elapsed approved bookings as completed'),
    ('AUTO_MARK_NO_SHOW', 'false', 'Future option for check-in based no-show automation'),
    ('REQUIRE_APPROVAL_FOR_EXTERNAL_MEETINGS', 'true', 'Approval rule for external meetings')
    ON CONFLICT(key) DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO boardrooms(name, code, description, location, floor, building, capacity, "requiresApproval") VALUES
    ('Executive Boardroom', 'BR-EXEC', 'Executive meeting room with video conferencing', 'Main Office', '5', 'HQ', 16, true),
    ('Training Room', 'BR-TRAIN', 'Large training room for workshops and team sessions', 'Main Office', '2', 'HQ', 30, false),
    ('Small Meeting Room', 'BR-SMALL', 'Small meeting room for quick team sessions', 'Main Office', '1', 'HQ', 6, false)
    ON CONFLICT(code) DO NOTHING
  `);

  const roles = await dataSource.query(`SELECT id, name FROM roles`);
  const roleMap = Object.fromEntries(
    roles.map((r: { id: string; name: string }) => [r.name, r.id]),
  );

  const users = [
    ["System", "Admin", "admin@company.com", "SUPER_ADMIN"],
    ["Business", "Admin", "business.admin@company.com", "ADMIN"],
    ["Facilities", "Manager", "facilities@company.com", "FACILITIES_MANAGER"],
    ["Demo", "Employee", "employee@company.com", "EMPLOYEE"],
  ];

  const password = await bcrypt.hash("Admin@12345", 10);

  for (const [firstName, lastName, email, roleName] of users) {
    await dataSource.query(
      `
        INSERT INTO users("firstName", "lastName", email, password, department, "jobTitle", "roleId", "isActive")
        VALUES ($1, $2, $3, $4, 'Operations', $5, $6, true)
        ON CONFLICT(email) DO NOTHING
      `,
      [
        firstName,
        lastName,
        email,
        password,
        `${roleName} User`,
        roleMap[roleName],
      ],
    );
  }

  await dataSource.destroy();
  console.log(
    "Seed completed successfully. Default password for demo users: Admin@12345",
  );
}

seed().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
