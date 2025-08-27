import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
          }
        },
      },
    }
  );
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get system metrics from database
    const { data: metrics, error: metricsError } = await supabase
      .from('system_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent system logs
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get recent security events
    const { data: securityEvents, error: securityError } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get database performance metrics
    const { data: dbMetrics, error: dbError } = await supabase
      .from('database_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Return mock data for now (replace with actual metrics when available)
    const mockMetrics = {
      cpu: {
        usage: Math.random() * 100,
        temperature: 60 + Math.random() * 20,
        cores: 8,
      },
      memory: {
        total: 16384,
        used: 8192 + Math.random() * 4096,
        available: 8192 - Math.random() * 4096,
        usage: 50 + Math.random() * 30,
      },
      disk: {
        total: 1000000,
        used: 450000 + Math.random() * 100000,
        available: 550000 - Math.random() * 100000,
        usage: 45 + Math.random() * 20,
      },
      network: {
        bytesIn: 1024000 + Math.random() * 500000,
        bytesOut: 512000 + Math.random() * 250000,
        connections: 1250 + Math.random() * 500,
      },
      database: {
        connections: 45 + Math.random() * 20,
        queriesPerSecond: 1250 + Math.random() * 500,
        slowQueries: Math.floor(Math.random() * 10),
        uptime: 86400 + Math.random() * 86400,
      },
      uptime: 604800 + Math.random() * 86400,
      loadAverage: [1.2 + Math.random() * 0.5, 1.1 + Math.random() * 0.5, 1.0 + Math.random() * 0.5],
      responseTime: 150 + Math.random() * 100,
    };

    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        level: 'info',
        message: 'User authentication successful',
        source: 'auth-service',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        level: 'warning',
        message: 'High memory usage detected',
        source: 'system-monitor',
        details: { memoryUsage: 85.2 },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        source: 'database-service',
        details: { timeout: 5000, retries: 3 },
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        level: 'info',
        message: 'Property listing created successfully',
        source: 'property-service',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        level: 'warning',
        message: 'Slow query detected',
        source: 'database-service',
        details: { queryTime: 2500, query: 'SELECT * FROM properties' },
      },
    ];

    const mockSecurityEvents = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        type: 'login_attempt',
        severity: 'medium',
        description: 'Failed login attempt from IP 192.168.1.100',
        ipAddress: '192.168.1.100',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'permission_denied',
        severity: 'low',
        description: 'User attempted to access admin panel without permission',
        userId: 'user-123',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        type: 'rate_limit_exceeded',
        severity: 'high',
        description: 'API rate limit exceeded from IP 10.0.0.50',
        ipAddress: '10.0.0.50',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'suspicious_activity',
        severity: 'critical',
        description: 'Multiple failed login attempts from same IP',
        ipAddress: '203.0.113.0',
      },
    ];

    return NextResponse.json({
      metrics: mockMetrics,
      logs: mockLogs,
      securityEvents: mockSecurityEvents,
    });
  } catch (error) {
    console.error('Error in admin monitoring GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
