/**
 * Integration Tests: Gallery Management System
 * 
 * Tests the complete gallery management workflow:
 * - Upload images
 * - Display gallery
 * - Set featured image
 * - Reorder images
 * - Edit image metadata
 * - Delete images
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test user credentials (should exist in your test database)
const TEST_PARTNER_EMAIL = 'test_partner@muaythai.com';
const TEST_PARTNER_PASSWORD = 'password123';

describe('Gallery Management System', () => {
  let supabase;
  let authToken;
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
      console.error('❌ Sign in error:', signInError);
      throw signInError;
    }

    authToken = signInData.session.access_token;
    testUserId = signInData.user.id;
    console.log('✅ Signed in successfully');

    // Get or create a test gym
    console.log('\n🏢 Getting test gym...');
    const { data: gyms, error: gymsError } = await supabase
      .from('gyms')
      .select('id')
      .eq('user_id', testUserId)
      .limit(1);

    if (gymsError) {
      console.error('❌ Error fetching gyms:', gymsError);
      throw gymsError;
    }

    if (gyms && gyms.length > 0) {
      testGymId = gyms[0].id;
      console.log('✅ Using existing gym:', testGymId);
    } else {
      // Create a test gym if none exists
      const { data: newGym, error: createError } = await supabase
        .from('gyms')
        .insert({
          gym_name: 'Test Gallery Gym',
          contact_name: 'Test Contact',
          phone: '0801234567',
          email: TEST_PARTNER_EMAIL,
          location: 'Bangkok, Thailand',
          gym_details: 'Test gym for gallery testing',
          user_id: testUserId,
          status: 'approved',
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating gym:', createError);
        throw createError;
      }

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
          const response = await fetch(`${BASE_URL}/api/partner/gallery/${imageId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });
          if (response.ok) {
            console.log(`✅ Deleted image: ${imageId}`);
          }
        } catch (error) {
          console.error(`❌ Error deleting image ${imageId}:`, error);
        }
      }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out\n');
  });

  describe('1. Image Upload', () => {
    test('should upload a test image to gallery', async () => {
      console.log('\n📤 Testing image upload...');

      // Create a simple test image blob (1x1 red pixel PNG)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');
      
      // Upload to Supabase Storage
      const fileName = `${testUserId}/${Date.now()}-test-image.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gym-images')
        .upload(fileName, testImageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      expect(uploadError).toBeNull();
      expect(uploadData).toBeTruthy();
      console.log('✅ Uploaded to storage:', fileName);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gym-images')
        .getPublicUrl(fileName);

      expect(publicUrl).toBeTruthy();
      console.log('✅ Public URL:', publicUrl);

      // Save to gallery via API
      const response = await fetch(`${BASE_URL}/api/partner/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          gym_id: testGymId,
          image_url: publicUrl,
          storage_path: fileName,
          title: 'Test Gallery Image',
          description: 'This is a test image for gallery',
          alt_text: 'Test image',
          file_size: testImageBuffer.length,
          width: 1,
          height: 1,
          mime_type: 'image/png',
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      expect(result.data.id).toBeTruthy();
      expect(result.data.gym_id).toBe(testGymId);
      expect(result.data.image_url).toBe(publicUrl);

      uploadedImageIds.push(result.data.id);
      console.log('✅ Image saved to gallery:', result.data.id);
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    });

    test('should upload multiple images', async () => {
      console.log('\n📤 Testing multiple image upload...');

      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');

      // Upload 3 test images
      for (let i = 0; i < 3; i++) {
        const fileName = `${testUserId}/${Date.now()}-test-image-${i}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gym-images')
          .upload(fileName, testImageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600',
          });

        expect(uploadError).toBeNull();

        const { data: { publicUrl } } = supabase.storage
          .from('gym-images')
          .getPublicUrl(fileName);

        const response = await fetch(`${BASE_URL}/api/partner/gallery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            gym_id: testGymId,
            image_url: publicUrl,
            storage_path: fileName,
            title: `Test Image ${i + 1}`,
            description: `Test image number ${i + 1}`,
            file_size: testImageBuffer.length,
            width: 1,
            height: 1,
            mime_type: 'image/png',
          }),
        });

        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.success).toBe(true);
        
        uploadedImageIds.push(result.data.id);
        console.log(`✅ Uploaded image ${i + 1}:`, result.data.id);
      }

      console.log('✅ Successfully uploaded 3 images');
    });
  });

  describe('2. Gallery Display', () => {
    test('should fetch all gallery images for the gym', async () => {
      console.log('\n🖼️  Testing gallery display...');

      const response = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      expect(result.data.images).toBeTruthy();
      expect(Array.isArray(result.data.images)).toBe(true);
      expect(result.data.images.length).toBeGreaterThan(0);

      console.log(`✅ Found ${result.data.images.length} images in gallery`);
      console.log('📊 Stats:', JSON.stringify(result.data.stats, null, 2));

      // Verify image structure
      const firstImage = result.data.images[0];
      expect(firstImage.id).toBeTruthy();
      expect(firstImage.gym_id).toBe(testGymId);
      expect(firstImage.image_url).toBeTruthy();
      expect(firstImage.storage_path).toBeTruthy();
      expect(firstImage.display_order).toBeDefined();

      console.log('✅ Gallery images fetched successfully');
    });

    test('should have proper display order', async () => {
      console.log('\n🔢 Testing display order...');

      const response = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();
      const images = result.data.images;

      // Check that display_order is sequential
      let previousOrder = -1;
      for (const image of images) {
        expect(image.display_order).toBeGreaterThan(previousOrder);
        previousOrder = image.display_order;
      }

      console.log('✅ Display order is correct');
    });
  });

  describe('3. Featured Image', () => {
    test('should set an image as featured', async () => {
      console.log('\n⭐ Testing featured image...');

      // Get the first uploaded image
      const imageId = uploadedImageIds[0];

      const response = await fetch(`${BASE_URL}/api/partner/gallery/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          is_featured: true,
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.is_featured).toBe(true);

      console.log('✅ Image set as featured:', imageId);

      // Verify only one featured image exists
      const galleryResponse = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const galleryResult = await galleryResponse.json();
      const featuredImages = galleryResult.data.images.filter(img => img.is_featured);

      expect(featuredImages.length).toBe(1);
      expect(featuredImages[0].id).toBe(imageId);

      console.log('✅ Only one featured image exists');
    });

    test('should switch featured image when setting another as featured', async () => {
      console.log('\n🔄 Testing featured image switch...');

      // Set the second image as featured
      const imageId = uploadedImageIds[1];

      const response = await fetch(`${BASE_URL}/api/partner/gallery/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          is_featured: true,
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data.is_featured).toBe(true);

      // Verify only this image is featured
      const galleryResponse = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const galleryResult = await galleryResponse.json();
      const featuredImages = galleryResult.data.images.filter(img => img.is_featured);

      expect(featuredImages.length).toBe(1);
      expect(featuredImages[0].id).toBe(imageId);

      console.log('✅ Featured image switched successfully');
    });
  });

  describe('4. Image Reordering', () => {
    test('should reorder gallery images', async () => {
      console.log('\n🔀 Testing image reordering...');

      // Get current images
      const galleryResponse = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const galleryResult = await galleryResponse.json();
      const images = galleryResult.data.images;

      // Reverse the order
      const newOrder = images.reverse().map((img, index) => ({
        id: img.id,
        display_order: index + 1,
      }));

      // Update order
      const response = await fetch(`${BASE_URL}/api/partner/gallery/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          gym_id: testGymId,
          image_orders: newOrder,
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);

      console.log('✅ Images reordered successfully');

      // Verify new order
      const verifyResponse = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const verifyResult = await verifyResponse.json();
      const reorderedImages = verifyResult.data.images;

      expect(reorderedImages[0].id).toBe(newOrder[0].id);
      expect(reorderedImages[reorderedImages.length - 1].id).toBe(newOrder[newOrder.length - 1].id);

      console.log('✅ New order verified');
    });
  });

  describe('5. Image Metadata Update', () => {
    test('should update image metadata', async () => {
      console.log('\n✏️  Testing image metadata update...');

      const imageId = uploadedImageIds[0];
      const newTitle = 'Updated Test Title';
      const newDescription = 'Updated test description';
      const newAltText = 'Updated alt text';

      const response = await fetch(`${BASE_URL}/api/partner/gallery/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          alt_text: newAltText,
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.title).toBe(newTitle);
      expect(result.data.description).toBe(newDescription);
      expect(result.data.alt_text).toBe(newAltText);

      console.log('✅ Image metadata updated successfully');
    });
  });

  describe('6. Image Deletion', () => {
    test('should delete an image', async () => {
      console.log('\n🗑️  Testing image deletion...');

      // Get the last uploaded image
      const imageId = uploadedImageIds[uploadedImageIds.length - 1];

      const response = await fetch(`${BASE_URL}/api/partner/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);

      console.log('✅ Image deleted successfully:', imageId);

      // Verify image is deleted
      const galleryResponse = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const galleryResult = await galleryResponse.json();
      const deletedImage = galleryResult.data.images.find(img => img.id === imageId);

      expect(deletedImage).toBeUndefined();

      // Remove from our tracking array
      uploadedImageIds = uploadedImageIds.filter(id => id !== imageId);

      console.log('✅ Image deletion verified');
    });
  });

  describe('7. Error Handling', () => {
    test('should return 404 for non-existent image', async () => {
      console.log('\n❌ Testing error handling...');

      const fakeImageId = '00000000-0000-0000-0000-000000000000';

      const response = await fetch(`${BASE_URL}/api/partner/gallery/${fakeImageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Should fail',
        }),
      });

      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.success).toBe(false);

      console.log('✅ 404 error handled correctly');
    });

    test('should require authentication', async () => {
      console.log('\n🔒 Testing authentication requirement...');

      const response = await fetch(
        `${BASE_URL}/api/partner/gallery?gym_id=${testGymId}`,
        {
          method: 'GET',
          // No Authorization header
        }
      );

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.success).toBe(false);

      console.log('✅ Authentication requirement enforced');
    });

    test('should validate gym_id parameter', async () => {
      console.log('\n🔍 Testing parameter validation...');

      const response = await fetch(
        `${BASE_URL}/api/partner/gallery`, // Missing gym_id
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);

      console.log('✅ Parameter validation working');
    });
  });
});

