import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from("member_sites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        sites: (data || []).map(site => ({
          ...site,
          content: (site.content as unknown as SiteBlock[]) || [],
          branding: (site.branding as unknown as SiteBranding) || DEFAULT_BRANDING,
          status: site.status as "draft" | "published" | "archived",
        })),
      }));
    } catch (err) {
      console.error("Error fetching sites:", err);
      setState(prev => ({ ...prev, error: "Failed to load sites" }));
    }
  }, [user]);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_templates")
        .select("*")
        .eq("is_active", true)
        .order("category");

      if (error) throw error;

      setState(prev => ({
        ...prev,
        templates: data || [],
      }));
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
      const { data, error } = await supabase
        .from("member_sites")
        .insert({
          user_id: user.id,
          name,
          slug: finalSlug,
          template_id: templateId,
          content: template.default_blocks,
          branding: DEFAULT_BRANDING as unknown as Json,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("A site with this URL already exists. Try a different name.");
        } else {
          throw error;
        }
        return null;
      }

      const newSite: MemberSite = {
        ...data,
        content: (data.content as unknown as SiteBlock[]) || [],
        branding: (data.branding as unknown as SiteBranding) || DEFAULT_BRANDING,
        status: data.status as "draft" | "published" | "archived",
      };

      setState(prev => ({
        ...prev,
        sites: [newSite, ...prev.sites],
      }));

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
      if (updates.content !== undefined) dbUpdates.content = updates.content as unknown as Json;
      if (updates.branding !== undefined) dbUpdates.branding = updates.branding as unknown as Json;

      const { error } = await supabase
        .from("member_sites")
        .update(dbUpdates)
        .eq("id", siteId)
        .eq("user_id", user.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from("member_sites")
        .delete()
        .eq("id", siteId)
        .eq("user_id", user.id);

      if (error) throw error;

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
