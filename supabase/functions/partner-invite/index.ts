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

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: 'Aurelia Partner Network <partnerships@aurelia-access.lovable.app>',
      to: [contact_email],
      subject: `Exclusive Partnership Invitation - Aurelia Concierge`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aurelia Partnership Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Georgia', serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #c9a55c30; border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #c9a55c20;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: #c9a55c; letter-spacing: 4px;">AURELIA</h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: #888; letter-spacing: 2px; text-transform: uppercase;">Private Concierge Network</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 18px; color: #e5e5e5; line-height: 1.6;">
                ${greeting},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #a0a0a0; line-height: 1.8;">
                We've identified <strong style="color: #c9a55c;">${company_name}</strong> as an exceptional provider in <strong style="color: #e5e5e5;">${categoryDisplay}</strong>${subcategory ? ` (${subcategory})` : ''}, and we would be honored to invite you to join the Aurelia Partner Network.
              </p>
              
              ${match_reason ? `
              <div style="margin: 30px 0; padding: 20px; background-color: #c9a55c10; border-left: 3px solid #c9a55c; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #c9a55c; font-style: italic;">
                  "${match_reason}"
                </p>
              </div>
              ` : ''}
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #a0a0a0; line-height: 1.8;">
                Aurelia serves ultra-high-net-worth individuals worldwide, providing white-glove concierge services across private aviation, yachts, real estate, and exclusive experiences. Our partners enjoy:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 15px; color: #a0a0a0; line-height: 2;">
                <li>Access to a curated clientele with substantial booking power</li>
                <li>Competitive commission structures on all referrals</li>
                <li>Dedicated relationship manager support</li>
                <li>Integrated booking and payment systems</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #c9a55c 0%, #a08040 100%);">
                    <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 14px; font-weight: 500; letter-spacing: 2px; color: #0a0a0a; text-decoration: none; text-transform: uppercase;">
                      Apply Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; color: #666; text-align: center; line-height: 1.6;">
                Your application will be reviewed within 48 hours. Upon approval, you'll receive full access to our Partner Portal.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0d0d0d; border-top: 1px solid #c9a55c20; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #555;">
                © ${new Date().getFullYear()} Aurelia Concierge. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: #444;">
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
      `,
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
