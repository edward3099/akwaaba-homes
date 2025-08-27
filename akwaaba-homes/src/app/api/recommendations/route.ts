import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const recommendationQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  limit: z.string().transform(Number).default(() => 10),
  type: z.enum(['similar', 'trending', 'personalized', 'market']).default('personalized'),
  filters: z.string().optional() // JSON string of additional filters
})

interface PropertyRecommendation {
  id: string
  title: string
  price: number
  location: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  image_url: string
  similarity_score?: number
  trending_score?: number
  personalization_score?: number
}

export async function GET(request: NextRequest) {
  try {
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
    
    // Get user session for personalized recommendations
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(request.url)
    const validatedData = recommendationQuerySchema.parse(Object.fromEntries(searchParams.entries()))
    
    let recommendations: PropertyRecommendation[] = []
    
    switch (validatedData.type) {
      case 'similar':
        if (!validatedData.propertyId) {
          return NextResponse.json(
            { error: 'Property ID is required for similar property recommendations' },
            { status: 400 }
          )
        }
        recommendations = await getSimilarProperties(supabase, validatedData.propertyId, validatedData.limit)
        break
        
      case 'trending':
        recommendations = await getTrendingProperties(supabase, validatedData.limit)
        break
        
      case 'personalized':
        if (!user) {
          // Fall back to trending if no user
          recommendations = await getTrendingProperties(supabase, validatedData.limit)
        } else {
          recommendations = await getPersonalizedRecommendations(supabase, user.id, validatedData.limit)
        }
        break
        
      case 'market':
        recommendations = await getMarketInsights(supabase, validatedData.limit)
        break
        
      default:
        recommendations = await getTrendingProperties(supabase, validatedData.limit)
    }
    
    return NextResponse.json({
      recommendations,
      type: validatedData.type,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Recommendation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

async function getSimilarProperties(supabase: any, propertyId: string, limit: number): Promise<PropertyRecommendation[]> {
  // Get the reference property details
  const { data: referenceProperty, error: refError } = await supabase
    .from('properties')
    .select('property_type, price, bedrooms, bathrooms, square_feet, location')
    .eq('id', propertyId)
    .single()
    
  if (refError || !referenceProperty) {
    return []
  }
  
  // Find similar properties based on key attributes
  const { data: similarProperties, error } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, property_type, bedrooms, bathrooms, square_feet,
      property_images!inner(image_url)
    `)
    .eq('status', 'active')
    .eq('property_type', referenceProperty.property_type)
    .gte('bedrooms', Math.max(1, referenceProperty.bedrooms - 1))
    .lte('bedrooms', referenceProperty.bedrooms + 1)
    .gte('price', referenceProperty.price * 0.7)
    .lte('price', referenceProperty.price * 1.3)
    .limit(limit)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching similar properties:', error)
    return []
  }
  
  return similarProperties?.map((prop: any) => ({
    id: prop.id,
    title: prop.title,
    price: prop.price,
    location: prop.location,
    property_type: prop.property_type,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_feet,
    image_url: prop.property_images?.[0]?.image_url || '',
    similarity_score: calculateSimilarityScore(prop, referenceProperty)
  })) || []
}

async function getTrendingProperties(supabase: any, limit: number): Promise<PropertyRecommendation[]> {
  // Get trending properties based on views, favorites, and recent activity
  const { data: trendingProperties, error } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, property_type, bedrooms, bathrooms, square_feet,
      property_images!inner(image_url),
      property_views(count),
      property_favorites(count)
    `)
    .eq('status', 'active')
    .limit(limit)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching trending properties:', error)
    return []
  }
  
  return trendingProperties?.map((prop: any) => ({
    id: prop.id,
    title: prop.title,
    price: prop.price,
    location: prop.location,
    property_type: prop.property_type,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_feet,
    image_url: prop.property_images?.[0]?.image_url || '',
    trending_score: calculateTrendingScore(prop)
  })) || []
}

async function getPersonalizedRecommendations(supabase: any, userId: string, limit: number): Promise<PropertyRecommendation[]> {
  // Get user preferences from saved searches and favorites
  const { data: userPreferences, error: prefError } = await supabase
    .from('saved_searches')
    .select('search_criteria')
    .eq('user_id', userId)
    .eq('is_active', true)
    
  if (prefError) {
    console.error('Error fetching user preferences:', prefError)
    return await getTrendingProperties(supabase, limit)
  }
  
  // Extract common preferences
  const preferences = extractUserPreferences(userPreferences)
  
  // Get personalized recommendations based on preferences
  const { data: personalizedProperties, error } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, property_type, bedrooms, bathrooms, square_feet,
      property_images!inner(image_url)
    `)
    .eq('status', 'active')
    .gte('price', preferences.minPrice || 0)
    .lte('price', preferences.maxPrice || 999999999)
    .eq('property_type', preferences.preferredType || 'house')
    .gte('bedrooms', preferences.minBedrooms || 1)
    .limit(limit)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching personalized properties:', error)
    return await getTrendingProperties(supabase, limit)
  }
  
  return personalizedProperties?.map((prop: any) => ({
    id: prop.id,
    title: prop.title,
    price: prop.price,
    location: prop.location,
    property_type: prop.property_type,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_feet,
    image_url: prop.property_images?.[0]?.image_url || '',
    personalization_score: calculatePersonalizationScore(prop, preferences)
  })) || []
}

async function getMarketInsights(supabase: any, limit: number): Promise<PropertyRecommendation[]> {
  // Get market insights based on recent sales and market trends
  const { data: marketProperties, error } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, property_type, bedrooms, bathrooms, square_feet,
      property_images!inner(image_url),
      market_analytics!inner(price_trend, demand_score)
    `)
    .eq('status', 'active')
    .limit(limit)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching market insights:', error)
    return []
  }
  
  return marketProperties?.map((prop: any) => ({
    id: prop.id,
    title: prop.title,
    price: prop.price,
    location: prop.location,
    property_type: prop.property_type,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_feet,
    image_url: prop.property_images?.[0]?.image_url || '',
    market_score: calculateMarketScore(prop)
  })) || []
}

