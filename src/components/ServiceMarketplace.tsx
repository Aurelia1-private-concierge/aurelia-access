import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Ship, Hotel, UtensilsCrossed, Calendar, Shield, 
  Heart, Car, Home, ShoppingBag, Palette, Cpu,
  Search, MapPin, Users, Clock, Star, Sparkles, Loader2,
  Filter, ChevronDown, Wifi, Waves, Dumbbell, UtensilsCrossed as Restaurant,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  useServiceAvailability, 
  ServiceInventory, 
  ServiceCategory,
  SearchParams 
} from '@/hooks/useServiceAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays } from 'date-fns';

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

const categoryLabels: Record<ServiceCategory, string> = {
  aviation: 'Private Aviation',
  yacht: 'Yacht Charter',
  hospitality: 'Luxury Hotels',
  dining: 'Private Dining',
  events: 'Exclusive Events',
  security: 'Security Services',
  wellness: 'Wellness & Spa',
  automotive: 'Luxury Automotive',
  real_estate: 'Real Estate',
  shopping: 'Personal Shopping',
  art_collectibles: 'Art & Collectibles',
  technology: 'Technology',
};

const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  limited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  on_request: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  seasonal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sold_out: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const priceUnitLabels: Record<string, string> = {
  per_flight: '/flight',
  per_day: '/day',
  per_night: '/night',
  per_person: '/person',
  per_hour: '/hour',
  per_session: '/session',
  per_service: '',
};

