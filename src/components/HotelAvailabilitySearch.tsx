import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hotel, 
  Calendar, 
  Users, 
  MapPin, 
  Search, 
  Star, 
  Wifi, 
  Car, 
  Utensils,
  Waves,
  Dumbbell,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHotelAvailability, HotelAvailability } from '@/hooks/useHotelAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays } from 'date-fns';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3 w-3" />,
  parking: <Car className="h-3 w-3" />,
  restaurant: <Utensils className="h-3 w-3" />,
  pool: <Waves className="h-3 w-3" />,
  gym: <Dumbbell className="h-3 w-3" />,
  spa: <Sparkles className="h-3 w-3" />,
};

const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  limited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  on_request: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sold_out: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const HotelAvailabilitySearch: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, availability, searchAvailability, bookProperty } = useHotelAvailability();
  
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 10), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(2);
  const [selectedProperty, setSelectedProperty] = useState<HotelAvailability | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const handleSearch = async () => {
    await searchAvailability({
      location: location || undefined,
      checkIn,
      checkOut,
      guests,
    });
  };

  const handleBook = async (property: HotelAvailability) => {
    if (!user) {
      // Redirect to auth or show login modal
      return;
    }

    setBookingInProgress(true);
    setSelectedProperty(property);

    const result = await bookProperty({
      availabilityId: property.id,
      checkIn,
      checkOut,
      guests,
      guestDetails: {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Guest',
        email: user.email || '',
      },
    });

    setBookingInProgress(false);
    if (result?.success) {
      setSelectedProperty(null);
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Hotel className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Partner Properties</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Luxury Accommodations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover exclusive properties from our curated partner network
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City, region, or property name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground mb-1 block">Guests</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
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
          ) : availability.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {availability.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
                    {/* Image placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      {property.images?.[0] ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.property_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Hotel className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <Badge 
                        className={`absolute top-3 right-3 ${statusColors[property.availability_status]}`}
                      >
                        {property.availability_status.replace('_', ' ')}
                      </Badge>

                      {/* Partner badge */}
                      {property.partnerName && (
                        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                          <span className="text-xs text-white/80">{property.partnerName}</span>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-1">{property.property_name}</CardTitle>
                      {property.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Room type */}
                      <div>
                        <p className="text-sm font-medium text-foreground">{property.room_type}</p>
                        {property.room_description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{property.room_description}</p>
                        )}
                      </div>

                      {/* Amenities */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.slice(0, 5).map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs gap-1">
                              {amenityIcons[amenity.toLowerCase()] || <Star className="h-3 w-3" />}
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Special offer */}
                      {property.special_offers && (
                        <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-xs text-primary">{property.special_offers}</p>
                        </div>
                      )}

                      {/* Pricing and booking */}
                      <div className="flex items-end justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {property.currency} {property.rate_per_night.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">per night</p>
                          {property.nights && property.totalAmount && (
                            <p className="text-sm text-primary mt-1">
                              {property.currency} {property.totalAmount.toLocaleString()} total ({property.nights} nights)
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleBook(property)}
                          disabled={bookingInProgress || property.availability_status === 'sold_out'}
                        >
                          {bookingInProgress && selectedProperty?.id === property.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : property.availability_status === 'on_request' ? (
                            'Request'
                          ) : (
                            'Book Now'
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
              className="text-center py-12"
            >
              <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or contact our concierge for personalized recommendations
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HotelAvailabilitySearch;
