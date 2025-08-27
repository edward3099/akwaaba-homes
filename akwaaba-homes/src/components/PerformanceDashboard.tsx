'use client'

import React, { useState, useEffect } from 'react'
import { memoryCache } from '@/lib/services/cacheService'
import { queryOptimizer } from '@/lib/services/queryOptimizer'
import { imageOptimizer } from '@/lib/services/imageOptimizer'
import { connectionPool } from '@/lib/services/connectionPool'

interface PerformanceMetrics {
  cache: {
    hitRate: number
    size: number
    stats: any
  }
  database: {
    totalQueries: number
    averageExecutionTime: number
    cacheHitRate: number
    slowQueries: any[]
    optimizationSuggestions: any[]
  }
  images: {
    totalImages: number
    compressionRatio: string
    averageCompression: string
  }
  connections: {
    totalConnections: number
    activeConnections: number
    idleConnections: number
    waitingRequests: number
    averageResponseTime: number
  }
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  useEffect(() => {
    refreshMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const refreshMetrics = async () => {
    setIsRefreshing(true)
    try {
      // Gather metrics from all services
      const cacheStats = memoryCache.getStats()
      const dbStats = queryOptimizer.getDatabaseStats()
      const imageStats = imageOptimizer.getImageStats()
      const connectionStats = connectionPool.getStats()

      setMetrics({
        cache: {
          hitRate: 0, // Default value since hitRate not available
          size: cacheStats.size || 0,
          stats: cacheStats
        },
        database: {
          totalQueries: dbStats.totalQueries,
          averageExecutionTime: dbStats.averageExecutionTime,
          cacheHitRate: dbStats.cacheHitRate,
          slowQueries: dbStats.slowQueries,
          optimizationSuggestions: dbStats.optimizationSuggestions
        },
        images: {
          totalImages: imageStats.totalImages,
          compressionRatio: imageStats.compressionRatio,
          averageCompression: imageStats.averageCompression
        },
        connections: {
          totalConnections: connectionStats.totalConnections,
          activeConnections: connectionStats.activeConnections,
          idleConnections: connectionStats.idleConnections,
          waitingRequests: connectionStats.waitingRequests,
          averageResponseTime: connectionStats.averageResponseTime
        }
      })
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const clearCache = () => {
    memoryCache.clear()
    refreshMetrics()
  }

  const clearMetrics = () => {
    queryOptimizer.clearMetrics()
    refreshMetrics()
  }

  const getPerformanceColor = (value: number, threshold: number, reverse: boolean = false): string => {
    if (reverse) {
      return value > threshold ? 'text-red-500' : value > threshold * 0.7 ? 'text-yellow-500' : 'text-green-500'
    }
    return value < threshold ? 'text-green-500' : value < threshold * 1.3 ? 'text-yellow-500' : 'text-red-500'
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading performance metrics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of system performance, caching, and database optimization
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={refreshMetrics}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
            )}
            
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear Cache
            </button>
            
            <button
              onClick={clearMetrics}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Clear Metrics
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Cache Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hit Rate</span>
                <span className={`font-semibold ${getPerformanceColor(metrics.cache.hitRate, 70)}`}>
                  {metrics.cache.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size</span>
                <span className="font-semibold text-gray-900">{metrics.cache.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hits</span>
                <span className="font-semibold text-gray-900">{metrics.cache.stats.hits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Misses</span>
                <span className="font-semibold text-gray-900">{metrics.cache.stats.misses}</span>
              </div>
            </div>
          </div>

          {/* Database Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Queries</span>
                <span className="font-semibold text-gray-900">{metrics.database.totalQueries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response</span>
                <span className={`font-semibold ${getPerformanceColor(metrics.database.averageExecutionTime, 100)}`}>
                  {metrics.database.averageExecutionTime.toFixed(1)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Hit Rate</span>
                <span className={`font-semibold ${getPerformanceColor(metrics.database.cacheHitRate, 50)}`}>
                  {metrics.database.cacheHitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slow Queries</span>
                <span className={`font-semibold ${getPerformanceColor(metrics.database.slowQueries.length, 5, true)}`}>
                  {metrics.database.slowQueries.length}
                </span>
              </div>
            </div>
          </div>

          {/* Image Optimization */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Optimization</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Images</span>
                <span className="font-semibold text-gray-900">{metrics.images.totalImages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compression</span>
                <span className="font-semibold text-green-600">{metrics.images.compressionRatio}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Compression</span>
                <span className="font-semibold text-green-600">{metrics.images.averageCompression}</span>
              </div>
            </div>
          </div>

          {/* Connection Pool */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Pool</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Connections</span>
                <span className="font-semibold text-gray-900">{metrics.connections.totalConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-blue-600">{metrics.connections.activeConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Idle</span>
                <span className="font-semibold text-green-600">{metrics.connections.idleConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waiting</span>
                <span className={`font-semibold ${getPerformanceColor(metrics.connections.waitingRequests, 0, true)}`}>
                  {metrics.connections.waitingRequests}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slow Queries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Slow Queries</h3>
            {metrics.database.slowQueries.length > 0 ? (
              <div className="space-y-3">
                {metrics.database.slowQueries.slice(0, 5).map((query, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-red-800">
                        {query.executionTime}ms
                      </span>
                      <span className="text-xs text-red-600">
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 font-mono break-all">
                      {query.query.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No slow queries detected</p>
            )}
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h3>
            {metrics.database.optimizationSuggestions.length > 0 ? (
              <div className="space-y-3">
                {metrics.database.optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {suggestion.impact.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-blue-800">
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">{suggestion.description}</p>
                    <details className="text-xs text-blue-600">
                      <summary className="cursor-pointer hover:text-blue-800">Show Implementation</summary>
                      <pre className="mt-2 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
                        {suggestion.implementation}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No optimization suggestions</p>
            )}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.database.averageExecutionTime.toFixed(1)}ms
              </div>
              <div className="text-sm text-gray-600">Average Query Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.cache.hitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.connections.averageResponseTime.toFixed(1)}ms
              </div>
              <div className="text-sm text-gray-600">Connection Response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


















