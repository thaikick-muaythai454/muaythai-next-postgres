-- ---
-- Add event_reminder notification type
-- Migration: 20251219000000_add_event_reminder_notification_type.sql
-- Adds 'event_reminder' to the notifications type CHECK constraint
-- ---

-- Drop the existing CHECK constraint
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new CHECK constraint with event_reminder type
ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'booking_confirmation',
  'booking_reminder',
  'booking_cancelled',
  'payment_received',
  'payment_failed',
  'badge_earned',
  'level_up',
  'points_awarded',
  'challenge_complete',
  'promotion',
  'system',
  'partner_message',
  'content_flag',
  'event_reminder'
));

-- Add comment
COMMENT ON COLUMN notifications.type IS 'Notification type: booking_confirmation, booking_reminder, booking_cancelled, payment_received, payment_failed, badge_earned, level_up, points_awarded, challenge_complete, promotion, system, partner_message, content_flag, event_reminder';

