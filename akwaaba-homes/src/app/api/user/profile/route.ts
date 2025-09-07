import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for profile update data
const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  company_name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  license_number: z.string().min(5, 'License number must be at least 5 characters').optional(),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required').optional(),
  experience_years: z.number().min(0, 'Experience years must be 0 or more').max(50, 'Experience years cannot exceed 50').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profile_image: z.string().url('Invalid profile image URL').optional(),
  cover_image: z.string().url('Invalid cover image URL').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    );

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data - fixed to use user_id instead of id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        license_number: profile.license_number,
        specializations: profile.specializations,
        experience_years: profile.experience_years,
        bio: profile.bio,
        profile_image: profile.profile_image,
        cover_image: profile.cover_image,
        user_role: profile.user_role,
        verification_status: profile.verification_status,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    );

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in again' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id, user.email);

    // Check if profile exists, if not create it
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let profileData;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Profile not found, creating new profile for user:', user.id);
      
      const newProfileData = {
        user_id: user.id,
        email: user.email!,
        full_name: validationResult.data.full_name || '',
        phone: validationResult.data.phone || null,
        company_name: validationResult.data.company_name || null,
        license_number: validationResult.data.license_number || null,
        experience_years: validationResult.data.experience_years || null,
        bio: validationResult.data.bio || null,
        user_role: 'agent', // Default to agent for onboarding
        verification_status: 'pending',
        is_verified: false,
        avatar_url: validationResult.data.profile_image || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile', details: createError.message },
          { status: 500 }
        );
      }

      // Also create/update the users table to keep phone numbers in sync
      const { error: userCreateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: validationResult.data.full_name || '',
          phone: validationResult.data.phone || null,
          user_type: 'agent', // Default to agent for onboarding
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userCreateError) {
        console.error('User table creation/update error:', userCreateError);
        // Don't fail the request, just log the error
        // The profile creation was successful
      }

      profileData = newProfile;
    } else if (fetchError) {
      console.error('Profile fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: fetchError.message },
        { status: 500 }
      );
    } else {
      // Profile exists, update it
      const updateData: Record<string, string | number | boolean | string[] | null> = {
        ...validationResult.data,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile', details: updateError.message },
          { status: 500 }
        );
      }

      // Also update the users table to keep phone numbers in sync
      const userUpdateData: Record<string, string | number | boolean | string[] | null> = {
        full_name: validationResult.data.full_name,
        phone: validationResult.data.phone,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(userUpdateData).forEach(key => 
        userUpdateData[key] === undefined && delete userUpdateData[key]
      );

      const { error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', user.id);

      if (userUpdateError) {
        console.error('User table update error:', userUpdateError);
        // Don't fail the request, just log the error
        // The profile update was successful
      }

      profileData = updatedProfile;
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        company_name: profileData.company_name,
        license_number: profileData.license_number,
        experience_years: profileData.experience_years,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        user_role: profileData.user_role,
        verification_status: profileData.verification_status,
        is_verified: profileData.is_verified,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
