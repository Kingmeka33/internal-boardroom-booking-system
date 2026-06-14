# Internal Boardroom Booking System

A full-stack enterprise boardroom booking and facilities management system built with **NestJS**, **Angular**, **PostgreSQL**, and **TypeORM**. The application enables employees to reserve boardrooms, manage bookings, handle approval workflows, track room availability, receive notifications, and maintain complete audit trails across the organization.

---

# Overview

The Internal Boardroom Booking System streamlines the process of reserving meeting rooms and managing facilities resources within an organization.

The platform provides:

- Secure authentication and authorization
- Boardroom management
- Booking management
- Approval workflows
- Facilities management
- Notification system
- Email delivery tracking
- Audit logging
- Administrative dashboards
- Role-based access control

---

# Features

## Authentication & Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected API Endpoints
- Password Hashing
- User Session Management
- Permission-Based Access

### Supported Roles

- Super Admin
- Admin
- Facilities Manager
- Employee

---

## Boardroom Management

- Create Boardrooms
- Update Boardrooms
- Delete Boardrooms
- View Boardroom Availability
- Configure Capacity
- Manage Amenities
- Room Status Management

---

## Booking Management

- Create Bookings
- Update Bookings
- Cancel Bookings
- Approve Bookings
- Reject Bookings
- Booking Validation
- Conflict Detection
- Recurring Bookings Support

---

## Facilities Management

- Manage Amenities
- Block Room Availability
- Maintenance Scheduling
- Room Status Monitoring

---

## Notification System

- In-App Notifications
- Booking Notifications
- Approval Notifications
- Cancellation Notifications
- Operational Alerts

---

## Email Delivery System

The application includes a custom email delivery service supporting:

### Mailjet Integration

- Email Sending
- Delivery Tracking
- Retry Mechanism
- Error Handling

### SMTP Support

- SMTP Authentication
- Secure TLS Connections
- Manual SMTP Communication

### Email Features

- Booking Confirmations
- Booking Cancellations
- Approval Notifications
- Rejection Notifications
- Retry Failed Emails
- Delivery Auditing

---

## Audit Logging

Every critical action is recorded including:

- Login Activity
- Booking Actions
- Approval Actions
- Email Delivery Events
- User Management Activities
- Administrative Actions

---

# Technology Stack

## Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication
- Swagger

## Frontend

- Angular
- TypeScript
- Angular Router
- Angular Services
- Reactive Forms

## Infrastructure

- PostgreSQL
- Mailjet
- SMTP
- Docker (Optional)

---

# System Architecture

```text
Angular Frontend
       │
       ▼
NestJS REST API
       │
       ▼
Business Services
       │
       ▼
TypeORM Repositories
       │
       ▼
PostgreSQL Database
```

---

# Project Structure

```text
src/
│
├── auth/
├── users/
├── roles/
├── permissions/
├── boardrooms/
├── bookings/
├── amenities/
├── notifications/
├── email-delivery/
├── audit-logs/
├── dashboard/
├── settings/
│
├── app.module.ts
└── main.ts
```

---

# Email Delivery Flow

```text
Booking Created
       │
       ▼
sendBookingEmail()
       │
       ▼
Email Log Created
       │
       ▼
attemptDelivery()
       │
       ├── Mailjet
       │
       └── SMTP
       │
       ▼
SENT / FAILED
       │
       ▼
Audit Log Created
       │
       ▼
Admin Notification
```

---

# Database Entities

## Users

Stores application users and role assignments.

## Roles

Stores system roles.

## Permissions

Stores role permissions.

## Boardrooms

Stores meeting room information.

## Amenities

Stores available room amenities.

## Bookings

Stores booking information.

## Notifications

Stores system notifications.

## Audit Logs

Stores audit history.

## Email Delivery Logs

Stores email delivery attempts and status history.

---

# API Documentation

Swagger documentation is available after starting the backend:

```bash
http://localhost:3000/api
```

---

# Environment Variables

## Database

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=boardroom_db
```

## JWT

```env
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
```

## Email

```env
EMAIL_ENABLED=true

EMAIL_DELIVERY_MODE=mailjet

EMAIL_FROM=noreply@company.com

EMAIL_MAILJET_API_KEY=your_api_key

EMAIL_MAILJET_SECRET_KEY=your_secret_key

EMAIL_MAX_RETRIES=3

EMAIL_RETRY_DELAY_MINUTES=5
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-repository/internal-boardroom-booking-system.git

cd internal-boardroom-booking-system
```

---

## Install Backend Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create:

```env
.env
```

and populate the required variables.

---

## Run Database Migrations

```bash
npm run migration:run
```

---

## Start Backend

```bash
npm run start:dev
```

---

## Start Frontend

```bash
ng serve
```

Frontend:

```text
http://localhost:4200
```

Backend:

```text
http://localhost:3000
```

---

# Key Business Rules

### Booking Validation

- Start time must be before end time.
- Room must be available.
- Users cannot double-book the same room.
- Blocked rooms cannot be booked.

### Approval Workflow

- Pending
- Approved
- Rejected
- Cancelled

### Email Delivery

- Emails are logged before sending.
- Failed emails are retried automatically.
- Permanent failures are not retried.
- All delivery actions are audited.

---

# Security Features

- JWT Authentication
- Role-Based Authorization
- Password Hashing
- Protected Routes
- Audit Logging
- Email Validation
- SMTP TLS Support

---

# Future Enhancements

- Microsoft Outlook Integration
- Microsoft Teams Integration
- Calendar Synchronization
- Room Occupancy Analytics
- Mobile Application
- Multi-Branch Support
- Advanced Reporting

---

# Author

**Emeka Oramalu**

Junior Full-Stack Developer | Cloud & Software Engineering Enthusiast

Technologies:
- NestJS
- Angular
- PostgreSQL
- AWS
- TypeScript
- TypeORM

---
