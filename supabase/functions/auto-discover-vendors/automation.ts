import { Vendor, VendorEnriched, VendorCategory, ComplianceResult } from "./types.ts";

const AURELIA_MIN_RATING = 4.5;
const DENIED_WORDS = /(budget|cheap|economy|hostel|motel)/i;
const BLACKLIST_TERMS = /(scam|fraud|complaint|lawsuit)/i;

// Filter vendors to Aurelia luxury standard
export function filterCurated(vendor: Vendor): boolean {
  if (!vendor.name) return false;
  if (DENIED_WORDS.test(vendor.name)) return false;
  if (vendor.website && DENIED_WORDS.test(vendor.website)) return false;
  if (vendor.rating && vendor.rating < AURELIA_MIN_RATING) return false;
  return true;
}

// Enrich vendor with contact information
export async function enrichContact(vendor: Vendor): Promise<Vendor> {
  // In production, this would call email verification APIs, LinkedIn, etc.
  const domain = vendor.website?.replace(/https?:\/\//, "").split("/")[0] || "unknown.com";
  return {
    ...vendor,
    email: vendor.email || `contact@${domain}`,
  };
}

// Check vendor compliance with Aurelia standards
export async function checkCompliance(vendor: Vendor): Promise<ComplianceResult> {
  const issues: string[] = [];
  
  if (!vendor.website) issues.push("Missing website");
  if (!vendor.location) issues.push("Missing location");
  if (vendor.rating && vendor.rating < 4.0) {
    issues.push(`Rating ${vendor.rating} below minimum 4.0`);
  }
  if (BLACKLIST_TERMS.test(vendor.name)) {
    issues.push("Blacklisted terms in name");
  }
  
  return {
    passed: issues.length === 0,
    notes: issues.length > 0 ? issues.join("; ") : "All checks passed",
  };
}

// Full enrichment pipeline: enrich contact + check compliance
export async function enrichAndValidate(vendor: Vendor): Promise<VendorEnriched> {
  try {
    const enrichedVendor = await enrichContact(vendor);
    const compliance = await checkCompliance(enrichedVendor);
    
    console.log(`[AUDIT] Vendor "${vendor.name}" compliance ${compliance.passed ? "PASS" : "FAIL"} - ${compliance.notes}`);
    
    return {
      ...enrichedVendor,
      compliant: compliance.passed,
      complianceNotes: compliance.notes,
      enrichedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`[ENRICH ERROR] Vendor: ${vendor.name}`, e);
    return {
      ...vendor,
      compliant: false,
      complianceNotes: "Enrichment failed",
      enrichedAt: new Date().toISOString(),
    };
  }
}

// Check if vendor complies with a specific standard
export function compliesWith(vendor: VendorEnriched, standard: string): boolean {
  if (standard === "AureliaLuxuryStandard") {
    return vendor.compliant && (vendor.rating === undefined || vendor.rating >= AURELIA_MIN_RATING);
  }
  return vendor.compliant;
}
