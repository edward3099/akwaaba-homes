import { createClient } from '@supabase/supabase-js'

// Cache configuration
interface CacheConfig {
  defaultTTL: number // seconds
  maxSize: number // maximum number of items in cache
  cleanupInterval: number // milliseconds
}

// Cache item structure
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

// Cache statistics
interface CacheStats {
  hits: number
  misses: number
  size: number
  evictions: number
  totalRequests: number
}

export class CacheService {
  private cache: Map<string, CacheItem<any>>
  private config: CacheConfig
  private stats: CacheStats
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60000, // 1 minute
      ...config
    }

    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      evictions: 0,
      totalRequests: 0
    }

    this.startCleanupTimer()
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: (ttl || this.config.defaultTTL) * 1000,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed()
    }

    this.cache.set(key, item)
    this.stats.size = this.cache.size
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    this.stats.totalRequests++

    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      return null
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = Date.now()
    this.stats.hits++

    return item.data
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.size = this.cache.size
    }
    return deleted
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    if (this.stats.totalRequests === 0) return 0
    return (this.stats.hits / this.stats.totalRequests) * 100
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size
  }

  /**
   * Check if an item has expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  /**
   * Evict least used items when cache is full
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries())
    
    // Sort by access count and last accessed time
    entries.sort((a, b) => {
      if (a[1].accessCount !== b[1].accessCount) {
        return a[1].accessCount - b[1].accessCount
      }
      return a[1].lastAccessed - b[1].lastAccessed
    })

    // Remove 10% of least used items
    const itemsToRemove = Math.ceil(this.config.maxSize * 0.1)
    for (let i = 0; i < itemsToRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
      this.stats.evictions++
    }

    this.stats.size = this.cache.size
  }

  /**
   * Start cleanup timer to remove expired items
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size
    }
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

// Redis-like cache service for distributed environments
export class RedisCacheService {
  private supabase: any
  private bucket: string

  constructor(supabase: any, bucket: string = 'cache') {
    this.supabase = supabase
    this.bucket = bucket
  }

  /**
   * Set a value in Redis-like cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: (ttl || 300) * 1000
    }

    try {
      await this.supabase.storage
        .from(this.bucket)
        .upload(`${key}.json`, JSON.stringify(item), {
          contentType: 'application/json',
          upsert: true
        })
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Get a value from Redis-like cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .download(`${key}.json`)

      if (error || !data) return null

      const text = await data.text()
      const item = JSON.parse(text)

      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        await this.delete(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([`${key}.json`])

      return !error
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      const { data } = await this.supabase.storage
        .from(this.bucket)
        .list('', { limit: 1000 })

      if (data) {
        const files = data.map(file => file.name)
        await this.supabase.storage
          .from(this.bucket)
          .remove(files)
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}

// Memory cache instance
export const memoryCache = new CacheService()

// Cache decorator for functions
export function cache(ttl?: number, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator 
        ? keyGenerator(...args) 
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache first
      let result = memoryCache.get(cacheKey)
      if (result !== null) {
        return result
      }

      // Execute method and cache result
      result = await method.apply(this, args)
      memoryCache.set(cacheKey, result, ttl)

      return result
    }
  }
}

// Cache middleware for API routes
export function cacheMiddleware(ttl: number = 300) {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `api:${req.method}:${req.url}:${JSON.stringify(req.query)}`
    
    // Try to get from cache
    const cached = memoryCache.get(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // Store original send method
    const originalSend = res.json

    // Override send method to cache response
    res.json = function(data: any) {
      memoryCache.set(cacheKey, data, ttl)
      return originalSend.call(this, data)
    }

    next()
  }
}

// Cache utilities
export const cacheUtils = {
  /**
   * Generate cache key from object
   */
  generateKey(obj: any, prefix: string = ''): string {
    const sorted = Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = obj[key]
        return result
      }, {})

    return `${prefix}:${JSON.stringify(sorted)}`
  },

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    for (const key of memoryCache['cache'].keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key)
      }
    }
  },

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(keys: string[], dataFetcher: (key: string) => Promise<any>): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const data = await dataFetcher(key)
        memoryCache.set(key, data, 600) // 10 minutes TTL
      } catch (error) {
        console.error(`Cache warmup failed for key ${key}:`, error)
      }
    })

    await Promise.all(promises)
  }
}


















