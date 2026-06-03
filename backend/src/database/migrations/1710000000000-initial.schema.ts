import { MigrationInterface, QueryRunner } from "typeorm";
export class InitialSchema1710000000000 implements MigrationInterface {
  name = "InitialSchema1710000000000";
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(
      `CREATE TABLE IF NOT EXISTS roles(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),name varchar UNIQUE NOT NULL,description varchar,"isSystemRole" boolean DEFAULT false)`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS permissions(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),code varchar UNIQUE NOT NULL,description varchar)`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS role_permissions("rolesId" uuid REFERENCES roles(id) ON DELETE CASCADE,"permissionsId" uuid REFERENCES permissions(id) ON DELETE CASCADE,PRIMARY KEY("rolesId","permissionsId"))`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS users(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),"firstName" varchar NOT NULL,"lastName" varchar NOT NULL,email varchar UNIQUE NOT NULL,password varchar NOT NULL,"phoneNumber" varchar,department varchar,"jobTitle" varchar,"roleId" uuid REFERENCES roles(id),"isActive" boolean DEFAULT true,"refreshTokenHash" varchar,"createdAt" timestamptz DEFAULT now(),"updatedAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS boardrooms(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),name varchar NOT NULL,code varchar UNIQUE NOT NULL,description varchar,location varchar NOT NULL,floor varchar,building varchar,capacity int NOT NULL,"imageUrl" varchar,"isActive" boolean DEFAULT true,"isBookable" boolean DEFAULT true,"requiresApproval" boolean DEFAULT false,"openingTime" varchar DEFAULT '08:00',"closingTime" varchar DEFAULT '17:00',"minimumBookingMinutes" int DEFAULT 15,"maximumBookingMinutes" int DEFAULT 240,"bufferTimeBeforeMinutes" int DEFAULT 0,"bufferTimeAfterMinutes" int DEFAULT 0,"createdAt" timestamptz DEFAULT now(),"updatedAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS amenities(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),name varchar UNIQUE NOT NULL,description varchar,icon varchar,"isActive" boolean DEFAULT true,"createdAt" timestamptz DEFAULT now(),"updatedAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS boardroom_amenities("boardroomsId" uuid REFERENCES boardrooms(id) ON DELETE CASCADE,"amenitiesId" uuid REFERENCES amenities(id) ON DELETE CASCADE,PRIMARY KEY("boardroomsId","amenitiesId"))`,
    );
    await q.query(
      `DO $$ BEGIN CREATE TYPE booking_status_enum AS ENUM('PENDING_APPROVAL','APPROVED','REJECTED','CANCELLED','COMPLETED','NO_SHOW'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS bookings(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),"boardroomId" uuid REFERENCES boardrooms(id),"bookedByUserId" uuid REFERENCES users(id),title varchar NOT NULL,description varchar,"startDateTime" timestamptz NOT NULL,"endDateTime" timestamptz NOT NULL,status booking_status_enum DEFAULT 'APPROVED',"meetingType" varchar,"attendeeCount" int NOT NULL,"requiresCatering" boolean DEFAULT false,"cateringNotes" varchar,"requiresSetup" boolean DEFAULT false,"setupNotes" varchar,"cancellationReason" varchar,"approvedByUserId" uuid REFERENCES users(id),"rejectedByUserId" uuid REFERENCES users(id),"rejectionReason" varchar,"approvedAt" timestamptz,"rejectedAt" timestamptz,"createdAt" timestamptz DEFAULT now(),"updatedAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS boardroom_blocks(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),"boardroomId" uuid REFERENCES boardrooms(id),reason varchar NOT NULL,"startDateTime" timestamptz NOT NULL,"endDateTime" timestamptz NOT NULL,"createdByUserId" uuid REFERENCES users(id),"isActive" boolean DEFAULT true,"createdAt" timestamptz DEFAULT now(),"updatedAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS notifications(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),"userId" uuid REFERENCES users(id),title varchar NOT NULL,message varchar NOT NULL,type varchar DEFAULT 'INFO',"isRead" boolean DEFAULT false,metadata jsonb,"createdAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS audit_logs(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),"actorUserId" varchar,action varchar NOT NULL,"entityName" varchar NOT NULL,"entityId" varchar,before jsonb,after jsonb,"ipAddress" varchar,"userAgent" varchar,"createdAt" timestamptz DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS system_settings(key varchar PRIMARY KEY,value varchar NOT NULL,description varchar)`,
    );

    await q.query(
      `INSERT INTO roles (name, description, "isSystemRole") VALUES
        ('EMPLOYEE', 'Standard internal user who books rooms.', true),
        ('FACILITIES_MANAGER', 'Operational user responsible for room readiness.', true),
        ('ADMIN', 'Business administrator for boardrooms and booking governance.', true),
        ('SUPER_ADMIN', 'System owner with full access.', true)
      ON CONFLICT (name) DO NOTHING`,
    );

    await q.query(
      `INSERT INTO system_settings (key, value, description) VALUES
        ('DEFAULT_MINIMUM_BOOKING_MINUTES', '15', 'Minimum allowed booking duration.'),
        ('DEFAULT_MAXIMUM_BOOKING_MINUTES', '240', 'Maximum allowed booking duration.'),
        ('ALLOW_WEEKEND_BOOKINGS', 'false', 'Controls weekend booking availability.'),
        ('ALLOW_AFTER_HOURS_BOOKINGS', 'false', 'Controls booking outside room operating hours.'),
        ('BOOKING_REMINDER_MINUTES_BEFORE', '15', 'Reminder timing before booking start.'),
        ('AUTO_COMPLETE_BOOKINGS', 'true', 'Automatically mark elapsed approved bookings as completed.'),
        ('AUTO_MARK_NO_SHOW', 'false', 'Future check-in based no-show automation option.'),
        ('REQUIRE_APPROVAL_FOR_EXTERNAL_MEETINGS', 'true', 'Approval rule for external meetings.')
      ON CONFLICT (key) DO NOTHING`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS idx_bookings_room_status ON bookings("boardroomId",status)`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings("startDateTime","endDateTime")`,
    );
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `DROP TABLE IF EXISTS system_settings,audit_logs,notifications,boardroom_blocks,bookings,boardroom_amenities,amenities,boardrooms,users,role_permissions,permissions,roles CASCADE`,
    );
    await q.query(`DROP TYPE IF EXISTS booking_status_enum`);
  }
}
