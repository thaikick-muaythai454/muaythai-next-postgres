-- Add phone column to profiles table
-- Migration: 20251020000000_add_phone_to_profiles.sql

-- Add phone column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Add comment
COMMENT ON COLUMN profiles.phone IS 'User phone number';

-- Update the handle_new_user function to include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with phone number
  INSERT INTO public.profiles (user_id, username, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create user_role with default 'authenticated' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'authenticated');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

