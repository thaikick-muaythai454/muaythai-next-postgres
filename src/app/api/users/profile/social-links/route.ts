import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database/supabase/server';

/**
 * Get Social Links API
 * GET /api/users/profile/social-links
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get social links
    const { data, error } = await supabase
      .from('user_social_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get social links error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get social links' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Get social links error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update Social Links API
 * PUT /api/users/profile/social-links
 * 
 * Body:
 * {
 *   links: [
 *     { platform: 'facebook', url: 'https://...' },
 *     { platform: 'instagram', url: 'https://...' }
 *   ]
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { links } = body;

    if (!Array.isArray(links)) {
      return NextResponse.json(
        { success: false, error: 'Links must be an array' },
        { status: 400 }
      );
    }

    // Validate URLs
    const urlPattern = /^https?:\/\//;
    const validPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'];

    for (const link of links) {
      if (!validPlatforms.includes(link.platform)) {
        return NextResponse.json(
          { success: false, error: `Invalid platform: ${link.platform}` },
          { status: 400 }
        );
      }
      if (!urlPattern.test(link.url)) {
        return NextResponse.json(
          { success: false, error: `Invalid URL for ${link.platform}` },
          { status: 400 }
        );
      }
    }

    // Delete existing links
    await supabase
      .from('user_social_links')
      .delete()
      .eq('user_id', user.id);

    // Insert new links
    if (links.length > 0) {
      const linksToInsert = links.map(link => ({
        user_id: user.id,
        platform: link.platform,
        url: link.url
      }));

      const { data, error } = await supabase
        .from('user_social_links')
        .insert(linksToInsert)
        .select();

      if (error) {
        console.error('Insert social links error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update social links' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Social links updated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      message: 'Social links cleared successfully'
    });

  } catch (error) {
    console.error('Update social links error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

