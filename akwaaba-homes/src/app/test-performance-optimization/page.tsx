'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { performanceMonitor, performanceUtils } from '@/lib/services/performanceMonitor'
import { connectionPool } from '@/lib/services/connectionPool'
import { memoryCache } from '@/lib/services/cacheService'
import { queryOptimizer } from '@/lib/services/queryOptimizer'
import { cdnService } from '@/lib/services/cdnService'

interface PerformanceData {
  summary: any
  latestMetrics: any
  activeAlerts: any[]
  recentRecommendations: any[]
}

export default function TestPerformanceOptimization() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    loadPerformanceData()
    const interval = setInterval(loadPerformanceData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadPerformanceData = async () => {
    try {
      const data = performanceUtils.getDashboardStatus()
      setPerformanceData(data)
    } catch (error) {
      console.error('Error loading performance data:', error)
    }
  }

  const runPerformanceTests = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      // Test connection pool
      results.connectionPool = await testConnectionPool()
      
      // Test cache performance
      results.cache = await testCachePerformance()
      
      // Test query optimization
      results.queryOptimization = await testQueryOptimization()
      
      // Test CDN performance
      results.cdn = await testCDNPerformance()
      
      // Test overall performance
      results.overall = await testOverallPerformance()

      setTestResults(results)
    } catch (error) {
      console.error('Error running performance tests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testConnectionPool = async () => {
    const startTime = Date.now()
    const results = []

    try {
      // Test connection acquisition
      const client = await connectionPool.getConnection()
      const acquisitionTime = Date.now() - startTime
      results.push({ test: 'Connection Acquisition', time: acquisitionTime, status: 'success' })

      // Test connection health
      const isHealthy = await connectionPool.healthCheck()
      results.push({ test: 'Connection Health Check', time: Date.now() - startTime, status: isHealthy ? 'success' : 'failed' })

      // Get pool statistics
      const stats = connectionPool.getStats()
      results.push({ test: 'Pool Statistics', data: stats, status: 'success' })

      // Release connection
      connectionPool.releaseConnection(client)
      results.push({ test: 'Connection Release', time: Date.now() - startTime, status: 'success' })

      return { results, totalTime: Date.now() - startTime, status: 'success' }
    } catch (error) {
      return { results, error: error.message, status: 'failed' }
    }
  }

  const testCachePerformance = async () => {
    const startTime = Date.now()
    const results = []

    try {
      // Test cache set operations
      const testData = { id: 1, name: 'Test Property', price: 250000 }
      const setStart = Date.now()
      memoryCache.set('test_property', testData, 60)
      const setTime = Date.now() - setStart
      results.push({ test: 'Cache Set', time: setTime, status: 'success' })

      // Test cache get operations
      const getStart = Date.now()
      const retrieved = memoryCache.get('test_property')
      const getTime = Date.now() - getStart
      results.push({ test: 'Cache Get', time: getTime, status: retrieved ? 'success' : 'failed' })

      // Test cache hit rate
      const hitRate = memoryCache.getHitRate()
      results.push({ test: 'Cache Hit Rate', value: hitRate, status: 'success' })

      // Test cache statistics
      const stats = memoryCache.getStats()
      results.push({ test: 'Cache Statistics', data: stats, status: 'success' })

      // Clean up test data
      memoryCache.delete('test_property')

      return { results, totalTime: Date.now() - startTime, status: 'success' }
    } catch (error) {
      return { results, error: error.message, status: 'failed' }
    }
  }

  const testQueryOptimization = async () => {
    const startTime = Date.now()
    const results = []

    try {
      // Test database statistics
      const dbStats = queryOptimizer.getDatabaseStats()
      results.push({ test: 'Database Statistics', data: dbStats, status: 'success' })

      // Test slow query analysis
      const slowQueryAnalysis = queryOptimizer.getSlowQueryAnalysis()
      results.push({ test: 'Slow Query Analysis', data: slowQueryAnalysis, status: 'success' })

      // Test performance trends
      const trends = queryOptimizer.getPerformanceTrends(3600000) // 1 hour
      results.push({ test: 'Performance Trends', data: trends, status: 'success' })

      return { results, totalTime: Date.now() - startTime, status: 'success' }
    } catch (error) {
      return { results, error: error.message, status: 'failed' }
    }
  }

  const testCDNPerformance = async () => {
    const startTime = Date.now()
    const results = []

    try {
      // Test CDN performance metrics
      const cdnMetrics = await cdnService.getCDNPerformanceMetrics('property-images', '24h')
      results.push({ test: 'CDN Performance Metrics', data: cdnMetrics, status: 'success' })

      // Test CDN optimization
      const optimization = await cdnService.optimizeCDNSettings('property-images')
      results.push({ test: 'CDN Optimization', data: optimization, status: 'success' })

      return { results, totalTime: Date.now() - startTime, status: 'success' }
    } catch (error) {
      return { results, error: error.message, status: 'failed' }
    }
  }

  const testOverallPerformance = async () => {
    const startTime = Date.now()
    const results = []

    try {
      // Get performance summary
      const summary = performanceMonitor.getPerformanceSummary()
      results.push({ test: 'Performance Summary', data: summary, status: 'success' })

      // Get latest metrics
      const metrics = performanceMonitor.getLatestMetrics()
      results.push({ test: 'Latest Metrics', data: metrics, status: 'success' })

      // Get active alerts
      const alerts = performanceMonitor.getActiveAlerts()
      results.push({ test: 'Active Alerts', data: alerts, status: 'success' })

      // Get optimization recommendations
      const recommendations = performanceMonitor.getOptimizationRecommendations()
      results.push({ test: 'Optimization Recommendations', data: recommendations, status: 'success' })

      return { results, totalTime: Date.now() - startTime, status: 'success' }
    } catch (error) {
      return { results, error: error.message, status: 'failed' }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case 'good': return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case 'fair': return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
      case 'poor': return <Badge className="bg-red-100 text-red-800">Poor</Badge>
      default: return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (!performanceData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Performance Optimization Testing</h1>
          <p>Loading performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Performance Optimization Testing</h1>
        <p className="text-gray-600">
          Test and monitor all aspects of the performance optimization system including connection pooling, 
          caching, query optimization, CDN performance, and overall system health.
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runPerformanceTests} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Running Tests...' : 'Run Performance Tests'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="cdn">CDN</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.summary.score}/100</div>
                <div className={`text-sm ${getStatusColor(performanceData.summary.overall)}`}>
                  {performanceData.summary.overall}
                </div>
                <Progress value={performanceData.summary.score} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.summary.issues}</div>
                <p className="text-xs text-muted-foreground">Performance alerts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.summary.recommendations}</div>
                <p className="text-xs text-muted-foreground">Optimization suggestions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(performanceUtils.isPerformanceHealthy() ? 'good' : 'poor')}
                <p className="text-xs text-muted-foreground mt-1">
                  {performanceUtils.isPerformanceHealthy() ? 'All systems operational' : 'Issues detected'}
                </p>
              </CardContent>
            </Card>
          </div>

          {performanceData.activeAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Performance Alerts</CardTitle>
                <CardDescription>Current performance issues that require attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {performanceData.activeAlerts.map((alert, index) => (
                  <Alert key={index} className={alert.type === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{alert.message}</span>
                        <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.metric}: {alert.value} (threshold: {alert.threshold})
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {performanceData.recentRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Optimization Recommendations</CardTitle>
                <CardDescription>Suggested improvements for better performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {performanceData.recentRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{rec.description}</span>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.impact}</p>
                    <p className="text-xs text-muted-foreground">{rec.implementation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Connection pool and query performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.latestMetrics?.database && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Connection Pool</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.connectionPool.totalConnections}</div>
                        <div className="text-sm text-muted-foreground">Total Connections</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.connectionPool.activeConnections}</div>
                        <div className="text-sm text-muted-foreground">Active Connections</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.connectionPool.idleConnections}</div>
                        <div className="text-sm text-muted-foreground">Idle Connections</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.connectionPool.waitingRequests}</div>
                        <div className="text-sm text-muted-foreground">Waiting Requests</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Query Performance</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.queryPerformance.totalQueries}</div>
                        <div className="text-sm text-muted-foreground">Total Queries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.queryPerformance.averageExecutionTime.toFixed(2)}ms</div>
                        <div className="text-sm text-muted-foreground">Avg Execution Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.queryPerformance.cacheHitRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{performanceData.latestMetrics.database.queryPerformance.slowQueries}</div>
                        <div className="text-sm text-muted-foreground">Slow Queries</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Memory cache and CDN cache performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.latestMetrics?.cache && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cache.hitRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Hit Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cache.totalRequests}</div>
                      <div className="text-sm text-muted-foreground">Total Requests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cache.cacheSize}</div>
                      <div className="text-sm text-muted-foreground">Cache Size</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cache.evictions}</div>
                      <div className="text-sm text-muted-foreground">Evictions</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cdn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CDN Performance</CardTitle>
              <CardDescription>Content delivery network performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.latestMetrics?.cdn && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cdn.cacheHitRatio.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Cache Hit Ratio</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cdn.totalRequests}</div>
                      <div className="text-sm text-muted-foreground">Total Requests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cdn.averageResponseTime.toFixed(2)}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Response Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{performanceData.latestMetrics.cdn.regions.length}</div>
                      <div className="text-sm text-muted-foreground">Active Regions</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Test Results</CardTitle>
              <CardDescription>Results from the latest performance tests</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <p className="text-muted-foreground">No test results available. Run the performance tests to see results.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                    <div key={testName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h4>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                      
                      {result.error && (
                        <p className="text-red-600 text-sm mb-2">{result.error}</p>
                      )}
                      
                      {result.totalTime && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Total time: {result.totalTime}ms
                        </p>
                      )}
                      
                      {result.results && (
                        <div className="space-y-2">
                          {result.results.map((testResult: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{testResult.test}</span>
                              <div className="flex items-center gap-2">
                                {testResult.time && <span className="text-muted-foreground">{testResult.time}ms</span>}
                                {testResult.value && <span className="text-muted-foreground">{testResult.value}</span>}
                                <Badge variant={testResult.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                                  {testResult.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}






