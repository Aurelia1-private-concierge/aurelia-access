import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Star, Phone, Mail, MapPin, Building2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  "Private Aviation",
  "Yacht Charter",
  "Luxury Real Estate",
  "Fine Dining",
  "Travel & Concierge",
  "Security Services",
  "Wellness & Spa",
  "Art & Collectibles",
  "Personal Shopping",
  "Event Planning",
  "Chauffeur Services",
  "Legal & Financial",
];

interface HousePartner {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  category: string;
  subcategories: string[];
  description: string | null;
  service_regions: string[];
  contact_notes: string | null;
  pricing_tier: string;
  rating: number;
  is_preferred: boolean;
  is_active: boolean;
  created_at: string;
}

export function HousePartnersPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<HousePartner | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    category: "",
    description: "",
    service_regions: "",
    contact_notes: "",
    pricing_tier: "standard",
    is_preferred: false,
  });

  const { data: partners, isLoading } = useQuery({
    queryKey: ["house-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("house_partners")
        .select("*")
        .order("is_preferred", { ascending: false })
        .order("name");
      
      if (error) throw error;
      return data as HousePartner[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("house_partners").insert({
        name: data.name,
        company_name: data.company_name || null,
        email: data.email || null,
        phone: data.phone || null,
        category: data.category,
        description: data.description || null,
        service_regions: data.service_regions.split(",").map(s => s.trim()).filter(Boolean),
        contact_notes: data.contact_notes || null,
        pricing_tier: data.pricing_tier,
        is_preferred: data.is_preferred,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partners"] });
      toast.success("House partner added successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add partner: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("house_partners").update({
        name: data.name,
        company_name: data.company_name || null,
        email: data.email || null,
        phone: data.phone || null,
        category: data.category,
        description: data.description || null,
        service_regions: data.service_regions.split(",").map(s => s.trim()).filter(Boolean),
        contact_notes: data.contact_notes || null,
        pricing_tier: data.pricing_tier,
        is_preferred: data.is_preferred,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partners"] });
      toast.success("Partner updated successfully");
      resetForm();
      setIsDialogOpen(false);
      setEditingPartner(null);
    },
    onError: (error) => {
      toast.error(`Failed to update partner: ${error.message}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("house_partners")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("house_partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partners"] });
      toast.success("Partner removed");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      company_name: "",
      email: "",
      phone: "",
      category: "",
      description: "",
      service_regions: "",
      contact_notes: "",
      pricing_tier: "standard",
      is_preferred: false,
    });
  };

  const handleEdit = (partner: HousePartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      company_name: partner.company_name || "",
      email: partner.email || "",
      phone: partner.phone || "",
      category: partner.category,
      description: partner.description || "",
      service_regions: partner.service_regions.join(", "),
      contact_notes: partner.contact_notes || "",
      pricing_tier: partner.pricing_tier,
      is_preferred: partner.is_preferred,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            House Partners
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-vetted vendors you manage directly for member services
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPartner(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? "Edit House Partner" : "Add House Partner"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Contact Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing_tier">Pricing Tier</Label>
                  <Select
                    value={formData.pricing_tier}
                    onValueChange={(value) => setFormData({ ...formData, pricing_tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="ultra">Ultra Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_regions">Service Regions (comma-separated)</Label>
                <Input
                  id="service_regions"
                  value={formData.service_regions}
                  onChange={(e) => setFormData({ ...formData, service_regions: e.target.value })}
                  placeholder="London, Monaco, New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_notes">Internal Notes</Label>
                <Textarea
                  id="contact_notes"
                  value={formData.contact_notes}
                  onChange={(e) => setFormData({ ...formData, contact_notes: e.target.value })}
                  rows={2}
                  placeholder="Pricing agreements, contact preferences, etc."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_preferred"
                    checked={formData.is_preferred}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_preferred: checked })}
                  />
                  <Label htmlFor="is_preferred">Preferred Partner</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPartner ? "Update Partner" : "Add Partner"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !partners?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No house partners yet.</p>
            <p className="text-sm">Add your trusted vendors to start fulfilling member requests.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Regions</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{partner.name}</span>
                          {partner.is_preferred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {partner.company_name && (
                          <span className="text-sm text-muted-foreground">{partner.company_name}</span>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {partner.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {partner.email}
                            </span>
                          )}
                          {partner.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {partner.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{partner.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {partner.service_regions.length > 0 
                          ? partner.service_regions.slice(0, 2).join(", ") 
                          : "Global"}
                        {partner.service_regions.length > 2 && ` +${partner.service_regions.length - 2}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {partner.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={partner.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: partner.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(partner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Remove this partner?")) {
                              deleteMutation.mutate(partner.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
