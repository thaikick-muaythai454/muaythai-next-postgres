-- Add slug auto-generation for gyms table

-- Function to generate slug from English name
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  slug := lower(text_input);
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug TEXT, gym_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  final_slug := base_slug;
  
  -- Check if slug exists (excluding current gym if updating)
  WHILE EXISTS (
    SELECT 1 FROM gyms 
    WHERE slug = final_slug 
    AND (gym_id IS NULL OR id != gym_id)
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate slug before insert/update
CREATE OR REPLACE FUNCTION auto_generate_gym_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
BEGIN
  -- Only generate if slug is empty or null
  -- and gym_name_english exists
  IF (NEW.slug IS NULL OR NEW.slug = '') AND NEW.gym_name_english IS NOT NULL AND NEW.gym_name_english != '' THEN
    base_slug := generate_slug(NEW.gym_name_english);
    NEW.slug := ensure_unique_slug(base_slug, NEW.id);
  -- If gym_name_english is empty but gym_name exists, use gym_name as fallback
  ELSIF (NEW.slug IS NULL OR NEW.slug = '') AND NEW.gym_name IS NOT NULL THEN
    base_slug := generate_slug(NEW.gym_name);
    NEW.slug := ensure_unique_slug(base_slug, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_generate_gym_slug ON gyms;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_gym_slug
  BEFORE INSERT OR UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_gym_slug();

-- Update existing gyms to have slugs
UPDATE gyms 
SET slug = ensure_unique_slug(
  generate_slug(
    COALESCE(gym_name_english, gym_name)
  ),
  id
)
WHERE slug IS NULL OR slug = '';

-- Make slug NOT NULL after populating existing records
ALTER TABLE gyms 
ALTER COLUMN slug SET NOT NULL;

COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generates URL-friendly slug from input text';
COMMENT ON FUNCTION ensure_unique_slug(TEXT, UUID) IS 'Ensures slug is unique by appending counter if needed';
COMMENT ON FUNCTION auto_generate_gym_slug() IS 'Trigger function to auto-generate slug from gym_name_english or gym_name';

