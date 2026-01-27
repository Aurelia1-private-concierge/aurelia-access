import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HousePartner {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  category: string;
  subcategories: string[];
  description: string | null;
  service_regions: string[];
  pricing_tier: string;
  rating: number;
  is_preferred: boolean;
  is_active: boolean;
}

export function useHousePartners(category?: string) {
  return useQuery({
    queryKey: ["house-partners", category],
    queryFn: async () => {
      let query = supabase
        .from("house_partners")
        .select("*")
        .eq("is_active", true)
        .order("is_preferred", { ascending: false })
        .order("rating", { ascending: false });
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as HousePartner[];
    },
  });
}

export function useHousePartnersByRegion(region: string) {
  return useQuery({
    queryKey: ["house-partners-region", region],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("house_partners")
        .select("*")
        .eq("is_active", true)
        .contains("service_regions", [region])
        .order("is_preferred", { ascending: false })
        .order("rating", { ascending: false });
      
      if (error) throw error;
      return data as HousePartner[];
    },
    enabled: !!region,
  });
}
