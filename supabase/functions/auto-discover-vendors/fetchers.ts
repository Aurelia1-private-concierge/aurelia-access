import { Vendor, VendorCategory } from "./types.ts";

// Generic fetch helper with error handling
async function fetchFromAPI<T>(
  url: string,
  apiKeyEnvVar: string,
  transformFn: (data: any) => Vendor[]
): Promise<Vendor[]> {
  try {
    const apiKey = Deno.env.get(apiKeyEnvVar);
    if (!apiKey) {
      console.warn(`[Discovery] ${apiKeyEnvVar} not configured, skipping`);
      return [];
    }
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return transformFn(data);
  } catch (error) {
    console.warn(`[Discovery] API failed for ${url}:`, error);
    return [];
  }
}

// Category-specific fetchers
export async function fetchLuxuryHotels(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://trusted-luxury-api.com/v1/hotels/curated",
    "LUXURY_API_KEY",
    (data) => (data.hotels || []).map((h: any) => ({
      name: h.name,
      website: h.website,
      location: `${h.city}, ${h.country}`,
      categories: ["hotel"] as VendorCategory[],
      referenceId: h.id,
      rating: h.rating,
    }))
  );
}

export async function fetchPrivateJets(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://api.luxjetpartners.com/v1/jets",
    "JET_API_KEY",
    (data) => (data.jets || []).map((j: any) => ({
      name: j.operator,
      website: j.website,
      location: j.base,
      categories: ["privateJet"] as VendorCategory[],
      referenceId: j.tailNumber,
      rating: j.safetyRating,
    }))
  );
}

export async function fetchLuxuryYachts(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://api.yachtluxury.com/v2/yachts",
    "YACHT_API_KEY",
    (data) => (data.yachts || []).map((y: any) => ({
      name: y.name,
      website: y.broker_website,
      location: y.port,
      categories: ["yacht"] as VendorCategory[],
      referenceId: y.yachtId,
      rating: y.rating,
    }))
  );
}

export async function fetchFineDining(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://api.finedininglux.com/v1/restaurants",
    "DINING_API_KEY",
    (data) => (data.restaurants || []).map((r: any) => ({
      name: r.name,
      website: r.website,
      location: `${r.city}, ${r.country}`,
      categories: ["fineDining"] as VendorCategory[],
      referenceId: r.id,
      rating: r.michelinStars || r.rating,
    }))
  );
}

export async function fetchVipEvents(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://api.vipexperiences.com/v1/events",
    "EVENT_API_KEY",
    (data) => (data.events || []).map((e: any) => ({
      name: e.title,
      website: e.website,
      location: e.location,
      categories: ["vipEvent"] as VendorCategory[],
      referenceId: e.id,
      rating: e.rating,
    }))
  );
}

export async function fetchWellnessSpas(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://api.wellnesslux.com/v1/spas",
    "WELLNESS_API_KEY",
    (data) => (data.spas || []).map((s: any) => ({
      name: s.name,
      website: s.website,
      location: `${s.city}, ${s.country}`,
      categories: ["wellness"] as VendorCategory[],
      referenceId: s.id,
      rating: s.rating,
    }))
  );
}

export async function fetchExclusiveExperiences(): Promise<Vendor[]> {
  return fetchFromAPI(
    "https://api.experiencelux.com/v1/experiences",
    "EXPERIENCE_API_KEY",
    (data) => (data.experiences || []).map((ex: any) => ({
      name: ex.title,
      website: ex.website,
      location: ex.location,
      categories: ["experience"] as VendorCategory[],
      referenceId: ex.id,
      rating: ex.rating,
    }))
  );
}

// Fetch from all luxury directories in parallel
export async function fetchVendorsFromAllSources(): Promise<Vendor[]> {
  const [hotels, jets, yachts, dining, events, wellness, experiences] = await Promise.all([
    fetchLuxuryHotels(),
    fetchPrivateJets(),
    fetchLuxuryYachts(),
    fetchFineDining(),
    fetchVipEvents(),
    fetchWellnessSpas(),
    fetchExclusiveExperiences(),
  ]);

  const all = [...hotels, ...jets, ...yachts, ...dining, ...events, ...wellness, ...experiences];
  console.log(`[Discovery] Total vendors fetched: ${all.length}`);
  return all;
}
