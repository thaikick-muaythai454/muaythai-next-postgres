-- Create gym packages and pricing system
-- Migration: 20251020000001_create_gym_packages.sql

-- Create gym_packages table
CREATE TABLE IF NOT EXISTS gym_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  
  -- Package type: 'one_time' (รายครั้ง) หรือ 'package' (แพ็คเกจ)
  package_type TEXT NOT NULL CHECK (package_type IN ('one_time', 'package')),
  
  -- Package details
  name TEXT NOT NULL,
  name_english TEXT,
  description TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  
  -- Duration (NULL สำหรับ one_time, 1/3/6 สำหรับ package)
  duration_months INTEGER CHECK (duration_months IN (1, 3, 6)),
  
  -- Features (JSON array)
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT valid_package_duration CHECK (
    (package_type = 'one_time' AND duration_months IS NULL) OR
    (package_type = 'package' AND duration_months IS NOT NULL)
  )
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES gym_packages(id) ON DELETE RESTRICT,
  
  -- Booking details
  booking_number TEXT UNIQUE NOT NULL,
  
  -- Contact info (snapshot at time of booking)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Booking dates
  start_date DATE NOT NULL,
  end_date DATE, -- NULL สำหรับ one_time
  
  -- Pricing snapshot
  price_paid DECIMAL(10,2) NOT NULL,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  duration_months INTEGER,
  
  -- Special requests
  special_requests TEXT,
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  payment_method TEXT,
  payment_id TEXT, -- Stripe payment intent ID
  
  -- Booking status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'completed')
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gym_packages_gym_id ON gym_packages(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_packages_type ON gym_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_gym_packages_active ON gym_packages(is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_gym_id ON bookings(gym_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  new_number := 'BK' || year_month || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Check if exists, regenerate if needed
  WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_number = new_number) LOOP
    new_number := 'BK' || year_month || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_gym_packages_updated_at
  BEFORE UPDATE ON gym_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for gym_packages
ALTER TABLE gym_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packages
CREATE POLICY "anyone_can_view_active_packages"
  ON gym_packages FOR SELECT
  TO public
  USING (is_active = true);

-- Gym owners can manage their packages
CREATE POLICY "gym_owners_can_manage_packages"
  ON gym_packages FOR ALL
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

-- Admins can manage all packages
CREATE POLICY "admins_can_manage_all_packages"
  ON gym_packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "users_can_view_own_bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "users_can_create_bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Gym owners can view bookings for their gyms
CREATE POLICY "gym_owners_can_view_gym_bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all bookings
CREATE POLICY "admins_can_manage_all_bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON gym_packages TO authenticated, anon;
GRANT INSERT, UPDATE ON gym_packages TO authenticated;

GRANT SELECT, INSERT ON bookings TO authenticated;
GRANT UPDATE ON bookings TO authenticated;

-- Comments
COMMENT ON TABLE gym_packages IS 'Stores gym pricing packages (one-time and subscription packages)';
COMMENT ON TABLE bookings IS 'Stores user bookings for gym sessions and packages';
COMMENT ON COLUMN gym_packages.package_type IS 'Type: one_time (per session) or package (monthly subscription)';
COMMENT ON COLUMN gym_packages.duration_months IS 'Package duration: 1, 3, or 6 months. NULL for one_time';
COMMENT ON COLUMN bookings.booking_number IS 'Unique booking reference number (format: BKYYYYMMXXXX)';

