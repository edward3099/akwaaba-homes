-- Database Optimization and Performance Tuning for AkwaabaHomes
-- This file contains database indexes, query optimizations, and performance tuning

-- ============================================================================
-- DATABASE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_user_type_status ON users(user_type, status);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id) WHERE company_id IS NOT NULL;

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_updated_at ON properties(updated_at);
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON properties(approval_status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_location_status ON properties(location, status);
CREATE INDEX IF NOT EXISTS idx_properties_type_status ON properties(property_type, status);
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON properties(price, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_location_type ON properties(location, property_type, status);
CREATE INDEX IF NOT EXISTS idx_properties_seller_status ON properties(seller_id, status, created_at);

-- Property images indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_property_images_created_at ON property_images(created_at);

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer_id ON inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller_id ON inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_buyer ON inquiries(property_id, buyer_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_property_id ON analytics_events(property_id) WHERE property_id IS NOT NULL;

-- Verifications indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_type ON verifications(type);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verifications(created_at);

-- ============================================================================
-- PARTIAL INDEXES FOR OPTIMIZATION
-- ============================================================================

-- Partial indexes for active properties only
CREATE INDEX IF NOT EXISTS idx_properties_active_location ON properties(location, property_type) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_properties_active_price ON properties(price, bedrooms, bathrooms) 
WHERE status = 'active';

-- Partial indexes for pending approvals
CREATE INDEX IF NOT EXISTS idx_properties_pending_approval ON properties(seller_id, created_at) 
WHERE approval_status = 'pending';

-- Partial indexes for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, type, created_at) 
WHERE is_read = false;

-- Partial indexes for recent inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_recent ON inquiries(seller_id, status, created_at) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================================================
-- FUNCTIONAL INDEXES FOR ADVANCED QUERIES
-- ============================================================================

-- Index for case-insensitive location search
CREATE INDEX IF NOT EXISTS idx_properties_location_lower ON properties(LOWER(location));

-- Index for price range queries
CREATE INDEX IF NOT EXISTS idx_properties_price_range_active ON properties(price) 
WHERE status = 'active' AND price > 0;

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_properties_date_range ON properties(DATE(created_at), status);

-- Index for text search in property descriptions
CREATE INDEX IF NOT EXISTS idx_properties_description_search ON properties USING gin(to_tsvector('english', description));

-- Index for location coordinates (if using PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_properties_location_gist ON properties USING gist(location);

-- ============================================================================
-- VIEWS FOR COMMON QUERY PATTERNS
-- ============================================================================

-- View for active property listings with optimized data
CREATE OR REPLACE VIEW active_properties_view AS
SELECT 
  p.id,
  p.title,
  p.description,
  p.price,
  p.location,
  p.bedrooms,
  p.bathrooms,
  p.property_type,
  p.status,
  p.created_at,
  p.updated_at,
  u.company_name as seller_company,
  u.verified as seller_verified,
  COUNT(pi.id) as image_count,
  MAX(pi.created_at) as last_image_update
FROM properties p
LEFT JOIN users u ON p.seller_id = u.id
LEFT JOIN property_images pi ON p.id = pi.property_id
WHERE p.status = 'active' AND p.approval_status = 'approved'
GROUP BY p.id, u.company_name, u.verified;

-- View for seller dashboard statistics
CREATE OR REPLACE VIEW seller_dashboard_stats AS
SELECT 
  u.id as seller_id,
  u.company_name,
  COUNT(p.id) as total_properties,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_properties,
  COUNT(CASE WHEN p.status = 'inactive' THEN 1 END) as inactive_properties,
  COUNT(CASE WHEN p.approval_status = 'pending' THEN 1 END) as pending_approvals,
  COUNT(i.id) as total_inquiries,
  COUNT(CASE WHEN i.status = 'new' THEN 1 END) as new_inquiries,
  COUNT(CASE WHEN i.status = 'responded' THEN 1 END) as responded_inquiries,
  AVG(p.price) as average_property_price,
  MAX(p.created_at) as last_property_created
FROM users u
LEFT JOIN properties p ON u.id = p.seller_id
LEFT JOIN inquiries i ON p.id = i.property_id
WHERE u.user_type = 'seller'
GROUP BY u.id, u.company_name;

-- View for admin analytics
CREATE OR REPLACE VIEW admin_analytics_view AS
SELECT 
  DATE(ae.timestamp) as event_date,
  ae.event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT ae.user_id) as unique_users,
  COUNT(DISTINCT ae.property_id) as unique_properties
FROM analytics_events ae
WHERE ae.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(ae.timestamp), ae.event_type
ORDER BY event_date DESC, event_count DESC;

-- ============================================================================
-- MATERIALIZED VIEWS FOR HEAVY ANALYTICS
-- ============================================================================

-- Materialized view for daily property statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_property_stats AS
SELECT 
  DATE(p.created_at) as date,
  COUNT(*) as properties_created,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END) as properties_active,
  COUNT(CASE WHEN p.approval_status = 'approved' THEN 1 END) as properties_approved,
  AVG(p.price) as average_price,
  COUNT(DISTINCT p.seller_id) as unique_sellers
FROM properties p
GROUP BY DATE(p.created_at)
ORDER BY date DESC;

-- Materialized view for user activity summary
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_summary AS
SELECT 
  u.id,
  u.email,
  u.user_type,
  u.company_name,
  COUNT(p.id) as properties_count,
  COUNT(i.id) as inquiries_count,
  COUNT(m.id) as messages_count,
  MAX(p.created_at) as last_property_activity,
  MAX(i.created_at) as last_inquiry_activity,
  MAX(m.created_at) as last_message_activity
FROM users u
LEFT JOIN properties p ON u.id = p.seller_id
LEFT JOIN inquiries i ON u.id = i.buyer_id
LEFT JOIN messages m ON u.id = m.sender_id
GROUP BY u.id, u.email, u.user_type, u.company_name;

-- ============================================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================================================

-- Procedure to refresh materialized views
CREATE OR REPLACE PROCEDURE refresh_materialized_views()
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_property_stats;
  REFRESH MATERIALIZED VIEW user_activity_summary;
  
  -- Log the refresh
  INSERT INTO analytics_events (event_type, metadata, timestamp)
  VALUES ('materialized_view_refresh', 
          jsonb_build_object('views_refreshed', ARRAY['daily_property_stats', 'user_activity_summary']),
          NOW());
END;
$$;

-- Procedure to clean up old data
CREATE OR REPLACE PROCEDURE cleanup_old_data()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete old analytics events (older than 1 year)
  DELETE FROM analytics_events 
  WHERE timestamp < NOW() - INTERVAL '1 year';
  
  -- Delete old notifications (older than 6 months)
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '6 months' AND is_read = true;
  
  -- Log the cleanup
  INSERT INTO analytics_events (event_type, metadata, timestamp)
  VALUES ('data_cleanup', 
          jsonb_build_object('cleanup_performed', true, 'timestamp', NOW()),
          NOW());
END;
$$;

-- ============================================================================
-- TRIGGERS FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Trigger to update property search vector for full-text search
CREATE OR REPLACE FUNCTION update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' || 
    COALESCE(NEW.location, '') || ' ' || 
    COALESCE(NEW.property_type, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_property_search_vector
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_property_search_vector();

-- Trigger to update materialized views when data changes
CREATE OR REPLACE FUNCTION trigger_refresh_materialized_views()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule refresh of materialized views
  PERFORM pg_notify('refresh_materialized_views', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for materialized view refresh
CREATE TRIGGER trigger_refresh_property_stats
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_materialized_views();

CREATE TRIGGER trigger_refresh_user_activity
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_materialized_views();

-- ============================================================================
-- PERFORMANCE CONFIGURATION
-- ============================================================================

-- Set work_mem for complex queries
-- ALTER SYSTEM SET work_mem = '256MB';

-- Set shared_buffers for better caching
-- ALTER SYSTEM SET shared_buffers = '256MB';

-- Set effective_cache_size
-- ALTER SYSTEM SET effective_cache_size = '1GB';

-- Set random_page_cost for SSD storage
-- ALTER SYSTEM SET random_page_cost = 1.1;

-- Set effective_io_concurrency for parallel I/O
-- ALTER SYSTEM SET effective_io_concurrency = 200;

-- ============================================================================
-- QUERY OPTIMIZATION HINTS
-- ============================================================================

-- Example of optimized property search query
-- SELECT /*+ INDEX(p idx_properties_location_status) */
--   p.*, u.company_name, u.verified
-- FROM properties p
-- JOIN users u ON p.seller_id = u.id
-- WHERE p.location ILIKE $1 
--   AND p.status = 'active' 
--   AND p.approval_status = 'approved'
-- ORDER BY p.created_at DESC
-- LIMIT 20 OFFSET 0;

-- Example of optimized inquiry query
-- SELECT /*+ INDEX(i idx_inquiries_property_buyer) */
--   i.*, p.title, p.location
-- FROM inquiries i
-- JOIN properties p ON i.property_id = p.id
-- WHERE i.seller_id = $1
--   AND i.status = 'new'
-- ORDER BY i.created_at DESC;

-- ============================================================================
-- MONITORING AND MAINTENANCE
-- ============================================================================

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name text,
  table_size text,
  index_size text,
  total_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
  index_name text,
  table_name text,
  index_scans bigint,
  index_tuples_read bigint,
  index_tuples_fetched bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.relname as index_name,
    t.relname as table_name,
    s.idx_scan as index_scans,
    s.idx_tup_read as index_tuples_read,
    s.idx_tup_fetch as index_tuples_fetched
  FROM pg_stat_user_indexes s
  JOIN pg_class i ON s.indexrelid = i.oid
  JOIN pg_class t ON s.relid = t.oid
  ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze table performance
CREATE OR REPLACE FUNCTION analyze_table_performance(table_name text)
RETURNS TABLE (
  metric text,
  value text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Table Size'::text as metric,
    pg_size_pretty(pg_total_relation_size(table_name)) as value
  UNION ALL
  SELECT 
    'Index Size'::text,
    pg_size_pretty(pg_indexes_size(table_name)) as value
  UNION ALL
  SELECT 
    'Row Count'::text,
    (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_name = table_name) as value
  UNION ALL
  SELECT 
    'Last Vacuum'::text,
    COALESCE(last_vacuum::text, 'Never') as value
  FROM pg_stat_user_tables 
  WHERE relname = table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTOMATIC MAINTENANCE
-- ============================================================================

-- Create a function to run maintenance tasks
CREATE OR REPLACE FUNCTION run_maintenance_tasks()
RETURNS void AS $$
BEGIN
  -- Refresh materialized views
  CALL refresh_materialized_views();
  
  -- Clean up old data
  CALL cleanup_old_data();
  
  -- Update table statistics
  ANALYZE;
  
  -- Log maintenance completion
  INSERT INTO analytics_events (event_type, metadata, timestamp)
  VALUES ('maintenance_completed', 
          jsonb_build_object('maintenance_type', 'scheduled', 'timestamp', NOW()),
          NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run maintenance (requires pg_cron extension)
-- SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT run_maintenance_tasks();');

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View for slow query monitoring
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries taking more than 100ms
ORDER BY mean_time DESC;

-- View for table access patterns
CREATE OR REPLACE VIEW table_access_patterns AS
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY seq_scan + idx_scan DESC;

-- View for index usage efficiency
CREATE OR REPLACE VIEW index_efficiency AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  CASE 
    WHEN idx_scan = 0 THEN 'Unused'
    WHEN idx_scan < 10 THEN 'Rarely Used'
    WHEN idx_scan < 100 THEN 'Moderately Used'
    ELSE 'Frequently Used'
  END as usage_category
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_properties_location_status IS 'Optimizes queries filtering by location and status';
COMMENT ON INDEX idx_properties_price_range ON properties IS 'Optimizes price range queries for active properties';
COMMENT ON INDEX idx_inquiries_property_buyer IS 'Optimizes inquiry lookups by property and buyer';
COMMENT ON MATERIALIZED VIEW daily_property_stats IS 'Pre-computed daily property statistics for dashboard performance';
COMMENT ON MATERIALIZED VIEW user_activity_summary IS 'Pre-computed user activity summary for admin dashboard';
COMMENT ON FUNCTION run_maintenance_tasks() IS 'Runs scheduled database maintenance tasks';
COMMENT ON FUNCTION get_table_sizes() IS 'Returns table size information for monitoring';
COMMENT ON FUNCTION get_index_usage_stats() IS 'Returns index usage statistics for optimization';






