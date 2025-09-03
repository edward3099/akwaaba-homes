import { supabase } from '@/lib/supabase'
import { memoryCache } from './cacheService'

// Query performance metrics
interface QueryMetrics {
  query: string
  executionTime: number
  rowCount: number
  timestamp: number
  cacheHit: boolean
}

// Query optimization suggestions
interface OptimizationSuggestion {
  type: 'index' | 'query' | 'cache' | 'pagination'
  description: string
  impact: 'high' | 'medium' | 'low'
  implementation: string
}

// Database performance monitoring
interface DatabaseStats {
  totalQueries: number
  averageExecutionTime: number
  cacheHitRate: number
  slowQueries: QueryMetrics[]
  optimizationSuggestions: OptimizationSuggestion[]
}

export class QueryOptimizer {
  private queryMetrics: QueryMetrics[] = []
  private slowQueryThreshold: number = 100 // ms
  private maxMetrics: number = 1000

  /**
   * Execute optimized query with caching
   */
  async executeQuery<T>(
    query: string,
    params: any[] = [],
    cacheKey?: string,
    ttl: number = 300
  ): Promise<T> {
    const startTime = Date.now()
    
    // Try to get from cache first
    if (cacheKey) {
      const cached = memoryCache.get<T>(cacheKey)
      if (cached !== null) {
        this.recordQueryMetrics(query, Date.now() - startTime, 0, true)
        return cached
      }
    }

    try {
      // Execute the query
      const { data, error, count } = await this.executeOptimizedQuery(query, params)
      
      if (error) {
        throw error
      }

      const executionTime = Date.now() - startTime
      const rowCount = count || (Array.isArray(data) ? data.length : 1)

      // Record metrics
      this.recordQueryMetrics(query, executionTime, rowCount, false)

      // Cache the result if cache key provided
      if (cacheKey && data) {
        memoryCache.set(cacheKey, data, ttl)
      }

      return data
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.recordQueryMetrics(query, executionTime, 0, false)
      throw error
    }
  }

  /**
   * Execute the actual query with optimization
   */
  private async executeOptimizedQuery(query: string, params: any[]): Promise<any> {
    // For Supabase, we'll use the query builder approach
    // This is a simplified example - in practice, you'd parse the query
    // and use Supabase's query builder methods
    
    if (query.includes('SELECT') && query.includes('properties')) {
      return this.optimizePropertiesQuery(query, params)
    }
    
    if (query.includes('SELECT') && query.includes('users')) {
      return this.optimizeUsersQuery(query, params)
    }

    // Default execution
    return { data: null, error: null, count: 0 }
  }

