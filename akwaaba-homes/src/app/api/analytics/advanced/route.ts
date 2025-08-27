import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const analyticsQuerySchema = z.object({
  type: z.enum(['market_trends', 'price_prediction', 'user_behavior', 'property_performance', 'demand_analysis']),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  location: z.string().optional(),
  propertyType: z.string().optional(),
  limit: z.string().transform(Number).default(() => 100)
})

interface MarketTrend {
  period: string
  average_price: number
  price_change_percentage: number
  properties_sold: number
  days_on_market: number
  demand_score: number
  supply_score: number
}

interface PricePrediction {
  property_id: string
  current_price: number
  predicted_price: number
  confidence_score: number
  factors: string[]
  trend_direction: 'up' | 'down' | 'stable'
}

interface UserBehavior {
  user_id: string
  search_patterns: any[]
  favorite_properties: string[]
  view_history: any[]
  engagement_score: number
  conversion_likelihood: number
}

interface PropertyPerformance {
  property_id: string
  views_count: number
  favorites_count: number
  inquiries_count: number
  performance_score: number
  market_position: 'high' | 'medium' | 'low'
  recommendations: string[]
}

interface DemandAnalysis {
  location: string
  property_type: string
  demand_score: number
  supply_gap: number
  price_trend: number
  market_opportunity: 'high' | 'medium' | 'low'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validatedData = analyticsQuerySchema.parse(Object.fromEntries(searchParams.entries()))

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

    let analyticsData: any = {}

