// Database Types
// ประเภทข้อมูลสำหรับ Database Tables ของ MUAYTHAI Platform

export interface Profile {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// User Roles Table
export interface UserRole {
  user_id: string;
  role: 'authenticated' | 'partner' | 'admin';
  created_at: string;
  updated_at: string;
}

// Gyms Table (Partner Applications)
export interface Gym {
  id: string;
  user_id: string;
  gym_name: string;
  gym_name_english?: string;
  contact_name: string;
  phone: string;
  email: string;
  website?: string;
  location: string;
  address?: string;
  gym_details?: string;
  services: string[];
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  rating?: number;
  latitude?: number;
  longitude?: number;
  map_url?: string;
  socials?: string;
  gym_type?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

// Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

