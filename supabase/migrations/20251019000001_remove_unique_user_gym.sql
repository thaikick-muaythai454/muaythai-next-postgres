-- Remove unique constraint that prevents one user from having multiple gyms
-- This allows system user to create multiple approved gyms for display
ALTER TABLE gyms DROP CONSTRAINT IF EXISTS unique_user_gym;

COMMENT ON TABLE gyms IS 'Gyms table - users can own multiple gyms (constraint removed)';
