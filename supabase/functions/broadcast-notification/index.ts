import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  title: string;
  message: string;
  type: "system" | "portfolio" | "message" | "document";
  sendEmail: boolean;
  targetUserIds?: string[]; // If not provided, sends to all users
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid user token:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      console.error("User is not an admin:", user.id);
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, message, type, sendEmail, targetUserIds }: BroadcastRequest = await req.json();

    if (!title || !message || !type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Broadcasting notification: "${title}" to ${targetUserIds?.length || 'all'} users`);

    // Get target users
    let usersQuery = supabase.from("profiles").select("user_id");
    if (targetUserIds && targetUserIds.length > 0) {
      usersQuery = usersQuery.in("user_id", targetUserIds);
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users found", sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create in-app notifications for all users
    const notifications = users.map((u) => ({
      user_id: u.user_id,
      type,
      title,
      description: message,
      read: false,
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error("Error inserting notifications:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create notifications" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Created ${notifications.length} in-app notifications`);

    // Send emails if requested
    let emailsSent = 0;
    if (sendEmail && resendApiKey) {
      const resend = new Resend(resendApiKey);

      // Get user emails from auth
      for (const u of users) {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(u.user_id);
          
          if (authUser?.user?.email) {
            const emailHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                  .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
                  .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
                  .content { line-height: 1.8; color: #c0c0c0; }
                  .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; }
                  .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
                  .button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0a; padding: 14px 32px; text-decoration: none; font-weight: 500; letter-spacing: 1px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">AURELIA</div>
                    <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 10px;">PRIVATE CONCIERGE</p>
                  </div>
                  <div class="content">
                    <h1>${title}</h1>
                    <p>${message}</p>
                    <center>
                      <a href="https://aurelia-privateconcierge.com/dashboard" class="button">VIEW IN DASHBOARD</a>
                    </center>
                  </div>
                  <div class="footer">
                    <p>Aurelia Holdings Ltd. • Geneva • London • Singapore</p>
                  </div>
                </div>
              </body>
              </html>
            `;

            await resend.emails.send({
              from: "Aurelia <concierge@aurelia-privateconcierge.com>",
              to: [authUser.user.email],
              subject: title,
              html: emailHtml,
            });

            emailsSent++;
            console.log(`Email sent to ${authUser.user.email}`);
          }
        } catch (emailErr) {
          console.error(`Failed to send email to user ${u.user_id}:`, emailErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notifications.length,
        emailsSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
