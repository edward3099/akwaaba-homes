'use client';

import { useState, useEffect } from 'react';
import { cdnService, CDNMonitoringData } from '@/lib/services/cdnService';

interface CDNDashboardProps {
  bucketName: string;
  className?: string;
}

export default function CDNDashboard({ bucketName, className = '' }: CDNDashboardProps) {
  const [metrics, setMetrics] = useState<CDNMonitoringData | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [preloadAssets, setPreloadAssets] = useState<Array<{ bucket: string; path: string; priority: 'high' | 'medium' | 'low' }>>([]);
  const [newAsset, setNewAsset] = useState({ bucket: bucketName, path: '', priority: 'medium' as const });

  useEffect(() => {
    loadMetrics();
  }, [bucketName, timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await cdnService.getCDNPerformanceMetrics(bucketName, timeRange);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load CDN metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setLoading(true);
    try {
      const result = await cdnService.optimizeCDNSettings(bucketName);
      setOptimizationResult(result);
    } catch (error) {
      console.error('Failed to run CDN optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  const preloadSelectedAssets = async () => {
    if (preloadAssets.length === 0) return;
    
    setLoading(true);
    try {
      const result = await cdnService.preloadAssets(preloadAssets);
      console.log('Preload result:', result);
      alert(`Preloaded ${preloadAssets.length} assets`);
    } catch (error) {
      console.error('Failed to preload assets:', error);
      alert('Failed to preload assets');
    } finally {
      setLoading(false);
    }
  };

  const warmUpCache = async () => {
    if (preloadAssets.length === 0) return;
    
    setLoading(true);
    try {
      const filePaths = preloadAssets.map(asset => asset.path);
      const result = await cdnService.warmUpCDNCache(bucketName, filePaths);
      console.log('Cache warmup result:', result);
      alert(`Warmed up cache for ${filePaths.length} assets`);
    } catch (error) {
      console.error('Failed to warm up cache:', error);
      alert('Failed to warm up cache');
    } finally {
      setLoading(false);
    }
  };

  const addAsset = () => {
    if (newAsset.path.trim()) {
      setPreloadAssets([...preloadAssets, { ...newAsset }]);
      setNewAsset({ bucket: bucketName, path: '', priority: 'medium' });
    }
  };

  const removeAsset = (index: number) => {
    setPreloadAssets(preloadAssets.filter((_, i) => i !== index));
  };

  const getCacheStatusColor = (ratio: number) => {
    if (ratio >= 90) return 'text-green-600';
    if (ratio >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (time: number) => {
    if (time < 500) return 'text-green-600';
    if (time < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !metrics) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">CDN Dashboard</h2>
            <p className="text-sm text-gray-600">Bucket: {bucketName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cache Hit Ratio */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Cache Hit Ratio</p>
                  <p className={`text-2xl font-bold ${getCacheStatusColor(metrics.cacheHitRatio)}`}>
                    {metrics.cacheHitRatio.toFixed(1)}%
                  </p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {metrics.cacheHits} hits / {metrics.totalRequests} requests
              </p>
            </div>

            {/* Total Requests */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Requests</p>
                  <p className="text-2xl font-bold text-green-700">
                    {metrics.totalRequests.toLocaleString()}
                  </p>
                </div>
                <div className="text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">
                {metrics.cacheMisses} cache misses
              </p>
            </div>

            {/* Average Response Time */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Response Time</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics.averageResponseTime)}`}>
                    {metrics.averageResponseTime.toFixed(0)}ms
                  </p>
                </div>
                <div className="text-purple-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                {timeRange} average
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Section */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">CDN Optimization</h3>
          <button
            onClick={runOptimization}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Optimization'}
          </button>
        </div>

        {optimizationResult && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Optimization Results</h4>
            <div className="space-y-2">
              {optimizationResult.recommendations?.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Asset Management Section */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Management</h3>
        
        {/* Add New Asset */}
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="text"
            placeholder="Asset path (e.g., images/hero.jpg)"
            value={newAsset.path}
            onChange={(e) => setNewAsset({ ...newAsset, path: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newAsset.priority}
            onChange={(e) => setNewAsset({ ...newAsset, priority: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button
            onClick={addAsset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Asset
          </button>
        </div>

        {/* Asset List */}
        {preloadAssets.length > 0 && (
          <div className="space-y-2 mb-4">
            {preloadAssets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.priority === 'high' ? 'bg-red-100 text-red-800' :
                    asset.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {asset.priority}
                  </span>
                  <span className="text-sm text-gray-700">{asset.path}</span>
                </div>
                <button
                  onClick={() => removeAsset(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={preloadSelectedAssets}
            disabled={loading || preloadAssets.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            Preload Assets
          </button>
          <button
            onClick={warmUpCache}
            disabled={loading || preloadAssets.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
          >
            Warm Up Cache
          </button>
        </div>
      </div>
    </div>
  );
}

