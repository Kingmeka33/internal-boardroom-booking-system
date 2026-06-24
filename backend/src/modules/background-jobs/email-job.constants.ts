export enum EmailQueueName {
  Email = "email",
}

export enum EmailJobName {
  RunReminderCycle = "RUN_REMINDER_CYCLE",
  SendDueBookingReminders = "SEND_DUE_BOOKING_REMINDERS",
  ProcessQueuedEmails = "PROCESS_QUEUED_EMAILS",
  RetryDueFailures = "RETRY_DUE_FAILURES",
}