    switch (validatedData.type) {
      case 'market_trends':
        analyticsData = await getMarketTrends(supabase, validatedData.period, validatedData.location, validatedData.propertyType)
        break
      case 'price_prediction':
        analyticsData = await getPricePredictions(supabase, validatedData.period, validatedData.limit, validatedData.location, validatedData.propertyType)
        break
      case 'user_behavior':
        analyticsData = await getUserBehaviorAnalytics(supabase, user.id, validatedData.period)
        break
      case 'property_performance':
        analyticsData = await getPropertyPerformanceAnalytics(supabase, validatedData.period, validatedData.limit, validatedData.location, validatedData.propertyType)
        break
      case 'demand_analysis':
        analyticsData = await getDemandAnalysis(supabase, validatedData.period, validatedData.location, validatedData.propertyType)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      type: validatedData.type,
      period: validatedData.period,
      data: analyticsData,
      timestamp: new Date().toISOString(),
      generated_by: 'advanced_analytics_engine'
    })

  } catch (error) {
    console.error('Advanced analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

// Market Trends Analysis
async function getMarketTrends(supabase: any, period: string, location?: string, propertyType?: string): Promise<MarketTrend[]> {
  try {
    const dateRange = calculateDateRange(period)
    
    let query = supabase
      .from('properties')
      .select(`
        price,
        created_at,
        status,
        location,
        property_type,
        property_views(count),
        property_favorites(count),
        inquiries(count)
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .eq('status', 'active')

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties for market trends:', error)
      return []
    }

    // Group by time periods and calculate trends
    const trends = calculateMarketTrends(properties, period)
    return trends

  } catch (error) {
    console.error('Error in getMarketTrends:', error)
    return []
  }
}

// Price Prediction Analysis
async function getPricePredictions(supabase: any, period: string, limit: number, location?: string, propertyType?: string): Promise<PricePrediction[]> {
  try {
    const dateRange = calculateDateRange(period)
    
    let query = supabase
      .from('properties')
      .select(`
        id,
        price,
        location,
        property_type,
        bedrooms,
        bathrooms,
        square_feet,
        property_views(count),
        property_favorites(count),
        market_analytics!inner(price_trend, demand_score)
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .eq('status', 'active')
      .limit(limit)

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties for price prediction:', error)
      return []
    }

    // Generate price predictions using ML-like algorithms
    const predictions = properties.map((property: any) => generatePricePrediction(property))
    return predictions

  } catch (error) {
    console.error('Error in getPricePredictions:', error)
    return []
  }
}

// User Behavior Analytics
async function getUserBehaviorAnalytics(supabase: any, userId: string, period: string): Promise<UserBehavior> {
  try {
    const dateRange = calculateDateRange(period)
    
    // Get user search patterns
    const { data: savedSearches, error: searchError } = await supabase
      .from('saved_searches')
      .select('search_criteria, created_at')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())

    // Get favorite properties
    const { data: favorites, error: favError } = await supabase
      .from('property_favorites')
      .select('property_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())

    // Get view history
    const { data: views, error: viewError } = await supabase
      .from('property_views')
      .select('property_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())

    if (searchError || favError || viewError) {
      console.error('Error fetching user behavior data:', { searchError, favError, viewError })
      return {
        user_id: userId,
        search_patterns: [],
        favorite_properties: [],
        view_history: [],
        engagement_score: 0,
        conversion_likelihood: 0
      }
    }

    // Calculate engagement metrics
    const engagementScore = calculateEngagementScore(savedSearches?.length || 0, favorites?.length || 0, views?.length || 0)
    const conversionLikelihood = calculateConversionLikelihood(savedSearches?.length || 0, favorites?.length || 0, views?.length || 0)

    return {
      user_id: userId,
      search_patterns: savedSearches || [],
      favorite_properties: favorites?.map((f: any) => f.property_id) || [],
      view_history: views || [],
      engagement_score: engagementScore,
      conversion_likelihood: conversionLikelihood
    }

  } catch (error) {
    console.error('Error in getUserBehaviorAnalytics:', error)
    return {
      user_id: userId,
      search_patterns: [],
      favorite_properties: [],
      view_history: [],
      engagement_score: 0,
      conversion_likelihood: 0
    }
  }
}

// Property Performance Analytics
async function getPropertyPerformanceAnalytics(supabase: any, period: string, limit: number, location?: string, propertyType?: string): Promise<PropertyPerformance[]> {
  try {
    const dateRange = calculateDateRange(period)
    
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        location,
        property_type,
        property_views(count),
        property_favorites(count),
        inquiries(count),
        market_analytics!inner(performance_score, market_position)
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .eq('status', 'active')
      .limit(limit)

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties for performance analytics:', error)
      return []
    }

    // Calculate performance metrics
    const performanceData = properties.map((property: any) => calculatePropertyPerformance(property))
    return performanceData

  } catch (error) {
    console.error('Error in getPropertyPerformanceAnalytics:', error)
    return []
  }
}

// Demand Analysis
async function getDemandAnalysis(supabase: any, period: string, location?: string, propertyType?: string): Promise<DemandAnalysis[]> {
  try {
    const dateRange = calculateDateRange(period)
    
    let query = supabase
      .from('properties')
      .select(`
        location,
        property_type,
        price,
        status,
        property_views(count),
        property_favorites(count),
        inquiries(count),
        market_analytics!inner(demand_score, supply_gap, price_trend)
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .eq('status', 'active')

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties for demand analysis:', error)
      return []
    }

    // Group by location and property type for demand analysis
    const demandData = analyzeDemandByLocationAndType(properties)
    return demandData

  } catch (error) {
    console.error('Error in getDemandAnalysis:', error)
    return []
  }
}

// Helper Functions
function calculateDateRange(period: string): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'all':
      start.setFullYear(2020) // Reasonable start date
      break
    default:
      start.setDate(end.getDate() - 30)
  }
  
  return { start, end }
}

function calculateMarketTrends(properties: any[], period: string): MarketTrend[] {
  // Group properties by time periods
  const groupedProperties = groupPropertiesByPeriod(properties, period)
  
  return Object.entries(groupedProperties).map(([periodKey, periodProperties]) => {
    const prices = periodProperties.map((p: any) => p.price).filter(Boolean)
    const averagePrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0
    
    const views = periodProperties.map((p: any) => p.property_views?.[0]?.count || 0)
    const favorites = periodProperties.map((p: any) => p.property_favorites?.[0]?.count || 0)
    const inquiries = periodProperties.map((p: any) => p.inquiries?.[0]?.count || 0)
    
    return {
      period: periodKey,
      average_price: Math.round(averagePrice),
      price_change_percentage: calculatePriceChangePercentage(periodProperties),
      properties_sold: periodProperties.filter((p: any) => p.status === 'sold').length,
      days_on_market: calculateAverageDaysOnMarket(periodProperties),
      demand_score: calculateDemandScore(views, favorites, inquiries),
      supply_score: calculateSupplyScore(periodProperties.length, averagePrice)
    }
  })
}

function generatePricePrediction(property: any): PricePrediction {
  const currentPrice = property.price
  const basePrice = currentPrice
  
  // Simple ML-like prediction based on market factors
  let predictedPrice = basePrice
  let factors: string[] = []
  let confidenceScore = 0.7 // Base confidence
  
  // Adjust based on market analytics
  if (property.market_analytics?.[0]) {
    const analytics = property.market_analytics[0]
    
    if (analytics.price_trend > 0) {
      predictedPrice *= 1.05 // 5% increase
      factors.push('Positive market trend')
      confidenceScore += 0.1
    } else if (analytics.price_trend < 0) {
      predictedPrice *= 0.95 // 5% decrease
      factors.push('Negative market trend')
      confidenceScore -= 0.1
    }
    
    if (analytics.demand_score > 0.7) {
      predictedPrice *= 1.03 // 3% increase for high demand
      factors.push('High demand area')
      confidenceScore += 0.1
    }
  }
  
  // Adjust based on engagement
  const views = property.property_views?.[0]?.count || 0
  const favorites = property.property_favorites?.[0]?.count || 0
  
  if (views > 100 && favorites > 10) {
    predictedPrice *= 1.02 // 2% increase for high engagement
    factors.push('High property engagement')
    confidenceScore += 0.05
  }
  
  // Determine trend direction
  const trendDirection: 'up' | 'down' | 'stable' = 
    predictedPrice > currentPrice * 1.02 ? 'up' :
    predictedPrice < currentPrice * 0.98 ? 'down' : 'stable'
  
  return {
    property_id: property.id,
    current_price: currentPrice,
    predicted_price: Math.round(predictedPrice),
    confidence_score: Math.min(0.95, Math.max(0.3, confidenceScore)),
    factors,
    trend_direction: trendDirection
  }
}

function calculateEngagementScore(searches: number, favorites: number, views: number): number {
  // Weighted scoring system
  const searchScore = Math.min(searches * 10, 40) // Max 40 points
  const favoriteScore = Math.min(favorites * 15, 30) // Max 30 points
  const viewScore = Math.min(views * 0.5, 30) // Max 30 points
  
  return Math.min(100, searchScore + favoriteScore + viewScore)
}

function calculateConversionLikelihood(searches: number, favorites: number, views: number): number {
  // Conversion likelihood based on engagement patterns
  if (searches === 0) return 0.1
  
  const engagementRate = (favorites + views) / searches
  const baseLikelihood = 0.3
  
  if (engagementRate > 5) return Math.min(0.9, baseLikelihood + 0.4)
  if (engagementRate > 2) return Math.min(0.7, baseLikelihood + 0.3)
  if (engagementRate > 1) return Math.min(0.5, baseLikelihood + 0.2)
  
  return baseLikelihood
}

function calculatePropertyPerformance(property: any): PropertyPerformance {
  const views = property.property_views?.[0]?.count || 0
  const favorites = property.property_favorites?.[0]?.count || 0
  const inquiries = property.inquiries?.[0]?.count || 0
  
  // Calculate performance score (0-100)
  const viewScore = Math.min(views * 2, 30)
  const favoriteScore = Math.min(favorites * 5, 30)
  const inquiryScore = Math.min(inquiries * 10, 40)
  const performanceScore = viewScore + favoriteScore + inquiryScore
  
  // Determine market position
  let marketPosition: 'high' | 'medium' | 'low' = 'medium'
  if (performanceScore >= 70) marketPosition = 'high'
  else if (performanceScore <= 30) marketPosition = 'low'
  
  // Generate recommendations
  const recommendations: string[] = []
  if (views < 50) recommendations.push('Increase property visibility through better photos and descriptions')
  if (favorites < 5) recommendations.push('Consider price adjustments or property improvements')
  if (inquiries < 2) recommendations.push('Enhance property listing with virtual tours or detailed floor plans')
  
  return {
    property_id: property.id,
    views_count: views,
    favorites_count: favorites,
    inquiries_count: inquiries,
    performance_score: performanceScore,
    market_position: marketPosition,
    recommendations
  }
}

function analyzeDemandByLocationAndType(properties: any[]): DemandAnalysis[] {
  // Group properties by location and type
  const grouped = properties.reduce((acc: any, property) => {
    const key = `${property.location}_${property.property_type}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(property)
    return acc
  }, {})
  
  return Object.entries(grouped).map(([key, propertyGroup]: [string, any]) => {
    const [location, propertyType] = key.split('_')
    const properties = propertyGroup as any[]
    
    const totalViews = properties.reduce((sum: number, p: any) => sum + (p.property_views?.[0]?.count || 0), 0)
    const totalFavorites = properties.reduce((sum: number, p: any) => sum + (p.property_favorites?.[0]?.count || 0), 0)
    const totalInquiries = properties.reduce((sum: number, p: any) => sum + (p.inquiries?.[0]?.count || 0), 0)
    
    const demandScore = calculateDemandScore([totalViews], [totalFavorites], [totalInquiries])
    const supplyGap = calculateSupplyGap(properties.length, demandScore)
    const priceTrend = calculateAveragePriceTrend(properties)
    
    let marketOpportunity: 'high' | 'medium' | 'low' = 'medium'
    if (demandScore > 0.7 && supplyGap > 0.3) marketOpportunity = 'high'
    else if (demandScore < 0.3 || supplyGap < 0.1) marketOpportunity = 'low'
    
    return {
      location,
      property_type: propertyType,
      demand_score: demandScore,
      supply_gap: supplyGap,
      price_trend: priceTrend,
      market_opportunity: marketOpportunity
    }
  })
}

// Additional helper functions
function groupPropertiesByPeriod(properties: any[], period: string): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}
  
  properties.forEach(property => {
    const date = new Date(property.created_at)
    let periodKey = ''
    
    switch (period) {
      case '7d':
        periodKey = date.toLocaleDateString()
        break
      case '30d':
        periodKey = `${date.getMonth() + 1}/${date.getDate()}`
        break
      case '90d':
        periodKey = `${date.getMonth() + 1}`
        break
      case '1y':
        periodKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        break
      default:
        periodKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    }
    
    if (!grouped[periodKey]) {
      grouped[periodKey] = []
    }
    grouped[periodKey].push(property)
  })
  
  return grouped
}

