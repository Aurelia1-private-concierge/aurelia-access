import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "instant" | "daily_digest";
  userId?: string;
  title?: string;
  message?: string;
  channel?: "sms" | "email" | "both";
}

interface UserNotificationData {
  user_id: string;
  email: string;
  display_name: string | null;
  phone_number: string | null;
  sms_enabled: boolean;
  email_enabled: boolean;
  daily_digest_enabled: boolean;
}

interface DigestContent {
  hasContent: boolean;
  summary: string;
  smsContent: string;
  notifications: Array<{ title: string; description: string; created_at: string }>;
  requestUpdates: Array<{ title: string; status: string; updated_at: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const { type, userId, title, message, channel = "both" }: NotificationRequest = await req.json();

    console.log(`Processing ${type} notification request`);

    const results = {
      emailsSent: 0,
      smsSent: 0,
      errors: [] as string[],
    };

    if (type === "instant" && userId) {
      const userData = await getUserNotificationData(supabase, userId);
      
      if (!userData) {
        throw new Error("User not found or no notification settings");
      }

      if ((channel === "email" || channel === "both") && userData.email_enabled && resend) {
        try {
          await sendEmail(resend, userData.email, title || "Notification", message || "", userData.display_name);
          await logNotification(supabase, userId, "instant", "email", title || "Notification", message || "", "sent");
          results.emailsSent++;
        } catch (error) {
          console.error("Email send error:", error);
          await logNotification(supabase, userId, "instant", "email", title || "Notification", message || "", "failed", String(error));
          results.errors.push(`Email failed: ${error}`);
        }
      }

      if ((channel === "sms" || channel === "both") && userData.sms_enabled && userData.phone_number) {
        if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
          try {
            await sendSMS(twilioAccountSid, twilioAuthToken, twilioPhoneNumber, userData.phone_number, message || "");
            await logNotification(supabase, userId, "instant", "sms", title || "Notification", message || "", "sent");
            results.smsSent++;
          } catch (error) {
            console.error("SMS send error:", error);
            await logNotification(supabase, userId, "instant", "sms", title || "Notification", message || "", "failed", String(error));
            results.errors.push(`SMS failed: ${error}`);
          }
        } else {
          console.log("Twilio credentials not configured, skipping SMS");
          results.errors.push("SMS skipped: Twilio not configured");
        }
      }
    } else if (type === "daily_digest") {
      const users = await getDailyDigestUsers(supabase);
      console.log(`Found ${users.length} users for daily digest`);

      for (const user of users) {
        const digestContent = await generateDailyDigest(supabase, user.user_id);
        
        if (!digestContent.hasContent) {
          console.log(`No digest content for user ${user.user_id}, skipping`);
          continue;
        }

        if (user.email_enabled && resend) {
          try {
            await sendDigestEmail(resend, user.email, user.display_name, digestContent);
            await logNotification(supabase, user.user_id, "daily_digest", "email", "Daily Digest", digestContent.summary, "sent");
            results.emailsSent++;
          } catch (error) {
            console.error(`Digest email failed for ${user.user_id}:`, error);
            await logNotification(supabase, user.user_id, "daily_digest", "email", "Daily Digest", digestContent.summary, "failed", String(error));
            results.errors.push(`Email to ${user.email} failed`);
          }
        }

        if (user.sms_enabled && user.phone_number && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
          try {
            await sendSMS(twilioAccountSid, twilioAuthToken, twilioPhoneNumber, user.phone_number, digestContent.smsContent);
            await logNotification(supabase, user.user_id, "daily_digest", "sms", "Daily Digest", digestContent.smsContent, "sent");
            results.smsSent++;
          } catch (error) {
            console.error(`Digest SMS failed for ${user.user_id}:`, error);
            await logNotification(supabase, user.user_id, "daily_digest", "sms", "Daily Digest", digestContent.smsContent, "failed", String(error));
            results.errors.push(`SMS to ${user.phone_number} failed`);
          }
        }
      }
    }

