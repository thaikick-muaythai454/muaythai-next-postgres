// @ts-nocheck
/**
 * Gallery Management - Upload & Display Test
 * 
 * Simple test to verify:
 * 1. Images can be uploaded to Supabase Storage
 * 2. Images can be saved to gym_gallery table
 * 3. Images can be retrieved and displayed
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test user credentials
const TEST_PARTNER_EMAIL = 'test_partner@muaythai.com';
const TEST_PARTNER_PASSWORD = 'password123';

describe('Gallery Management - Upload & Display', () => {
  let supabase;
  let testUserId;
  let testGymId;
  let uploadedImageIds = [];

  beforeAll(async () => {
    // Initialize Supabase client
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Sign in as partner
    console.log('\n🔐 Signing in as partner...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_PARTNER_EMAIL,
      password: TEST_PARTNER_PASSWORD,
    });

    if (signInError) {
      throw signInError;
    }

    testUserId = signInData.user.id;
    console.log('✅ Signed in successfully:', testUserId);

    // Get or create a test gym
    console.log('\n🏢 Getting test gym...');
    const { data: gyms } = await supabase
      .from('gyms')
      .select('id')
      .eq('user_id', testUserId)
      .limit(1);

    if (gyms && gyms.length > 0) {
      testGymId = gyms[0].id;
      console.log('✅ Using existing gym:', testGymId);
    } else {
      // Create test gym
      const { data: newGym } = await supabase
        .from('gyms')
        .insert({
          gym_name: 'Test Gallery Gym',
          contact_name: 'Test Contact',
          phone: '0801234567',
          email: TEST_PARTNER_EMAIL,
          location: 'Bangkok, Thailand',
          gym_details: 'Test gym for gallery',
          user_id: testUserId,
          status: 'approved',
        })
        .select()
        .single();

      testGymId = newGym.id;
      console.log('✅ Created test gym:', testGymId);
    }
  });

  afterAll(async () => {
    // Clean up: Delete uploaded test images
    if (uploadedImageIds.length > 0) {
      console.log('\n🧹 Cleaning up test images...');
      
      for (const imageId of uploadedImageIds) {
        try {
          // Get image to get storage path
          const { data: image } = await supabase
            .from('gym_gallery')
            .select('storage_path')
            .eq('id', imageId)
            .single();

          if (image?.storage_path) {
            // Delete from storage
            await supabase.storage
              .from('gym-images')
              .remove([image.storage_path]);
          }

          // Delete from database
          await supabase
            .from('gym_gallery')
            .delete()
            .eq('id', imageId);

          console.log(`✅ Deleted image: ${imageId}`);
        } catch (error) {
          console.error(`❌ Error deleting image ${imageId}:`, error);
        }
      }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out\n');
  });

  describe('Upload & Display Workflow', () => {
    test('should upload a single image and save to gallery', async () => {
      console.log('\n📤 Testing single image upload...');

      // Create a simple test image (1x1 red pixel PNG)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');
      
      // 1. Upload to Supabase Storage
      const fileName = `${testUserId}/${Date.now()}-single-test.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gym-images')
        .upload(fileName, testImageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      expect(uploadError).toBeNull();
      expect(uploadData).toBeTruthy();
      console.log('✅ Uploaded to storage:', fileName);

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gym-images')
        .getPublicUrl(fileName);

      expect(publicUrl).toBeTruthy();
      expect(publicUrl).toContain(fileName);
      console.log('✅ Public URL generated:', publicUrl);

      // 3. Save to gym_gallery table
      const { data: galleryImage, error: insertError } = await supabase
        .from('gym_gallery')
        .insert({
          gym_id: testGymId,
          image_url: publicUrl,
          storage_path: fileName,
          title: 'Test Single Image',
          description: 'This is a test image',
          alt_text: 'Test image alt text',
          file_size: testImageBuffer.length,
          width: 1,
          height: 1,
          mime_type: 'image/png',
          uploaded_by: testUserId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(galleryImage).toBeTruthy();
      expect(galleryImage.id).toBeTruthy();
      expect(galleryImage.gym_id).toBe(testGymId);
      expect(galleryImage.image_url).toBe(publicUrl);
      expect(galleryImage.title).toBe('Test Single Image');

      uploadedImageIds.push(galleryImage.id);
      console.log('✅ Saved to gallery:', galleryImage.id);
      console.log('📊 Image data:', {
        id: galleryImage.id,
        title: galleryImage.title,
        display_order: galleryImage.display_order,
        is_featured: galleryImage.is_featured,
      });
    });

    test('should upload multiple images', async () => {
      console.log('\n📤 Testing multiple image upload...');

      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');
      const uploadCount = 3;

      for (let i = 0; i < uploadCount; i++) {
        const fileName = `${testUserId}/${Date.now()}-multi-${i}.png`;
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gym-images')
          .upload(fileName, testImageBuffer, {
            contentType: 'image/png',
          });

        expect(uploadError).toBeNull();

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gym-images')
          .getPublicUrl(fileName);

        // Save to gallery
        const { data: galleryImage, error: insertError } = await supabase
          .from('gym_gallery')
          .insert({
            gym_id: testGymId,
            image_url: publicUrl,
            storage_path: fileName,
            title: `Test Image ${i + 1}`,
            description: `Test image number ${i + 1}`,
            file_size: testImageBuffer.length,
            mime_type: 'image/png',
            uploaded_by: testUserId,
          })
          .select()
          .single();

        expect(insertError).toBeNull();
        expect(galleryImage).toBeTruthy();
        
        uploadedImageIds.push(galleryImage.id);
        console.log(`✅ Uploaded image ${i + 1}:`, galleryImage.id);
      }

      console.log(`✅ Successfully uploaded ${uploadCount} images`);
    });

    test('should display all gallery images', async () => {
      console.log('\n🖼️  Testing gallery display...');

      // Fetch all images for the gym
      const { data: images, error } = await supabase
        .from('gym_gallery')
        .select('*')
        .eq('gym_id', testGymId)
        .order('display_order', { ascending: true });

      expect(error).toBeNull();
      expect(images).toBeTruthy();
      expect(Array.isArray(images)).toBe(true);
      expect(images.length).toBeGreaterThanOrEqual(uploadedImageIds.length);

      console.log(`✅ Found ${images.length} images in gallery`);

      // Verify structure
      const firstImage = images[0];
      expect(firstImage).toHaveProperty('id');
      expect(firstImage).toHaveProperty('gym_id');
      expect(firstImage).toHaveProperty('image_url');
      expect(firstImage).toHaveProperty('storage_path');
      expect(firstImage).toHaveProperty('display_order');
      expect(firstImage).toHaveProperty('created_at');

      console.log('✅ Image structure verified');
      console.log('📊 Sample image:', {
        id: firstImage.id,
        title: firstImage.title,
        display_order: firstImage.display_order,
        is_featured: firstImage.is_featured,
        file_size: firstImage.file_size,
      });
    });

    test('should have correct display order', async () => {
      console.log('\n🔢 Testing display order...');

      const { data: images } = await supabase
        .from('gym_gallery')
        .select('id, display_order, title')
        .eq('gym_id', testGymId)
        .order('display_order', { ascending: true });

      expect(images.length).toBeGreaterThan(0);

      // Verify display_order is sequential
      let previousOrder = -1;
      for (const image of images) {
        expect(image.display_order).toBeGreaterThan(previousOrder);
        previousOrder = image.display_order;
        console.log(`  - ${image.title}: order ${image.display_order}`);
      }

      console.log('✅ Display order is correct');
    });

    test('should set and retrieve featured image', async () => {
      console.log('\n⭐ Testing featured image...');

      const imageId = uploadedImageIds[0];

      // Set as featured
      const { data: updatedImage, error: updateError } = await supabase
        .from('gym_gallery')
        .update({ is_featured: true })
        .eq('id', imageId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updatedImage.is_featured).toBe(true);

      console.log('✅ Image set as featured:', imageId);

      // Verify only one featured image exists (due to trigger)
      const { data: featuredImages } = await supabase
        .from('gym_gallery')
        .select('id, title, is_featured')
        .eq('gym_id', testGymId)
        .eq('is_featured', true);

      expect(featuredImages.length).toBe(1);
      expect(featuredImages[0].id).toBe(imageId);

      console.log('✅ Only one featured image exists:', featuredImages[0].title);
    });

    test('should update image metadata', async () => {
      console.log('\n✏️  Testing image metadata update...');

      const imageId = uploadedImageIds[1];
      const newTitle = 'Updated Test Title';
      const newDescription = 'Updated description';
      const newAltText = 'Updated alt text';

      const { data: updatedImage, error } = await supabase
        .from('gym_gallery')
        .update({
          title: newTitle,
          description: newDescription,
          alt_text: newAltText,
        })
        .eq('id', imageId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedImage.title).toBe(newTitle);
      expect(updatedImage.description).toBe(newDescription);
      expect(updatedImage.alt_text).toBe(newAltText);

      console.log('✅ Metadata updated successfully');
      console.log('📊 Updated image:', {
        title: updatedImage.title,
        description: updatedImage.description,
        alt_text: updatedImage.alt_text,
      });
    });

    test('should get gallery stats', async () => {
      console.log('\n📊 Testing gallery stats...');

      const { data: images } = await supabase
        .from('gym_gallery')
        .select('file_size, is_featured, created_at')
        .eq('gym_id', testGymId);

      const stats = {
        total_images: images.length,
        total_size: images.reduce((sum, img) => sum + (img.file_size || 0), 0),
        featured_count: images.filter(img => img.is_featured).length,
        latest_upload: images[0]?.created_at,
      };

      expect(stats.total_images).toBeGreaterThan(0);
      expect(stats.featured_count).toBeLessThanOrEqual(1);

      console.log('✅ Gallery stats:', stats);
    });
  });

  describe('Gallery Features', () => {
    test('should verify RLS policies allow gym owner access', async () => {
      console.log('\n🔒 Testing RLS policies...');

      // Partner should be able to read their own gym's images
      const { data, error } = await supabase
        .from('gym_gallery')
        .select('*')
        .eq('gym_id', testGymId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();

      console.log('✅ RLS policies working correctly');
    });

    test('should verify trigger sets display_order automatically', async () => {
      console.log('\n🔢 Testing display_order trigger...');

      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');
      const fileName = `${testUserId}/${Date.now()}-trigger-test.png`;

      // Upload to storage
      await supabase.storage
        .from('gym-images')
        .upload(fileName, testImageBuffer, { contentType: 'image/png' });

      const { data: { publicUrl } } = supabase.storage
        .from('gym-images')
        .getPublicUrl(fileName);

      // Insert without specifying display_order
      const { data: newImage, error } = await supabase
        .from('gym_gallery')
        .insert({
          gym_id: testGymId,
          image_url: publicUrl,
          storage_path: fileName,
          title: 'Auto Order Test',
          uploaded_by: testUserId,
          // display_order NOT specified
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newImage.display_order).toBeGreaterThan(0);

      uploadedImageIds.push(newImage.id);
      console.log('✅ Trigger set display_order automatically:', newImage.display_order);
    });
  });
});

