import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledTask {
  id: string;
  task_name: string;
  task_type: string;
  cron_expression: string;
  config: Record<string, unknown> | null;
}

// deno-lint-ignore no-explicit-any
type SupabaseClientType = ReturnType<typeof createClient>;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    const { task_type } = await req.json().catch(() => ({ task_type: null }));
    
    console.log('Running scheduled tasks, type filter:', task_type);

    let query = supabase
      .from('scheduled_mcp_tasks')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString());

    if (task_type) {
      query = query.eq('task_type', task_type);
    }

    const { data: tasks } = await query;

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: 'No tasks to run' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const task of tasks as ScheduledTask[]) {
      console.log(`Executing task: ${task.task_name} (${task.task_type})`);
      
      try {
        let result: Record<string, unknown> = {};

        switch (task.task_type) {
          case 'credit_reset':
            result = await handleCreditReset(supabase);
            break;
          case 'notification':
            result = await handleNotifications(supabase);
            break;
          case 'scoring':
            result = await handlePartnerScoring(supabase);
            break;
          case 'maintenance':
            result = await handleMaintenance(supabase);
            break;
          case 'report_generation':
            result = await handleReportGeneration(supabase, task.config);
            break;
          default:
            result = { error: `Unknown task type: ${task.task_type}` };
        }

        const nextRun = calculateNextRun(task.cron_expression);
        await supabase
          .from('scheduled_mcp_tasks')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun,
            last_result: result,
          })
          .eq('id', task.id);

        results.push({ task: task.task_name, success: true, result });
        
      } catch (error) {
        console.error(`Task ${task.task_name} failed:`, error);
        
        await supabase
          .from('scheduled_mcp_tasks')
          .update({
            last_run_at: new Date().toISOString(),
            last_result: { error: error instanceof Error ? error.message : 'Unknown error' },
          })
          .eq('id', task.id);

        results.push({ task: task.task_name, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return new Response(JSON.stringify({ tasks_run: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scheduled tasks error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateNextRun(cronExpression: string): string {
  const now = new Date();
  
  if (cronExpression === '0 0 * * *') {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.toISOString();
  }
  
  if (cronExpression === '0 * * * *') {
    const next = new Date(now);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next.toISOString();
  }
  
  if (cronExpression === '*/15 * * * *') {
    const next = new Date(now);
    const minutes = next.getMinutes();
    next.setMinutes(Math.ceil(minutes / 15) * 15 + 15, 0, 0);
    return next.toISOString();
  }
  
  if (cronExpression === '0 0 1 * *') {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1, 1);
    next.setHours(0, 0, 0, 0);
    return next.toISOString();
  }
  
  const next = new Date(now.getTime() + 60 * 60 * 1000);
  return next.toISOString();
}

async function handleCreditReset(supabase: SupabaseClientType) {
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  if (dayOfMonth === 1) {
    const { data: users } = await supabase.from('user_credits').select('user_id, monthly_credits');
    let resetCount = 0;
    
    for (const user of (users || []) as { user_id: string; monthly_credits: number }[]) {
      await supabase.from('user_credits').update({ credits_remaining: user.monthly_credits }).eq('user_id', user.user_id);
      await supabase.from('credit_transactions').insert({
        user_id: user.user_id,
        amount: user.monthly_credits,
        balance_after: user.monthly_credits,
        transaction_type: 'monthly_reset',
        description: 'Monthly credit reset',
      });
      resetCount++;
    }
    return { message: `Reset credits for ${resetCount} users` };
  }
  return { message: 'Not the first of the month, skipping' };
}

async function handleNotifications(supabase: SupabaseClientType) {
  const { data: pendingNotifications } = await supabase
    .from('proactive_notification_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('trigger_at', new Date().toISOString())
    .limit(50);

  let sentCount = 0;
  for (const n of (pendingNotifications || []) as { id: string; user_id: string; title: string; message: string; notification_type: string; priority: string; metadata: unknown }[]) {
    try {
      await supabase.from('notifications').insert({
        user_id: n.user_id, title: n.title, message: n.message, type: n.notification_type, priority: n.priority, metadata: n.metadata,
      });
      await supabase.from('proactive_notification_queue').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', n.id);
      sentCount++;
    } catch {
      await supabase.from('proactive_notification_queue').update({ status: 'failed' }).eq('id', n.id);
    }
  }
  return { message: `Sent ${sentCount} notifications` };
}

async function handlePartnerScoring(supabase: SupabaseClientType) {
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - 1);

  const { data: partners } = await supabase.from('partners').select('id').eq('status', 'approved');
  let scoredCount = 0;

  for (const partner of (partners || []) as { id: string }[]) {
    const { data: requests } = await supabase
      .from('service_requests')
      .select('id, status')
      .eq('partner_id', partner.id)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    if (!requests || requests.length === 0) continue;
    
    const completed = (requests as { status: string }[]).filter(r => r.status === 'completed').length;
    const reliabilityScore = (completed / requests.length) * 100;

    await supabase.from('partner_performance_scores').insert({
      partner_id: partner.id, score_type: 'overall', score: reliabilityScore,
      period_start: periodStart.toISOString(), period_end: periodEnd.toISOString(), sample_size: requests.length,
    });
    scoredCount++;
  }
  return { message: `Scored ${scoredCount} partners` };
}

async function handleMaintenance(supabase: SupabaseClientType) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: uptimeDeleted } = await supabase.from('uptime_checks').delete({ count: 'exact' }).lt('checked_at', thirtyDaysAgo.toISOString());
  const { count: metricsDeleted } = await supabase.from('performance_metrics').delete({ count: 'exact' }).lt('created_at', thirtyDaysAgo.toISOString());

  return { message: 'Maintenance complete', deleted: { uptime_checks: uptimeDeleted || 0, performance_metrics: metricsDeleted || 0 } };
}

async function handleReportGeneration(supabase: SupabaseClientType, config: Record<string, unknown> | null) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { count: newUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString());
  const { count: newRequests } = await supabase.from('service_requests').select('*', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString());

  return {
    report_type: config?.report_type || 'daily_summary',
    period: { start: yesterday.toISOString(), end: now.toISOString() },
    metrics: { new_users: newUsers || 0, new_requests: newRequests || 0 },
    generated_at: now.toISOString(),
  };
}
