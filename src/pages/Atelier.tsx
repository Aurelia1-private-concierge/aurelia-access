import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  Crown, 
  Globe, 
  FileText,
  Trash2,
  ExternalLink,
  Edit3,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAtelier, type MemberSite } from "@/hooks/useAtelier";
import { useAuth } from "@/contexts/AuthContext";
import { TEMPLATE_CATEGORIES } from "@/lib/atelier-templates";
import TemplateGallery from "@/components/atelier/TemplateGallery";
import CreateSiteDialog from "@/components/atelier/CreateSiteDialog";

const Atelier = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    sites, 
    templates, 
    isLoading, 
    currentTier, 
    limits,
    canCreateSite,
    deleteSite,
    publishSite,
    unpublishSite,
  } = useAtelier();

  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<MemberSite | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Aurelia Atelier</CardTitle>
            <CardDescription>
              Sign in to create your luxury microsite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentTier) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="text-center pb-8">
              <Crown className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-serif">Aurelia Atelier</CardTitle>
              <CardDescription className="text-lg mt-4 max-w-xl mx-auto">
                Create stunning, AI-powered microsites for your personal brand, 
                events, ventures, or family office. Available exclusively for 
                Gold and Platinum members.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg">
                <Link to="/membership">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Membership
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Feature preview */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {TEMPLATE_CATEGORIES.map((category) => (
              <Card key={category.id} className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplates(false);
    setShowCreateDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (siteToDelete) {
      await deleteSite(siteToDelete.id);
      setSiteToDelete(null);
    }
  };

  const getStatusBadge = (status: MemberSite["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
    }
  };

  const tierForGallery = currentTier as "gold" | "platinum";

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-serif text-foreground">Aurelia Atelier</h1>
              <p className="text-muted-foreground mt-1">
                {currentTier === "platinum" ? "Unlimited" : `${sites.length}/${limits?.maxSites}`} luxury microsites
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-primary border-primary/30">
                <Crown className="w-3 h-3 mr-1" />
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Member
              </Badge>
              
              <Button 
                onClick={() => setShowTemplates(true)}
                disabled={!canCreateSite}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Site
              </Button>
            </div>
          </div>

          {/* Sites Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-muted" />
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : sites.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">No sites yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  Create your first luxury microsite with AI-powered content generation
                </p>
                <Button onClick={() => setShowTemplates(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Choose a Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {sites.map((site) => (
                  <motion.div
                    key={site.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="group overflow-hidden hover:border-primary/30 transition-colors">
                      {/* Preview image placeholder */}
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Globe className="w-12 h-12 text-primary/40" />
                        </div>
                        
                        {/* Quick actions */}
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/atelier/${site.id}`)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Site
                              </DropdownMenuItem>
                              {site.status === "published" ? (
                                <DropdownMenuItem onClick={() => unpublishSite(site.id)}>
                                  Unpublish
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => publishSite(site.id)}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setSiteToDelete(site)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{site.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              /{site.slug}
                            </p>
                          </div>
                          {getStatusBadge(site.status)}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/atelier/${site.id}`)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Site
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Tier benefits reminder */}
          {currentTier === "gold" && (
            <Card className="mt-12 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <h3 className="font-medium">Unlock More with Platinum</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get up to 5 sites, unlimited AI content, custom domains, and white-glove setup
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/membership">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template Gallery Modal */}
      <TemplateGallery
        open={showTemplates}
        onOpenChange={setShowTemplates}
        templates={templates}
        onSelect={handleSelectTemplate}
        currentTier={tierForGallery}
      />

      {/* Create Site Dialog */}
      <CreateSiteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        templateId={selectedTemplateId}
        templates={templates}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!siteToDelete} onOpenChange={() => setSiteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{siteToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Atelier;
