import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';

// System configuration schemas
const configUpdateSchema = z.object({
  category: z.enum(['general', 'security', 'features', 'notifications', 'integrations', 'performance']),
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional(),
  is_public: z.boolean().default(false)
});

const configQuerySchema = z.object({
  category: z.enum(['general', 'security', 'features', 'notifications', 'integrations', 'performance']).optional(),
  key: z.string().optional(),
  include_public: z.string().transform(val => val === 'true').default(false)
});

const featureFlagSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  description: z.string().optional(),
  rollout_percentage: z.number().min(0).max(100).optional(),
  target_users: z.array(z.string()).optional(),
  conditions: z.record(z.string(), z.any()).optional()
});

// GET /api/admin/system/config - Get system configuration
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin with read permissions
    const authResult = await requireAdmin(['read:system_config'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    const queryData = configQuerySchema.parse(queryParams);
    const { category, key, include_public } = queryData;
    
    // Build query for system configuration
    let query = supabase
      .from('system_config')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    if (key) {
      query = query.eq('key', key);
    }
    
    // Filter public settings based on admin permissions
    if (!include_public) {
      query = query.eq('is_public', false);
    }
    
    // Execute query
    const { data: configs, error: queryError } = await query;
    
    if (queryError) {
      console.error('Error fetching system configuration:', queryError);
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
    }
    
    // Group configurations by category
    const groupedConfigs = (configs || []).reduce((acc: any, config: any) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {});
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'view_system_config', 'system_config', undefined, {
      category,
      key,
      include_public
    });
    
    return NextResponse.json({
      success: true,
      data: {
        configurations: groupedConfigs,
        total_count: configs?.length || 0
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/admin/system/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/system/config - Create or update system configuration
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:system_config'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = configUpdateSchema.parse(body);
    const { category, key, value, description, is_public } = validatedData;
    
    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('system_config')
      .select('id, value')
      .eq('category', category)
      .eq('key', key)
      .single();
    
    let result;
    
    if (existingConfig) {
      // Update existing configuration
      const { data: updatedConfig, error: updateError } = await supabase
        .from('system_config')
        .update({
          value: JSON.stringify(value),
          description,
          is_public,
          updated_at: new Date().toISOString(),
          updated_by: adminUser.id
        })
        .eq('id', existingConfig.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating system configuration:', updateError);
        return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
      }
      
      result = updatedConfig;
    } else {
      // Create new configuration
      const { data: newConfig, error: createError } = await supabase
        .from('system_config')
        .insert([{
          category,
          key,
          value: JSON.stringify(value),
          description,
          is_public,
          created_at: new Date().toISOString(),
          created_by: adminUser.id,
          updated_at: new Date().toISOString(),
          updated_by: adminUser.id
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating system configuration:', createError);
        return NextResponse.json({ error: 'Failed to create configuration' }, { status: 500 });
      }
      
      result = newConfig;
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'update_system_config', 'system_config', result.id, {
      action: existingConfig ? 'update' : 'create',
      category,
      key,
      value,
      is_public
    });
    
    return NextResponse.json({
      success: true,
      message: `Configuration ${existingConfig ? 'updated' : 'created'} successfully`,
      data: result
    }, { status: existingConfig ? 200 : 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/admin/system/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/system/config - Bulk update configurations
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:system_config'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body - array of configurations
    const validatedData = z.array(configUpdateSchema).parse(body);
    
    const results = [];
    const errors = [];
    
    // Process each configuration update
    for (const config of validatedData) {
      try {
        const { category, key, value, description, is_public } = config;
        
        // Check if configuration exists
        const { data: existingConfig } = await supabase
          .from('system_config')
          .select('id')
          .eq('category', category)
          .eq('key', key)
          .single();
        
        if (existingConfig) {
          // Update existing
          const { data: updatedConfig, error: updateError } = await supabase
            .from('system_config')
            .update({
              value: JSON.stringify(value),
              description,
              is_public,
              updated_at: new Date().toISOString(),
              updated_by: adminUser.id
            })
            .eq('id', existingConfig.id)
            .select()
            .single();
          
          if (updateError) {
            errors.push({ category, key, error: 'Update failed' });
            continue;
          }
          
          results.push({ category, key, action: 'updated', data: updatedConfig });
        } else {
          // Create new
          const { data: newConfig, error: createError } = await supabase
            .from('system_config')
            .insert([{
              category,
              key,
              value: JSON.stringify(value),
              description,
              is_public,
              created_at: new Date().toISOString(),
              created_by: adminUser.id,
              updated_at: new Date().toISOString(),
              updated_by: adminUser.id
            }])
            .select()
            .single();
          
          if (createError) {
            errors.push({ category, key, error: 'Creation failed' });
            continue;
          }
          
          results.push({ category, key, action: 'created', data: newConfig });
        }
        
      } catch (error) {
        errors.push({ 
          category: config.category, 
          key: config.key, 
          error: 'Processing error' 
        });
      }
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'bulk_update_system_config', 'system_config', undefined, {
      total_configs: validatedData.length,
      successful: results.length,
      failed: errors.length
    });
    
    return NextResponse.json({
      success: true,
      message: `Processed ${validatedData.length} configurations`,
      data: {
        results,
        errors,
        summary: {
          total: validatedData.length,
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
    
    console.error('Error in PUT /api/admin/system/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/system/config - Delete system configuration
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:system_config'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const key = searchParams.get('key');
    
    if (!category || !key) {
      return NextResponse.json({ 
        error: 'Category and key are required for deletion' 
      }, { status: 400 });
    }
    
    // Check if configuration exists
    const { data: existingConfig, error: checkError } = await supabase
      .from('system_config')
      .select('id, category, key')
      .eq('category', category)
      .eq('key', key)
      .single();
    
    if (checkError || !existingConfig) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }
    
    // Delete configuration
    const { error: deleteError } = await supabase
      .from('system_config')
      .delete()
      .eq('id', existingConfig.id);
    
    if (deleteError) {
      console.error('Error deleting system configuration:', deleteError);
      return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'delete_system_config', 'system_config', existingConfig.id, {
      category,
      key
    });
    
    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/admin/system/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