// Helper functions for scoring
function calculateSimilarityScore(property: any, reference: any): number {
  let score = 0
  
  // Property type match (highest weight)
  if (property.property_type === reference.property_type) score += 40
  
  // Bedroom count similarity
  const bedroomDiff = Math.abs(property.bedrooms - reference.bedrooms)
  if (bedroomDiff === 0) score += 25
  else if (bedroomDiff === 1) score += 15
  
  // Price range similarity
  const priceRatio = property.price / reference.price
  if (priceRatio >= 0.8 && priceRatio <= 1.2) score += 20
  else if (priceRatio >= 0.7 && priceRatio <= 1.3) score += 10
  
  // Size similarity
  if (property.square_feet && reference.square_feet) {
    const sizeRatio = property.square_feet / reference.square_feet
    if (sizeRatio >= 0.8 && sizeRatio <= 1.2) score += 15
  }
  
  return Math.min(100, score)
}

function calculateTrendingScore(property: any): number {
  let score = 0
  
  // View count (40% weight)
  const viewCount = property.property_views?.[0]?.count || 0
  score += Math.min(40, viewCount * 2)
  
  // Favorite count (30% weight)
  const favoriteCount = property.property_favorites?.[0]?.count || 0
  score += Math.min(30, favoriteCount * 5)
  
  // Recency (30% weight)
  const daysSinceCreation = Math.floor((Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceCreation <= 7) score += 30
  else if (daysSinceCreation <= 30) score += 20
  else if (daysSinceCreation <= 90) score += 10
  
  return Math.min(100, score)
}

function extractUserPreferences(savedSearches: any[]): any {
  const preferences = {
    minPrice: 0,
    maxPrice: 999999999,
    preferredType: 'house',
    minBedrooms: 1
  }
  
  if (!savedSearches || savedSearches.length === 0) return preferences
  
  // Analyze search criteria to extract preferences
  savedSearches.forEach(search => {
    const criteria = search.search_criteria
    if (criteria.price_min) preferences.minPrice = Math.max(preferences.minPrice, criteria.price_min)
    if (criteria.price_max) preferences.maxPrice = Math.min(preferences.maxPrice, criteria.price_max)
    if (criteria.property_type) preferences.preferredType = criteria.property_type
    if (criteria.bedrooms_min) preferences.minBedrooms = Math.max(preferences.minBedrooms, criteria.bedrooms_min)
  })
  
  return preferences
}

function calculatePersonalizationScore(property: any, preferences: any): number {
  let score = 0
  
  // Price range match (40% weight)
  if (property.price >= preferences.minPrice && property.price <= preferences.maxPrice) {
    score += 40
  }
  
  // Property type match (30% weight)
  if (property.property_type === preferences.preferredType) {
    score += 30
  }
  
  // Bedroom count match (20% weight)
  if (property.bedrooms >= preferences.minBedrooms) {
    score += 20
  }
  
  // Recency bonus (10% weight)
  const daysSinceCreation = Math.floor((Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceCreation <= 7) score += 10
  
  return Math.min(100, score)
}

function calculateMarketScore(property: any): number {
  let score = 0
  
  // Price trend (50% weight)
  const priceTrend = property.market_analytics?.[0]?.price_trend || 0
  if (priceTrend > 0) score += 50
  else if (priceTrend === 0) score += 25
  
  // Demand score (50% weight)
  const demandScore = property.market_analytics?.[0]?.demand_score || 0
  score += Math.min(50, demandScore)
  
  return Math.min(100, score)
}
