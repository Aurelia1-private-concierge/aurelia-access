import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type ServiceCategory = 
  | "private_aviation" 
  | "yacht_charter" 
  | "real_estate" 
  | "collectibles" 
  | "events_access" 
  | "security" 
  | "dining" 
  | "travel" 
  | "wellness" 
  | "shopping";

const categories: { value: ServiceCategory; label: string }[] = [
  { value: "private_aviation", label: "Private Aviation" },
  { value: "yacht_charter", label: "Yacht Charters" },
  { value: "real_estate", label: "Real Estate" },
  { value: "collectibles", label: "Rare Collectibles" },
  { value: "events_access", label: "Exclusive Events" },
  { value: "security", label: "Security & Privacy" },
  { value: "dining", label: "Fine Dining" },
  { value: "travel", label: "Bespoke Travel" },
  { value: "wellness", label: "Wellness & Medical" },
  { value: "shopping", label: "Personal Shopping" },
];

const PartnerServiceForm = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "" as ServiceCategory | "",
    description: "",
    highlights: "",
    minPrice: "",
    maxPrice: "",
    availabilityNotes: "",
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchPartner();
    }
  }, [user, authLoading]);

  const fetchPartner = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("id, status")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (!data || data.status !== "approved") {
        toast.error("Partner access required");
        navigate("/partner");
        return;
      }

      setPartnerId(data.id);
    } catch (error) {
      console.error("Error fetching partner:", error);
      navigate("/partner");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerId || !formData.title || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("partner_services")
        .insert({
          partner_id: partnerId,
          title: formData.title,
          category: formData.category,
          description: formData.description || null,
          highlights: formData.highlights ? formData.highlights.split("\n").filter(h => h.trim()) : null,
          min_price: formData.minPrice ? parseFloat(formData.minPrice) : null,
          max_price: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
          availability_notes: formData.availabilityNotes || null,
          is_active: formData.isActive,
        });

      if (error) throw error;

      toast.success("Service created successfully");
      navigate("/partner");
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast.error(error.message || "Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/partner")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-foreground">Add New Service</h1>
                <p className="text-sm text-muted-foreground">List a service for Aurelia members</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card/50 border border-border/30 rounded-2xl p-8 space-y-6">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Private Jet Charter - Global"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: ServiceCategory) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your service offering in detail..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="highlights">Key Highlights</Label>
                <Textarea
                  id="highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Enter one highlight per line, e.g.:&#10;24/7 availability&#10;Global positioning&#10;Luxury catering included"
                  rows={4}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">One highlight per line</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPrice">Minimum Price (USD)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                    placeholder="50000"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Maximum Price (USD)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                    placeholder="500000"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availability">Availability Notes</Label>
                <Textarea
                  id="availability"
                  value={formData.availabilityNotes}
                  onChange={(e) => setFormData({ ...formData, availabilityNotes: e.target.value })}
                  placeholder="e.g., 4-hour minimum notice, available worldwide..."
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <div>
                  <Label htmlFor="isActive" className="cursor-pointer">Active Listing</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Service will be visible to members
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.title || !formData.category}
                className="w-full"
              >
                {isSubmitting ? "Creating..." : "Create Service"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PartnerServiceForm;
