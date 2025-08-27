import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';

// Property approval schemas
const approvalActionSchema = z.object({
  property_id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_changes']),
  reason: z.string().optional(),
  changes_requested: z.array(z.string()).optional(),
  admin_notes: z.string().optional()
});

const bulkApprovalSchema = z.object({
  properties: z.array(z.object({
    property_id: z.string().uuid(),
    action: z.enum(['approve', 'reject', 'request_changes']),
    reason: z.string().optional(),
    changes_requested: z.array(z.string()).optional(),
    admin_notes: z.string().optional()
  })).min(1)
});

const approvalQuerySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  status: z.enum(['pending', 'approved', 'rejected', 'changes_requested']).optional(),
  property_type: z.string().optional(),
  seller_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'price', 'views_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// GET /api/admin/properties/approval - List properties pending approval
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin with read permissions
    const authResult = await requireAdmin(['read:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryData = approvalQuerySchema.parse(Object.fromEntries(searchParams));
    const { page, limit, status, property_type, seller_id, sort_by, sort_order } = queryData;
    
    // Build base query for properties
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        property_type,
        listing_type,
        status,
        created_at,
        updated_at,
        views_count,
        seller_id,
        users!properties_seller_id_fkey (
          id,
          full_name,
          email,
          company_name,
          is_verified
        ),
        property_images (
          id,
          image_url,
          is_primary
        )
      `);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default to pending approval if no status specified
      query = query.eq('status', 'pending');
    }
    
    if (property_type) {
      query = query.eq('property_type', property_type);
    }
    
    if (seller_id) {
      query = query.eq('seller_id', seller_id);
    }
    
    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: properties, error: queryError } = await query;
    
    if (queryError) {
      console.error('Error fetching properties for approval:', queryError);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', status || 'pending');
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'view_properties_approval', 'properties', undefined, {
      filters: { status, property_type, seller_id },
      pagination: { page, limit },
      sorting: { sort_by, sort_order }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        properties: properties || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          total_pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/admin/properties/approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/properties/approval - Approve/reject individual property
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = approvalActionSchema.parse(body);
    const { property_id, action, reason, changes_requested, admin_notes } = validatedData;
    
    // Check if property exists and is pending approval
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, status, seller_id')
      .eq('id', property_id)
      .single();
    
    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    if (property.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Property is not pending approval' 
      }, { status: 400 });
    }
    
    // Prepare update data based on action
    let updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    switch (action) {
      case 'approve':
        updateData.status = 'active';
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = adminUser.id;
        break;
      
      case 'reject':
        updateData.status = 'rejected';
        updateData.rejected_at = new Date().toISOString();
        updateData.rejected_by = adminUser.id;
        updateData.rejection_reason = reason;
        break;
      
      case 'request_changes':
        updateData.status = 'changes_requested';
        updateData.changes_requested_at = new Date().toISOString();
        updateData.changes_requested_by = adminUser.id;
        updateData.changes_requested_reason = reason;
        updateData.changes_requested_details = changes_requested;
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Update property status
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', property_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating property approval status:', updateError);
      return NextResponse.json({ error: 'Failed to update property status' }, { status: 500 });
    }
    
    // Create approval record
    const { error: approvalError } = await supabase
      .from('property_approvals')
      .insert([{
        property_id,
        admin_id: adminUser.id,
        action,
        reason,
        changes_requested,
        admin_notes,
        timestamp: new Date().toISOString()
      }]);
    
    if (approvalError) {
      console.error('Error creating approval record:', approvalError);
      // Don't fail the request if approval record creation fails
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, `property_${action}`, 'properties', property_id, {
      action,
      reason,
      changes_requested,
      admin_notes,
      property_title: property.title
    });
    
    return NextResponse.json({
      success: true,
      message: `Property ${action} successfully`,
      data: updatedProperty
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/admin/properties/approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/properties/approval - Bulk approval actions
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = bulkApprovalSchema.parse(body);
    const { properties } = validatedData;
    
    const results = [];
    const errors = [];
    
    // Process each property approval
    for (const approval of properties) {
      try {
        const { property_id, action, reason, changes_requested, admin_notes } = approval;
        
        // Check if property exists and is pending
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('id, title, status')
          .eq('id', property_id)
          .single();
        
        if (propertyError || !property) {
          errors.push({ property_id, error: 'Property not found' });
          continue;
        }
        
        if (property.status !== 'pending') {
          errors.push({ property_id, error: 'Property is not pending approval' });
          continue;
        }
        
        // Prepare update data
        let updateData: any = {
          updated_at: new Date().toISOString()
        };
        
        switch (action) {
          case 'approve':
            updateData.status = 'active';
            updateData.approved_at = new Date().toISOString();
            updateData.approved_by = adminUser.id;
            break;
          
          case 'reject':
            updateData.status = 'rejected';
            updateData.rejected_at = new Date().toISOString();
            updateData.rejected_by = adminUser.id;
            updateData.rejection_reason = reason;
            break;
          
          case 'request_changes':
            updateData.status = 'changes_requested';
            updateData.changes_requested_at = new Date().toISOString();
            updateData.changes_requested_by = adminUser.id;
            updateData.changes_requested_reason = reason;
            updateData.changes_requested_details = changes_requested;
            break;
        }
        
        // Update property
        const { data: updatedProperty, error: updateError } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', property_id)
          .select()
          .single();
        
        if (updateError) {
          errors.push({ property_id, error: 'Failed to update property' });
          continue;
        }
        
        // Create approval record
        await supabase
          .from('property_approvals')
          .insert([{
            property_id,
            admin_id: adminUser.id,
            action,
            reason,
            changes_requested,
            admin_notes,
            timestamp: new Date().toISOString()
          }]);
        
        results.push({
          property_id,
          action,
          success: true,
          data: updatedProperty
        });
        
      } catch (error) {
        errors.push({ 
          property_id: approval.property_id, 
          error: 'Processing error' 
        });
      }
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'bulk_property_approval', 'properties', undefined, {
      total_properties: properties.length,
      successful: results.length,
      failed: errors.length,
      actions: properties.map(p => ({ property_id: p.property_id, action: p.action }))
    });
    
    return NextResponse.json({
      success: true,
      message: `Processed ${properties.length} properties`,
      data: {
        results,
        errors,
        summary: {
          total: properties.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/admin/properties/approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

