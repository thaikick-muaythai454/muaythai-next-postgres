import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Validate file before upload
 */
export const validateFile = (file: File): string | null => {
  // Check file type (jpg, jpeg, png only)
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(file.type)) {
    return `${file.name}: ไฟล์ต้องเป็น JPG หรือ PNG เท่านั้น`;
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return `${file.name}: ขนาดไฟล์เกิน 5MB`;
  }

  return null;
};

/**
 * Upload gym images to Supabase Storage
 * Returns array of public URLs for uploaded images
 */
export const uploadImages = async (
  supabase: SupabaseClient,
  files: File[],
  userId: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    try {
      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage bucket 'gym-images'
      const { error } = await supabase.storage
        .from("gym-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from("gym-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    } catch {
      throw new Error("การอัปโหลดรูปภาพล้มเหลว");
    }
  }

  return uploadedUrls;
};

