-- ---
-- Event Waitlist System
-- Migration: 20251219000001_event_waitlist.sql
-- Creates waitlist table for users to join when tickets are sold out
-- ---

-- Create event_waitlist table
CREATE TABLE IF NOT EXISTS event_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES event_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Waitlist details
  ticket_count INTEGER NOT NULL DEFAULT 1 CHECK (ticket_count > 0),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'purchased', 'cancelled', 'expired')),
  
  -- Notification tracking
  notified_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE, -- When waitlist entry expires (e.g., 24 hours after notification)
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT check_waitlist_dates CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_waitlist_event ON event_waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_ticket ON event_waitlist(ticket_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_user ON event_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_status ON event_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_waiting ON event_waitlist(event_id, ticket_id, status, created_at) 
  WHERE status = 'waiting'; -- For efficient queue processing

-- Unique partial index: One active waitlist entry per user per ticket
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_waitlist_unique_user_ticket 
  ON event_waitlist(user_id, ticket_id) 
  WHERE status = 'waiting';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_event_waitlist_updated_at
  BEFORE UPDATE ON event_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_event_waitlist_updated_at();

-- Function to get next user in waitlist queue
CREATE OR REPLACE FUNCTION get_next_waitlist_user(
  p_ticket_id UUID,
  p_ticket_count INTEGER
)
RETURNS TABLE (
  waitlist_id UUID,
  user_id UUID,
  ticket_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ew.id,
    ew.user_id,
    ew.ticket_count,
    ew.created_at
  FROM event_waitlist ew
  WHERE ew.ticket_id = p_ticket_id
    AND ew.status = 'waiting'
    AND ew.ticket_count <= p_ticket_count
  ORDER BY ew.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
  ON event_waitlist FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own waitlist entries
CREATE POLICY "Users can create own waitlist entries"
  ON event_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own waitlist entries
CREATE POLICY "Users can update own waitlist entries"
  ON event_waitlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own waitlist entries
CREATE POLICY "Users can delete own waitlist entries"
  ON event_waitlist FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all waitlist entries (for cron jobs, notifications)
CREATE POLICY "Service role can manage all waitlist entries"
  ON event_waitlist FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE event_waitlist IS 'Waitlist for event tickets when sold out';
COMMENT ON COLUMN event_waitlist.status IS 'waiting: in queue, notified: user notified of availability, purchased: user purchased tickets, cancelled: user cancelled, expired: notification expired';
COMMENT ON COLUMN event_waitlist.expires_at IS 'When waitlist entry expires (typically 24 hours after notification)';

