import { 
  Plane, Ship, Hotel, UtensilsCrossed, Calendar, Shield, 
  Heart, Car, Home, ShoppingBag, Palette, Cpu, LucideIcon
} from 'lucide-react';

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

export interface CategoryConfig {
  id: ServiceCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  priceUnit: string;
  priceUnitLabel: string;
  defaultLeadTime: number;
  requiresDeposit: boolean;
  commissionRate: number;
  subcategories: string[];
  specifications: string[];
  color: string;
}

export const SERVICE_CATEGORIES: Record<ServiceCategory, CategoryConfig> = {
  aviation: {
    id: 'aviation',
    name: 'Private Aviation',
    description: 'Charter flights, jet cards, and helicopter services',
    icon: Plane,
    priceUnit: 'per_flight',
    priceUnitLabel: '/flight',
    defaultLeadTime: 48,
    requiresDeposit: true,
    commissionRate: 12,
    subcategories: ['Heavy Jet', 'Super Mid', 'Light Jet', 'Turboprop', 'Helicopter'],
    specifications: ['Aircraft Type', 'Range', 'Passengers', 'Luggage Capacity', 'WiFi', 'Catering'],
    color: 'from-sky-500 to-blue-600',
  },
  yacht: {
    id: 'yacht',
    name: 'Yacht Charter',
    description: 'Motor yachts, sailing vessels, and superyachts',
    icon: Ship,
    priceUnit: 'per_day',
    priceUnitLabel: '/day',
    defaultLeadTime: 72,
    requiresDeposit: true,
    commissionRate: 15,
    subcategories: ['Motor Yacht', 'Sailing Yacht', 'Superyacht', 'Catamaran', 'Gulet'],
    specifications: ['Length', 'Cabins', 'Crew', 'Cruising Speed', 'Built Year', 'Builder'],
    color: 'from-cyan-500 to-teal-600',
  },
  hospitality: {
    id: 'hospitality',
    name: 'Luxury Hotels',
    description: 'Five-star hotels, villas, and private residences',
    icon: Hotel,
    priceUnit: 'per_night',
    priceUnitLabel: '/night',
    defaultLeadTime: 24,
    requiresDeposit: true,
    commissionRate: 15,
    subcategories: ['Palace Hotel', 'Boutique Hotel', 'Resort', 'Private Villa', 'Penthouse'],
    specifications: ['Room Type', 'Size', 'View', 'Beds', 'Butler Service', 'Club Access'],
    color: 'from-amber-500 to-orange-600',
  },
  dining: {
    id: 'dining',
    name: 'Private Dining',
    description: 'Michelin-star restaurants and private chef experiences',
    icon: UtensilsCrossed,
    priceUnit: 'per_person',
    priceUnitLabel: '/person',
    defaultLeadTime: 24,
    requiresDeposit: false,
    commissionRate: 10,
    subcategories: ['Fine Dining', 'Private Chef', 'Wine Pairing', 'Omakase', 'Pop-up Experience'],
    specifications: ['Cuisine', 'Michelin Stars', 'Courses', 'Dietary Options', 'Wine Pairing'],
    color: 'from-rose-500 to-red-600',
  },
  events: {
    id: 'events',
    name: 'Exclusive Events',
    description: 'VIP access, galas, and private concerts',
    icon: Calendar,
    priceUnit: 'per_service',
    priceUnitLabel: '',
    defaultLeadTime: 168,
    requiresDeposit: true,
    commissionRate: 15,
    subcategories: ['Fashion Week', 'Film Festival', 'Sports Event', 'Concert', 'Art Fair', 'Private Party'],
    specifications: ['Event Type', 'Access Level', 'Includes', 'Dress Code', 'Duration'],
    color: 'from-violet-500 to-purple-600',
  },
  security: {
    id: 'security',
    name: 'Security Services',
    description: 'Executive protection and secure transportation',
    icon: Shield,
    priceUnit: 'per_day',
    priceUnitLabel: '/day',
    defaultLeadTime: 24,
    requiresDeposit: false,
    commissionRate: 20,
    subcategories: ['Executive Protection', 'Chauffeur', 'Travel Security', 'Event Security', 'Residential'],
    specifications: ['Team Size', 'Languages', 'Vehicle Type', 'Armed/Unarmed', 'Experience'],
    color: 'from-slate-500 to-gray-700',
  },
  wellness: {
    id: 'wellness',
    name: 'Wellness & Spa',
    description: 'World-class spas, retreats, and wellness programs',
    icon: Heart,
    priceUnit: 'per_session',
    priceUnitLabel: '/session',
    defaultLeadTime: 24,
    requiresDeposit: false,
    commissionRate: 15,
    subcategories: ['Spa Treatment', 'Wellness Retreat', 'Medical Spa', 'Fitness', 'Mental Wellness'],
    specifications: ['Treatment Type', 'Duration', 'Therapist', 'Products Used', 'Package'],
    color: 'from-pink-500 to-rose-600',
  },
  automotive: {
    id: 'automotive',
    name: 'Luxury Automotive',
    description: 'Exotic car rentals, classic cars, and driving experiences',
    icon: Car,
    priceUnit: 'per_day',
    priceUnitLabel: '/day',
    defaultLeadTime: 24,
    requiresDeposit: true,
    commissionRate: 12,
    subcategories: ['Supercar', 'Classic Car', 'SUV', 'Limousine', 'Electric', 'Racing Experience'],
    specifications: ['Make', 'Model', 'Year', 'Engine', 'Transmission', 'Mileage Limit'],
    color: 'from-red-500 to-orange-600',
  },
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Luxury property acquisition and rental services',
    icon: Home,
    priceUnit: 'per_service',
    priceUnitLabel: '',
    defaultLeadTime: 48,
    requiresDeposit: false,
    commissionRate: 3,
    subcategories: ['Purchase', 'Seasonal Rental', 'Long-term Rental', 'Investment', 'Property Management'],
    specifications: ['Property Type', 'Size', 'Bedrooms', 'Location', 'View', 'Amenities'],
    color: 'from-emerald-500 to-green-600',
  },
  shopping: {
    id: 'shopping',
    name: 'Personal Shopping',
    description: 'Bespoke shopping experiences and rare acquisitions',
    icon: ShoppingBag,
    priceUnit: 'per_service',
    priceUnitLabel: '',
    defaultLeadTime: 24,
    requiresDeposit: false,
    commissionRate: 8,
    subcategories: ['Fashion', 'Jewelry', 'Watches', 'Rare Items', 'Custom Orders', 'Wardrobe Styling'],
    specifications: ['Category', 'Brands', 'Budget Range', 'Style Preference', 'Size'],
    color: 'from-fuchsia-500 to-pink-600',
  },
  art_collectibles: {
    id: 'art_collectibles',
    name: 'Art & Collectibles',
    description: 'Fine art acquisition, auctions, and collection management',
    icon: Palette,
    priceUnit: 'per_service',
    priceUnitLabel: '',
    defaultLeadTime: 48,
    requiresDeposit: false,
    commissionRate: 5,
    subcategories: ['Contemporary Art', 'Classic Art', 'Photography', 'Sculpture', 'Wine Collection', 'Rare Books'],
    specifications: ['Artist', 'Period', 'Medium', 'Provenance', 'Authentication', 'Insurance'],
    color: 'from-indigo-500 to-blue-600',
  },
  technology: {
    id: 'technology',
    name: 'Technology',
    description: 'Smart home, cybersecurity, and tech concierge services',
    icon: Cpu,
    priceUnit: 'per_service',
    priceUnitLabel: '',
    defaultLeadTime: 24,
    requiresDeposit: false,
    commissionRate: 10,
    subcategories: ['Smart Home', 'Cybersecurity', 'Tech Setup', 'Digital Privacy', 'AI Assistants'],
    specifications: ['Service Type', 'Coverage', 'Support Level', 'Integration', 'Training'],
    color: 'from-cyan-500 to-blue-600',
  },
};

export const getCategoryConfig = (category: ServiceCategory): CategoryConfig => {
  return SERVICE_CATEGORIES[category];
};

export const getAllCategories = (): CategoryConfig[] => {
  return Object.values(SERVICE_CATEGORIES);
};

export const getCategoryIcon = (category: ServiceCategory): LucideIcon => {
  return SERVICE_CATEGORIES[category].icon;
};