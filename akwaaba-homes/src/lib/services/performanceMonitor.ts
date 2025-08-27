import { connectionPool } from './connectionPool'
import { memoryCache } from './cacheService'
import { queryOptimizer } from './queryOptimizer'
import { cdnService } from './cdnService'

// Performance metrics interface
interface PerformanceMetrics {
  timestamp: number
  database: DatabaseMetrics
  cache: CacheMetrics
  cdn: CDNMetrics
  api: APIMetrics
  system: SystemMetrics
}

interface DatabaseMetrics {
  connectionPool: {
    totalConnections: number
    activeConnections: number
    idleConnections: number
    waitingRequests: number
    averageResponseTime: number
  }
  queryPerformance: {
    totalQueries: number
    averageExecutionTime: number
    cacheHitRate: number
    slowQueries: number
  }
  tablePerformance: {
    totalTables: number
    totalIndexes: number
    averageTableSize: string
    indexUsageEfficiency: number
  }
}

interface CacheMetrics {
  hitRate: number
  totalRequests: number
  cacheSize: number
  evictions: number
  memoryUsage: string
}

interface CDNMetrics {
  cacheHitRatio: number
  totalRequests: number
  averageResponseTime: number
  regions: string[]
  optimizationRecommendations: string[]
}

interface APIMetrics {
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  activeConnections: number
  throughput: number
}

interface SystemMetrics {
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  networkLatency: number
  uptime: number
}

// Performance alert interface
interface PerformanceAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: number
  resolved: boolean
}

// Performance optimization recommendations
interface OptimizationRecommendation {
  category: 'database' | 'cache' | 'cdn' | 'api' | 'system'
  priority: 'high' | 'medium' | 'low'
  description: string
  impact: string
  implementation: string
  estimatedImprovement: string
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private alerts: PerformanceAlert[] = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private alertThresholds: Map<string, number> = new Map()
  private optimizationHistory: OptimizationRecommendation[] = []

