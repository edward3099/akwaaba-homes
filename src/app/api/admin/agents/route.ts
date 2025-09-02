import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  page: z.string().transform(Number).default('1')
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin privileges (you can customize this based on your role system)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // For now, allow any authenticated user to fetch agents
    // In production, you might want to restrict this to admins only
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const validatedData = querySchema.parse(Object.fromEntries(searchParams.entries()))

    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        created_at,
        updated_at
      `)
      .eq('role', 'agent')
      .eq('is_active', true)

    // Add search functionality
    if (validatedData.search) {
      const searchTerm = validatedData.search.toLowerCase()
      query = query.or(`
        first_name.ilike.%${searchTerm}%,
        last_name.ilike.%${searchTerm}%,
        email.ilike.%${searchTerm}%
      `)
    }

    // Add pagination
    const limit = Math.min(validatedData.limit, 100) // Cap at 100
    const offset = (validatedData.page - 1) * limit
    
    query = query
      .range(offset, offset + limit - 1)
      .order('first_name', { ascending: true })

    const { data: agents, error: fetchError, count } = await query

    if (fetchError) {
      console.error('Error fetching agents:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'agent')
      .eq('is_active', true)

    return NextResponse.json({
      agents: agents || [],
      pagination: {
        page: validatedData.page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
