// Performance & Caching Services
export { 
  CacheService, 
  RedisCacheService, 
  memoryCache, 
  cache, 
  cacheMiddleware, 
  cacheUtils 
} from './cacheService'

export { 
  QueryOptimizer, 
  queryOptimizer, 
  queryUtils 
} from './queryOptimizer'

export { 
  ImageOptimizer, 
  imageOptimizer, 
  cdnUtils 
} from './imageOptimizer'

export { 
  ConnectionPool, 
  connectionPool, 
  poolUtils 
} from './connectionPool'

// Re-export existing services
export { supabase } from '../supabase'
export { enhancedApiClient } from '../api/enhancedApiClient'
// export { enhancedHooks } from '../hooks/enhancedHooks' // No such export exists




















