import { supabase } from '@/lib/supabase';

export interface SellerProperty {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  land_size: number;
  year_built: number;
  features: string[];
  amenities: string[];
  status: string;
  approval_status: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejection_reason?: string;
  moderation_notes?: string;
  inquiry_count: number;
  image_count: number;
}

export interface SellerPropertyDetails extends SellerProperty {
  images: Array<{
    id: string;
    url: string;
    caption?: string;
    is_primary: boolean;
    created_at: string;
  }>;
  inquiries: Array<{
    id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone?: string;
    message: string;
    status: string;
    created_at: string;
    is_anonymous: boolean;
  }>;
  analytics: {
    total_views: number;
    total_inquiries: number;
    response_rate: number;
    avg_inquiry_response_time: number;
  };
}

export interface SellerInquiry {
  id: string;
  property_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  message: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  seller_response?: string;
  response_date?: string;
  property_title: string;
  property_type: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  images?: string[];
}

export interface SellerMessage {
  id: string;
  buyer_email: string;
  buyer_name?: string;
  buyer_phone?: string;
  property_id?: string;
  inquiry_id?: string;
  message_type: string;
  subject?: string;
  message_content: string;
  status: string;
  priority: string;
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  property_title?: string;
  property_type?: string;
  address?: string;
  city?: string;
}

export interface MessageTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject?: string;
  message_content: string;
  variables: Record<string, any>;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerAppointment {
  id: string;
  buyer_email: string;
  buyer_name?: string;
  buyer_phone?: string;
  property_id?: string;
  appointment_type: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  location?: string;
  meeting_link?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  property_title?: string;
  property_type?: string;
  address?: string;
  city?: string;
}

export interface SellerPerformanceOverview {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  overview: {
    total_properties: number;
    active_properties: number;
    total_inquiries: number;
    total_views: number;
    conversion_rate: number;
  };
  property_performance: {
    properties_by_type: Record<string, number>;
    properties_by_status: Record<string, number>;
    top_performing_properties: Array<{
      id: string;
      title: string;
      views: number;
      inquiries: number;
      conversion_rate: number;
    }>;
  };
  inquiry_analytics: {
    inquiries_by_status: Record<string, number>;
    response_time_metrics: {
      avg_response_time_hours: number;
      response_rate: number;
      conversion_rate: number;
    };
    inquiry_trends: Array<{
      date: string;
      count: number;
      converted: number;
    }>;
  };
  financial_metrics: {
    total_property_value: number;
    average_property_price: number;
    price_distribution: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
  };
  engagement_metrics: {
    total_views: number;
    avg_views_per_property: number;
    inquiry_to_view_ratio: number;
  };
}

export interface SellerPerformanceComparison {
  comparison_period: string;
  current_period: {
    start: string;
    end: string;
  };
  previous_period: {
    start: string;
    end: string;
  };
  metrics_comparison: {
    properties: { current: number; previous: number };
    inquiries: { current: number; previous: number };
    views: { current: number; previous: number };
    conversions: { current: number; previous: number };
  };
  growth_rates: {
    properties_growth: number;
    inquiries_growth: number;
    views_growth: number;
    conversion_growth: number;
  };
}

export interface SellerPerformanceInsights {
  top_performing_properties: Array<{
    id: string;
    title: string;
    views: number;
    inquiries: number;
    conversion_rate: number;
    performance_score: number;
  }>;
  improvement_opportunities: Array<{
    property_id: string;
    title: string;
    issue: string;
    priority: string;
  }>;
  market_positioning: {
    price_competitiveness: string;
    property_type_distribution: Record<string, number>;
  };
  recommendations: {
    immediate_actions: string[];
    long_term_strategies: string[];
  };
}

