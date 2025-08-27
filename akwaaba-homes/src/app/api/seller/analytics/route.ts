import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction } from '@/lib/middleware/sellerAuth';

// Analytics query schemas
const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  property_id: z.string().uuid().optional()
});

const reportQuerySchema = z.object({
  report_type: z.enum(['performance', 'inquiries', 'views', 'revenue', 'properties']),
  format: z.enum(['json', 'csv']).default('json'),
  filters: z.record(z.string(), z.any()).optional()
});

// GET /api/seller/analytics - Get seller performance analytics
export async function GET(request: NextRequest) {
  try {
    // Authenticate seller with read permissions
    const authResult = await requireSeller(['read:own_analytics'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryData = analyticsQuerySchema.parse(Object.fromEntries(searchParams));
    const { period, start_date, end_date, property_id } = queryData;
    
    // Calculate date range
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : calculateStartDate(period);
    
    // Get seller analytics data
    const analyticsData = await getSellerAnalytics(supabase, sellerUser.id, startDate, endDate, property_id);
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'view_analytics', 'analytics', undefined, {
      period,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      property_id
    });
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        property_id,
        analytics: analyticsData
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/seller/analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/seller/analytics - Generate specific reports
export async function POST(request: NextRequest) {
  try {
    // Authenticate seller with read permissions
    const authResult = await requireSeller(['read:own_analytics'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = reportQuerySchema.parse(body);
    const { report_type, format, filters } = validatedData;
    
    // Generate report based on type
    let reportData;
    switch (report_type) {
      case 'performance':
        reportData = await generatePerformanceReport(supabase, sellerUser.id, filters);
        break;
      case 'inquiries':
        reportData = await generateInquiryReport(supabase, sellerUser.id, filters);
        break;
      case 'views':
        reportData = await generateViewsReport(supabase, sellerUser.id, filters);
        break;
      case 'revenue':
        reportData = await generateRevenueReport(supabase, sellerUser.id, filters);
        break;
      case 'properties':
        reportData = await generatePropertiesReport(supabase, sellerUser.id, filters);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'generate_report', 'analytics', undefined, {
      report_type,
      format,
      filters
    });
    
    return NextResponse.json({
      success: true,
      data: {
        report_type,
        format,
        generated_at: new Date().toISOString(),
        report: reportData
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/seller/analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function calculateStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

async function getSellerAnalytics(supabase: any, sellerId: string, startDate: Date, endDate: Date, propertyId?: string) {
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  // Base property filter
  let propertyFilter = propertyId ? `eq('id', '${propertyId}')` : '';
  
  // Get property performance metrics
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      views_count,
      status,
      created_at,
      updated_at
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDateStr)
    .lte('created_at', endDateStr);
  
  if (propertiesError) {
    console.error('Error fetching properties for analytics:', propertiesError);
    throw new Error('Failed to fetch properties data');
  }
  
  // Get inquiry metrics
  const { data: inquiries, error: inquiriesError } = await supabase
    .from('property_inquiries')
    .select(`
      id,
      property_id,
      status,
      priority,
      created_at,
      response_message
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDateStr)
    .lte('created_at', endDateStr);
  
  if (inquiriesError) {
    console.error('Error fetching inquiries for analytics:', inquiriesError);
    throw new Error('Failed to fetch inquiries data');
  }
  
  // Calculate metrics
  const totalProperties = properties?.length || 0;
  const activeProperties = properties?.filter((p: any) => p.status === 'active').length || 0;
  const totalViews = properties?.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0) || 0;
  const totalInquiries = inquiries?.length || 0;
  const respondedInquiries = inquiries?.filter((i: any) => i.response_message).length || 0;
  const responseRate = totalInquiries > 0 ? (respondedInquiries / totalInquiries) * 100 : 0;
  
  // Calculate period-over-period changes
  const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
  const previousPeriodStartStr = previousPeriodStart.toISOString();
  
  const { data: previousProperties } = await supabase
    .from('properties')
    .select('id, views_count')
    .eq('seller_id', sellerId)
    .gte('created_at', previousPeriodStartStr)
    .lt('created_at', startDateStr);
  
  const { data: previousInquiries } = await supabase
    .from('property_inquiries')
    .select('id')
    .eq('seller_id', sellerId)
    .gte('created_at', previousPeriodStartStr)
    .lt('created_at', startDateStr);
  
  const previousViews = previousProperties?.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0) || 0;
  const previousInquiryCount = previousInquiries?.length || 0;
  
  const viewsChange = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0;
  const inquiriesChange = previousInquiryCount > 0 ? ((totalInquiries - previousInquiryCount) / previousInquiryCount) * 100 : 0;
  
  return {
    overview: {
      total_properties: totalProperties,
      active_properties: activeProperties,
      total_views: totalViews,
      total_inquiries: totalInquiries,
      response_rate: Math.round(responseRate * 100) / 100
    },
    trends: {
      views_change_percent: Math.round(viewsChange * 100) / 100,
      inquiries_change_percent: Math.round(inquiriesChange * 100) / 100
    },
    properties: properties?.map(p => ({
      id: p.id,
      title: p.title,
      views: p.views_count || 0,
      status: p.status,
      created_at: p.created_at
    })) || [],
    inquiries: inquiries?.map(i => ({
      id: i.id,
      property_id: i.property_id,
      status: i.status,
      priority: i.priority,
      responded: !!i.response_message,
      created_at: i.created_at
    })) || []
  };
}

async function generatePerformanceReport(supabase: any, sellerId: string, filters?: any) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      views_count,
      status,
      created_at,
      updated_at
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  
  const { data: inquiries } = await supabase
    .from('property_inquiries')
    .select(`
      id,
      property_id,
      status,
      priority,
      created_at
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  
  return {
    period: '30d',
    generated_at: new Date().toISOString(),
    metrics: {
      total_properties: properties?.length || 0,
      total_views: properties?.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0) || 0,
      total_inquiries: inquiries?.length || 0,
      avg_views_per_property: properties?.length > 0 ? 
        Math.round((properties.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0) / properties.length) * 100) / 100 : 0
    },
    top_performers: properties
      ?.sort((a: any, b: any) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        views: p.views_count || 0,
        inquiries: inquiries?.filter((i: any) => i.property_id === p.id).length || 0
      })) || []
  };
}

async function generateInquiryReport(supabase: any, sellerId: string, filters?: any) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const { data: inquiries } = await supabase
    .from('property_inquiries')
    .select(`
      id,
      property_id,
      buyer_name,
      buyer_email,
      message,
      status,
      priority,
      created_at,
      response_message
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  
  const inquiryStats = {
    total: inquiries?.length || 0,
    new: inquiries?.filter((i: any) => i.status === 'new').length || 0,
    responded: inquiries?.filter((i: any) => i.response_message).length || 0,
    closed: inquiries?.filter((i: any) => i.status === 'closed').length || 0,
    high_priority: inquiries?.filter((i: any) => i.priority === 'high' || i.priority === 'urgent').length || 0
  };
  
  return {
    period: '30d',
    generated_at: new Date().toISOString(),
    summary: inquiryStats,
    inquiries: inquiries?.map(i => ({
      id: i.id,
      buyer_name: i.buyer_name,
      buyer_email: i.buyer_email,
      message: i.message,
      status: i.status,
      priority: i.priority,
      responded: !!i.response_message,
      created_at: i.created_at
    })) || []
  };
}

async function generateViewsReport(supabase: any, sellerId: string, filters?: any) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      views_count,
      status,
      created_at
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  
  const totalViews = properties?.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0) || 0;
  const avgViewsPerProperty = properties?.length > 0 ? totalViews / properties.length : 0;
  
  return {
    period: '30d',
    generated_at: new Date().toISOString(),
    summary: {
      total_views: totalViews,
      total_properties: properties?.length || 0,
      avg_views_per_property: Math.round(avgViewsPerProperty * 100) / 100
    },
    property_views: properties?.map(p => ({
      id: p.id,
      title: p.title,
      views: p.views_count || 0,
      status: p.status
    })) || []
  };
}

async function generateRevenueReport(supabase: any, sellerId: string, filters?: any) {
  // Note: This is a placeholder for future revenue tracking
  // Currently, the system doesn't have revenue/payment tracking implemented
  return {
    period: '30d',
    generated_at: new Date().toISOString(),
    note: 'Revenue tracking not yet implemented',
    summary: {
      total_revenue: 0,
      total_transactions: 0,
      avg_transaction_value: 0
    }
  };
}

async function generatePropertiesReport(supabase: any, sellerId: string, filters?: any) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      price,
      property_type,
      listing_type,
      status,
      views_count,
      created_at,
      updated_at
    `)
    .eq('seller_id', sellerId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  
  const statusCounts = properties?.reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const typeCounts = properties?.reduce((acc: Record<string, number>, p: any) => {
    acc[p.property_type] = (acc[p.property_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  return {
    period: '30d',
    generated_at: new Date().toISOString(),
    summary: {
      total_properties: properties?.length || 0,
      status_breakdown: statusCounts,
      type_breakdown: typeCounts
    },
    properties: properties?.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      property_type: p.property_type,
      listing_type: p.listing_type,
      status: p.status,
      views: p.views_count || 0,
      created_at: p.created_at
    })) || []
  };
}

