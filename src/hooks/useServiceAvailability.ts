import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type ServiceCategory = 
  | 'aviation' 
  | 'yacht' 
  | 'hospitality' 
  | 'dining' 
  | 'events' 
  | 'security' 
  | 'wellness' 
  | 'automotive' 
  | 'real_estate' 
  | 'shopping' 
  | 'art_collectibles' 
  | 'technology';

export type AvailabilityStatus = 'available' | 'limited' | 'sold_out' | 'on_request' | 'seasonal';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'refunded';

export interface ServiceInventory {
  id: string;
  partner_id: string;
  partner_service_id?: string;
  category: ServiceCategory;
  subcategory?: string;
  title: string;
  description?: string;
  location?: string;
  available_from?: string;
  available_to?: string;
  is_always_available: boolean;
  lead_time_hours: number;
  availability_status: AvailabilityStatus;
  base_price?: number;
  price_unit: string;
  currency: string;
  min_spend?: number;
  deposit_required?: number;
  min_guests: number;
  max_guests?: number;
  min_duration_hours?: number;
  max_duration_hours?: number;
  specifications?: Record<string, unknown>;
  amenities?: string[];
  images?: string[];
  cancellation_policy?: string;
  special_conditions?: string;
  special_offers?: string;
  commission_rate: number;
  featured: boolean;
  priority_rank: number;
  metadata?: Record<string, unknown>;
  // Enriched fields
  partnerName?: string;
  partnerLogo?: string;
  categoryConfig?: {
    priceUnit: string;
    defaultLeadTime: number;
    requiresDeposit: boolean;
    commissionRate: number;
  };
}

export interface ServiceBooking {
  id: string;
  inventory_id?: string;
  client_id: string;
  partner_id: string;
  service_request_id?: string;
  category: ServiceCategory;
  title: string;
  start_datetime: string;
  end_datetime?: string;
  duration_hours?: number;
  guests: number;
  location?: string;
  base_price?: number;
  extras_price?: number;
  total_amount?: number;
  currency: string;
  deposit_amount?: number;
  deposit_paid: boolean;
  special_requests?: string;
  guest_details?: Record<string, unknown>;
  dietary_requirements?: string[];
  accessibility_needs?: string;
  booking_status: BookingStatus;
  confirmation_number?: string;
  partner_response?: Record<string, unknown>;
  booking_details?: Record<string, unknown>;
  created_at: string;
  // Enriched
  partner?: {
    company_name: string;
    logo_url?: string;
  };
}

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  count: number;
  priceUnit: string;
  defaultLeadTime: number;
  requiresDeposit: boolean;
  commissionRate: number;
}

export interface SearchParams {
  category?: ServiceCategory;
  subcategory?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  partnerId?: string;
  featured?: boolean;
}

export interface BookingParams {
  inventoryId: string;
  startDatetime: string;
  endDatetime?: string;
  durationHours?: number;
  guests?: number;
  location?: string;
  specialRequests?: string;
  guestDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
  dietaryRequirements?: string[];
  accessibilityNeeds?: string;
  bookingDetails?: Record<string, unknown>;
}

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/service-availability`;

export function useServiceAvailability() {
  const [isLoading, setIsLoading] = useState(false);
  const [inventory, setInventory] = useState<ServiceInventory[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [myBookings, setMyBookings] = useState<ServiceBooking[]>([]);
  const [featuredServices, setFeaturedServices] = useState<ServiceInventory[]>([]);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    };
  };

  const searchInventory = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ action: 'search' });
      
      if (params.category) queryParams.set('category', params.category);
      if (params.subcategory) queryParams.set('subcategory', params.subcategory);
      if (params.location) queryParams.set('location', params.location);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      if (params.guests) queryParams.set('guests', String(params.guests));
      if (params.minPrice) queryParams.set('minPrice', String(params.minPrice));
      if (params.maxPrice) queryParams.set('maxPrice', String(params.maxPrice));
      if (params.partnerId) queryParams.set('partnerId', params.partnerId);
      if (params.featured) queryParams.set('featured', 'true');

      const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setInventory(result.data || []);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Search failed';
      console.error('Search error:', error);
      toast({ title: 'Search Error', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}?action=categories`, {
        headers: { 
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setCategories(result.data || []);
      return result.data;
    } catch (error) {
      console.error('Fetch categories error:', error);
      return null;
    }
  }, []);

  const fetchFeatured = useCallback(async (limit = 6) => {
    try {
      const response = await fetch(`${API_BASE}?action=featured&limit=${limit}`, {
        headers: { 
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setFeaturedServices(result.data || []);
      return result.data;
    } catch (error) {
      console.error('Fetch featured error:', error);
      return null;
    }
  }, []);

  const bookService = useCallback(async (params: BookingParams) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      
      if (!headers.Authorization) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to make a booking',
          variant: 'destructive',
        });
        return null;
      }

      const response = await fetch(`${API_BASE}?action=book`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({
        title: 'Booking Submitted',
        description: result.message || 'Your booking request has been submitted',
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Booking failed';
      console.error('Booking error:', error);
      toast({ title: 'Booking Error', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async (category?: ServiceCategory, status?: BookingStatus) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return null;

      const params = new URLSearchParams({ action: 'my-bookings' });
      if (category) params.set('category', category);
      if (status) params.set('status', status);

      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setMyBookings(result.data || []);
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch bookings';
      console.error('Fetch bookings error:', error);
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Partner functions
  const addInventory = useCallback(async (data: Partial<ServiceInventory>) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        return null;
      }

      const response = await fetch(`${API_BASE}?action=inventory`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({ title: 'Success', description: data.id ? 'Inventory updated' : 'Service added' });
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Operation failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyInventory = useCallback(async (category?: ServiceCategory) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return null;

      const params = new URLSearchParams({ action: 'my-inventory' });
      if (category) params.set('category', category);

      const response = await fetch(`${API_BASE}?${params.toString()}`, { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      return result.data;
    } catch (error) {
      console.error('Fetch inventory error:', error);
      return null;
    }
  }, []);

  const deleteInventory = useCallback(async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return false;

      const response = await fetch(`${API_BASE}?action=inventory&id=${id}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({ title: 'Deleted', description: 'Service removed from inventory' });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return false;
    }
  }, []);

  return {
    isLoading,
    inventory,
    categories,
    myBookings,
    featuredServices,
    searchInventory,
    fetchCategories,
    fetchFeatured,
    bookService,
    fetchMyBookings,
    addInventory,
    fetchMyInventory,
    deleteInventory,
  };
}