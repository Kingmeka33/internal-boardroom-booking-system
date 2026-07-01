export enum NotificationType {
  BookingCreated = "BOOKING_CREATED",
  BookingApproved = "BOOKING_APPROVED",
  BookingRejected = "BOOKING_REJECTED",
  BookingCancelled = "BOOKING_CANCELLED",
  BookingReminder = "BOOKING_REMINDER",
  BookingUpdated = "BOOKING_UPDATED",
  BookingApprovalRequired = "BOOKING_APPROVAL_REQUIRED",
  FacilitiesRequest = "FACILITIES_REQUEST",
  RoomBlocked = "ROOM_BLOCKED",
  EmailFailed = "EMAIL_FAILED",
  EmailRetrying = "EMAIL_RETRYING",
  EmailSent = "EMAIL_SENT",
  SystemAnnouncement = "SYSTEM_ANNOUNCEMENT",
  Info = "INFO",
}

export enum NotificationTokenPlatform {
  Web = "WEB",
  Mobile = "MOBILE",
}

export enum NotificationTokenProvider {
  WebPush = "WEB_PUSH",
  Expo = "EXPO",
  Fcm = "FCM",
}
