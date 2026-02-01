import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * OCR Document Processor
 * 
 * Extracts text and structured data from partner documents using AI vision.
 * Supports: Passports, ID cards, business licenses, certificates, contracts
 * 
 * Process Flow:
 * 1. Receive document ID or file URL
 * 2. Update status to 'processing'
 * 3. Send to AI vision model for OCR
 * 4. Extract structured fields based on document type
 * 5. Store extracted data with confidence scores
 * 6. Update document status and trigger verification workflow
 */

interface ProcessRequest {
  document_id?: string;
  file_url?: string;
  document_type?: string;
  partner_id?: string;
}

interface ExtractedField {
  field_name: string;
  field_value: string;
  field_type: string;
  confidence: number;
  needs_verification: boolean;
}

// Document-specific field extractors
const EXTRACTION_PROMPTS: Record<string, string> = {
  passport: `Extract these fields from the passport image:
- full_name (as shown)
- nationality
- date_of_birth (YYYY-MM-DD format)
- passport_number
- expiry_date (YYYY-MM-DD format)
- place_of_birth
- gender (M/F)
- mrz_line1 (if visible)
- mrz_line2 (if visible)`,

  drivers_license: `Extract these fields from the driver's license:
- full_name
- license_number
- date_of_birth (YYYY-MM-DD format)
- expiry_date (YYYY-MM-DD format)
- address
- license_class
- restrictions (if any)`,

  national_id: `Extract these fields from the national ID card:
- full_name
- id_number
- date_of_birth (YYYY-MM-DD format)
- nationality
- expiry_date (YYYY-MM-DD format, if applicable)
- address (if shown)`,

  business_license: `Extract these fields from the business license:
- company_name
- registration_number
- business_type
- registration_date (YYYY-MM-DD format)
- expiry_date (YYYY-MM-DD format, if applicable)
- registered_address
- authorized_activities
- registered_capital (if shown)`,

  tax_certificate: `Extract these fields from the tax certificate:
- company_name
- tax_id
- registration_date (YYYY-MM-DD format)
- tax_year
- certificate_number
- issuing_authority`,

  insurance_certificate: `Extract these fields from the insurance certificate:
- policy_holder
- policy_number
- insurance_type
- coverage_amount
- effective_date (YYYY-MM-DD format)
- expiry_date (YYYY-MM-DD format)
- insurer_name`,

  bank_statement: `Extract these fields from the bank statement:
- account_holder
- bank_name
- account_number (last 4 digits only for security)
- statement_period
- ending_balance
- currency`,

  contract: `Extract these fields from the contract:
- document_title
- parties_involved (comma separated)
- contract_date (YYYY-MM-DD format)
- effective_date (YYYY-MM-DD format)
- expiry_date (YYYY-MM-DD format, if applicable)
- contract_value (if mentioned)
- key_terms (brief summary)`,

  other: `Extract all visible text and identify:
- document_type (what kind of document this appears to be)
- title (document title if visible)
- date (any date shown, YYYY-MM-DD format)
- issuing_authority (if applicable)
- key_information (comma-separated list of important details)`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { document_id, file_url, document_type, partner_id }: ProcessRequest = await req.json();

    console.log(`[OCR] Starting processing - Document ID: ${document_id}, Type: ${document_type}`);

    // Get document record if ID provided
    let documentRecord: Record<string, unknown> | null = null;
    let targetUrl = file_url;
    let targetType = document_type || "other";

    if (document_id) {
      const { data, error } = await supabase
        .from("partner_documents")
        .select("*")
        .eq("id", document_id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Document not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      documentRecord = data;
      targetUrl = data.file_url;
      targetType = data.document_type || "other";

      // Update status to processing
      await supabase
        .from("partner_documents")
        .update({ ocr_status: "processing" })
        .eq("id", document_id);
    }

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "No file URL provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[OCR] Processing ${targetType} from: ${targetUrl.substring(0, 50)}...`);

    // Build extraction prompt
    const extractionGuide = EXTRACTION_PROMPTS[targetType] || EXTRACTION_PROMPTS.other;

    // Call AI Vision API for OCR
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert document OCR and data extraction system for a luxury concierge platform. 
Extract information accurately from document images. Be precise with dates, numbers, and names.
Always return valid JSON. For any field you cannot read clearly, set confidence to a lower value.
If a field is not present in the document, omit it from the response.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this document image and extract structured data.

Document Type: ${targetType}

${extractionGuide}

Return ONLY a JSON object with this structure:
{
  "extracted_fields": [
    {
      "field_name": "field name from the list above",
      "field_value": "extracted value",
      "field_type": "text|date|number|address|name",
      "confidence": 0.0-1.0 (how confident you are in this extraction)
    }
  ],
  "overall_confidence": 0.0-1.0,
  "document_quality": "good|fair|poor",
  "notes": "any issues or observations about the document"
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: targetUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1, // Low temperature for accuracy
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[OCR] AI API error:", errorText);
      
      // Update status to failed
      if (document_id) {
        await supabase
          .from("partner_documents")
          .update({
            ocr_status: "failed",
            ocr_error_message: `AI processing failed: ${aiResponse.status}`,
          })
          .eq("id", document_id);
      }

      return new Response(
        JSON.stringify({ error: "OCR processing failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    console.log("[OCR] AI response received, parsing...");

    // Parse the JSON response
    let extractionResult: {
      extracted_fields: ExtractedField[];
      overall_confidence: number;
      document_quality: string;
      notes: string;
    };

    try {
      // Extract JSON from the response (may have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      extractionResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("[OCR] Failed to parse AI response:", parseError);
      
      if (document_id) {
        await supabase
          .from("partner_documents")
          .update({
            ocr_status: "manual_review",
            ocr_error_message: "Failed to parse extraction results",
          })
          .eq("id", document_id);
      }

      return new Response(
        JSON.stringify({ error: "Failed to parse OCR results", raw_response: content }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[OCR] Extracted ${extractionResult.extracted_fields.length} fields with ${(extractionResult.overall_confidence * 100).toFixed(1)}% confidence`);

    // Store extracted data in database
    if (document_id && extractionResult.extracted_fields.length > 0) {
      const extractedDataRows = extractionResult.extracted_fields.map((field) => ({
        document_id,
        field_name: field.field_name,
        field_value: field.field_value,
        field_type: field.field_type,
        confidence: field.confidence,
        needs_verification: field.confidence < 0.85, // Flag low-confidence fields
      }));

      const { error: insertError } = await supabase
        .from("extracted_data")
        .insert(extractedDataRows);

      if (insertError) {
        console.error("[OCR] Failed to store extracted data:", insertError);
      }

      // Update document status
      const finalStatus = extractionResult.overall_confidence >= 0.7 ? "completed" : "manual_review";
      
      await supabase
        .from("partner_documents")
        .update({
          ocr_status: finalStatus,
          ocr_processed_at: new Date().toISOString(),
          ocr_confidence_score: extractionResult.overall_confidence,
          metadata: {
            document_quality: extractionResult.document_quality,
            processing_notes: extractionResult.notes,
            fields_extracted: extractionResult.extracted_fields.length,
            processing_time_ms: Date.now() - startTime,
          },
        })
        .eq("id", document_id);

      console.log(`[OCR] Document ${document_id} status updated to: ${finalStatus}`);

      // Trigger KYC verification if this is an identity document
      const identityDocTypes = ["passport", "drivers_license", "national_id"];
      if (identityDocTypes.includes(targetType) && documentRecord?.partner_id) {
        try {
          await supabase.functions.invoke("kyc-aml-checker", {
            body: {
              entity_type: "partner",
              entity_id: documentRecord.partner_id,
              trigger: "document_uploaded",
              document_id,
            },
          });
          console.log(`[OCR] Triggered KYC check for partner ${documentRecord.partner_id}`);
        } catch (kycError) {
          console.error("[OCR] Failed to trigger KYC:", kycError);
        }
      }
    }

    // Log for analytics
    await supabase.from("discovery_logs").insert({
      kind: "ocr_processing",
      metadata: {
        document_id,
        document_type: targetType,
        partner_id: documentRecord?.partner_id || partner_id,
        fields_extracted: extractionResult.extracted_fields.length,
        overall_confidence: extractionResult.overall_confidence,
        document_quality: extractionResult.document_quality,
        processing_time_ms: Date.now() - startTime,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        document_type: targetType,
        extracted_fields: extractionResult.extracted_fields,
        overall_confidence: extractionResult.overall_confidence,
        document_quality: extractionResult.document_quality,
        notes: extractionResult.notes,
        fields_needing_verification: extractionResult.extracted_fields.filter(f => f.confidence < 0.85).length,
        processing_time_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[OCR] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
