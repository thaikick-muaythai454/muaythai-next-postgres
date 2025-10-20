-- Migration: Add RLS policy for partners to update bookings of their gyms
-- Created: 2025-10-20

-- Partners (gym owners) can update bookings for their gyms
CREATE POLICY "gym_owners_can_update_gym_bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON POLICY "gym_owners_can_update_gym_bookings" ON bookings 
  IS 'Allows gym owners (partners) to update booking status and other details for their gym';

