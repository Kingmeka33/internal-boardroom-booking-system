# Internal Boardroom Booking System

Requirements-aligned implementation based on the delivery brief.

## Stack
- NestJS backend
- Angular frontend
- PostgreSQL database
- TypeORM migrations
- JWT access + refresh token structure
- Role and permission controls
- Audit logging
- In-app notifications
- Dashboard/reporting foundations

## Backend modules
- Auth
- Users
- Roles
- Permissions
- Boardrooms
- Amenities
- Bookings
- Boardroom Blocks
- Notifications
- Audit Logs
- Dashboard
- System Settings
- Shared guards, decorators, filters, interceptors and utilities

## Start locally

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev
```

```bash
cd frontend
npm install
npm start
```

Swagger: `http://localhost:3000/api`
Frontend: `http://localhost:4200`

## Default seeded roles
- EMPLOYEE
- FACILITIES_MANAGER
- ADMIN
- SUPER_ADMIN

## Notes
This project implements the required architecture, entities, endpoints, validation rules and frontend shell. External integrations such as Outlook/Google Calendar, Teams, QR check-in and kiosk screens remain deferred enhancements as described in the brief.

## Step 5 Final Additions

This version includes notifications, audit logging, dashboard reporting, and system settings.

### Important Commands

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

```bash
cd frontend
npm install
npm start
```

### Local URLs

```text
Backend Swagger: http://localhost:3000/api
Frontend: http://localhost:4200
```

