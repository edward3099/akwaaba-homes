import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Connection pool configuration
interface PoolConfig {
  minConnections: number
  maxConnections: number
  acquireTimeout: number
  idleTimeout: number
  maxLifetime: number
  testOnBorrow: boolean
  testOnReturn: boolean
  testWhileIdle: boolean
}

// Connection status
interface ConnectionStatus {
  id: string
  inUse: boolean
  lastUsed: number
  createdAt: number
  errorCount: number
  lastError?: Error
}

// Pool statistics
interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  maxResponseTime: number
  minResponseTime: number
}

// Scaling configuration
interface ScalingConfig {
  enableAutoScaling: boolean
  minPoolSize: number
  maxPoolSize: number
  scaleUpThreshold: number
  scaleDownThreshold: number
  scaleUpFactor: number
  scaleDownFactor: number
  monitoringInterval: number
  cooldownPeriod: number
}

export class ConnectionPool {
  private pool: Map<string, SupabaseClient> = new Map()
  private status: Map<string, ConnectionStatus> = new Map()
  private waitingQueue: Array<{
    resolve: (client: SupabaseClient) => void
    reject: (error: Error) => void
    timestamp: number
  }> = []
  
  private config: PoolConfig
  private scalingConfig: ScalingConfig
  private stats: PoolStats
  private monitoringTimer: NodeJS.Timeout | null = null
  private lastScaleUp: number = 0
  private lastScaleDown: number = 0

  constructor(
    poolConfig: Partial<PoolConfig> = {},
    scalingConfig: Partial<ScalingConfig> = {}
  ) {
    this.config = {
      minConnections: 2,
      maxConnections: 10,
      acquireTimeout: 5000,
      idleTimeout: 30000,
      maxLifetime: 300000,
      testOnBorrow: true,
      testOnReturn: true,
      testWhileIdle: true,
      ...poolConfig
    }

    this.scalingConfig = {
      enableAutoScaling: true,
      minPoolSize: 2,
      maxPoolSize: 20,
      scaleUpThreshold: 0.8, // 80% utilization
      scaleDownThreshold: 0.3, // 30% utilization
      scaleUpFactor: 1.5,
      scaleDownFactor: 0.7,
      monitoringInterval: 30000, // 30 seconds
      cooldownPeriod: 60000, // 1 minute
      ...scalingConfig
    }

    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: 0
    }