export class SellerService {
  private static instance: SellerService;
  private supabase: typeof supabase;

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): SellerService {
    if (!SellerService.instance) {
      SellerService.instance = new SellerService();
    }
    return SellerService.instance;
  }

  /**
   * Check if current user is seller
   */
  async isSeller(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await this.supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error || !data) return false;
      return data.user_type === 'seller';
    } catch (error) {
      console.error('Error checking seller status:', error);
      return false;
    }
  }

  // ===== PROPERTY MANAGEMENT =====

  /**
   * Get seller's properties with filtering and pagination
   */
  async getProperties(
    limit: number = 20,
    offset: number = 0,
    status?: string,
    propertyType?: string,
    search?: string,
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC'
  ): Promise<{ success: boolean; data: SellerProperty[]; pagination: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_properties', {
          p_seller_id: user.id,
          p_limit: limit,
          p_offset: offset,
          p_status: status,
          p_property_type: propertyType,
          p_search: search,
          p_sort_by: sortBy,
          p_sort_order: sortOrder
        });

      if (error) {
        throw new Error(`Failed to get properties: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  }

  /**
   * Get detailed property information
   */
  async getPropertyDetails(propertyId: string): Promise<{ success: boolean; data: SellerPropertyDetails }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_property_details', {
          p_property_id: propertyId,
          p_seller_id: user.id
        });

      if (error) {
        throw new Error(`Failed to get property details: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting property details:', error);
      throw error;
    }
  }

  /**
   * Create new property
   */
  async createProperty(propertyData: Record<string, any>): Promise<{ success: boolean; data: SellerPropertyDetails }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('create_seller_property', {
          p_seller_id: user.id,
          p_property_data: propertyData
        });

      if (error) {
        throw new Error(`Failed to create property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update property
   */
  async updateProperty(
    propertyId: string,
    updates: Record<string, any>
  ): Promise<{ success: boolean; data: SellerPropertyDetails }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('update_seller_property', {
          p_property_id: propertyId,
          p_seller_id: user.id,
          p_updates: updates
        });

      if (error) {
        throw new Error(`Failed to update property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(propertyId: string): Promise<{ success: boolean; message: string; deleted_property_id: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('delete_seller_property', {
          p_property_id: propertyId,
          p_seller_id: user.id
        });

      if (error) {
        throw new Error(`Failed to delete property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStatistics(): Promise<Record<string, any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_property_statistics', { p_seller_id: user.id });

      if (error) {
        throw new Error(`Failed to get property statistics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting property statistics:', error);
      throw error;
    }
  }

  // ===== INQUIRY MANAGEMENT =====

  /**
   * Get seller's inquiries with filtering
   */
  async getInquiries(
    limit: number = 20,
    offset: number = 0,
    status?: string,
    propertyId?: string,
    dateFrom?: string,
    dateTo?: string,
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC'
  ): Promise<{ success: boolean; data: SellerInquiry[]; pagination: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_inquiries', {
          p_seller_id: user.id,
          p_limit: limit,
          p_offset: offset,
          p_status: status,
          p_property_id: propertyId,
          p_date_from: dateFrom,
          p_date_to: dateTo,
          p_sort_by: sortBy,
          p_sort_order: sortOrder
        });

      if (error) {
        throw new Error(`Failed to get inquiries: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting inquiries:', error);
      throw error;
    }
  }

  /**
   * Get inquiry details
   */
  async getInquiryDetails(inquiryId: string): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_inquiry_details', {
          p_inquiry_id: inquiryId,
          p_seller_id: user.id
        });

      if (error) {
        throw new Error(`Failed to get inquiry details: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting inquiry details:', error);
      throw error;
    }
  }

  /**
   * Respond to inquiry
   */
  async respondToInquiry(
    inquiryId: string,
    response: string,
    status: string = 'responded'
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('respond_to_inquiry', {
          p_inquiry_id: inquiryId,
          p_seller_id: user.id,
          p_response: response,
          p_status: status
        });

      if (error) {
        throw new Error(`Failed to respond to inquiry: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      throw error;
    }
  }

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(
    inquiryId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('update_inquiry_status', {
          p_inquiry_id: inquiryId,
          p_seller_id: user.id,
          p_status: status,
          p_notes: notes
        });

      if (error) {
        throw new Error(`Failed to update inquiry status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  }

  /**
   * Mark inquiry as converted
   */
  async markInquiryConverted(
    inquiryId: string,
    conversionNotes?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('mark_inquiry_converted', {
          p_inquiry_id: inquiryId,
          p_seller_id: user.id,
          p_conversion_notes: conversionNotes
        });

      if (error) {
        throw new Error(`Failed to mark inquiry as converted: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error marking inquiry as converted:', error);
      throw error;
    }
  }

  /**
   * Get inquiry statistics
   */
  async getInquiryStatistics(dateFrom?: string, dateTo?: string): Promise<Record<string, any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_inquiry_statistics', {
          p_seller_id: user.id,
          p_date_from: dateFrom,
          p_date_to: dateTo
        });

      if (error) {
        throw new Error(`Failed to get inquiry statistics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting inquiry statistics:', error);
      throw error;
    }
  }

  // ===== PERFORMANCE ANALYTICS =====

  /**
   * Get seller performance overview
   */
  async getPerformanceOverview(
    period: string = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; data: SellerPerformanceOverview }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_performance_overview', {
          p_seller_id: user.id,
          p_period: period,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) {
        throw new Error(`Failed to get performance overview: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting performance overview:', error);
      throw error;
    }
  }

  /**
   * Get performance comparison
   */
  async getPerformanceComparison(
    comparisonPeriod: string = 'monthly'
  ): Promise<{ success: boolean; data: SellerPerformanceComparison }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_performance_comparison', {
          p_seller_id: user.id,
          p_comparison_period: comparisonPeriod
        });

      if (error) {
        throw new Error(`Failed to get performance comparison: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting performance comparison:', error);
      throw error;
    }
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(): Promise<{ success: boolean; data: SellerPerformanceInsights }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_performance_insights', { p_seller_id: user.id });

      if (error) {
        throw new Error(`Failed to get performance insights: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw error;
    }
  }

  // ===== COMMUNICATION TOOLS =====

  /**
   * Send message to buyer
   */
  async sendMessage(
    buyerEmail: string,
    messageData: Record<string, any>
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('send_seller_message', {
          p_seller_id: user.id,
          p_buyer_email: buyerEmail,
          p_message_data: messageData
        });

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get seller messages
   */
  async getMessages(
    limit: number = 20,
    offset: number = 0,
    status?: string,
    messageType?: string,
    buyerEmail?: string,
    propertyId?: string,
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC'
  ): Promise<{ success: boolean; data: SellerMessage[]; pagination: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_messages', {
          p_seller_id: user.id,
          p_limit: limit,
          p_offset: offset,
          p_status: status,
          p_message_type: messageType,
          p_buyer_email: buyerEmail,
          p_property_id: propertyId,
          p_sort_by: sortBy,
          p_sort_order: sortOrder
        });

      if (error) {
        throw new Error(`Failed to get messages: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Create message template
   */
  async createMessageTemplate(templateData: Record<string, any>): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('create_message_template', {
          p_seller_id: user.id,
          p_template_data: templateData
        });

      if (error) {
        throw new Error(`Failed to create message template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating message template:', error);
      throw error;
    }
  }

  /**
   * Get message templates
   */
  async getMessageTemplates(templateType?: string): Promise<{ success: boolean; data: MessageTemplate[] }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_message_templates', {
          p_seller_id: user.id,
          p_template_type: templateType
        });

      if (error) {
        throw new Error(`Failed to get message templates: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting message templates:', error);
      throw error;
    }
  }

  // ===== APPOINTMENT SCHEDULING =====

  /**
   * Schedule appointment
   */
  async scheduleAppointment(appointmentData: Record<string, any>): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('schedule_seller_appointment', {
          p_seller_id: user.id,
          p_appointment_data: appointmentData
        });

      if (error) {
        throw new Error(`Failed to schedule appointment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Get seller appointments
   */
  async getAppointments(
    limit: number = 20,
    offset: number = 0,
    status?: string,
    dateFrom?: string,
    dateTo?: string,
    appointmentType?: string
  ): Promise<{ success: boolean; data: SellerAppointment[]; pagination: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('get_seller_appointments', {
          p_seller_id: user.id,
          p_limit: limit,
          p_offset: offset,
          p_status: status,
          p_date_from: dateFrom,
          p_date_to: dateTo,
          p_appointment_type: appointmentType
        });

      if (error) {
        throw new Error(`Failed to get appointments: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('update_appointment_status', {
          p_appointment_id: appointmentId,
          p_seller_id: user.id,
          p_status: status,
          p_notes: notes
        });

      if (error) {
        throw new Error(`Failed to update appointment status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const sellerService = SellerService.getInstance();
export default sellerService;
