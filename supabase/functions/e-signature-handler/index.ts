import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * E-Signature Handler
 * 
 * Manages digital signature workflows for NDAs, DPAs, and other legal documents.
 * 
 * Features:
 * - Document creation from templates
 * - Multi-party signing workflow
 * - Signature tracking and verification
 * - Email notifications for signing requests
 * - Audit trail for compliance
 */

interface SignatureRequest {
  action: "create" | "send" | "sign" | "void" | "status" | "remind";
  document_id?: string;
  
  // For create
  document_type?: string;
  title?: string;
  content?: string;
  signers?: { email: string; name: string; role?: string; order?: number }[];
  event_id?: string;
  partner_id?: string;
  service_request_id?: string;
  expires_in_days?: number;
  
  // For sign
  signer_email?: string;
  signature_data?: Record<string, unknown>;
  
  // For void
  void_reason?: string;
}

// NDA Template
const NDA_TEMPLATE = `
# NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{date}}.

## PARTIES
- **Disclosing Party**: Aurelia Private Concierge
- **Receiving Party**: {{recipient_name}} ("Recipient")

## 1. CONFIDENTIAL INFORMATION
The Receiving Party agrees to maintain in strict confidence all proprietary information, client data, business strategies, and service methodologies disclosed by Aurelia Private Concierge.

## 2. OBLIGATIONS
The Receiving Party shall:
- Use Confidential Information solely for the Purpose
- Not disclose Confidential Information to third parties
- Protect Confidential Information with reasonable care
- Return or destroy all Confidential Information upon request

## 3. TERM
This Agreement shall remain in effect for a period of five (5) years from the date of execution.

## 4. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware, United States.

---

**ACKNOWLEDGED AND AGREED:**

Signature: _____________________
Name: {{recipient_name}}
Date: {{signature_date}}
`;

