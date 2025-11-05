-- Partner Promotions Support
-- Migration: 20251209000000_partner_promotions.sql
-- Allows partners to create promotions for their gym bookings
-- ---
-- PART 1: ADD GYM_ID TO PROMOTIONS TABLE
-- ---
-- Add gym_id column to promotions table (nullable - for admin promotions)
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_promotions_gym_id ON promotions(gym_id) WHERE gym_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN promotions.gym_id IS 'Reference to gym for partner promotions. NULL for admin-created promotions.';
-- ---
-- PART 2: UPDATE RLS POLICIES
-- ---
-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can manage promotions" ON promotions;

-- Policy: Everyone can view active promotions
-- (Keep existing policy, already exists)
-- Policy: Admins can manage all promotions
CREATE POLICY "admins_can_manage_all_promotions"
  ON promotions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy: Partners can create promotions for their own gym
CREATE POLICY "partners_can_create_own_gym_promotions"
  ON promotions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = promotions.gym_id
      AND gyms.user_id = auth.uid()
      AND gyms.status = 'approved'
    )
  );

-- Policy: Partners can view their own gym promotions
CREATE POLICY "partners_can_view_own_gym_promotions"
  ON promotions
  FOR SELECT
  TO authenticated
  USING (
    gym_id IS NULL OR -- Admin promotions (visible to everyone if active)
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = promotions.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

-- Policy: Partners can update their own gym promotions
CREATE POLICY "partners_can_update_own_gym_promotions"
  ON promotions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = promotions.gym_id
      AND gyms.user_id = auth.uid()
      AND gyms.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = promotions.gym_id
      AND gyms.user_id = auth.uid()
      AND gyms.status = 'approved'
    )
  );

-- Policy: Partners can delete their own gym promotions
CREATE POLICY "partners_can_delete_own_gym_promotions"
  ON promotions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = promotions.gym_id
      AND gyms.user_id = auth.uid()
    )
  );
-- ---
-- PART 3: UPDATE GRANTS
-- ---
-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON promotions TO authenticated;
-- ---
-- PART 4: ADD COMMENTS
-- ---
COMMENT ON TABLE promotions IS 'Promotions for marquee and banner displays. Can be created by admins (gym_id = NULL) or partners (gym_id = their gym)';
