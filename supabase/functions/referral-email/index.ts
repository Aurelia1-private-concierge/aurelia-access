import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralEmailRequest {
  type: "invitation" | "signup_notification" | "reward_confirmation";
  referrerEmail?: string;
  referrerName?: string;
  referredEmail?: string;
  referredName?: string;
  referralLink?: string;
  rewardType?: string;
  rewardValue?: number;
}

const getInvitationEmailHtml = (referrerName: string, referralLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <!-- Logo -->
              <div style="margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: 300; color: #d4af37; letter-spacing: 4px;">AURELIA</span>
              </div>
              
              <!-- Heading -->
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0 0 24px 0; letter-spacing: 1px;">
                You've Been Invited
              </h1>
              
              <!-- Message -->
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                ${referrerName} has invited you to join <strong style="color: #d4af37;">Aurelia</strong>, the world's most exclusive private concierge service. Experience unparalleled luxury and personalized attention.
              </p>
              
              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 16px; background-color: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.2);">
                    <p style="color: #d4af37; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">YOUR EXCLUSIVE OFFER</p>
                    <p style="color: #ffffff; font-size: 18px; margin: 0;">20% off your first month of membership</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #000000; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Accept Invitation
              </a>
              
              <!-- Footer -->
              <p style="color: #666666; font-size: 12px; margin: 40px 0 0 0;">
                This invitation was sent by ${referrerName} via Aurelia's referral program.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Links -->
        <p style="color: #444444; font-size: 11px; margin-top: 24px;">
          © ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getSignupNotificationHtml = (referrerName: string, referredName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <!-- Logo -->
              <div style="margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: 300; color: #d4af37; letter-spacing: 4px;">AURELIA</span>
              </div>
              
              <!-- Success Icon -->
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); border-radius: 50%; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              
              <!-- Heading -->
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0 0 24px 0; letter-spacing: 1px;">
                Great News, ${referrerName}!
              </h1>
              
              <!-- Message -->
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                <strong style="color: #ffffff;">${referredName}</strong> has accepted your invitation and joined Aurelia. Once they subscribe, you'll receive your referral reward.
              </p>
              
              <!-- Status -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 16px; background-color: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.2);">
                    <p style="color: #d4af37; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">REFERRAL STATUS</p>
                    <p style="color: #ffffff; font-size: 18px; margin: 0;">Pending Subscription</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <a href="https://aurelia-privateconcierge.com/dashboard?tab=referrals" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #000000; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                View Referrals
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <p style="color: #444444; font-size: 11px; margin-top: 24px;">
          © ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getRewardConfirmationHtml = (referrerName: string, rewardType: string, rewardValue: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; border: 1px solid #2a2a2a;">
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <!-- Logo -->
              <div style="margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: 300; color: #d4af37; letter-spacing: 4px;">AURELIA</span>
              </div>
              
              <!-- Celebration Icon -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 48px;">🎉</span>
              </div>
              
              <!-- Heading -->
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0 0 24px 0; letter-spacing: 1px;">
                Congratulations, ${referrerName}!
              </h1>
              
              <!-- Message -->
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Your referral has subscribed to Aurelia. Your reward has been applied to your account.
              </p>
              
              <!-- Reward Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%); border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.3);">
                    <p style="color: #d4af37; font-size: 14px; margin: 0 0 8px 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Reward</p>
                    <p style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 300;">
                      ${rewardType === 'credit' ? `$${rewardValue} Credit` : `${rewardValue} Month${rewardValue > 1 ? 's' : ''} Free`}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <a href="https://aurelia-privateconcierge.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #000000; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Go to Dashboard
              </a>
              
              <!-- Tip -->
              <p style="color: #666666; font-size: 14px; margin: 32px 0 0 0;">
                Keep inviting friends to earn more rewards!
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <p style="color: #444444; font-size: 11px; margin-top: 24px;">
          © ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("Referral email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: ReferralEmailRequest = await req.json();
    console.log("Processing referral email request:", request.type);

    let emailResponse;
    let toEmail: string;
    let subject: string;
    let html: string;

    switch (request.type) {
      case "invitation":
        if (!request.referredEmail || !request.referrerName || !request.referralLink) {
          throw new Error("Missing required fields for invitation email");
        }
        toEmail = request.referredEmail;
        subject = `${request.referrerName} has invited you to Aurelia`;
        html = getInvitationEmailHtml(request.referrerName, request.referralLink);
        break;

      case "signup_notification":
        if (!request.referrerEmail || !request.referrerName || !request.referredName) {
          throw new Error("Missing required fields for signup notification");
        }
        toEmail = request.referrerEmail;
        subject = `${request.referredName} joined Aurelia through your referral!`;
        html = getSignupNotificationHtml(request.referrerName, request.referredName);
        break;

      case "reward_confirmation":
        if (!request.referrerEmail || !request.referrerName || !request.rewardType) {
          throw new Error("Missing required fields for reward confirmation");
        }
        toEmail = request.referrerEmail;
        subject = "Your referral reward has been applied!";
        html = getRewardConfirmationHtml(
          request.referrerName,
          request.rewardType,
          request.rewardValue || 1
        );
        break;

      default:
        throw new Error("Invalid email type");
    }

    emailResponse = await resend.emails.send({
      from: "Aurelia Concierge <concierge@aurelia-privateconcierge.com>",
      to: [toEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email in the database
    await supabase.from("email_notifications").insert({
      email: toEmail,
      subject,
      template: `referral_${request.type}`,
      status: "sent",
      sent_at: new Date().toISOString(),
      user_id: "00000000-0000-0000-0000-000000000000", // System user
      data: request,
    });

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending referral email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
