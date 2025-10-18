-- Script to manually update gym slugs
-- This is useful if you need to regenerate slugs for existing gyms

-- Update all gyms that don't have slugs yet
UPDATE gyms 
SET slug = NULL
WHERE slug IS NULL OR slug = '';

-- The trigger will automatically generate slugs on the next update
UPDATE gyms
SET updated_at = NOW()
WHERE slug IS NULL OR slug = '';

-- Verify all gyms have slugs
SELECT 
  id,
  gym_name,
  gym_name_english,
  slug,
  CASE 
    WHEN slug IS NULL OR slug = '' THEN '❌ Missing'
    ELSE '✓ Has slug'
  END as slug_status
FROM gyms
ORDER BY created_at DESC;

