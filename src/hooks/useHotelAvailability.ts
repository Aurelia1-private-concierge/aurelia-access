import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface HotelAvailability {
  id: string;
  partner_id: string;
  property_name: string;
  property_code?: string;
  location?: string;
  room_type: string;
  room_description?: string;
  available_from: string;
  available_to: string;
  rate_per_night: number;
  currency: string;
  availability_status: 'available' | 'limited' | 'sold_out' | 'on_request';
  min_nights: number;
  max_guests: number;
  amenities?: string[];
  images?: string[];
  special_offers?: string;
  commission_rate: number;
  last_synced_at: string;
  metadata?: Record<string, unknown>;
  // Computed fields
  nights?: number;
  totalAmount?: number;
  partnerName?: string;
  partnerLogo?: string;
}

export interface HotelBooking {
  id: string;
  availability_id?: string;
  client_id: string;
  service_request_id?: string;
  partner_id: string;
  property_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_nights?: number;
  rate_per_night?: number;
  total_amount?: number;
  currency: string;
  special_requests?: string;
  guest_details?: {
    name: string;
    email: string;
    phone?: string;
  };
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  confirmation_number?: string;
  created_at: string;
}

export interface SearchParams {
  location?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  minRate?: number;
  maxRate?: number;
  partnerId?: string;
}

export interface BookingParams {
  availabilityId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
  guestDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export function useHotelAvailability() {
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<HotelAvailability[]>([]);
  const [myBookings, setMyBookings] = useState<HotelBooking[]>([]);

  const searchAvailability = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: 'search',
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: String(params.guests || 2),
      });

      if (params.location) queryParams.set('location', params.location);
      if (params.minRate) queryParams.set('minRate', String(params.minRate));
      if (params.maxRate) queryParams.set('maxRate', String(params.maxRate));
      if (params.partnerId) queryParams.set('partnerId', params.partnerId);

      const { data, error } = await supabase.functions.invoke('hotel-availability', {
        body: null,
        method: 'GET',
      });

      // Use direct fetch for GET with query params
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-availability?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search availability');
      }

      setAvailability(result.data || []);
      return result;
    } catch (error: any) {
      console.error('Search availability error:', error);
      toast({
        title: 'Search Error',
        description: error.message || 'Failed to search hotel availability',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookProperty = useCallback(async (params: BookingParams) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to make a booking',
          variant: 'destructive',
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-availability?action=book`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(params),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      toast({
        title: 'Booking Submitted',
        description: result.message || 'Your booking request has been submitted',
      });

      return result;
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Error',
        description: error.message || 'Failed to submit booking request',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      const { data, error } = await supabase
        .from('hotel_bookings')
        .select('*')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion since we know the structure matches
      setMyBookings(data as unknown as HotelBooking[]);
      return data;
    } catch (error: any) {
      console.error('Fetch bookings error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch your bookings',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Partner functions
  const updateAvailability = useCallback(async (availabilityData: Partial<HotelAvailability> & { id?: string }) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to update availability',
          variant: 'destructive',
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-availability?action=update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(availabilityData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update availability');
      }

      toast({
        title: 'Success',
        description: availabilityData.id ? 'Availability updated' : 'Property added',
      });

      return result;
    } catch (error: any) {
      console.error('Update availability error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-availability?action=my-properties`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch properties');
      }

      return result.data;
    } catch (error: any) {
      console.error('Fetch properties error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch your properties',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    availability,
    myBookings,
    searchAvailability,
    bookProperty,
    fetchMyBookings,
    updateAvailability,
    fetchMyProperties,
  };
}
