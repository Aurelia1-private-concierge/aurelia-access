import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncOperation {
  id?: string;
  operation_type: 'create' | 'update' | 'delete';
  table_name: string;
  record_id?: string;
  payload: Record<string, unknown>;
  client_timestamp: string;
  device_id?: string;
}

interface CacheRequest {
  cache_type: string;
  cache_key?: string;
}

// Tables that support offline sync
const SYNCABLE_TABLES = [
  'service_requests',
  'conversations',
  'conversation_messages',
  'calendar_events',
  'notifications',
  'user_preferences',
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = req.method !== 'GET' ? await req.json() : {};

    console.log(`[OfflineSync] Action: ${action}, User: ${user.id}`);

    switch (action) {
      case 'queue_operations': {
        // Queue multiple operations for sync
        const { operations } = body as { operations: SyncOperation[] };

        if (!operations || !Array.isArray(operations)) {
          return new Response(
            JSON.stringify({ error: 'Operations array required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate table names
        const invalidTables = operations.filter(op => !SYNCABLE_TABLES.includes(op.table_name));
        if (invalidTables.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid table names', 
              invalid: invalidTables.map(op => op.table_name) 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const queueRecords = operations.map(op => ({
          user_id: user.id,
          operation_type: op.operation_type,
          table_name: op.table_name,
          record_id: op.record_id,
          payload: op.payload,
          client_timestamp: op.client_timestamp,
          device_id: op.device_id,
          status: 'pending',
          priority: op.operation_type === 'delete' ? 1 : (op.operation_type === 'update' ? 3 : 5),
        }));

        const { data: queued, error } = await supabase
          .from('offline_sync_queue')
          .insert(queueRecords)
          .select();

        if (error) throw error;

        console.log(`[OfflineSync] Queued ${queued?.length} operations`);

        return new Response(
          JSON.stringify({ success: true, queued: queued?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'process_queue': {
        // Process pending sync operations
        const { data: pendingOps, error: fetchError } = await supabase
          .from('offline_sync_queue')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('priority', { ascending: true })
          .order('client_timestamp', { ascending: true })
          .limit(50);

        if (fetchError) throw fetchError;

        const results = {
          processed: 0,
          failed: 0,
          errors: [] as { id: string; error: string }[],
        };

        for (const op of pendingOps || []) {
          try {
            // Mark as syncing
            await supabase
              .from('offline_sync_queue')
              .update({ status: 'syncing' })
              .eq('id', op.id);

            // Execute the operation
            let opError = null;

            switch (op.operation_type) {
              case 'create': {
                const { error } = await supabase
                  .from(op.table_name)
                  .insert({ ...op.payload, user_id: user.id });
                opError = error;
                break;
              }
              case 'update': {
                if (!op.record_id) throw new Error('record_id required for update');
                const { error } = await supabase
                  .from(op.table_name)
                  .update(op.payload)
                  .eq('id', op.record_id);
                opError = error;
                break;
              }
              case 'delete': {
                if (!op.record_id) throw new Error('record_id required for delete');
                const { error } = await supabase
                  .from(op.table_name)
                  .delete()
                  .eq('id', op.record_id);
                opError = error;
                break;
              }
            }

            if (opError) throw opError;

            // Mark as completed
            await supabase
              .from('offline_sync_queue')
              .update({ status: 'completed', synced_at: new Date().toISOString() })
              .eq('id', op.id);

            results.processed++;
          } catch (opError: any) {
            // Mark as failed with retry logic
            const newRetryCount = (op.retry_count || 0) + 1;
            const newStatus = newRetryCount >= op.max_retries ? 'failed' : 'pending';

            await supabase
              .from('offline_sync_queue')
              .update({ 
                status: newStatus, 
                retry_count: newRetryCount,
                error_message: opError.message,
              })
              .eq('id', op.id);

            results.failed++;
            results.errors.push({ id: op.id, error: opError.message });
          }
        }

        console.log(`[OfflineSync] Processed: ${results.processed}, Failed: ${results.failed}`);

        return new Response(
          JSON.stringify({ success: true, ...results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_cache': {
        // Get cached data for offline use
        const { cache_type } = body as CacheRequest;

        const { data: cache } = await supabase
          .from('offline_cache')
          .select('*')
          .eq('user_id', user.id)
          .eq('cache_type', cache_type)
          .order('updated_at', { ascending: false });

        return new Response(
          JSON.stringify({ success: true, cache: cache || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_cache': {
        // Update offline cache with fresh data
        const { cache_type, cache_key, data, expires_in_hours } = body;

        const expiresAt = expires_in_hours 
          ? new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h

        const { data: cached, error } = await supabase
          .from('offline_cache')
          .upsert({
            user_id: user.id,
            cache_key: cache_key || `${cache_type}_${Date.now()}`,
            cache_type,
            data,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,cache_key',
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`[OfflineSync] Updated cache: ${cache_type}`);

        return new Response(
          JSON.stringify({ success: true, cached }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'prefetch': {
        // Prefetch essential data for offline access
        const prefetchData: Record<string, unknown> = {};

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        prefetchData.profile = profile;

        // Fetch recent service requests
        const { data: requests } = await supabase
          .from('service_requests')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        prefetchData.service_requests = requests;

        // Fetch upcoming events
        const { data: events } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(10);
        prefetchData.calendar_events = events;

        // Fetch user preferences
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        prefetchData.preferences = preferences;

        // Fetch recent conversations
        const { data: conversations } = await supabase
          .from('conversations')
          .select('*, conversation_messages(content, role, created_at)')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);
        prefetchData.conversations = conversations;

        // Store all in cache
        for (const [key, data] of Object.entries(prefetchData)) {
          if (data) {
            await supabase
              .from('offline_cache')
              .upsert({
                user_id: user.id,
                cache_key: `prefetch_${key}`,
                cache_type: key,
                data,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id,cache_key',
              });
          }
        }

        console.log(`[OfflineSync] Prefetched ${Object.keys(prefetchData).length} data types`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            prefetched: Object.keys(prefetchData),
            data: prefetchData,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'clear_synced': {
        // Clean up completed sync operations
        const { data: deleted, error } = await supabase
          .from('offline_sync_queue')
          .delete()
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .select();

        if (error) throw error;

        console.log(`[OfflineSync] Cleared ${deleted?.length} completed operations`);

        return new Response(
          JSON.stringify({ success: true, cleared: deleted?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OfflineSync] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