    console.log("Notification results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function getUserNotificationData(supabase: SupabaseClient, userId: string): Promise<UserNotificationData | null> {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  if (!authUser?.user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .single();

  const { data: settings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return {
    user_id: userId,
    email: authUser.user.email,
    display_name: profile?.display_name || null,
    phone_number: settings?.phone_number || null,
    sms_enabled: settings?.sms_enabled ?? false,
    email_enabled: settings?.email_enabled ?? true,
    daily_digest_enabled: settings?.daily_digest_enabled ?? true,
  };
}

async function getDailyDigestUsers(supabase: SupabaseClient): Promise<UserNotificationData[]> {
  const { data: settings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("daily_digest_enabled", true);

  if (!settings || settings.length === 0) return [];

  const users: UserNotificationData[] = [];

  for (const setting of settings) {
    const { data: authUser } = await supabase.auth.admin.getUserById(setting.user_id);
    if (!authUser?.user?.email) continue;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", setting.user_id)
      .single();

    users.push({
      user_id: setting.user_id,
      email: authUser.user.email,
      display_name: profile?.display_name || null,
      phone_number: setting.phone_number,
      sms_enabled: setting.sms_enabled,
      email_enabled: setting.email_enabled,
      daily_digest_enabled: true,
    });
  }

  return users;
}

async function generateDailyDigest(supabase: SupabaseClient, userId: string): Promise<DigestContent> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("title, description, created_at")
    .eq("user_id", userId)
    .eq("read", false)
    .gte("created_at", yesterday.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: requests } = await supabase
    .from("service_requests")
    .select("title, status, updated_at")
    .eq("client_id", userId)
    .gte("updated_at", yesterday.toISOString())
    .order("updated_at", { ascending: false })
    .limit(5);

  const hasContent = Boolean((notifications && notifications.length > 0) || (requests && requests.length > 0));

  let summary = "";
  let smsContent = "";

  if (hasContent) {
    const notifCount = notifications?.length || 0;
    const requestCount = requests?.length || 0;

    summary = `You have ${notifCount} new notification${notifCount !== 1 ? 's' : ''} and ${requestCount} service request update${requestCount !== 1 ? 's' : ''}.`;
    smsContent = `Aurelia Daily: ${notifCount} notifications, ${requestCount} request updates. Log in to view details.`;
  }

  return {
    hasContent,
    summary,
    smsContent,
    notifications: notifications || [],
    requestUpdates: requests || [],
  };
}

async function sendEmail(resend: Resend, to: string, subject: string, message: string, name: string | null) {
  const displayName = name || "Valued Member";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #d4af37; border-radius: 12px; padding: 40px; }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: bold; color: #d4af37; letter-spacing: 2px; }
        .content { line-height: 1.8; color: #e2e8f0; }
        .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155; color: #94a3b8; font-size: 12px; }
        h1 { color: #d4af37; font-size: 20px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AURELIA</div>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 12px; letter-spacing: 1px;">PRIVATE CONCIERGE</p>
        </div>
        <div class="content">
          <p>Dear ${displayName},</p>
          <h1>${subject}</h1>
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.</p>
          <p>This is an automated notification from your concierge service.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Aurelia Concierge <concierge@aurelia-privateconcierge.com>",
    to: [to],
    subject: `Aurelia: ${subject}`,
    html,
  });
}

async function sendDigestEmail(resend: Resend, to: string, name: string | null, digest: DigestContent) {
  const displayName = name || "Valued Member";
  
  let notificationsHtml = "";
  if (digest.notifications.length > 0) {
    notificationsHtml = `
      <h2 style="color: #d4af37; font-size: 16px; margin: 24px 0 12px;">Recent Notifications</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${digest.notifications.map(n => `
          <li style="background: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #d4af37;">
            <strong style="color: #f8fafc;">${n.title}</strong>
            <p style="margin: 4px 0 0; color: #94a3b8; font-size: 14px;">${n.description}</p>
          </li>
        `).join('')}
      </ul>
    `;
  }

  let requestsHtml = "";
  if (digest.requestUpdates.length > 0) {
    requestsHtml = `
      <h2 style="color: #d4af37; font-size: 16px; margin: 24px 0 12px;">Service Request Updates</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${digest.requestUpdates.map(r => `
          <li style="background: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #d4af37;">
            <strong style="color: #f8fafc;">${r.title}</strong>
            <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: #d4af37; color: #0f172a; border-radius: 4px; font-size: 12px;">${r.status}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #d4af37; border-radius: 12px; padding: 40px; }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: bold; color: #d4af37; letter-spacing: 2px; }
        .content { line-height: 1.8; color: #e2e8f0; }
        .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AURELIA</div>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 12px; letter-spacing: 1px;">DAILY DIGEST</p>
        </div>
        <div class="content">
          <p>Good morning, ${displayName}</p>
          <p>${digest.summary}</p>
          ${notificationsHtml}
          ${requestsHtml}
          <p style="margin-top: 24px;">
            <a href="https://aurelia.lovable.app/dashboard" style="display: inline-block; padding: 12px 24px; background: #d4af37; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.</p>
          <p>To adjust notification preferences, visit your profile settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Aurelia Concierge <concierge@aurelia-privateconcierge.com>",
    to: [to],
    subject: `Your Aurelia Daily Digest - ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    html,
  });
}

async function sendSMS(accountSid: string, authToken: string, from: string, to: string, message: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: from,
      To: to,
      Body: message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio error: ${error}`);
  }

  return response.json();
}

async function logNotification(
  supabase: SupabaseClient,
  userId: string,
  notificationType: string,
  channel: string,
  subject: string,
  content: string,
  status: string,
  errorMessage?: string
) {
  await supabase.from("sent_notifications").insert({
    user_id: userId,
    notification_type: notificationType,
    channel,
    subject,
    content,
    status,
    error_message: errorMessage,
    sent_at: status === "sent" ? new Date().toISOString() : null,
  });
}

serve(handler);