  /**
   * Optimize properties queries
   */
  private async optimizePropertiesQuery(query: string, params: any[]): Promise<any> {
    // Extract filters from query
    const filters = this.extractFilters(query)
    
    let queryBuilder = supabase
      .from('properties')
      .select('*, property_images(*), users!properties_seller_id_fkey(*)')

    // Apply filters with optimization
    if (filters.location) {
      queryBuilder = queryBuilder.eq('location', filters.location)
    }
    
    if (filters.minPrice) {
      queryBuilder = queryBuilder.gte('price', filters.minPrice)
    }
    
    if (filters.maxPrice) {
      queryBuilder = queryBuilder.lte('price', filters.maxPrice)
    }
    
    if (filters.bedrooms) {
      queryBuilder = queryBuilder.eq('bedrooms', filters.bedrooms)
    }
    
    if (filters.propertyType) {
      queryBuilder = queryBuilder.eq('property_type', filters.propertyType)
    }

    // Add pagination for large result sets
    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit)
    }

    // Add ordering for consistent results
    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    return queryBuilder
  }

  /**
   * Optimize users queries
   */
  private async optimizeUsersQuery(query: string, params: any[]): Promise<any> {
    const filters = this.extractFilters(query)
    
    let queryBuilder = supabase
      .from('users')
      .select('*')

    if (filters.userType) {
      queryBuilder = queryBuilder.eq('user_type', filters.userType)
    }
    
    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status)
    }

    // Add pagination
    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit)
    }

    return queryBuilder
  }

  /**
   * Extract filters from query string
   */
  private extractFilters(query: string): any {
    const filters: any = {}
    
    // Simple regex-based filter extraction
    const locationMatch = query.match(/location\s*=\s*['"]([^'"]+)['"]/)
    if (locationMatch) filters.location = locationMatch[1]
    
    const minPriceMatch = query.match(/price\s*>=\s*(\d+)/)
    if (minPriceMatch) filters.minPrice = parseInt(minPriceMatch[1])
    
    const maxPriceMatch = query.match(/price\s*<=\s*(\d+)/)
    if (maxPriceMatch) filters.maxPrice = parseInt(maxPriceMatch[1])
    
    const bedroomsMatch = query.match(/bedrooms\s*=\s*(\d+)/)
    if (bedroomsMatch) filters.bedrooms = parseInt(bedroomsMatch[1])
    
    const propertyTypeMatch = query.match(/property_type\s*=\s*['"]([^'"]+)['"]/)
    if (propertyTypeMatch) filters.propertyType = propertyTypeMatch[1]
    
    const userTypeMatch = query.match(/user_type\s*=\s*['"]([^'"]+)['"]/)
    if (userTypeMatch) filters.userType = userTypeMatch[1]
    
    const statusMatch = query.match(/status\s*=\s*['"]([^'"]+)['"]/)
    if (statusMatch) filters.status = statusMatch[1]
    
    const limitMatch = query.match(/LIMIT\s+(\d+)/i)
    if (limitMatch) filters.limit = parseInt(limitMatch[1])

    return filters
  }

  /**
   * Record query metrics for performance monitoring
   */
  private recordQueryMetrics(
    query: string,
    executionTime: number,
    rowCount: number,
    cacheHit: boolean
  ): void {
    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      executionTime,
      rowCount,
      timestamp: Date.now(),
      cacheHit
    }

    this.queryMetrics.push(metric)

    // Keep only the last N metrics
    if (this.queryMetrics.length > this.maxMetrics) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetrics)
    }
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    return query
      .replace(/password\s*=\s*['"][^'"]*['"]/gi, 'password=***')
      .replace(/token\s*=\s*['"][^'"]*['"]/gi, 'token=***')
      .replace(/key\s*=\s*['"][^'"]*['"]/gi, 'key=***')
  }

  /**
   * Get database performance statistics
   */
  getDatabaseStats(): DatabaseStats {
    const totalQueries = this.queryMetrics.length
    const averageExecutionTime = totalQueries > 0 
      ? this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
      : 0
    
    const cacheHitRate = totalQueries > 0
      ? (this.queryMetrics.filter(m => m.cacheHit).length / totalQueries) * 100
      : 0

    const slowQueries = this.queryMetrics
      .filter(m => m.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10)

    const optimizationSuggestions = this.generateOptimizationSuggestions()

    return {
      totalQueries,
      averageExecutionTime,
      cacheHitRate,
      slowQueries,
      optimizationSuggestions
    }
  }

  /**
   * Generate optimization suggestions based on metrics
   */
  private generateOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    
    // Analyze slow queries
    const slowQueries = this.queryMetrics.filter(m => m.executionTime > this.slowQueryThreshold)
    
    if (slowQueries.length > 0) {
      // Check for common patterns
      const propertyQueries = slowQueries.filter(m => m.query.includes('properties'))
      const userQueries = slowQueries.filter(m => m.query.includes('users'))
      
      if (propertyQueries.length > 0) {
        suggestions.push({
          type: 'index',
          description: 'Add indexes on frequently queried property fields',
          impact: 'high',
          implementation: 'CREATE INDEX idx_properties_location ON properties(location); CREATE INDEX idx_properties_price ON properties(price);'
        })
      }
      
      if (userQueries.length > 0) {
        suggestions.push({
          type: 'index',
          description: 'Add indexes on user type and status fields',
          impact: 'medium',
          implementation: 'CREATE INDEX idx_users_type_status ON users(user_type, status);'
        })
      }
    }

    // Check cache hit rate
    const cacheHitRate = this.queryMetrics.length > 0
      ? (this.queryMetrics.filter(m => m.cacheHit).length / this.queryMetrics.length) * 100
      : 0

    if (cacheHitRate < 50) {
      suggestions.push({
        type: 'cache',
        description: 'Improve caching strategy for frequently accessed data',
        impact: 'high',
        implementation: 'Implement cache warming and increase TTL for popular queries'
      })
    }

    // Check for pagination issues
    const largeResultQueries = this.queryMetrics.filter(m => m.rowCount > 100)
    if (largeResultQueries.length > 0) {
      suggestions.push({
        type: 'pagination',
        description: 'Implement pagination for large result sets',
        impact: 'medium',
        implementation: 'Add LIMIT and OFFSET to queries returning large datasets'
      })
    }

    return suggestions
  }

  /**
   * Get slow query analysis
   */
  getSlowQueryAnalysis(): any {
    const slowQueries = this.queryMetrics
      .filter(m => m.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)

    const analysis = {
      totalSlowQueries: slowQueries.length,
      averageSlowQueryTime: slowQueries.length > 0
        ? slowQueries.reduce((sum, m) => sum + m.executionTime, 0) / slowQueries.length
        : 0,
      slowestQueries: slowQueries.slice(0, 5),
      recommendations: this.generateOptimizationSuggestions()
    }

    return analysis
  }

  /**
   * Clear query metrics
   */
  clearMetrics(): void {
    this.queryMetrics = []
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold
  }

  /**
   * Get query performance trends
   */
  getPerformanceTrends(timeWindow: number = 3600000): any {
    const now = Date.now()
    const recentMetrics = this.queryMetrics.filter(m => now - m.timestamp < timeWindow)
    
    if (recentMetrics.length === 0) {
      return { trend: 'no_data', message: 'No recent query data available' }
    }

    const recentAvg = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length
    const olderMetrics = this.queryMetrics.filter(m => now - m.timestamp >= timeWindow)
    
    if (olderMetrics.length === 0) {
      return { trend: 'stable', message: 'Performance appears stable', averageTime: recentAvg }
    }

    const olderAvg = olderMetrics.reduce((sum, m) => sum + m.executionTime, 0) / olderMetrics.length
    const change = ((recentAvg - olderAvg) / olderAvg) * 100

    if (change > 10) {
      return { trend: 'degrading', message: 'Performance appears to be degrading', change: `${change.toFixed(1)}%` }
    } else if (change < -10) {
      return { trend: 'improving', message: 'Performance appears to be improving', change: `${change.toFixed(1)}%` }
    } else {
      return { trend: 'stable', message: 'Performance appears stable', change: `${change.toFixed(1)}%` }
    }
  }
}

