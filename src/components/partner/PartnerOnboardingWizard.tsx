import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Ship, Hotel, UtensilsCrossed, Calendar, Shield,
  Heart, Car, Home, ShoppingBag, Palette, Cpu,
  ChevronRight, ChevronLeft, Check, Sparkles, MapPin,
  DollarSign, Users, Image as ImageIcon, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/lib/service-categories';
import { useServiceAvailability, ServiceInventory } from '@/hooks/useServiceAvailability';
import { cn } from '@/lib/utils';

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  aviation: <Plane className="h-6 w-6" />,
  yacht: <Ship className="h-6 w-6" />,
  hospitality: <Hotel className="h-6 w-6" />,
  dining: <UtensilsCrossed className="h-6 w-6" />,
  events: <Calendar className="h-6 w-6" />,
  security: <Shield className="h-6 w-6" />,
  wellness: <Heart className="h-6 w-6" />,
  automotive: <Car className="h-6 w-6" />,
  real_estate: <Home className="h-6 w-6" />,
  shopping: <ShoppingBag className="h-6 w-6" />,
  art_collectibles: <Palette className="h-6 w-6" />,
  technology: <Cpu className="h-6 w-6" />,
};

interface PartnerOnboardingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, title: 'Category', description: 'Choose your service type' },
  { id: 2, title: 'Details', description: 'Describe your offering' },
  { id: 3, title: 'Pricing', description: 'Set your rates' },
  { id: 4, title: 'Review', description: 'Confirm and publish' },
];

export const PartnerOnboardingWizard: React.FC<PartnerOnboardingWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { addInventory, isLoading } = useServiceAvailability();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ServiceInventory>>({
    category: undefined,
    subcategory: '',
    title: '',
    description: '',
    location: '',
    base_price: 0,
    currency: 'USD',
    availability_status: 'available',
    max_guests: 2,
    featured: false,
    specifications: {},
  });

  const selectedCategory = formData.category ? SERVICE_CATEGORIES[formData.category] : null;

  const updateFormData = (updates: Partial<ServiceInventory>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.category;
      case 2:
        return !!formData.title && formData.title.length >= 3;
      case 3:
        return formData.base_price !== undefined && formData.base_price >= 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await addInventory(formData);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">New Service</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Add Your First Offering</h1>
            <p className="text-muted-foreground">
              Follow these steps to list your luxury service on our marketplace
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Category Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                    What type of service do you offer?
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(Object.keys(SERVICE_CATEGORIES) as ServiceCategory[]).map((cat) => {
                      const config = SERVICE_CATEGORIES[cat];
                      return (
                        <Card
                          key={cat}
                          className={cn(
                            "cursor-pointer transition-all hover:border-primary/50",
                            formData.category === cat
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                          onClick={() => updateFormData({ category: cat, subcategory: '' })}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={cn(
                              "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3",
                              formData.category === cat
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-muted-foreground"
                            )}>
                              {categoryIcons[cat]}
                            </div>
                            <h3 className="text-sm font-medium text-foreground">{config.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {config.description}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Subcategory selection */}
                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Subcategory (optional)
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory.subcategories.map(sub => (
                          <Badge
                            key={sub}
                            variant={formData.subcategory === sub ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => updateFormData({ subcategory: sub })}
                          >
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                    Tell us about your offering
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder={`e.g., ${selectedCategory?.name || 'Luxury'} Experience in Monaco`}
                        value={formData.title || ''}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what makes your service special..."
                        value={formData.description || ''}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="e.g., Monaco, French Riviera"
                          value={formData.location || ''}
                          onChange={(e) => updateFormData({ location: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="guests">Maximum Guests</Label>
                      <div className="relative mt-1">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="guests"
                          type="number"
                          min={1}
                          value={formData.max_guests || 2}
                          onChange={(e) => updateFormData({ max_guests: parseInt(e.target.value) || 2 })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                    Set your pricing
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Base Price *</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="price"
                            type="number"
                            min={0}
                            placeholder="0"
                            value={formData.base_price || ''}
                            onChange={(e) => updateFormData({ base_price: parseFloat(e.target.value) || 0 })}
                            className="pl-10"
                          />
                        </div>
                        {selectedCategory && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedCategory.priceUnitLabel || 'per service'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency || 'USD'}
                          onValueChange={(value) => updateFormData({ currency: value })}
                        >
                          <SelectTrigger className="mt-1">
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

                    <div>
                      <Label htmlFor="status">Availability Status</Label>
                      <Select
                        value={formData.availability_status || 'available'}
                        onValueChange={(value) => updateFormData({ availability_status: value as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="limited">Limited Availability</SelectItem>
                          <SelectItem value="on_request">On Request</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
                      <div>
                        <Label htmlFor="featured" className="font-medium">Feature this service</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Featured services appear prominently on the marketplace
                        </p>
                      </div>
                      <Switch
                        id="featured"
                        checked={formData.featured || false}
                        onCheckedChange={(checked) => updateFormData({ featured: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                    Review your listing
                  </h2>

                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          {formData.category && categoryIcons[formData.category]}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {formData.title || 'Untitled Service'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {selectedCategory && (
                              <Badge variant="outline">{selectedCategory.name}</Badge>
                            )}
                            {formData.subcategory && (
                              <Badge variant="secondary">{formData.subcategory}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {formData.description && (
                        <p className="text-sm text-muted-foreground">{formData.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formData.location || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Max Guests</p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {formData.max_guests || 2}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-sm font-medium text-foreground">
                            {formData.currency} {formData.base_price?.toLocaleString() || 0}
                            {selectedCategory?.priceUnitLabel}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge variant="outline" className="capitalize">
                            {formData.availability_status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {formData.featured && (
                        <div className="flex items-center gap-2 pt-4 border-t border-border">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm text-primary font-medium">
                            This service will be featured
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handleBack}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Publish Service
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboardingWizard;
