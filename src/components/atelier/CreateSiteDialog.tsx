import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtelier, type SiteTemplate } from "@/hooks/useAtelier";

interface CreateSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
  templates: SiteTemplate[];
}

const CreateSiteDialog = ({
  open,
  onOpenChange,
  templateId,
  templates,
}: CreateSiteDialogProps) => {
  const navigate = useNavigate();
  const { createSite } = useAtelier();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedTemplate = templates.find(t => t.id === templateId);

  const generateSlug = (siteName: string) => {
    return siteName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !templateId) return;

    setIsCreating(true);
    const site = await createSite(name.trim(), templateId, slug || undefined);
    setIsCreating(false);

    if (site) {
      onOpenChange(false);
      setName("");
      setSlug("");
      navigate(`/atelier/${site.id}`);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onOpenChange(false);
      setName("");
      setSlug("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Site
          </DialogTitle>
          <DialogDescription>
            {selectedTemplate 
              ? `Using the "${selectedTemplate.name}" template`
              : "Give your luxury microsite a name"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              placeholder="e.g., Monaco Gala 2026"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">aurelia.co/</span>
              <Input
                id="site-slug"
                placeholder="monaco-gala-2026"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                disabled={isCreating}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will be the URL for your site
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Site"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSiteDialog;