// Query optimization utilities
export const queryUtils = {
  /**
   * Generate optimized cache key for queries
   */
  generateCacheKey(table: string, filters: any, limit?: number): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result: any, key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          result[key] = filters[key]
        }
        return result
      }, {})

    return `query:${table}:${JSON.stringify(sortedFilters)}:${limit || 'all'}`
  },

  /**
   * Check if query should be cached
   */
  shouldCache(query: string, rowCount: number): boolean {
    // Don't cache very large result sets
    if (rowCount > 1000) return false
    
    // Don't cache write operations
    if (query.trim().toUpperCase().startsWith('INSERT') ||
        query.trim().toUpperCase().startsWith('UPDATE') ||
        query.trim().toUpperCase().startsWith('DELETE')) {
      return false
    }
    
    return true
  },

  /**
   * Get optimal TTL based on query type
   */
  getOptimalTTL(query: string, rowCount: number): number {
    // Static data gets longer TTL
    if (query.includes('system_config') || query.includes('constants')) {
      return 3600 // 1 hour
    }
    
    // User data gets shorter TTL
    if (query.includes('users') || query.includes('sessions')) {
      return 60 // 1 minute
    }
    
    // Property data gets medium TTL
    if (query.includes('properties')) {
      return 300 // 5 minutes
    }
    
    // Default TTL
    return 180 // 3 minutes
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer()



