const DPA_TEMPLATE = `
# DATA PROCESSING AGREEMENT

This Data Processing Agreement ("DPA") is entered into as of {{date}}.

## PARTIES
- **Data Controller**: The Client
- **Data Processor**: {{processor_name}}

## 1. SCOPE
This DPA applies to the processing of personal data by the Data Processor on behalf of the Data Controller in connection with services provided by Aurelia Private Concierge.

## 2. DATA PROCESSING PRINCIPLES
The Data Processor shall:
- Process personal data only on documented instructions
- Ensure confidentiality of personnel processing data
- Implement appropriate technical and organizational measures
- Assist the Controller with data subject requests
- Delete or return personal data upon termination

## 3. SUB-PROCESSORS
The Data Processor shall not engage sub-processors without prior authorization.

## 4. SECURITY
The Processor shall implement appropriate security measures as outlined in Annex A.

## 5. TERM
This DPA shall remain in effect for the duration of the service relationship.

---

**ACKNOWLEDGED AND AGREED:**

Signature: _____________________
Name: {{processor_name}}
Title: {{processor_title}}
Date: {{signature_date}}
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth context
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const request: SignatureRequest = await req.json();
    console.log(`[E-Signature] Action: ${request.action}`);

    switch (request.action) {
      case "create":
        return await handleCreate(supabase, request, userId);
      
      case "send":
        return await handleSend(supabase, request);
      
      case "sign":
        return await handleSign(supabase, request);
      
      case "void":
        return await handleVoid(supabase, request);
      
      case "status":
        return await handleStatus(supabase, request);
      
      case "remind":
        return await handleRemind(supabase, request);
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("[E-Signature] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCreate(
  supabase: any,
  request: SignatureRequest,
  userId: string | null
): Promise<Response> {
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { document_type, title, content, signers, event_id, partner_id, service_request_id, expires_in_days = 30 } = request;

  if (!document_type || !title || !signers?.length) {
    return new Response(
      JSON.stringify({ error: "document_type, title, and signers are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get template content or use provided content
  let documentContent = content;
  if (!documentContent) {
    switch (document_type) {
      case "nda":
        documentContent = NDA_TEMPLATE;
        break;
      case "dpa":
        documentContent = DPA_TEMPLATE;
        break;
      default:
        documentContent = "Document content to be added.";
    }
  }

  // Replace template variables
  const now = new Date();
  documentContent = documentContent
    .replace(/\{\{date\}\}/g, now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
    .replace(/\{\{recipient_name\}\}/g, signers[0]?.name || "Recipient")
    .replace(/\{\{processor_name\}\}/g, signers[0]?.name || "Processor")
    .replace(/\{\{processor_title\}\}/g, "Authorized Representative");

  // Create document
  const { data: document, error: docError } = await (supabase
    .from("legal_documents") as any)
    .insert({
      title,
      document_type,
      content: documentContent,
      created_by: userId,
      signature_status: "draft",
      requires_signatures: signers.length,
      completed_signatures: 0,
      provider: "internal",
      event_id,
      partner_id,
      service_request_id,
      expires_at: new Date(now.getTime() + expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (docError) throw docError;

  // Create signer records
  const signerRecords = signers.map((s, i) => ({
    document_id: document.id,
    email: s.email,
    name: s.name,
    role: s.role || "signer",
    signing_order: s.order || i + 1,
    status: "pending",
  }));

  await (supabase.from("document_signers") as any).insert(signerRecords);

  console.log(`[E-Signature] Created document ${document.id} with ${signers.length} signers`);

  return new Response(
    JSON.stringify({
      success: true,
      document_id: document.id,
      title,
      document_type,
      signers_count: signers.length,
      expires_at: document.expires_at,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSend(
  supabase: any,
  request: SignatureRequest
): Promise<Response> {
  const { document_id } = request;

  if (!document_id) {
    return new Response(
      JSON.stringify({ error: "document_id is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get document and signers
  const { data: document, error: docError } = await (supabase
    .from("legal_documents") as any)
    .select("*")
    .eq("id", document_id)
    .single();

  if (docError || !document) {
    return new Response(
      JSON.stringify({ error: "Document not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: signers } = await (supabase
    .from("document_signers") as any)
    .select("*")
    .eq("document_id", document_id)
    .order("signing_order");

  // Update document status
  await (supabase
    .from("legal_documents") as any)
    .update({
      signature_status: "pending_signature",
      sent_at: new Date().toISOString(),
    })
    .eq("id", document_id);

  // Update signers to sent status
  await (supabase
    .from("document_signers") as any)
    .update({ status: "sent" })
    .eq("document_id", document_id);

  // Queue email notifications for each signer
  for (const signer of signers || []) {
      await (supabase.from("notification_outbox") as any).insert({
      channel: "email",
      recipient: signer.email,
      subject: `Signature Required: ${document.title}`,
      content: JSON.stringify({
        template: "signature_request",
        data: {
          signer_name: signer.name,
          document_title: document.title,
          expires_at: document.expires_at,
          signing_url: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}/sign/${document_id}?email=${encodeURIComponent(signer.email)}`,
        },
      }),
      priority: "high",
    });
  }

  console.log(`[E-Signature] Sent document ${document_id} to ${signers?.length || 0} signers`);

  return new Response(
    JSON.stringify({
      success: true,
      document_id,
      signers_notified: signers?.length || 0,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSign(
  supabase: any,
  request: SignatureRequest
): Promise<Response> {
  const { document_id, signer_email, signature_data } = request;

  if (!document_id || !signer_email) {
    return new Response(
      JSON.stringify({ error: "document_id and signer_email are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get signer record
  const { data: signer, error: signerError } = await (supabase
    .from("document_signers") as any)
    .select("*")
    .eq("document_id", document_id)
    .eq("email", signer_email)
    .single();

  if (signerError || !signer) {
    return new Response(
      JSON.stringify({ error: "Signer not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (signer.status === "signed") {
    return new Response(
      JSON.stringify({ error: "Document already signed by this signer" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update signer record
  await (supabase
    .from("document_signers") as any)
    .update({
      status: "signed",
      signed_at: new Date().toISOString(),
      signature_data,
    })
    .eq("id", signer.id);

  // Get document and check if all signed
  const { data: document } = await (supabase
    .from("legal_documents") as any)
    .select("*")
    .eq("id", document_id)
    .single();

  const { data: allSigners } = await (supabase
    .from("document_signers") as any)
    .select("status")
    .eq("document_id", document_id);

  const signedCount = allSigners?.filter((s: { status: string }) => s.status === "signed").length || 0;
  const allSigned = signedCount === document.requires_signatures;

  // Update document
  await (supabase
    .from("legal_documents") as any)
    .update({
      completed_signatures: signedCount,
      signature_status: allSigned ? "completed" : "partially_signed",
      completed_at: allSigned ? new Date().toISOString() : null,
    })
    .eq("id", document_id);

  console.log(`[E-Signature] ${signer_email} signed document ${document_id} (${signedCount}/${document.requires_signatures})`);

  return new Response(
    JSON.stringify({
      success: true,
      document_id,
      signer_email,
      signed_at: new Date().toISOString(),
      completed_signatures: signedCount,
      total_required: document.requires_signatures,
      document_completed: allSigned,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVoid(
  supabase: any,
  request: SignatureRequest
): Promise<Response> {
  const { document_id, void_reason } = request;

  if (!document_id) {
    return new Response(
      JSON.stringify({ error: "document_id is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  await (supabase
    .from("legal_documents") as any)
    .update({
      signature_status: "voided",
      voided_at: new Date().toISOString(),
      voided_reason: void_reason || "Voided by sender",
    })
    .eq("id", document_id);

  console.log(`[E-Signature] Voided document ${document_id}`);

  return new Response(
    JSON.stringify({ success: true, document_id, voided: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleStatus(
  supabase: any,
  request: SignatureRequest
): Promise<Response> {
  const { document_id } = request;

  if (!document_id) {
    return new Response(
      JSON.stringify({ error: "document_id is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: document, error: docError } = await (supabase
    .from("legal_documents") as any)
    .select("*")
    .eq("id", document_id)
    .single();

  if (docError || !document) {
    return new Response(
      JSON.stringify({ error: "Document not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: signers } = await (supabase
    .from("document_signers") as any)
    .select("email, name, role, status, signed_at, viewed_at")
    .eq("document_id", document_id)
    .order("signing_order");

  return new Response(
    JSON.stringify({
      document_id,
      title: document.title,
      document_type: document.document_type,
      status: document.signature_status,
      created_at: document.created_at,
      sent_at: document.sent_at,
      expires_at: document.expires_at,
      completed_at: document.completed_at,
      completed_signatures: document.completed_signatures,
      requires_signatures: document.requires_signatures,
      signers,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleRemind(
  supabase: any,
  request: SignatureRequest
): Promise<Response> {
  const { document_id } = request;

  if (!document_id) {
    return new Response(
      JSON.stringify({ error: "document_id is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: document } = await (supabase
    .from("legal_documents") as any)
    .select("title, expires_at")
    .eq("id", document_id)
    .single();

  const { data: pendingSigners } = await (supabase
    .from("document_signers") as any)
    .select("email, name")
    .eq("document_id", document_id)
    .in("status", ["pending", "sent", "viewed"]);

  if (!pendingSigners?.length) {
    return new Response(
      JSON.stringify({ success: true, reminders_sent: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Send reminders
  for (const signer of pendingSigners) {
    await (supabase.from("notification_outbox") as any).insert({
      channel: "email",
      recipient: signer.email,
      subject: `Reminder: Signature Required - ${document?.title}`,
      content: JSON.stringify({
        template: "signature_reminder",
        data: {
          signer_name: signer.name,
          document_title: document?.title,
          expires_at: document?.expires_at,
        },
      }),
      priority: "medium",
    });
  }

  console.log(`[E-Signature] Sent reminders for document ${document_id} to ${pendingSigners.length} signers`);

  return new Response(
    JSON.stringify({
      success: true,
      document_id,
      reminders_sent: pendingSigners.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
