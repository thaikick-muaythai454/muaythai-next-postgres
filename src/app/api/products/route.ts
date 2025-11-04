/**
 * Products API Endpoint
 * 
 * GET /api/products - Get all products
 * POST /api/products - Create new product (Admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';
import { withAdminAuth } from '@/lib/api/withAdminAuth';

/**
 * Helper function to check if user is admin
 */
async function checkIsAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  return data?.role === 'admin';
}

/**
 * GET /api/products
 * Get all products
 * Query params:
 * - category: category_id (UUID)
 * - search: search text
 * - featured: true/false
 * - active: true/false (default: true for public)
 * - limit: number of items
 * - offset: offset for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const isAdmin = !authError && user ? await checkIsAdmin(supabase, user.id) : false;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const featuredParam = searchParams.get('featured');
    const activeParam = searchParams.get('active');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Default: show only active products for non-admin users
    const active = activeParam === null 
      ? (!isAdmin ? true : undefined) 
      : activeParam === 'true';

    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          name_thai,
          name_english,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    // Apply active filter
    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    // Apply featured filter
    if (featuredParam === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `name_thai.ilike.%${search}%,name_english.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Get products error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Get product images
    const productIds = data?.map(p => p.id) || [];
    const images: Record<string, any[]> = {};

    if (productIds.length > 0) {
      const { data: productImages } = await supabase
        .from('product_images')
        .select('product_id, image_url, alt_text, is_primary, display_order')
        .in('product_id', productIds)
        .order('display_order')
        .order('is_primary', { ascending: false });

      if (productImages) {
        productImages.forEach((img: any) => {
          if (!images[img.product_id]) {
            images[img.product_id] = [];
          }
          images[img.product_id].push(img);
        });
      }
    }

    // Format response
    const formattedData = data?.map((product: any) => ({
      id: product.id,
      slug: product.slug,
      nameThai: product.name_thai,
      nameEnglish: product.name_english,
      description: product.description,
      price: parseFloat(product.price),
      stock: product.stock,
      category: product.product_categories ? {
        id: product.product_categories.id,
        nameThai: product.product_categories.name_thai,
        nameEnglish: product.product_categories.name_english,
        slug: product.product_categories.slug,
      } : null,
      sku: product.sku,
      weightKg: product.weight_kg ? parseFloat(product.weight_kg) : null,
      dimensions: product.dimensions,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      viewsCount: product.views_count,
      salesCount: product.sales_count,
      image: images[product.id]?.find((img: any) => img.is_primary)?.image_url || images[product.id]?.[0]?.image_url || null,
      images: images[product.id]?.map((img: any) => img.image_url) || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create new product (Admin only)
 */
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    const { nameThai, nameEnglish, price, stock } = body;
    if (!nameThai || !nameEnglish || price === undefined || stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nameThai, nameEnglish, price, stock' },
        { status: 400 }
      );
    }

    // Generate slug from name_english
    const slug = body.slug || nameEnglish.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        slug,
        name_thai: nameThai,
        name_english: nameEnglish,
        description: body.description || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: body.categoryId || null,
        sku: body.sku || null,
        weight_kg: body.weightKg ? parseFloat(body.weightKg) : null,
        dimensions: body.dimensions || null,
        is_active: body.isActive !== undefined ? body.isActive : true,
        is_featured: body.isFeatured || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      );
    }

    // Add images if provided
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const imageRecords = body.images.map((url: string, index: number) => ({
        product_id: product.id,
        image_url: url,
        alt_text: `${nameEnglish} - Image ${index + 1}`,
        display_order: index,
        is_primary: index === 0,
      }));

      await supabase
        .from('product_images')
        .insert(imageRecords);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        slug: product.slug,
        nameThai: product.name_thai,
        nameEnglish: product.name_english,
        description: product.description,
        price: parseFloat(product.price),
        stock: product.stock,
        categoryId: product.category_id,
        sku: product.sku,
        weightKg: product.weight_kg ? parseFloat(product.weight_kg) : null,
        dimensions: product.dimensions,
        isActive: product.is_active,
        isFeatured: product.is_featured,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

