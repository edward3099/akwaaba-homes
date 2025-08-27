import { supabase } from '../supabase';
import { 
  DatabaseAnalytics, 
  AnalyticsEventType,
  ApiResponse 
} from '../types/database';

export class AnalyticsService {
  // Track property view (anonymous users don't need accounts)
  static async trackPropertyView(
    propertyId: string, 
    userId?: string, 
    eventData?: any
  ): Promise<ApiResponse<DatabaseAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .insert([{
          property_id: propertyId,
          user_id: userId || null,
          event_type: 'property_view',
          event_data: eventData || {},
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseAnalytics,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Track search events (anonymous users don't need accounts)
  static async trackSearch(
    searchTerm: string,
    filters?: any,
    userId?: string
  ): Promise<ApiResponse<DatabaseAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .insert([{
          user_id: userId || null,
          event_type: 'search',
          event_data: {
            search_term: searchTerm,
            filters: filters || {},
            user_type: userId ? 'authenticated' : 'anonymous'
          },
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseAnalytics,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Track inquiry creation (anonymous users don't need accounts)
  static async trackInquiry(
    propertyId: string,
    inquiryType: string,
    userId?: string
  ): Promise<ApiResponse<DatabaseAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .insert([{
          property_id: propertyId,
          user_id: userId || null,
          event_type: 'inquiry',
          event_data: {
            inquiry_type: inquiryType,
            user_type: userId ? 'authenticated' : 'anonymous'
          },
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseAnalytics,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Track property favorites (anonymous users don't need accounts)
  static async trackFavorite(
    propertyId: string,
    action: 'added' | 'removed',
    userId?: string
  ): Promise<ApiResponse<DatabaseAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .insert([{
          property_id: propertyId,
          user_id: userId || null,
          event_type: 'favorite',
          event_data: {
            action,
            user_type: userId ? 'authenticated' : 'anonymous'
          },
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseAnalytics,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Track property sharing (anonymous users don't need accounts)
  static async trackShare(
    propertyId: string,
    platform: string,
    userId?: string
  ): Promise<ApiResponse<DatabaseAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .insert([{
          property_id: propertyId,
          user_id: userId || null,
          event_type: 'share',
          event_data: {
            platform,
            user_type: userId ? 'authenticated' : 'anonymous'
          },
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseAnalytics,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get analytics for a specific property (for sellers/agents)
  static async getPropertyAnalytics(propertyId: string): Promise<ApiResponse<{
    totalViews: number;
    totalInquiries: number;
    totalFavorites: number;
    totalShares: number;
    viewsByDay: { date: string; count: number }[];
    inquiriesByDay: { date: string; count: number }[];
  }>> {
    try {
      const { data: analytics, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('property_id', propertyId);

      if (error) {
        throw error;
      }

      const totalViews = analytics?.filter(a => a.event_type === 'property_view').length || 0;
      const totalInquiries = analytics?.filter(a => a.event_type === 'inquiry').length || 0;
      const totalFavorites = analytics?.filter(a => a.event_type === 'favorite').length || 0;
      const totalShares = analytics?.filter(a => a.event_type === 'share').length || 0;

      // Group by day for views
      const viewsByDay = this.groupByDay(
        analytics?.filter(a => a.event_type === 'property_view') || []
      );

      // Group by day for inquiries
      const inquiriesByDay = this.groupByDay(
        analytics?.filter(a => a.event_type === 'inquiry') || []
      );

      return {
        data: {
          totalViews,
          totalInquiries,
          totalFavorites,
          totalShares,
          viewsByDay,
          inquiriesByDay
        },
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get analytics for a seller/agent (across all their properties)
  static async getSellerAnalytics(sellerId: string): Promise<ApiResponse<{
    totalProperties: number;
    totalViews: number;
    totalInquiries: number;
    totalFavorites: number;
    totalShares: number;
    viewsByProperty: { propertyId: string; title: string; views: number }[];
    inquiriesByProperty: { propertyId: string; title: string; inquiries: number }[];
  }>> {
    try {
      // First get all properties for the seller
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('seller_id', sellerId);

      if (propertiesError) {
        throw propertiesError;
      }

      const propertyIds = properties?.map(p => p.id) || [];

      if (propertyIds.length === 0) {
        return {
          data: {
            totalProperties: 0,
            totalViews: 0,
            totalInquiries: 0,
            totalFavorites: 0,
            totalShares: 0,
            viewsByProperty: [],
            inquiriesByProperty: []
          },
          error: null,
          success: true
        };
      }

      // Get analytics for all properties
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .in('property_id', propertyIds);

      if (analyticsError) {
        throw analyticsError;
      }

      const totalProperties = properties?.length || 0;
      const totalViews = analytics?.filter(a => a.event_type === 'property_view').length || 0;
      const totalInquiries = analytics?.filter(a => a.event_type === 'inquiry').length || 0;
      const totalFavorites = analytics?.filter(a => a.event_type === 'favorite').length || 0;
      const totalShares = analytics?.filter(a => a.event_type === 'share').length || 0;

      // Group views by property
      const viewsByProperty = properties?.map(property => ({
        propertyId: property.id,
        title: property.title,
        views: analytics?.filter(a => a.property_id === property.id && a.event_type === 'property_view').length || 0
      })) || [];

      // Group inquiries by property
      const inquiriesByProperty = properties?.map(property => ({
        propertyId: property.id,
        title: property.title,
        inquiries: analytics?.filter(a => a.property_id === property.id && a.event_type === 'inquiry').length || 0
      })) || [];

      return {
        data: {
          totalProperties,
          totalViews,
          totalInquiries,
          totalFavorites,
          totalShares,
          viewsByProperty,
          inquiriesByProperty
        },
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get platform-wide analytics (admin only)
  static async getPlatformAnalytics(): Promise<ApiResponse<{
    totalViews: number;
    totalSearches: number;
    totalInquiries: number;
    totalFavorites: number;
    totalShares: number;
    viewsByDay: { date: string; count: number }[];
    searchesByDay: { date: string; count: number }[];
    inquiriesByDay: { date: string; count: number }[];
  }>> {
    try {
      const { data: analytics, error } = await supabase
        .from('analytics')
        .select('*');

      if (error) {
        throw error;
      }

      const totalViews = analytics?.filter(a => a.event_type === 'property_view').length || 0;
      const totalSearches = analytics?.filter(a => a.event_type === 'search').length || 0;
      const totalInquiries = analytics?.filter(a => a.event_type === 'inquiry').length || 0;
      const totalFavorites = analytics?.filter(a => a.event_type === 'favorite').length || 0;
      const totalShares = analytics?.filter(a => a.event_type === 'share').length || 0;

      // Group by day
      const viewsByDay = this.groupByDay(
        analytics?.filter(a => a.event_type === 'property_view') || []
      );
      const searchesByDay = this.groupByDay(
        analytics?.filter(a => a.event_type === 'search') || []
      );
      const inquiriesByDay = this.groupByDay(
        analytics?.filter(a => a.event_type === 'inquiry') || []
      );

      return {
        data: {
          totalViews,
          totalSearches,
          totalInquiries,
          totalFavorites,
          totalShares,
          viewsByDay,
          searchesByDay,
          inquiriesByDay
        },
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Helper method to group analytics by day
  private static groupByDay(analytics: DatabaseAnalytics[]): { date: string; count: number }[] {
    const grouped: { [key: string]: number } = {};
    
    analytics.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Delete analytics (admin only)
  static async deleteAnalytics(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('analytics')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        data: true,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }
}
