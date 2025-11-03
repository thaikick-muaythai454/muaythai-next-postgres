// Email Utilities Barrel Export
export { 
  sendContactEmail, 
  sendWelcomeEmail,
  isEmailServiceConfigured,
  getEmailServiceStatus,
  type ContactEmailData,
  // Verification Emails (Resend)
  sendVerificationEmail as sendVerificationEmailResend,
  type VerificationEmailData,
  // Booking Emails
  sendBookingConfirmationEmail,
  sendBookingReminderEmail,
  type BookingConfirmationData,
  type BookingReminderData,
  // Payment Emails
  sendPaymentReceiptEmail,
  sendPaymentFailedEmail,
  type PaymentReceiptData,
  type PaymentFailedData,
  // Partner Emails
  sendPartnerApprovalEmail,
  sendPartnerRejectionEmail,
  type PartnerApprovalData,
  type PartnerRejectionData,
  // Admin Alerts
  sendAdminAlertEmail,
  type AdminAlertData,
} from './resend';

// SMTP Email Service
export {
  sendVerificationEmail,
  isSmtpConfigured,
  getSmtpStatus,
} from './smtp';

// Email Templates (for reference/testing)
export * from './templates';
