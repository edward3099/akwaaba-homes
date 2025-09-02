import { NextRequest, NextResponse } from 'next/server'
import { createApiRouteSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for contact form submission
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  category: z.enum(['general', 'technical', 'billing', 'feature_request', 'bug_report']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  userId: z.string().uuid().optional(), // Optional - user might not be logged in
  userType: z.enum(['user', 'agent', 'admin']).optional()
})

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient()
    
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    // Try to get the current user if they're authenticated
    let currentUser = null
    let userType = validatedData.userType || 'user'
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!authError && user) {
        currentUser = user
        
        // Get user profile to determine user type
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (userProfile) {
          userType = userProfile.user_type
        }
      }
    } catch (authError) {
      // User is not authenticated, which is fine for contact forms
      console.log('User not authenticated, proceeding with anonymous contact submission')
    }

    // Insert the contact submission
    const { data: contactSubmission, error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        category: validatedData.category,
        message: validatedData.message,
        priority: validatedData.priority,
        user_id: currentUser?.id || null,
        user_type: userType,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating contact submission:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      )
    }

    // If user is authenticated, also create a notification
    if (currentUser) {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: currentUser.id,
            type: 'contact_submitted',
            title: 'Contact Form Submitted',
            message: `Your ${validatedData.category} inquiry has been submitted successfully. We'll get back to you soon.`,
            data: {
              contactId: contactSubmission.id,
              category: validatedData.category,
              priority: validatedData.priority
            },
            is_read: false,
            created_at: new Date().toISOString()
          })
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError)
        // Don't fail the request if notification creation fails
      }
    }

    // Send email notification to admin (in a real app, this would use a service like SendGrid)
    // For now, we'll just log it
    console.log(`New contact submission from ${validatedData.email}: ${validatedData.subject}`)
    console.log(`Category: ${validatedData.category}, Priority: ${validatedData.priority}`)
    console.log(`Message: ${validatedData.message}`)

    return NextResponse.json({
      message: 'Contact form submitted successfully',
      submissionId: contactSubmission.id,
      estimatedResponseTime: '24-48 hours'
    }, { status: 201 })

  } catch (error) {
    console.error('Contact POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
