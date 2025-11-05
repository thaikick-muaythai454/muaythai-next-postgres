-- Booking Promotion Fields Migration
-- Migration: 20251105000001_booking_promotion_fields.sql
-- Adds promotion_id and discount_amount fields to bookings table
-- ---
-- PART 1: ADD PROMOTION FIELDS TO BOOKINGS TABLE
-- ---
-- Add promotion_id column (nullable - reference to promotions table)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL;

-- Add discount_amount column (nullable - amount discounted from original price)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) CHECK (discount_amount IS NULL OR discount_amount >= 0);

-- ---
-- PART 2: ADD INDEXES FOR PERFORMANCE
-- ---
-- Index for querying bookings by promotion
CREATE INDEX IF NOT EXISTS idx_bookings_promotion_id 
  ON bookings(promotion_id) 
  WHERE promotion_id IS NOT NULL;

-- ---
-- PART 3: ADD COMMENTS FOR DOCUMENTATION
-- ---
COMMENT ON COLUMN bookings.promotion_id IS 'Reference to promotion used for this booking. NULL if no promotion was used.';
COMMENT ON COLUMN bookings.discount_amount IS 'Amount discounted from original package price. NULL if no promotion was used.';