interface ServiceCardProps {
  service: ServiceInventory;
  onBook: (service: ServiceInventory) => void;
  isBooking: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook, isBooking }) => {
  return (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {service.images?.[0] ? (
          <img 
            src={service.images[0]} 
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {categoryIcons[service.category]}
          </div>
        )}
        
        {/* Status & Featured badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge className={statusColors[service.availability_status]}>
            {service.availability_status.replace('_', ' ')}
          </Badge>
          {service.featured && (
            <Badge className="bg-primary/90 text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm flex items-center gap-1">
          {categoryIcons[service.category]}
          <span className="text-xs text-white/90">{categoryLabels[service.category]}</span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
        {service.location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {service.location}
          </p>
        )}
        {service.partnerName && (
          <p className="text-xs text-muted-foreground">by {service.partnerName}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
        )}

        {/* Specifications preview */}
        {service.specifications && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(service.specifications).slice(0, 3).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
        )}

        {/* Capacity & Duration */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {service.max_guests && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Up to {service.max_guests}
            </span>
          )}
          {service.lead_time_hours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {service.lead_time_hours}h notice
            </span>
          )}
        </div>

        {/* Special offer */}
        {service.special_offers && (
          <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {service.special_offers}
            </p>
          </div>
        )}

        {/* Pricing and booking */}
        <div className="flex items-end justify-between pt-2 border-t border-border">
          <div>
            {service.base_price ? (
              <>
                <p className="text-2xl font-bold text-foreground">
                  {service.currency} {service.base_price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {priceUnitLabels[service.price_unit] || ''}
                  {service.min_spend && ` • Min ${service.currency} ${service.min_spend.toLocaleString()}`}
                </p>
              </>
            ) : (
              <p className="text-lg font-medium text-foreground">Price on request</p>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => onBook(service)}
            disabled={isBooking || service.availability_status === 'sold_out'}
          >
            {isBooking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : service.availability_status === 'on_request' ? (
              'Inquire'
            ) : (
              'Book'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ServiceMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    inventory, 
    categories,
    featuredServices,
    searchInventory, 
    fetchCategories,
    fetchFeatured,
    bookService 
  } = useServiceAvailability();
  
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(2);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingService, setBookingService] = useState<string | null>(null);
  
  // Hospitality-specific filters
  const [starRating, setStarRating] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [roomType, setRoomType] = useState<string>('');

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'spa', label: 'Spa', icon: Sparkles },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'restaurant', label: 'Restaurant', icon: Restaurant },
    { id: 'butler', label: 'Butler Service', icon: Users },
  ];

  const roomTypeOptions = [
    'Standard Suite', 'Junior Suite', 'Executive Suite', 
    'Presidential Suite', 'Royal Suite', 'Penthouse', 'Villa'
  ];

  useEffect(() => {
    fetchCategories();
    fetchFeatured();
  }, [fetchCategories, fetchFeatured]);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const clearFilters = () => {
    setStarRating('');
    setSelectedAmenities([]);
    setRoomType('');
    setLocation('');
    setGuests(2);
  };

  const hasActiveFilters = starRating || selectedAmenities.length > 0 || roomType || location;

  const handleSearch = async () => {
    const params: SearchParams = {
      location: location || undefined,
      startDate,
      guests,
    };
    
    if (activeCategory !== 'all') {
      params.category = activeCategory;
    }

    await searchInventory(params);
  };

  const handleCategoryChange = async (category: ServiceCategory | 'all') => {
    setActiveCategory(category);
    
    const params: SearchParams = {
      location: location || undefined,
      startDate,
      guests,
    };
    
    if (category !== 'all') {
      params.category = category;
    }

    await searchInventory(params);
  };

  const handleBook = async (service: ServiceInventory) => {
    if (!user) {
      // Could redirect to auth
      return;
    }

    setBookingService(service.id);
    
    await bookService({
      inventoryId: service.id,
      startDatetime: `${startDate}T10:00:00Z`,
      guests,
      guestDetails: {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Guest',
        email: user.email || '',
      },
    });

    setBookingService(null);
  };

  const displayServices = inventory.length > 0 ? inventory : featuredServices;

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Partner Network</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Luxury Service Marketplace
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover exclusive services from our curated network of world-class partners
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 overflow-x-auto"
        >
          <div className="flex gap-2 pb-2 min-w-max">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
              className="shrink-0"
            >
              All Services
            </Button>
            {(Object.keys(categoryLabels) as ServiceCategory[]).map((cat) => {
              const count = categories.find(c => c.id === cat)?.count || 0;
              return (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(cat)}
                  className="shrink-0 gap-2"
                >
                  {categoryIcons[cat]}
                  {categoryLabels[cat]}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City, region, or venue"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            {/* Hospitality Filters Button */}
            <div className="flex flex-col justify-end">
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Hospitality Filters</h4>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Star Rating</Label>
                      <Select value={starRating || "any"} onValueChange={(val) => setStarRating(val === "any" ? "" : val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="5">5 Stars Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Room Type */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Room Type</Label>
                      <Select value={roomType || "any"} onValueChange={(val) => setRoomType(val === "any" ? "" : val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Any type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any type</SelectItem>
                          {roomTypeOptions.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Amenities</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {amenityOptions.map(amenity => (
                          <div
                            key={amenity.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                              selectedAmenities.includes(amenity.id)
                                ? 'bg-primary/10 border-primary/30'
                                : 'bg-background/50 border-border hover:border-primary/20'
                            }`}
                            onClick={() => toggleAmenity(amenity.id)}
                          >
                            <Checkbox
                              id={amenity.id}
                              checked={selectedAmenities.includes(amenity.id)}
                              onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                            <amenity.icon className="h-3 w-3 text-muted-foreground" />
                            <Label htmlFor={amenity.id} className="text-xs cursor-pointer">
                              {amenity.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="sm" 
                      onClick={() => {
                        setShowFilters(false);
                        handleSearch();
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
              {starRating && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  {starRating}+ Stars
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setStarRating('')} />
                </Badge>
              )}
              {roomType && (
                <Badge variant="secondary" className="gap-1">
                  <Hotel className="h-3 w-3" />
                  {roomType}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setRoomType('')} />
                </Badge>
              )}
              {selectedAmenities.map(amenityId => {
                const amenity = amenityOptions.find(a => a.id === amenityId);
                return amenity ? (
                  <Badge key={amenityId} variant="secondary" className="gap-1">
                    <amenity.icon className="h-3 w-3" />
                    {amenity.label}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleAmenity(amenityId)} />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>
          ) : displayServices.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {inventory.length === 0 && featuredServices.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Featured Services
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Search above or explore our featured offerings
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ServiceCard
                      service={service}
                      onBook={handleBook}
                      isBooking={bookingService === service.id}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or contact our concierge for bespoke arrangements
              </p>
              <Button variant="outline" onClick={() => setActiveCategory('all')}>
                View All Services
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServiceMarketplace;