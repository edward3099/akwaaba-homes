import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const notificationQuerySchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['all', 'property', 'message', 'payment', 'system']).default('all'),
  limit: z.string().transform(Number).default(() => 50)
})

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: any
  is_read: boolean
  created_at: string
  priority: 'low' | 'medium' | 'high'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validatedData = notificationQuerySchema.parse(Object.fromEntries(searchParams.entries()))

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    )

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user can access these notifications
    if (validatedData.userId !== user.id) {
      return NextResponse.json(
        { error: 'Can only access your own notifications' },
        { status: 403 }
      )
    }

    // Get notifications based on type
    let notifications: Notification[] = []
    
    switch (validatedData.type) {
      case 'property':
        notifications = await getPropertyNotifications(supabase, user.id, validatedData.limit)
        break
      case 'message':
        notifications = await getMessageNotifications(supabase, user.id, validatedData.limit)
        break
      case 'payment':
        notifications = await getPaymentNotifications(supabase, user.id, validatedData.limit)
        break
      case 'system':
        notifications = await getSystemNotifications(supabase, user.id, validatedData.limit)
        break
      default:
        notifications = await getAllNotifications(supabase, user.id, validatedData.limit)
    }

    return NextResponse.json({
      notifications,
      count: notifications.length,
      type: validatedData.type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Real-time notifications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// SSE endpoint for real-time notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type = 'all' } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    )

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user can access these notifications
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Can only access your own notifications' },
        { status: 403 }
      )
    }

    // Create SSE response for real-time updates
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'connection',
          message: 'Real-time notifications connected',
          timestamp: new Date().toISOString()
        })}\n\n`))

        // Set up real-time subscription to notifications table
        const subscription = supabase
          .channel(`notifications:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              const notification = {
                type: 'notification',
                data: payload.new,
                event: payload.eventType,
                timestamp: new Date().toISOString()
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`))
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'chat_messages',
              filter: `chat_rooms.seller_id=eq.${userId} OR chat_rooms.buyer_email=eq.${user.email}`
            },
            (payload) => {
              const messageNotification = {
                type: 'message',
                data: payload.new,
                event: payload.eventType,
                timestamp: new Date().toISOString()
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(messageNotification)}\n\n`))
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'property_views',
              filter: `property_id=in.(SELECT id FROM properties WHERE owner_id=eq.${userId})`
            },
            (payload) => {
              const viewNotification = {
                type: 'property_view',
                data: payload.new,
                event: payload.eventType,
                timestamp: new Date().toISOString()
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(viewNotification)}\n\n`))
            }
          )
          .subscribe()

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`))
        }, 30000) // 30 seconds

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          subscription.unsubscribe()
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('SSE notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to establish real-time connection' },
      { status: 500 }
    )
  }
}

// Helper functions for different notification types
async function getAllNotifications(supabase: any, userId: string, limit: number): Promise<Notification[]> {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching all notifications:', error)
    return []
  }

  return notifications || []
}

async function getPropertyNotifications(supabase: any, userId: string, limit: number): Promise<Notification[]> {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'property')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching property notifications:', error)
    return []
  }

  return notifications || []
}

async function getMessageNotifications(supabase: any, userId: string, limit: number): Promise<Notification[]> {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'message')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching message notifications:', error)
    return []
  }

  return notifications || []
}

async function getPaymentNotifications(supabase: any, userId: string, limit: number): Promise<Notification[]> {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'payment')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching payment notifications:', error)
    return []
  }

  return notifications || []
}

async function getSystemNotifications(supabase: any, userId: string, limit: number): Promise<Notification[]> {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'system')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching system notifications:', error)
    return []
  }

  return notifications || []
}
