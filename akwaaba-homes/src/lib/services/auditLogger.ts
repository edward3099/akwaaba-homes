import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AuditLogEntry {
  user_id: string;
  action: string;
  target_id?: string;
  target_type?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface AuditLogConfig {
  enabled: boolean;
  logLevel: 'minimal' | 'standard' | 'detailed';
  includeUserContext: boolean;
  includeRequestContext: boolean;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private config: AuditLogConfig;

  private constructor() {
    this.config = {
      enabled: true,
      logLevel: 'standard',
      includeUserContext: true,
      includeRequestContext: true
    };
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log a critical action to the audit log
   */
  async logAction(
    action: string,
    userId: string,
    targetId?: string,
    targetType?: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

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

      // Prepare audit log entry
      const auditEntry: AuditLogEntry = {
        user_id: userId,
        action,
        target_id: targetId,
        target_type: targetType,
        details: this.enrichDetails(details, request),
        timestamp: new Date().toISOString()
      };

      // Insert into audit_logs table
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);

      if (error) {
        console.error('Failed to insert audit log:', error);
        // Don't fail the main operation if audit logging fails
      } else {
        console.log('Audit log entry created:', {
          action,
          userId,
          targetId,
          timestamp: auditEntry.timestamp
        });
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't fail the main operation if audit logging fails
    }
  }

  /**
   * Log user authentication events
   */
  async logAuthEvent(
    action: 'login' | 'logout' | 'signup' | 'password_reset' | 'password_change',
    userId: string,
    success: boolean,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const enrichedDetails = {
      ...details,
      success,
      event_type: 'authentication'
    };

    await this.logAction(action, userId, undefined, 'auth', enrichedDetails, request);
  }

  /**
   * Log profile management events
   */
  async logProfileEvent(
    action: 'profile_view' | 'profile_update' | 'profile_delete',
    userId: string,
    targetId: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const enrichedDetails = {
      ...details,
      event_type: 'profile_management'
    };

    await this.logAction(action, userId, targetId, 'profile', enrichedDetails, request);
  }

  /**
   * Log agent verification events
   */
  async logAgentVerificationEvent(
    action: 'agent_approve' | 'agent_reject' | 'agent_application',
    adminUserId: string,
    agentId: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const enrichedDetails = {
      ...details,
      event_type: 'agent_verification',
      admin_user_id: adminUserId
    };

    await this.logAction(action, adminUserId, agentId, 'agent', enrichedDetails, request);
  }

  /**
   * Log property management events
   */
  async logPropertyEvent(
    action: 'property_create' | 'property_update' | 'property_delete' | 'property_view',
    userId: string,
    propertyId: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const enrichedDetails = {
      ...details,
      event_type: 'property_management'
    };

    await this.logAction(action, userId, propertyId, 'property', enrichedDetails, request);
  }

  /**
   * Log contact form submissions
   */
  async logContactSubmission(
    userId: string,
    contactId: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const enrichedDetails = {
      ...details,
      event_type: 'contact_submission'
    };

    await this.logAction('contact_submit', userId, contactId, 'contact', enrichedDetails, request);
  }

  /**
   * Log admin actions
   */
  async logAdminAction(
    action: string,
    adminUserId: string,
    targetId?: string,
    targetType?: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const enrichedDetails = {
      ...details,
      event_type: 'admin_action',
      admin_user_id: adminUserId
    };

    await this.logAction(action, adminUserId, targetId, targetType, enrichedDetails, request);
  }

  /**
   * Enrich details with request context if available
   */
  private enrichDetails(details: Record<string, any>, request?: Request): Record<string, any> {
    if (!request || !this.config.includeRequestContext) {
      return details;
    }

    const enriched = { ...details };

    try {
      // Extract IP address from various headers
      const forwarded = request.headers.get('x-forwarded-for');
      const realIP = request.headers.get('x-real-ip');
      const cfConnectingIP = request.headers.get('cf-connecting-ip');
      
      if (forwarded) {
        enriched.ip_address = forwarded.split(',')[0].trim();
      } else if (realIP) {
        enriched.ip_address = realIP;
      } else if (cfConnectingIP) {
        enriched.ip_address = cfConnectingIP;
      }

      // Extract user agent
      enriched.user_agent = request.headers.get('user-agent') || 'unknown';

      // Extract referer
      enriched.referer = request.headers.get('referer') || 'unknown';

      // Extract origin
      enriched.origin = request.headers.get('origin') || 'unknown';
    } catch (error) {
      console.error('Error enriching audit details:', error);
    }

    return enriched;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AuditLogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AuditLogConfig {
    return { ...this.config };
  }

  /**
   * Check if audit logging is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions for common audit events
export const logAuthEvent = auditLogger.logAuthEvent.bind(auditLogger);
export const logProfileEvent = auditLogger.logProfileEvent.bind(auditLogger);
export const logAgentVerificationEvent = auditLogger.logAgentVerificationEvent.bind(auditLogger);
export const logPropertyEvent = auditLogger.logPropertyEvent.bind(auditLogger);
export const logContactSubmission = auditLogger.logContactSubmission.bind(auditLogger);
export const logAdminAction = auditLogger.logAdminAction.bind(auditLogger);
