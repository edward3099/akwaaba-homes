import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for agent verification data
const verificationSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
  action: z.enum(['approve', 'reject']),
  reason: z.string().min(1, 'Reason is required for rejections').optional(),
  adminNotes: z.string().max(500, 'Admin notes must be less than 500 characters').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = verificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { agentId, action, reason, adminNotes } = validationResult.data;

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

    // Check if current user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (adminError || adminProfile?.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    // Get agent profile
    const { data: agentProfile, error: agentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', agentId)
      .eq('user_role', 'agent')
      .single();

    if (agentError || !agentProfile) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agentProfile.verification_status === 'verified') {
      return NextResponse.json(
        { error: 'Agent is already verified' },
        { status: 400 }
      );
    }

    // Update agent verification status
    const updateData: Record<string, any> = {
      verification_status: action === 'approve' ? 'verified' : 'rejected',
      is_verified: action === 'approve',
      admin_notes: adminNotes || null,
      verified_by: user.id,
      updated_at: new Date().toISOString()
    };

    if (action === 'reject' && reason) {
      updateData.rejection_reason = reason;
    }

    const { data: updatedAgent, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', agentId)
      .select()
      .single();

    if (updateError) {
      console.error('Agent verification update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update agent verification status', details: updateError.message },
        { status: 500 }
      );
    }

    // Log the verification action
    console.log(`Agent verification ${action}d:`, {
      agentId,
      agentEmail: agentProfile.email,
      adminId: user.id,
      adminEmail: user.email,
      action,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: `Agent ${action}d successfully`,
      agent: {
        id: updatedAgent.id,
        user_id: updatedAgent.user_id,
        email: updatedAgent.email,
        full_name: updatedAgent.full_name,
        verification_status: updatedAgent.verification_status,
        is_verified: updatedAgent.is_verified,
        admin_notes: updatedAgent.admin_notes,
        verified_by: updatedAgent.verified_by
      }
    });

  } catch (error) {
    console.error('Agent verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
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
