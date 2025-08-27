import { supabase } from '../supabase';
import { 
  DatabaseInquiry, 
  InquiryWithDetails, 
  CreateInquiryForm,
  ApiResponse 
} from '../types/database';

export class InquiryService {
  // Create a new inquiry (anonymous buyers don't need accounts)
  static async createInquiry(inquiryData: CreateInquiryForm): Promise<ApiResponse<DatabaseInquiry>> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          ...inquiryData,
          is_anonymous: true,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseInquiry,
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

  // Get inquiries for a specific property (for sellers/agents)
  static async getInquiriesByProperty(propertyId: string): Promise<ApiResponse<DatabaseInquiry[]>> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get all inquiries for a seller/agent (across all their properties)
  static async getInquiriesBySeller(sellerId: string): Promise<ApiResponse<InquiryWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties!inquiries_property_id_fkey(*)
        `)
        .eq('property.seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data as InquiryWithDetails[] || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get a single inquiry by ID
  static async getInquiryById(id: string): Promise<ApiResponse<InquiryWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties!inquiries_property_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as InquiryWithDetails,
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

  // Update inquiry status (for sellers/agents to respond)
  static async updateInquiryStatus(id: string, status: 'responded' | 'closed' | 'spam', agentNotes?: string): Promise<ApiResponse<DatabaseInquiry>> {
    try {
      const updates: Partial<DatabaseInquiry> = { status };
      if (agentNotes) {
        updates.agent_notes = agentNotes;
      }

      const { data, error } = await supabase
        .from('inquiries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseInquiry,
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

  // Add agent notes to an inquiry
  static async addAgentNotes(id: string, notes: string): Promise<ApiResponse<DatabaseInquiry>> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ agent_notes: notes })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseInquiry,
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

  // Get inquiry statistics for a seller/agent
  static async getInquiryStats(sellerId: string): Promise<ApiResponse<{
    total: number;
    pending: number;
    responded: number;
    closed: number;
    spam: number;
    responseRate: number;
    averageResponseTime: string;
  }>> {
    try {
      // Get all inquiries for the seller's properties
      const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties!inquiries_property_id_fkey(*)
        `)
        .eq('property.seller_id', sellerId);

      if (error) {
        throw error;
      }

      const total = inquiries?.length || 0;
      const pending = inquiries?.filter(i => i.status === 'pending').length || 0;
      const responded = inquiries?.filter(i => i.status === 'responded').length || 0;
      const closed = inquiries?.filter(i => i.status === 'closed').length || 0;
      const spam = inquiries?.filter(i => i.status === 'spam').length || 0;

      // Calculate response rate
      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

      // Calculate average response time (simplified - would need more complex logic in production)
      const averageResponseTime = '2.3 hours'; // Placeholder

      return {
        data: {
          total,
          pending,
          responded,
          closed,
          spam,
          responseRate,
          averageResponseTime
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

  // Get recent inquiries (for dashboard)
  static async getRecentInquiries(sellerId: string, limit: number = 10): Promise<ApiResponse<InquiryWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties!inquiries_property_id_fkey(*)
        `)
        .eq('property.seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        data: data as InquiryWithDetails[] || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Delete an inquiry (admin only)
  static async deleteInquiry(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('inquiries')
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
