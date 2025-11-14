-- =============================================
-- Gym Gallery Management System
-- =============================================
-- This migration creates a dedicated gallery system for gym images
-- with support for featured images, ordering, and metadata

-- Create gym_gallery table
CREATE TABLE IF NOT EXISTS gym_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase storage for deletion
  title TEXT,
  description TEXT,
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  file_size INTEGER, -- In bytes
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT valid_mime_type CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gym_gallery_gym_id ON gym_gallery(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_gallery_featured ON gym_gallery(gym_id, is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_gym_gallery_order ON gym_gallery(gym_id, display_order);
CREATE INDEX IF NOT EXISTS idx_gym_gallery_created_at ON gym_gallery(created_at DESC);

-- Enable RLS
ALTER TABLE gym_gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow public to view images
CREATE POLICY "Public can view gym gallery images"
  ON gym_gallery FOR SELECT
  TO public
  USING (true);

-- Allow gym owners to insert images
CREATE POLICY "Gym owners can insert gallery images"
  ON gym_gallery FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = gym_gallery.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

-- Allow gym owners to update their images
CREATE POLICY "Gym owners can update gallery images"
  ON gym_gallery FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = gym_gallery.gym_id
      AND gyms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = gym_gallery.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

-- Allow gym owners to delete their images
CREATE POLICY "Gym owners can delete gallery images"
  ON gym_gallery FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = gym_gallery.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

-- Allow admins full access
CREATE POLICY "Admins have full access to gallery"
  ON gym_gallery FOR ALL
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

-- Create function to ensure only one featured image per gym
CREATE OR REPLACE FUNCTION ensure_single_featured_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting an image as featured
  IF NEW.is_featured = true THEN
    -- Unset other featured images for this gym
    UPDATE gym_gallery
    SET is_featured = false
    WHERE gym_id = NEW.gym_id
      AND id != NEW.id
      AND is_featured = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for featured image management
CREATE TRIGGER trigger_ensure_single_featured_image
  BEFORE INSERT OR UPDATE ON gym_gallery
  FOR EACH ROW
  WHEN (NEW.is_featured = true)
  EXECUTE FUNCTION ensure_single_featured_image();

-- Create function to automatically set display_order
CREATE OR REPLACE FUNCTION set_gallery_display_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If display_order is not set, set it to max + 1
  IF NEW.display_order = 0 OR NEW.display_order IS NULL THEN
    NEW.display_order := COALESCE(
      (SELECT MAX(display_order) + 1 FROM gym_gallery WHERE gym_id = NEW.gym_id),
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic display_order
CREATE TRIGGER trigger_set_gallery_display_order
  BEFORE INSERT ON gym_gallery
  FOR EACH ROW
  EXECUTE FUNCTION set_gallery_display_order();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gym_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_gym_gallery_updated_at
  BEFORE UPDATE ON gym_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_gym_gallery_updated_at();

-- Create view for gallery with gym info
CREATE OR REPLACE VIEW gym_gallery_with_gym AS
SELECT 
  gg.*,
  g.gym_name,
  g.slug,
  g.status as gym_status
FROM gym_gallery gg
JOIN gyms g ON g.id = gg.gym_id
ORDER BY gg.gym_id, gg.display_order;

-- Grant access to view
GRANT SELECT ON gym_gallery_with_gym TO authenticated, anon;

-- Add comment
COMMENT ON TABLE gym_gallery IS 'Stores individual gym images with metadata for gallery management';
COMMENT ON COLUMN gym_gallery.is_featured IS 'Only one image per gym should be featured at a time';
COMMENT ON COLUMN gym_gallery.display_order IS 'Order in which images are displayed (lower numbers first)';
COMMENT ON COLUMN gym_gallery.storage_path IS 'Full path in Supabase storage for cleanup';