    this.initializePool()
    this.startMonitoring()
  }

  /**
   * Initialize the connection pool
   */
  private async initializePool(): Promise<void> {
    try {
      // Create minimum number of connections
      for (let i = 0; i < this.config.minConnections; i++) {
        await this.createConnection()
      }
      
      console.log(`Connection pool initialized with ${this.config.minConnections} connections`)
    } catch (error) {
      console.error('Failed to initialize connection pool:', error)
      throw error
    }
  }

  /**
   * Create a new Supabase client connection
   */
  private async createConnection(): Promise<string> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Test the connection
      if (this.config.testOnBorrow) {
        await this.testConnection(client)
      }

      this.pool.set(connectionId, client)
      this.status.set(connectionId, {
        id: connectionId,
        inUse: false,
        lastUsed: Date.now(),
        createdAt: Date.now(),
        errorCount: 0
      })

      this.stats.totalConnections++
      this.stats.idleConnections++

      return connectionId
    } catch (error) {
      console.error(`Failed to create connection ${connectionId}:`, error)
      throw error
    }
  }

  /**
   * Test connection health
   */
  private async testConnection(client: SupabaseClient): Promise<boolean> {
    try {
      // Simple health check query
      const { error } = await client.from('users').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<SupabaseClient> {
    const startTime = Date.now()
    this.stats.totalRequests++
    this.stats.waitingRequests++

    try {
      // Try to find an available connection
      let connectionId = this.findAvailableConnection()
      
      if (!connectionId) {
        // No available connections, try to create a new one
        if (this.pool.size < this.config.maxConnections) {
          connectionId = await this.createConnection()
        } else {
          // Wait for a connection to become available
          const client = await this.waitForConnection()
          this.stats.waitingRequests--
          this.recordResponseTime(Date.now() - startTime)
          this.stats.successfulRequests++
          return client
        }
      }

      // Mark connection as in use
      const status = this.status.get(connectionId)!
      status.inUse = true
      status.lastUsed = Date.now()
      
      this.stats.activeConnections++
      this.stats.idleConnections--
      this.stats.waitingRequests--

      const client = this.pool.get(connectionId)!
      
      // Test connection before returning
      if (this.config.testOnBorrow) {
        const isHealthy = await this.testConnection(client)
        if (!isHealthy) {
          await this.removeConnection(connectionId)
          return this.getConnection() // Retry
        }
      }

      this.recordResponseTime(Date.now() - startTime)
      this.stats.successfulRequests++
      
      return client
    } catch (error) {
      this.stats.waitingRequests--
      this.stats.failedRequests++
      this.recordResponseTime(Date.now() - startTime)
      throw error
    }
  }

  /**
   * Find an available connection
   */
  private findAvailableConnection(): string | null {
    for (const [id, status] of this.status.entries()) {
      if (!status.inUse) {
        return id
      }
    }
    return null
  }

  /**
   * Wait for a connection to become available
   */
  private waitForConnection(): Promise<SupabaseClient> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection acquisition timeout'))
      }, this.config.acquireTimeout)

      this.waitingQueue.push({
        resolve: (client: SupabaseClient) => {
          clearTimeout(timeout)
          resolve(client)
        },
        reject: (error: Error) => {
          clearTimeout(timeout)
          reject(error)
        },
        timestamp: Date.now()
      })
    })
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(client: SupabaseClient): void {
    // Find the connection ID
    let connectionId: string | null = null
    for (const [id, conn] of this.pool.entries()) {
      if (conn === client) {
        connectionId = id
        break
      }
    }

    if (!connectionId) {
      console.warn('Attempted to release unknown connection')
      return
    }

    const status = this.status.get(connectionId)!
    
    // Test connection before returning to pool
    if (this.config.testOnReturn) {
      this.testConnection(client).then(isHealthy => {
        if (!isHealthy) {
          this.removeConnection(connectionId!)
          return
        }
        this.returnConnectionToPool(connectionId!)
      }).catch(() => {
        this.removeConnection(connectionId!)
      })
    } else {
      this.returnConnectionToPool(connectionId)
    }
  }

  /**
   * Return connection to pool
   */
  private returnConnectionToPool(connectionId: string): void {
    const status = this.status.get(connectionId)!
    status.inUse = false
    status.lastUsed = Date.now()
    
    this.stats.activeConnections--
    this.stats.idleConnections++

    // Check if there are waiting requests
    if (this.waitingQueue.length > 0) {
      const request = this.waitingQueue.shift()!
      const client = this.pool.get(connectionId)!
      
      // Mark connection as in use again
      status.inUse = true
      this.stats.activeConnections++
      this.stats.idleConnections--
      
      request.resolve(client)
    }
  }

  /**
   * Remove a connection from the pool
   */
  private async removeConnection(connectionId: string): Promise<void> {
    const client = this.pool.get(connectionId)
    if (client) {
      // Close the connection if it has a close method
      if (typeof (client as any).close === 'function') {
        try {
          await (client as any).close()
        } catch (error) {
          console.warn(`Error closing connection ${connectionId}:`, error)
        }
      }
    }

    this.pool.delete(connectionId)
    this.status.delete(connectionId)
    
    this.stats.totalConnections--
    if (this.status.get(connectionId)?.inUse) {
      this.stats.activeConnections--
    } else {
      this.stats.idleConnections--
    }
  }

  /**
   * Start monitoring and auto-scaling
   */
  private startMonitoring(): void {
    if (!this.scalingConfig.enableAutoScaling) return

    this.monitoringTimer = setInterval(() => {
      this.monitorAndScale()
    }, this.scalingConfig.monitoringInterval)
  }

  /**
   * Monitor pool performance and scale if needed
   */
  private async monitorAndScale(): Promise<void> {
    const now = Date.now()
    const utilization = this.stats.activeConnections / this.pool.size

    // Check if we need to scale up
    if (utilization > this.scalingConfig.scaleUpThreshold &&
        this.pool.size < this.scalingConfig.maxPoolSize &&
        now - this.lastScaleUp > this.scalingConfig.cooldownPeriod) {
      
      await this.scaleUp()
      this.lastScaleUp = now
    }

    // Check if we need to scale down
    if (utilization < this.scalingConfig.scaleDownThreshold &&
        this.pool.size > this.scalingConfig.minPoolSize &&
        now - this.lastScaleDown > this.scalingConfig.cooldownPeriod) {
      
      await this.scaleDown()
      this.lastScaleDown = now
    }

    // Clean up idle connections
    await this.cleanupIdleConnections()
  }

  /**
   * Scale up the pool
   */
  private async scaleUp(): Promise<void> {
    const currentSize = this.pool.size
    const targetSize = Math.min(
      Math.ceil(currentSize * this.scalingConfig.scaleUpFactor),
      this.scalingConfig.maxPoolSize
    )
    
    const connectionsToAdd = targetSize - currentSize
    
    console.log(`Scaling up pool from ${currentSize} to ${targetSize} connections`)
    
    for (let i = 0; i < connectionsToAdd; i++) {
      try {
        await this.createConnection()
      } catch (error) {
        console.error('Failed to create connection during scale up:', error)
        break
      }
    }
  }

  /**
   * Scale down the pool
   */
  private async scaleDown(): Promise<void> {
    const currentSize = this.pool.size
    const targetSize = Math.max(
      Math.floor(currentSize * this.scalingConfig.scaleDownFactor),
      this.scalingConfig.minPoolSize
    )
    
    const connectionsToRemove = currentSize - targetSize
    
    if (connectionsToRemove <= 0) return
    
    console.log(`Scaling down pool from ${currentSize} to ${targetSize} connections`)
    
    // Remove idle connections first
    const idleConnections = Array.from(this.status.entries())
      .filter(([_, status]) => !status.inUse)
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed)
      .slice(0, connectionsToRemove)
    
    for (const [id] of idleConnections) {
      await this.removeConnection(id)
    }
  }

  /**
   * Clean up idle connections
   */
  private async cleanupIdleConnections(): Promise<void> {
    const now = Date.now()
    const connectionsToRemove: string[] = []

    for (const [id, status] of this.status.entries()) {
      if (!status.inUse && 
          now - status.lastUsed > this.config.idleTimeout &&
          this.pool.size > this.config.minConnections) {
        connectionsToRemove.push(id)
      }
    }

    for (const id of connectionsToRemove) {
      await this.removeConnection(id)
    }
  }

  /**
   * Record response time for statistics
   */
  private recordResponseTime(responseTime: number): void {
    if (this.stats.totalRequests === 1) {
      this.stats.minResponseTime = responseTime
      this.stats.maxResponseTime = responseTime
      this.stats.averageResponseTime = responseTime
    } else {
      this.stats.minResponseTime = Math.min(this.stats.minResponseTime, responseTime)
      this.stats.maxResponseTime = Math.max(this.stats.maxResponseTime, responseTime)
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / this.stats.totalRequests
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    return { ...this.stats }
  }

  /**
   * Get pool status
   */
  getStatus(): ConnectionStatus[] {
    return Array.from(this.status.values())
  }

  /**
   * Get waiting queue length
   */
  getWaitingQueueLength(): number {
    return this.waitingQueue.length
  }

  /**
   * Update pool configuration
   */
  updateConfig(newConfig: Partial<PoolConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Update scaling configuration
   */
  updateScalingConfig(newConfig: Partial<ScalingConfig>): void {
    this.scalingConfig = { ...this.scalingConfig, ...newConfig }
  }

  /**
   * Drain the pool (close all connections)
   */
  async drain(): Promise<void> {
    // Stop monitoring
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
      this.monitoringTimer = null
    }

    // Wait for active connections to finish
    while (this.stats.activeConnections > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Close all connections
    const connectionIds = Array.from(this.pool.keys())
    for (const id of connectionIds) {
      await this.removeConnection(id)
    }

    console.log('Connection pool drained')
  }

  /**
   * Health check for the pool
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to get a connection
      const client = await this.getConnection()
      
      // Test the connection
      const isHealthy = await this.testConnection(client)
      
      // Release the connection
      this.releaseConnection(client)
      
      return isHealthy
    } catch (error) {
      console.error('Pool health check failed:', error)
      return false
    }
  }
}

// Connection pool utilities
export const poolUtils = {
  /**
   * Create a connection pool with default configuration
   */
  createDefaultPool(): ConnectionPool {
    return new ConnectionPool()
  },

  /**
   * Create a connection pool optimized for high traffic
   */
  createHighTrafficPool(): ConnectionPool {
    return new ConnectionPool(
      {
        minConnections: 5,
        maxConnections: 25,
        acquireTimeout: 3000,
        idleTimeout: 60000
      },
      {
        enableAutoScaling: true,
        minPoolSize: 5,
        maxPoolSize: 50,
        scaleUpThreshold: 0.7,
        scaleDownThreshold: 0.2,
        monitoringInterval: 15000
      }
    )
  },

  /**
   * Create a connection pool optimized for low traffic
   */
  createLowTrafficPool(): ConnectionPool {
    return new ConnectionPool(
      {
        minConnections: 1,
        maxConnections: 5,
        acquireTimeout: 10000,
        idleTimeout: 120000
      },
      {
        enableAutoScaling: false,
        minPoolSize: 1,
        maxPoolSize: 5
      }
    )
  }
}

// Export singleton instance
export const connectionPool = new ConnectionPool()