function calculatePriceChangePercentage(properties: any[]): number {
  if (properties.length < 2) return 0
  
  const sortedProperties = properties.sort((a: any, b: any) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  const firstPrice = sortedProperties[0].price
  const lastPrice = sortedProperties[sortedProperties.length - 1].price
  
  if (firstPrice === 0) return 0
  return ((lastPrice - firstPrice) / firstPrice) * 100
}

function calculateAverageDaysOnMarket(properties: any[]): number {
  const validProperties = properties.filter(p => p.created_at && p.status === 'sold')
  if (validProperties.length === 0) return 0
  
  const totalDays = validProperties.reduce((sum: number, property: any) => {
    const created = new Date(property.created_at)
    const sold = new Date(property.updated_at || property.created_at)
    return sum + Math.ceil((sold.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)
  
  return Math.round(totalDays / validProperties.length)
}

function calculateDemandScore(views: number[], favorites: number[], inquiries: number[]): number {
  const avgViews = views.reduce((a, b) => a + b, 0) / views.length || 0
  const avgFavorites = favorites.reduce((a, b) => a + b, 0) / favorites.length || 0
  const avgInquiries = inquiries.reduce((a, b) => a + b, 0) / inquiries.length || 0
  
  // Normalize scores (0-1)
  const viewScore = Math.min(avgViews / 100, 1)
  const favoriteScore = Math.min(avgFavorites / 20, 1)
  const inquiryScore = Math.min(avgInquiries / 10, 1)
  
  // Weighted average
  return (viewScore * 0.4 + favoriteScore * 0.4 + inquiryScore * 0.2)
}

function calculateSupplyScore(propertyCount: number, averagePrice: number): number {
  // Normalize supply based on property count and price
  const countScore = Math.min(propertyCount / 50, 1) // Max 50 properties
  const priceScore = averagePrice > 0 ? Math.min(averagePrice / 1000000, 1) : 0.5
  
  return (countScore * 0.6 + priceScore * 0.4)
}

function calculateSupplyGap(propertyCount: number, demandScore: number): number {
  // Supply gap: difference between demand and available supply
  const normalizedSupply = Math.min(propertyCount / 100, 1) // Normalize to 0-1
  return Math.max(0, demandScore - normalizedSupply)
}

function calculateAveragePriceTrend(properties: any[]): number {
  if (properties.length < 2) return 0
  
  const sortedProperties = properties.sort((a: any, b: any) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  const firstPrice = sortedProperties[0].price
  const lastPrice = sortedProperties[sortedProperties.length - 1].price
  
  if (firstPrice === 0) return 0
  return ((lastPrice - firstPrice) / firstPrice) * 100
}
