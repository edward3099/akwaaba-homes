import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for contact form data
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  propertyInterest: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'both']).default('email'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      subject,
      message,
      propertyInterest,
      preferredContact
    } = validationResult.data;

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

    // Store contact form submission in database
    const { data: contactData, error: contactError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        property_interest: propertyInterest || null,
        preferred_contact: preferredContact,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contactError) {
      console.error('Contact submission error:', contactError);
      return NextResponse.json(
        { error: 'Failed to submit contact form', details: contactError.message },
        { status: 500 }
      );
    }

    // TODO: Send email notification to admin team
    // This would typically integrate with a service like SendGrid, Resend, or similar
    // For now, we'll just log the submission
    console.log('New contact form submission:', {
      id: contactData.id,
      name,
      email,
      subject,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement admin email notification
    // Example implementation with Resend:
    // try {
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: 'noreply@akwaabahomes.com',
    //     to: 'admin@akwaabahomes.com',
    //     subject: `New Contact Form Submission: ${subject}`,
    //     html: `
    //       <h2>New Contact Form Submission</h2>
    //       <p><strong>Name:</strong> ${name}</p>
    //       <p><strong>Email:</strong> ${email}</p>
    //       <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
    //       <p><strong>Subject:</strong> ${subject}</p>
    //       <p><strong>Message:</strong> ${message}</p>
    //       <p><strong>Property Interest:</strong> ${propertyInterest || 'Not specified'}</p>
    //       <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
    //       <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
    //     `
    //   });
    //   console.log('Admin notification email sent successfully');
    // } catch (emailError) {
    //   console.error('Failed to send admin notification email:', emailError);
    //   // Don't fail the contact submission if email fails
    // }

    return NextResponse.json({
      message: 'Contact form submitted successfully. We will get back to you soon.',
      submission_id: contactData.id
    }, { status: 201 });

  } catch (error) {
    console.error('Contact form error:', error);
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
