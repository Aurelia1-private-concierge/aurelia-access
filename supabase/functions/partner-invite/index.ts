import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartnerInviteRequest {
  prospect_id?: string;
  company_name: string;
  contact_email: string;
  contact_name?: string;
  category: string;
  subcategory?: string;
  website?: string;
  description?: string;
  coverage_regions?: string[];
  match_score?: number;
  match_reason?: string;
  auto_outreach?: boolean;
  // Custom message support
  custom_subject?: string;
  custom_message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const resend = new Resend(RESEND_API_KEY);

    const data: PartnerInviteRequest = await req.json();
    const {
      prospect_id,
      company_name,
      contact_email,
      contact_name,
      category,
      subcategory,
      website,
      description,
      coverage_regions,
      match_score,
      match_reason,
      auto_outreach,
      custom_subject,
      custom_message,
    } = data;

    if (!company_name || !contact_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Company name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing partner invite for:', company_name, contact_email);

    // Generate unique invite token
    const inviteToken = crypto.randomUUID();
    
    // Create or update prospect record
    let prospectId = prospect_id;
    
    if (!prospectId) {
      // Check if prospect already exists by email
      const { data: existing } = await supabase
        .from('partner_prospects')
        .select('id')
        .eq('email', contact_email)
        .single();
      
      if (existing) {
        prospectId = existing.id;
      } else {
        // Create new prospect
        const { data: newProspect, error: prospectError } = await supabase
          .from('partner_prospects')
          .insert({
            company_name,
            email: contact_email,
            contact_name: contact_name || null,
            category,
            subcategory: subcategory || null,
            website: website || null,
            description: description || null,
            coverage_regions: coverage_regions || [],
            source: auto_outreach ? 'ai_discovery_auto' : 'ai_discovery',
            priority: match_score && match_score >= 80 ? 'high' : 'medium',
            status: 'contacted',
            notes: match_reason || null,
            metadata: { invite_token: inviteToken, match_score },
          })
          .select('id')
          .single();

        if (prospectError) {
          console.error('Failed to create prospect:', prospectError);
          throw new Error('Failed to create prospect record');
        }
        prospectId = newProspect!.id;
      }
    } else {
      // Update existing prospect with invite token
      await supabase
        .from('partner_prospects')
        .update({
          status: 'contacted',
          last_contacted_at: new Date().toISOString(),
          metadata: { invite_token: inviteToken, match_score },
        })
        .eq('id', prospectId);
    }

    // Generate invite link with pre-filled data
    const baseUrl = 'https://aurelia-access.lovable.app';
    const inviteParams = new URLSearchParams({
      invite: inviteToken,
      company: company_name,
      email: contact_email,
      ...(contact_name && { name: contact_name }),
      ...(category && { category }),
      ...(website && { website }),
    });
    const inviteLink = `${baseUrl}/partner-apply?${inviteParams.toString()}`;

    // Determine greeting
    const greeting = contact_name 
      ? `Dear ${contact_name.split(' ')[0]}` 
      : `Dear ${company_name} Team`;

    // Category display name
    const categoryDisplay = category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    // Build email content - use custom or default template
    const emailSubject = custom_subject || `Exclusive Invitation from Aurelia`;
    
    // Replace placeholders in custom message if provided
    let emailHtml: string;
    
    if (custom_message) {
      // Process custom message with placeholder replacements
      let processedMessage = custom_message
        .replace(/\{\{company_name\}\}/g, company_name)
        .replace(/\{\{contact_name\}\}/g, contact_name || company_name + ' Team')
        .replace(/\{\{category\}\}/g, categoryDisplay)
        .replace(/\{\{invite_link\}\}/g, inviteLink);
      
      // Wrap custom message in styled template
      emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Fredericka+the+Great&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Cormorant Garamond', Georgia, serif; background: linear-gradient(135deg, #D4AF37 0%, #1B263B 100%); min-height: 100vh;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #D4AF37 0%, #1B263B 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background: linear-gradient(145deg, #f5f5f0 0%, #e8e4dc 50%, #f0ece4 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(180deg, rgba(212,175,55,0.1) 0%, transparent 100%); border-bottom: 2px solid #D4AF37;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #D4AF37; letter-spacing: 6px; text-transform: uppercase;">AURELIA</h1>
              <p style="margin: 12px 0 0; font-size: 13px; color: #15233A; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;">Private Concierge Network</p>
            </td>
          </tr>
          
          <!-- Custom Content -->
          <tr>
            <td style="padding: 45px 50px;">
              <div style="font-size: 17px; color: #2a3a4a; line-height: 1.9;">
                ${processedMessage.replace(/\n/g, '<br>')}
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 35px auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #D4AF37 0%, #b8962f 100%); box-shadow: 0 8px 25px -5px rgba(212,175,55,0.4);">
                    <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 18px 50px; font-size: 14px; font-weight: 600; letter-spacing: 3px; color: #15233A; text-decoration: none; text-transform: uppercase; font-family: 'Cormorant Garamond', Georgia, serif;">
                      Apply Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 35px 50px 45px; background: linear-gradient(0deg, rgba(212,175,55,0.08) 0%, transparent 100%); border-top: 1px solid rgba(212,175,55,0.3);">
              <p style="margin: 0 0 25px; font-family: 'Fredericka the Great', cursive; font-size: 20px; color: #D4AF37; line-height: 1.6;">
                Yours in Luxury,<br/>
                <span style="font-size: 18px;">Aurelia Private Concierge</span>
              </p>
              <p style="margin: 0; font-size: 12px; color: #7a8a9a; text-align: center;">
                © ${new Date().getFullYear()} Aurelia Concierge. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
    } else {
      // Use default branded template
      emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Invitation from Aurelia</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Fredericka+the+Great&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Cormorant Garamond', Georgia, serif; background: linear-gradient(135deg, #D4AF37 0%, #1B263B 100%); min-height: 100vh;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #D4AF37 0%, #1B263B 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background: linear-gradient(145deg, #f5f5f0 0%, #e8e4dc 50%, #f0ece4 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);">
          
          <!-- Marble Header -->
          <tr>
            <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(180deg, rgba(212,175,55,0.1) 0%, transparent 100%); border-bottom: 2px solid #D4AF37;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #D4AF37; letter-spacing: 6px; text-transform: uppercase;">AURELIA</h1>
              <p style="margin: 12px 0 0; font-size: 13px; color: #15233A; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;">Private Concierge Network</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 45px 50px;">
              <h2 style="margin: 0 0 25px; font-size: 24px; font-weight: 500; color: #15233A; line-height: 1.4;">
                Dear ${contact_name ? contact_name.split(' ')[0] : company_name + ' Team'},
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 17px; color: #2a3a4a; line-height: 1.9;">
                As a distinguished provider in <strong style="color: #D4AF37;">${categoryDisplay}</strong>, Aurelia invites you to experience a world of bespoke luxury partnerships, exclusive clientele, and unparalleled opportunities.
              </p>
              
              <p style="margin: 0 0 25px; font-size: 17px; color: #2a3a4a; line-height: 1.9;">
                Our AI concierge crafts exclusive opportunities matched to your services and expertise, connecting you with ultra-high-net-worth individuals worldwide.
              </p>
              
              ${match_reason ? `
              <div style="margin: 30px 0; padding: 25px 30px; background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.05) 100%); border-left: 4px solid #D4AF37; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 16px; color: #15233A; font-style: italic; line-height: 1.7;">
                  "${match_reason}"
                </p>
              </div>
              ` : ''}
              
              <p style="margin: 25px 0 15px; font-size: 17px; color: #15233A; font-weight: 500;">
                <strong>Discover:</strong>
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 25px; font-size: 16px; color: #2a3a4a; line-height: 2.2;">
                <li>VIP events & exclusive experiences</li>
                <li>Private travel & aviation partnerships</li>
                <li>Fine art, yachts & luxury real estate</li>
                <li>Competitive commission structures</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 35px auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #D4AF37 0%, #b8962f 100%); box-shadow: 0 8px 25px -5px rgba(212,175,55,0.4);">
                    <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 18px 50px; font-size: 14px; font-weight: 600; letter-spacing: 3px; color: #15233A; text-decoration: none; text-transform: uppercase; font-family: 'Cormorant Garamond', Georgia, serif;">
                      Apply Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 15px; color: #5a6a7a; text-align: center; line-height: 1.7;">
                To connect and book your next opportunity, reply to this message or schedule a confidential call with our partnerships team.
              </p>
            </td>
          </tr>
          
          <!-- Signature & Footer -->
          <tr>
            <td style="padding: 35px 50px 45px; background: linear-gradient(0deg, rgba(212,175,55,0.08) 0%, transparent 100%); border-top: 1px solid rgba(212,175,55,0.3);">
              <p style="margin: 0 0 25px; font-family: 'Fredericka the Great', cursive; font-size: 20px; color: #D4AF37; line-height: 1.6;">
                Yours in Luxury,<br/>
                <span style="font-size: 18px;">Aurelia Private Concierge</span>
              </p>
              
              <p style="margin: 0; font-size: 12px; color: #7a8a9a; text-align: center;">
                © ${new Date().getFullYear()} Aurelia Concierge. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #9aa5b0; text-align: center;">
                This is an exclusive invitation. Please do not forward this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
    }

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: 'Aurelia Partner Network <partnerships@aurelia-access.lovable.app>',
      to: [contact_email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log('Email sent:', emailResponse);

    // Log the outreach
    if (prospectId) {
      await supabase
        .from('partner_outreach_logs')
        .insert({
          prospect_id: prospectId,
          outreach_type: 'email',
          subject: 'Exclusive Partnership Invitation - Aurelia Concierge',
          content: `Automated invitation sent to ${contact_email}`,
          sent_at: new Date().toISOString(),
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${contact_email}`,
        invite_link: inviteLink,
        prospect_id: prospectId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Partner invite error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
