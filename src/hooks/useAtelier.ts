import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { TIER_LIMITS, DEFAULT_BRANDING, type SiteBranding, type SiteBlock } from "@/lib/atelier-templates";
import type { Json } from "@/integrations/supabase/types";

export interface MemberSite {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  template_id: string;
  status: "draft" | "published" | "archived";
  content: SiteBlock[];
  branding: SiteBranding;
  custom_domain: string | null;
  analytics_enabled: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteTemplate {
  id: string;
  name: string;
  category: string;
  preview_image: string | null;
  description: string | null;
  default_blocks: Json;
  min_tier: string;
  is_active: boolean;
}

interface AtelierState {
  sites: MemberSite[];
  templates: SiteTemplate[];
  isLoading: boolean;
  error: string | null;
}

// Raw database response type
interface RawMemberSite {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  template_id: string;
  status: string;
  content: Json;
  branding: Json;
  custom_domain: string | null;
  analytics_enabled: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const getAuthHeaders = async () => {
  // Get the current session token from localStorage
  const storedSession = localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`);
  let authToken = SUPABASE_KEY;
  
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession);
      if (session?.access_token) {
        authToken = session.access_token;
      }
    } catch {
      // Use default key
    }
  }
  
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
};

export function useAtelier() {
  const { user } = useAuth();
  const { tier, subscribed } = useSubscription();
  const [state, setState] = useState<AtelierState>({
    sites: [],
    templates: [],
    isLoading: true,
    error: null,
  });

  const currentTier = (tier === "gold" || tier === "platinum") ? tier : null;
  const limits = currentTier ? TIER_LIMITS[currentTier] : null;

  const canCreateSite = useCallback(() => {
    if (!subscribed || !currentTier || !limits) return false;
    return state.sites.length < limits.maxSites;
  }, [subscribed, currentTier, limits, state.sites.length]);

  const canAccessTemplate = useCallback((templateMinTier: string) => {
    if (!currentTier) return false;
    if (currentTier === "platinum") return true;
    return templateMinTier === "gold";
  }, [currentTier]);

  const fetchSites = useCallback(async () => {
    if (!user) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/member_sites?user_id=eq.${user.id}&order=created_at.desc`,
        { headers }
      );

      if (!response.ok) throw new Error("Failed to fetch sites");

      const data: RawMemberSite[] = await response.json();

      const sites: MemberSite[] = data.map(site => ({
        ...site,
        content: (site.content as unknown as SiteBlock[]) || [],
        branding: (site.branding as unknown as SiteBranding) || DEFAULT_BRANDING,
        status: site.status as "draft" | "published" | "archived",
      }));

      setState(prev => ({ ...prev, sites }));
    } catch (err) {
      console.error("Error fetching sites:", err);
      setState(prev => ({ ...prev, error: "Failed to load sites" }));
    }
  }, [user]);

  const fetchTemplates = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/site_templates?is_active=eq.true&order=category`,
        { headers }
      );

      if (!response.ok) throw new Error("Failed to fetch templates");

      const data: SiteTemplate[] = await response.json();

      setState(prev => ({ ...prev, templates: data || [] }));
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  }, []);

  const createSite = useCallback(async (
    name: string,
    templateId: string,
    slug?: string
  ): Promise<MemberSite | null> => {
    if (!user || !canCreateSite()) {
      toast.error("Unable to create site. Check your membership tier.");
      return null;
    }

    const template = state.templates.find(t => t.id === templateId);
    if (!template || !canAccessTemplate(template.min_tier)) {
      toast.error("Template not available for your tier.");
      return null;
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/member_sites`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: user.id,
          name,
          slug: finalSlug,
          template_id: templateId,
          content: template.default_blocks,
          branding: DEFAULT_BRANDING,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error?.code === "23505") {
          toast.error("A site with this URL already exists. Try a different name.");
        } else {
          throw new Error(error?.message || "Failed to create site");
        }
        return null;
      }

      const [data]: RawMemberSite[] = await response.json();

      const newSite: MemberSite = {
        ...data,
        content: (data.content as unknown as SiteBlock[]) || [],
        branding: (data.branding as unknown as SiteBranding) || DEFAULT_BRANDING,
        status: data.status as "draft" | "published" | "archived",
      };

      setState(prev => ({ ...prev, sites: [newSite, ...prev.sites] }));
      toast.success("Site created successfully!");
      return newSite;
    } catch (err) {
      console.error("Error creating site:", err);
      toast.error("Failed to create site");
      return null;
    }
  }, [user, canCreateSite, canAccessTemplate, state.templates]);

  const updateSite = useCallback(async (
    siteId: string,
    updates: Partial<Pick<MemberSite, "name" | "content" | "branding" | "status" | "analytics_enabled">>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        if (updates.status === "published") {
          dbUpdates.published_at = new Date().toISOString();
        }
      }
      if (updates.analytics_enabled !== undefined) dbUpdates.analytics_enabled = updates.analytics_enabled;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.branding !== undefined) dbUpdates.branding = updates.branding;

      const headers = await getAuthHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/member_sites?id=eq.${siteId}&user_id=eq.${user.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(dbUpdates),
        }
      );

      if (!response.ok) throw new Error("Failed to update site");

      setState(prev => ({
        ...prev,
        sites: prev.sites.map(site =>
          site.id === siteId
            ? { ...site, ...updates, updated_at: new Date().toISOString() }
            : site
        ),
      }));

      return true;
    } catch (err) {
      console.error("Error updating site:", err);
      toast.error("Failed to save changes");
      return false;
    }
  }, [user]);

  const deleteSite = useCallback(async (siteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/member_sites?id=eq.${siteId}&user_id=eq.${user.id}`,
        { method: "DELETE", headers }
      );

      if (!response.ok) throw new Error("Failed to delete site");

      setState(prev => ({
        ...prev,
        sites: prev.sites.filter(site => site.id !== siteId),
      }));

      toast.success("Site deleted");
      return true;
    } catch (err) {
      console.error("Error deleting site:", err);
      toast.error("Failed to delete site");
      return false;
    }
  }, [user]);

  const publishSite = useCallback(async (siteId: string): Promise<boolean> => {
    return updateSite(siteId, { status: "published" });
  }, [updateSite]);

  const unpublishSite = useCallback(async (siteId: string): Promise<boolean> => {
    return updateSite(siteId, { status: "draft" });
  }, [updateSite]);

  useEffect(() => {
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      await Promise.all([fetchSites(), fetchTemplates()]);
      setState(prev => ({ ...prev, isLoading: false }));
    };

    loadData();
  }, [fetchSites, fetchTemplates]);

  return {
    sites: state.sites,
    templates: state.templates,
    isLoading: state.isLoading,
    error: state.error,
    currentTier,
    limits,
    canCreateSite: canCreateSite(),
    canAccessTemplate,
    createSite,
    updateSite,
    deleteSite,
    publishSite,
    unpublishSite,
    refreshSites: fetchSites,
  };
}
