-- Add public-facing fields to gyms table for /gyms page
ALTER TABLE gyms
ADD COLUMN IF NOT EXISTS gym_name_english TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS map_url TEXT,
ADD COLUMN IF NOT EXISTS socials TEXT,
ADD COLUMN IF NOT EXISTS gym_type TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add check constraint for rating
ALTER TABLE gyms
ADD CONSTRAINT rating_range CHECK (rating >= 0 AND rating <= 5);

-- Create index for approved gyms
CREATE INDEX IF NOT EXISTS idx_gyms_approved ON gyms(status) WHERE status = 'approved';

-- Create index for slug
CREATE INDEX IF NOT EXISTS idx_gyms_slug ON gyms(slug);

COMMENT ON COLUMN gyms.gym_name_english IS 'English name of the gym for international visitors';
COMMENT ON COLUMN gyms.address IS 'Full address for public display';
COMMENT ON COLUMN gyms.rating IS 'Average rating out of 5';
COMMENT ON COLUMN gyms.latitude IS 'GPS latitude coordinate';
COMMENT ON COLUMN gyms.longitude IS 'GPS longitude coordinate';
COMMENT ON COLUMN gyms.map_url IS 'Google Maps or similar map URL';
COMMENT ON COLUMN gyms.socials IS 'Social media links (JSON or comma-separated)';
COMMENT ON COLUMN gyms.gym_type IS 'Type of gym (e.g., Professional, Beginner-Friendly, etc.)';
COMMENT ON COLUMN gyms.slug IS 'URL-friendly identifier for gym pages';
