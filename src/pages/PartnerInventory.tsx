import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Loader2, Package, 
  MapPin, DollarSign, Users, Clock, Star,
  Plane, Ship, Hotel, UtensilsCrossed, Calendar, Shield, 
  Heart, Car, Home, ShoppingBag, Palette, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceAvailability, ServiceInventory, ServiceCategory } from '@/hooks/useServiceAvailability';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PartnerOnboardingWizard from '@/components/partner/PartnerOnboardingWizard';

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  aviation: <Plane className="h-5 w-5" />,
  yacht: <Ship className="h-5 w-5" />,
  hospitality: <Hotel className="h-5 w-5" />,
  dining: <UtensilsCrossed className="h-5 w-5" />,
  events: <Calendar className="h-5 w-5" />,
  security: <Shield className="h-5 w-5" />,
  wellness: <Heart className="h-5 w-5" />,
  automotive: <Car className="h-5 w-5" />,
  real_estate: <Home className="h-5 w-5" />,
  shopping: <ShoppingBag className="h-5 w-5" />,
  art_collectibles: <Palette className="h-5 w-5" />,
  technology: <Cpu className="h-5 w-5" />,
};

const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400',
  limited: 'bg-amber-500/20 text-amber-400',
  on_request: 'bg-blue-500/20 text-blue-400',
  seasonal: 'bg-purple-500/20 text-purple-400',
  sold_out: 'bg-red-500/20 text-red-400',
};

const emptyInventoryItem: Partial<ServiceInventory> = {
  title: '',
  description: '',
  category: 'hospitality',
  subcategory: '',
  location: '',
  base_price: 0,
  currency: 'USD',
  availability_status: 'available',
  max_guests: 2,
  featured: false,
  specifications: {},
};

const PartnerInventory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isLoading, 
    inventory, 
    fetchMyInventory, 
    addInventory, 
    deleteInventory 
  } = useServiceAvailability();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ServiceInventory> | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceInventory>>(emptyInventoryItem);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyInventory();
    }
  }, [user, fetchMyInventory]);

  const handleOpenDialog = (item?: ServiceInventory) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(emptyInventoryItem);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyInventoryItem);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await addInventory({
        ...formData,
        id: editingItem?.id,
      });
      handleCloseDialog();
      fetchMyInventory();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteInventory(id);
    if (success) {
      fetchMyInventory();
    }
    setDeletingId(null);
  };

  const getCategoryConfig = (category: ServiceCategory) => {
    return SERVICE_CATEGORIES[category] || SERVICE_CATEGORIES.hospitality;
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Partner Access Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to manage your inventory
            </p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Partner Inventory Management | Aurelia"
        description="Manage your luxury service inventory on the Aurelia partner platform."
      />
      <Navigation />
      
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground">
                Add and manage your luxury services for the marketplace
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Service' : 'Add New Service'}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details for your luxury service offering
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Category */}
                  <div className="grid gap-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: ServiceCategory) => {
                        setFormData({ 
                          ...formData, 
                          category: value,
                          subcategory: '',
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_CATEGORIES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              {categoryIcons[key as ServiceCategory]}
                              {config.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subcategory */}
                  {formData.category && (
                    <div className="grid gap-2">
                      <Label>Subcategory</Label>
                      <Select
                        value={formData.subcategory || ''}
                        onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCategoryConfig(formData.category as ServiceCategory).subcategories.map((sub) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Title */}
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="e.g., Presidential Suite at The Ritz"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your service offering..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Location */}
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Paris, France"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Base Price *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.base_price || ''}
                        onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Currency</Label>
                      <Select
                        value={formData.currency || 'USD'}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="AED">AED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Capacity & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Max Guests</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.max_guests || 2}
                        onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 2 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Availability Status</Label>
                      <Select
                        value={formData.availability_status || 'available'}
                        onValueChange={(value) => setFormData({ ...formData, availability_status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="on_request">On Request</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                          <SelectItem value="sold_out">Sold Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      id="featured"
                      checked={formData.featured || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured" className="flex items-center gap-2 cursor-pointer">
                      <Star className="h-4 w-4 text-primary" />
                      Feature this service
                    </Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : editingItem ? (
                      'Update Service'
                    ) : (
                      'Add Service'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Inventory Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </motion.div>
            ) : inventory.length > 0 ? (
              <motion.div
                key="inventory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {inventory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {categoryIcons[item.category]}
                            <Badge variant="outline" className="text-xs">
                              {getCategoryConfig(item.category).name}
                            </Badge>
                          </div>
                          <Badge className={statusColors[item.availability_status]}>
                            {item.availability_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
                        {item.location && (
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {item.currency} {item.base_price?.toLocaleString()}
                          </span>
                          {item.max_guests && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.max_guests}
                            </span>
                          )}
                          {item.featured && (
                            <span className="flex items-center gap-1 text-primary">
                              <Star className="h-3 w-3 fill-primary" />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No inventory yet
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start adding your luxury services to showcase them on our marketplace
                </p>
                <Button onClick={() => setShowOnboardingWizard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />

      {/* Onboarding Wizard */}
      {showOnboardingWizard && (
        <PartnerOnboardingWizard
          onComplete={() => {
            setShowOnboardingWizard(false);
            fetchMyInventory();
          }}
          onCancel={() => setShowOnboardingWizard(false)}
        />
      )}
    </>
  );
};

export default PartnerInventory;
