export type VendorCategory =
  | "hotel"
  | "privateJet"
  | "yacht"
  | "fineDining"
  | "vipEvent"
  | "wellness"
  | "experience";

export interface Vendor {
  name: string;
  website?: string;
  location?: string;
  categories: VendorCategory[];
  referenceId?: string;
  email?: string;
  phone?: string;
  rating?: number;
}

export interface VendorEnriched extends Vendor {
  compliant: boolean;
  complianceNotes?: string;
  enrichedAt?: string;
}

export interface ComplianceResult {
  passed: boolean;
  notes?: string;
}

export interface DiscoveryResult {
  success: boolean;
  vendors: VendorEnriched[];
  totalDiscovered: number;
  totalCompliant: number;
  categories: Record<string, number>;
  discoveredAt: string;
}
