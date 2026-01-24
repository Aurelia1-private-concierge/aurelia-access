import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAtelier, type MemberSite } from "@/hooks/useAtelier";
import { useAuth } from "@/contexts/AuthContext";
import type { SiteBlock, SiteBranding } from "@/lib/atelier-templates";
import { DEFAULT_BRANDING } from "@/lib/atelier-templates";
import type { Json } from "@/integrations/supabase/types";
import BlockEditor from "./BlockEditor";
import BrandingPanel from "./BrandingPanel";
import SitePreview from "./SitePreview";
import OrlaContentAssist from "./OrlaContentAssist";

type ViewMode = "desktop" | "tablet" | "mobile";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

const getAuthHeaders = async () => {
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
  };
};

const SiteBuilder = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateSite, publishSite, unpublishSite } = useAtelier();

  const [site, setSite] = useState<MemberSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [showBranding, setShowBranding] = useState(false);
  const [showOrlaAssist, setShowOrlaAssist] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

  // Fetch site data
  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId || !user) return;

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/member_sites?id=eq.${siteId}&user_id=eq.${user.id}&select=*`,
          { headers }
        );

        if (!response.ok) throw new Error("Failed to fetch site");

        const data: RawMemberSite[] = await response.json();
        
        if (!data || data.length === 0) {
          throw new Error("Site not found");
        }

        const rawSite = data[0];
        
        // Normalize content blocks to ensure they have required fields
        const rawContent = rawSite.content as unknown;
        const normalizedContent: SiteBlock[] = Array.isArray(rawContent)
          ? rawContent.map((block: Record<string, unknown>, index: number) => {
              // Extract known metadata fields, rest goes into content
              const { id, type, order, ...contentFields } = block;
              return {
                id: (id as string) || `block-${index}-${Date.now()}`,
                type: (type as SiteBlock["type"]) || "hero",
                content: contentFields as Record<string, unknown>,
                order: (order as number) ?? index,
              };
            })
          : [];

        // Normalize branding
        const rawBranding = rawSite.branding as unknown as Record<string, unknown> | null;
        const normalizedBranding: SiteBranding = {
          ...DEFAULT_BRANDING,
          ...(rawBranding && {
            primaryColor: (rawBranding.primaryColor as string) || DEFAULT_BRANDING.primaryColor,
            secondaryColor: (rawBranding.secondaryColor as string) || DEFAULT_BRANDING.secondaryColor,
            accentColor: (rawBranding.accentColor as string) || DEFAULT_BRANDING.accentColor,
            fontHeading: (rawBranding.fontHeading as string) || DEFAULT_BRANDING.fontHeading,
            fontBody: (rawBranding.fontBody as string) || DEFAULT_BRANDING.fontBody,
            logoUrl: rawBranding.logoUrl as string | undefined,
            faviconUrl: rawBranding.faviconUrl as string | undefined,
          }),
        };

        setSite({
          ...rawSite,
          content: normalizedContent,
          branding: normalizedBranding,
          status: rawSite.status as "draft" | "published" | "archived",
        });
      } catch (err) {
        console.error("Error fetching site:", err);
        toast.error("Failed to load site");
        navigate("/atelier");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSite();
  }, [siteId, user, navigate]);

  const handleSave = useCallback(async () => {
    if (!site) return;

    setIsSaving(true);
    const success = await updateSite(site.id, {
      name: site.name,
      content: site.content,
      branding: site.branding,
    });
    setIsSaving(false);

    if (success) {
      setHasChanges(false);
      toast.success("Site saved");
    }
  }, [site, updateSite]);

  const handlePublish = async () => {
    if (!site) return;

    if (hasChanges) {
      await handleSave();
    }

    const success = await publishSite(site.id);
    if (success) {
      setSite(prev => prev ? { ...prev, status: "published" } : null);
      toast.success("Site published!");
    }
  };

  const handleUnpublish = async () => {
    if (!site) return;

    const success = await unpublishSite(site.id);
    if (success) {
      setSite(prev => prev ? { ...prev, status: "draft" } : null);
      toast.success("Site unpublished");
    }
  };

  const updateBlock = (index: number, updates: Partial<SiteBlock>) => {
    if (!site) return;

    const newContent = [...site.content];
    newContent[index] = { ...newContent[index], ...updates };

    setSite({ ...site, content: newContent });
    setHasChanges(true);
  };

  const updateBranding = (updates: Partial<SiteBranding>) => {
    if (!site) return;

    setSite({
      ...site,
      branding: { ...site.branding, ...updates },
    });
    setHasChanges(true);
  };

  const insertGeneratedContent = (content: string) => {
    if (selectedBlockIndex !== null && site) {
      const block = site.content[selectedBlockIndex];
      updateBlock(selectedBlockIndex, {
        content: { ...block.content, text: content },
      });
      toast.success("Content inserted");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Site not found</p>
          <Button asChild>
            <Link to="/atelier">Back to Atelier</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/atelier">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>

          <div>
            <Input
              value={site.name}
              onChange={(e) => {
                setSite({ ...site, name: e.target.value });
                setHasChanges(true);
              }}
              className="h-8 text-lg font-medium border-none bg-transparent px-0 focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>/{site.slug}</span>
              {site.status === "published" && (
                <Badge variant="secondary" className="text-xs">Published</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device preview toggles */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="desktop" className="h-7 px-2">
                <Monitor className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="tablet" className="h-7 px-2">
                <Tablet className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="mobile" className="h-7 px-2">
                <Smartphone className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBranding(!showBranding)}
          >
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOrlaAssist(!showOrlaAssist)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Orla AI
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>

          {site.status === "published" ? (
            <Button variant="outline" size="sm" onClick={handleUnpublish}>
              Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={handlePublish}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block Editor Sidebar */}
        <aside className="w-80 border-r bg-card overflow-y-auto shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-4">Content Blocks</h3>
            <div className="space-y-2">
              {site.content.map((block, index) => (
                <BlockEditor
                  key={block.id || index}
                  block={block}
                  isSelected={selectedBlockIndex === index}
                  onClick={() => setSelectedBlockIndex(index)}
                  onChange={(updates) => updateBlock(index, updates)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 bg-muted/30 overflow-hidden">
          <SitePreview
            site={site}
            viewMode={viewMode}
          />
        </main>

        {/* Branding Panel */}
        {showBranding && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l bg-card overflow-y-auto shrink-0"
          >
            <BrandingPanel
              branding={site.branding}
              onChange={updateBranding}
              onClose={() => setShowBranding(false)}
            />
          </motion.aside>
        )}

        {/* Orla AI Assist */}
        {showOrlaAssist && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l bg-card overflow-y-auto shrink-0"
          >
            <OrlaContentAssist
              selectedBlock={selectedBlockIndex !== null ? site.content[selectedBlockIndex] : null}
              onInsertContent={insertGeneratedContent}
              onClose={() => setShowOrlaAssist(false)}
            />
          </motion.aside>
        )}
      </div>
    </div>
  );
};

export default SiteBuilder;