  private constructor() {
    this.initializeAlertThresholds()
    this.startMonitoring()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Initialize performance alert thresholds
   */
  private initializeAlertThresholds(): void {
    this.alertThresholds.set('database_response_time', 1000) // 1 second
    this.alertThresholds.set('cache_hit_rate', 70) // 70%
    this.alertThresholds.set('cdn_response_time', 500) // 500ms
    this.alertThresholds.set('api_response_time', 2000) // 2 seconds
    this.alertThresholds.set('memory_usage', 80) // 80%
    this.alertThresholds.set('cpu_usage', 85) // 85%
    this.alertThresholds.set('connection_pool_utilization', 90) // 90%
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.analyzePerformance()
      this.generateAlerts()
      this.generateOptimizationRecommendations()
    }, 30000) // Every 30 seconds
  }

  /**
   * Collect comprehensive performance metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = Date.now()

      // Collect database metrics
      const dbMetrics = await this.collectDatabaseMetrics()
      
      // Collect cache metrics
      const cacheMetrics = this.collectCacheMetrics()
      
      // Collect CDN metrics
      const cdnMetrics = await this.collectCDNMetrics()
      
      // Collect API metrics
      const apiMetrics = this.collectAPIMetrics()
      
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics()

      const metrics: PerformanceMetrics = {
        timestamp,
        database: dbMetrics,
        cache: cacheMetrics,
        cdn: cdnMetrics,
        api: apiMetrics,
        system: systemMetrics
      }

      this.metrics.push(metrics)

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000)
      }

      // Store in cache for quick access
      memoryCache.set('latest_performance_metrics', metrics, 60)
      memoryCache.set('performance_metrics_history', this.metrics.slice(-100), 300)

    } catch (error) {
      console.error('Error collecting performance metrics:', error)
    }
  }

  /**
   * Collect database performance metrics
   */
  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Get connection pool stats
      const poolStats = connectionPool.getStats()
      const poolStatus = connectionPool.getStatus()

      // Get query performance stats
      const queryStats = queryOptimizer.getDatabaseStats()

      // Calculate table performance metrics
      const tablePerformance = await this.calculateTablePerformance()

      return {
        connectionPool: {
          totalConnections: poolStats.totalConnections,
          activeConnections: poolStats.activeConnections,
          idleConnections: poolStats.idleConnections,
          waitingRequests: poolStats.waitingRequests,
          averageResponseTime: poolStats.averageResponseTime
        },
        queryPerformance: {
          totalQueries: queryStats.totalQueries,
          averageExecutionTime: queryStats.averageExecutionTime,
          cacheHitRate: queryStats.cacheHitRate,
          slowQueries: queryStats.slowQueries.length
        },
        tablePerformance
      }
    } catch (error) {
      console.error('Error collecting database metrics:', error)
      return this.getDefaultDatabaseMetrics()
    }
  }

  /**
   * Calculate table performance metrics
   */
  private async calculateTablePerformance(): Promise<{
    totalTables: number
    totalIndexes: number
    averageTableSize: string
    indexUsageEfficiency: number
  }> {
    try {
      // This would typically query the database for table statistics
      // For now, return estimated values
      return {
        totalTables: 15, // Estimated based on your schema
        totalIndexes: 45, // Estimated based on your indexes
        averageTableSize: '2.5 MB',
        indexUsageEfficiency: 85 // Percentage of indexes being used effectively
      }
    } catch (error) {
      return {
        totalTables: 0,
        totalIndexes: 0,
        averageTableSize: '0 MB',
        indexUsageEfficiency: 0
      }
    }
  }

  /**
   * Collect cache performance metrics
   */
  private collectCacheMetrics(): CacheMetrics {
    try {
      const stats = memoryCache.getStats()
      const size = memoryCache.getSize()
      
      // Estimate memory usage (rough calculation)
      const estimatedMemoryUsage = (size * 1024).toString() + ' KB'

      return {
        hitRate: memoryCache.getHitRate(),
        totalRequests: stats.totalRequests,
        cacheSize: size,
        evictions: stats.evictions,
        memoryUsage: estimatedMemoryUsage
      }
    } catch (error) {
      return {
        hitRate: 0,
        totalRequests: 0,
        cacheSize: 0,
        evictions: 0,
        memoryUsage: '0 KB'
      }
    }
  }

  /**
   * Collect CDN performance metrics
   */
  private async collectCDNMetrics(): Promise<CDNMetrics> {
    try {
      // Get CDN metrics for property-images bucket (most commonly used)
      const cdnMetrics = await cdnService.getCDNPerformanceMetrics('property-images', '24h')
      
      return {
        cacheHitRatio: cdnMetrics.cacheHitRatio,
        totalRequests: cdnMetrics.totalRequests,
        averageResponseTime: cdnMetrics.averageResponseTime,
        regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'], // Default regions
        optimizationRecommendations: [] // Will be populated by optimization analysis
      }
    } catch (error) {
      return {
        cacheHitRatio: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        regions: [],
        optimizationRecommendations: []
      }
    }
  }

  /**
   * Collect API performance metrics
   */
  private collectAPIMetrics(): APIMetrics {
    try {
      // This would typically collect from API middleware or logging
      // For now, return estimated values based on connection pool stats
      const poolStats = connectionPool.getStats()
      
      return {
        totalRequests: poolStats.totalRequests,
        averageResponseTime: poolStats.averageResponseTime,
        errorRate: (poolStats.failedRequests / poolStats.totalRequests) * 100,
        activeConnections: poolStats.activeConnections,
        throughput: poolStats.totalRequests / 60 // Requests per minute
      }
    } catch (error) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        activeConnections: 0,
        throughput: 0
      }
    }
  }

  /**
   * Collect system performance metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      // This would typically use system monitoring libraries
      // For now, return estimated values
      return {
        memoryUsage: 65, // Percentage
        cpuUsage: 45, // Percentage
        diskUsage: 30, // Percentage
        networkLatency: 25, // Milliseconds
        uptime: process.uptime() * 1000 // Convert to milliseconds
      }
    } catch (error) {
      return {
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        networkLatency: 0,
        uptime: 0
      }
    }
  }

  /**
   * Analyze performance and identify issues
   */
  private analyzePerformance(): void {
    if (this.metrics.length === 0) return

    const latestMetrics = this.metrics[this.metrics.length - 1]
    
    // Analyze database performance
    this.analyzeDatabasePerformance(latestMetrics.database)
    
    // Analyze cache performance
    this.analyzeCachePerformance(latestMetrics.cache)
    
    // Analyze CDN performance
    this.analyzeCDNPerformance(latestMetrics.cdn)
    
    // Analyze API performance
    this.analyzeAPIPerformance(latestMetrics.api)
    
    // Analyze system performance
    this.analyzeSystemPerformance(latestMetrics.system)
  }

  /**
   * Analyze database performance
   */
  private analyzeDatabasePerformance(metrics: DatabaseMetrics): void {
    // Check connection pool utilization
    const poolUtilization = (metrics.connectionPool.activeConnections / metrics.connectionPool.totalConnections) * 100
    if (poolUtilization > this.alertThresholds.get('connection_pool_utilization')!) {
      this.createAlert('critical', 'High connection pool utilization', 'connection_pool_utilization', poolUtilization)
    }

    // Check query performance
    if (metrics.queryPerformance.averageExecutionTime > this.alertThresholds.get('database_response_time')!) {
      this.createAlert('warning', 'Slow database queries detected', 'database_response_time', metrics.queryPerformance.averageExecutionTime)
    }

    // Check cache hit rate
    if (metrics.queryPerformance.cacheHitRate < this.alertThresholds.get('cache_hit_rate')!) {
      this.createAlert('warning', 'Low database cache hit rate', 'cache_hit_rate', metrics.queryPerformance.cacheHitRate)
    }
  }

  /**
   * Analyze cache performance
   */
  private analyzeCachePerformance(metrics: CacheMetrics): void {
    if (metrics.hitRate < this.alertThresholds.get('cache_hit_rate')!) {
      this.createAlert('warning', 'Low cache hit rate', 'cache_hit_rate', metrics.hitRate)
    }

    if (metrics.evictions > 100) {
      this.createAlert('info', 'High cache eviction rate', 'cache_evictions', metrics.evictions)
    }
  }

  /**
   * Analyze CDN performance
   */
  private analyzeCDNPerformance(metrics: CDNMetrics): void {
    if (metrics.averageResponseTime > this.alertThresholds.get('cdn_response_time')!) {
      this.createAlert('warning', 'Slow CDN response times', 'cdn_response_time', metrics.averageResponseTime)
    }

    if (metrics.cacheHitRatio < 80) {
      this.createAlert('info', 'CDN cache hit ratio below optimal', 'cdn_cache_hit_ratio', metrics.cacheHitRatio)
    }
  }

  /**
   * Analyze API performance
   */
  private analyzeAPIPerformance(metrics: APIMetrics): void {
    if (metrics.averageResponseTime > this.alertThresholds.get('api_response_time')!) {
      this.createAlert('warning', 'Slow API response times', 'api_response_time', metrics.averageResponseTime)
    }

    if (metrics.errorRate > 5) {
      this.createAlert('critical', 'High API error rate', 'api_error_rate', metrics.errorRate)
    }
  }

  /**
   * Analyze system performance
   */
  private analyzeSystemPerformance(metrics: SystemMetrics): void {
    if (metrics.memoryUsage > this.alertThresholds.get('memory_usage')!) {
      this.createAlert('warning', 'High memory usage', 'memory_usage', metrics.memoryUsage)
    }

    if (metrics.cpuUsage > this.alertThresholds.get('cpu_usage')!) {
      this.createAlert('warning', 'High CPU usage', 'cpu_usage', metrics.cpuUsage)
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: 'warning' | 'critical' | 'info',
    message: string,
    metric: string,
    value: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      metric,
      value,
      threshold: this.alertThresholds.get(metric) || 0,
      timestamp: Date.now(),
      resolved: false
    }

    this.alerts.push(alert)
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    // Log alert
    console.log(`Performance Alert [${type.toUpperCase()}]: ${message} - ${metric}: ${value}`)
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(): void {
    if (this.metrics.length === 0) return

    const latestMetrics = this.metrics[this.metrics.length - 1]
    const recommendations: OptimizationRecommendation[] = []

    // Database optimization recommendations
    if (latestMetrics.database.queryPerformance.cacheHitRate < 70) {
      recommendations.push({
        category: 'database',
        priority: 'high',
        description: 'Implement query result caching for frequently accessed data',
        impact: 'High - Can reduce database load by 30-50%',
        implementation: 'Use Redis or in-memory cache for query results with TTL',
        estimatedImprovement: '30-50% reduction in database queries'
      })
    }

    if (latestMetrics.database.connectionPool.waitingRequests > 10) {
      recommendations.push({
        category: 'database',
        priority: 'medium',
        description: 'Increase connection pool size or implement connection pooling',
        impact: 'Medium - Can reduce connection wait times',
        implementation: 'Adjust connection pool configuration or add more database connections',
        estimatedImprovement: '20-30% reduction in connection wait times'
      })
    }

    // Cache optimization recommendations
    if (latestMetrics.cache.hitRate < 70) {
      recommendations.push({
        category: 'cache',
        priority: 'high',
        description: 'Implement cache warming and increase TTL for popular data',
        impact: 'High - Can improve response times by 40-60%',
        implementation: 'Pre-populate cache with frequently accessed data and increase TTL',
        estimatedImprovement: '40-60% improvement in response times'
      })
    }

    // CDN optimization recommendations
    if (latestMetrics.cdn.cacheHitRatio < 80) {
      recommendations.push({
        category: 'cdn',
        priority: 'medium',
        description: 'Implement CDN cache warming and optimize cache headers',
        impact: 'Medium - Can improve asset delivery by 25-40%',
        implementation: 'Pre-warm CDN cache and optimize cache control headers',
        estimatedImprovement: '25-40% improvement in asset delivery'
      })
    }

    // API optimization recommendations
    if (latestMetrics.api.averageResponseTime > 1000) {
      recommendations.push({
        category: 'api',
        priority: 'high',
        description: 'Implement API response caching and optimize database queries',
        impact: 'High - Can reduce API response times by 50-70%',
        implementation: 'Cache API responses and optimize database queries with proper indexing',
        estimatedImprovement: '50-70% reduction in API response times'
      })
    }

    // System optimization recommendations
    if (latestMetrics.system.memoryUsage > 80) {
      recommendations.push({
        category: 'system',
        priority: 'medium',
        description: 'Optimize memory usage and implement garbage collection',
        impact: 'Medium - Can prevent memory-related crashes',
        implementation: 'Review memory usage patterns and implement proper cleanup',
        estimatedImprovement: '20-30% reduction in memory usage'
      })
    }

    // Store recommendations
    this.optimizationHistory.push(...recommendations)
    
    // Keep only last 50 recommendations
    if (this.optimizationHistory.length > 50) {
      this.optimizationHistory = this.optimizationHistory.slice(-50)
    }

    // Cache recommendations
    memoryCache.set('performance_optimization_recommendations', recommendations, 300)
  }

  /**
   * Get latest performance metrics
   */
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  /**
   * Get performance metrics history
   */
  getMetricsHistory(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit)
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      return true
    }
    return false
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    return [...this.optimizationHistory]
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    overall: 'excellent' | 'good' | 'fair' | 'poor'
    score: number
    issues: number
    recommendations: number
  } {
    if (this.metrics.length === 0) {
      return {
        overall: 'good',
        score: 75,
        issues: 0,
        recommendations: 0
      }
    }

    const latestMetrics = this.metrics[this.metrics.length - 1]
    const activeAlerts = this.getActiveAlerts()
    const recommendations = this.getOptimizationRecommendations()

    // Calculate performance score (0-100)
    let score = 100

    // Deduct points for various issues
    if (latestMetrics.database.queryPerformance.averageExecutionTime > 1000) score -= 20
    if (latestMetrics.cache.hitRate < 70) score -= 15
    if (latestMetrics.cdn.averageResponseTime > 500) score -= 10
    if (latestMetrics.api.averageResponseTime > 2000) score -= 20
    if (latestMetrics.system.memoryUsage > 80) score -= 10

    // Determine overall performance
    let overall: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) overall = 'excellent'
    else if (score >= 75) overall = 'good'
    else if (score >= 60) overall = 'fair'
    else overall = 'poor'

    return {
      overall,
      score: Math.max(0, score),
      issues: activeAlerts.length,
      recommendations: recommendations.length
    }
  }

  /**
   * Export performance report
   */
  exportPerformanceReport(): {
    summary: any
    metrics: PerformanceMetrics[]
    alerts: PerformanceAlert[]
    recommendations: OptimizationRecommendation[]
    timestamp: number
  } {
    return {
      summary: this.getPerformanceSummary(),
      metrics: this.getMetricsHistory(100),
      alerts: this.getAllAlerts(),
      recommendations: this.getOptimizationRecommendations(),
      timestamp: Date.now()
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * Get default database metrics
   */
  private getDefaultDatabaseMetrics(): DatabaseMetrics {
    return {
      connectionPool: {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingRequests: 0,
        averageResponseTime: 0
      },
      queryPerformance: {
        totalQueries: 0,
        averageExecutionTime: 0,
        cacheHitRate: 0,
        slowQueries: 0
      },
      tablePerformance: {
        totalTables: 0,
        totalIndexes: 0,
        averageTableSize: '0 MB',
        indexUsageEfficiency: 0
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Performance monitoring utilities
export const performanceUtils = {
  /**
   * Get performance status for dashboard
   */
  getDashboardStatus() {
    const monitor = PerformanceMonitor.getInstance()
    return {
      summary: monitor.getPerformanceSummary(),
      latestMetrics: monitor.getLatestMetrics(),
      activeAlerts: monitor.getActiveAlerts().slice(0, 5), // Top 5 alerts
      recentRecommendations: monitor.getOptimizationRecommendations().slice(0, 3) // Top 3 recommendations
    }
  },

  /**
   * Check if performance is healthy
   */
  isPerformanceHealthy(): boolean {
    const monitor = PerformanceMonitor.getInstance()
    const summary = monitor.getPerformanceSummary()
    return summary.overall === 'excellent' || summary.overall === 'good'
  },

  /**
   * Get critical alerts count
   */
  getCriticalAlertsCount(): number {
    const monitor = PerformanceMonitor.getInstance()
    return monitor.getActiveAlerts().filter(alert => alert.type === 'critical').length
  }
}






