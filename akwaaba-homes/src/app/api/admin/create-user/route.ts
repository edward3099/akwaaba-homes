import { NextRequest, NextResponse } from 'next/server';
import { createConfirmedUserProfile } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Admin routes not available in production' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { userId, email, full_name, phone, user_type } = body;
    
    if (!userId || !email || !full_name || !user_type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, full_name, user_type' },
        { status: 400 }
      );
    }
    
    if (!['agent', 'seller', 'buyer'].includes(user_type)) {
      return NextResponse.json(
        { error: 'Invalid user_type. Must be agent, seller, or buyer' },
        { status: 400 }
      );
    }
    
    const result = await createConfirmedUserProfile(userId, {
      email,
      full_name,
      phone,
      user_type: user_type as 'agent' | 'seller' | 'buyer'
    });
    
    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user profile', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
