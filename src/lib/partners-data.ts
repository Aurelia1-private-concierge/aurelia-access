// Partner display data for public-facing pages
import { Plane, Ship, Shield, Truck, Globe, Utensils, Car, Laptop } from "lucide-react";

export interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  specialty: string;
  services: string[];
  regions: string[];
  highlights: string[];
  contactMethod: string;
  icon: typeof Plane;
}

export const partnersData: Partner[] = [
  // Private Aviation
  {
    id: "netjets",
    name: "NetJets",
    category: "Private Aviation",
    description: "The world's largest private jet company, offering fractional ownership, jet cards, and on-demand charter services with the highest standards of safety and service.",
    specialty: "Light to ultra-long-range aircraft",
    services: ["Fractional Ownership", "Jet Cards", "On-Demand Charter", "Aircraft Management"],
    regions: ["Global"],
    highlights: ["4-6 hour minimum lead time", "Dedicated Aurelia desk", "Strategic alliance partner"],
    contactMethod: "Direct API integration",
    icon: Plane,
  },
  {
    id: "vistajet",
    name: "VistaJet",
    category: "Private Aviation",
    description: "Global business aviation company offering access to a fleet of silver and red branded aircraft, known for consistent luxury experience worldwide.",
    specialty: "Global coverage with consistent experience",
    services: ["Subscription Programs", "On-Demand Charter", "Corporate Solutions"],
    regions: ["Global - 187 countries"],
    highlights: ["6-12 hour lead time", "Preferred partner status", "Distinctive silver and red fleet"],
    contactMethod: "Concierge hotline",
    icon: Plane,
  },
  {
    id: "xo",
    name: "XO",
    category: "Private Aviation",
    description: "Revolutionary private aviation platform combining technology with luxury, offering shared flights and exclusive access to empty leg opportunities.",
    specialty: "Empty legs and shared flights",
    services: ["Shared Flights", "Empty Legs", "On-Demand Charter", "Membership Programs"],
    regions: ["North America", "Europe"],
    highlights: ["2-4 hour availability for shared flights", "App integration", "50-75% savings on empty legs"],
    contactMethod: "App or concierge",
    icon: Plane,
  },
  // Yacht Charter
  {
    id: "burgess-yachts",
    name: "Burgess Yachts",
    category: "Yacht Charter",
    description: "Premier superyacht brokerage specializing in the world's finest luxury vessels over 50 meters, with expertise in Mediterranean and Caribbean waters.",
    specialty: "50m+ superyachts",
    services: ["Yacht Charter", "Yacht Sales", "Yacht Management", "New Construction"],
    regions: ["Mediterranean", "Caribbean"],
    highlights: ["48-hour confirmation", "Superyacht specialists", "Premium crew vetting"],
    contactMethod: "Direct broker relationship",
    icon: Ship,
  },
  {
    id: "fraser-yachts",
    name: "Fraser Yachts",
    category: "Yacht Charter",
    description: "Full-service yacht company offering exceptional charter experiences across all vessel sizes, renowned for thorough crew selection and global coverage.",
    specialty: "Full range with excellent crew vetting",
    services: ["Charter", "Sales", "Management", "Crew Placement"],
    regions: ["Global"],
    highlights: ["24-48 hour confirmation", "Rigorous crew standards", "Wide vessel selection"],
    contactMethod: "Direct broker relationship",
    icon: Ship,
  },
  {
    id: "northrop-johnson",
    name: "Northrop & Johnson",
    category: "Yacht Charter",
    description: "Leading yacht brokerage with deep expertise in American and Caribbean waters, offering personalized charter experiences.",
    specialty: "Americas and Caribbean expertise",
    services: ["Charter", "Sales", "Management", "Insurance"],
    regions: ["Americas", "Caribbean"],
    highlights: ["24-hour confirmation", "Americas specialist", "Comprehensive yacht services"],
    contactMethod: "Direct broker relationship",
    icon: Ship,
  },
  // Security & Chauffeur
  {
    id: "velocities",
    name: "Velocities",
    category: "Security & Chauffeur",
    description: "Premium chauffeur and executive protection service offering seamless luxury ground transport with integrated security for discerning clients.",
    specialty: "Seamless luxury ground transport with integrated security",
    services: ["Executive Chauffeur", "Close Protection", "Armored Vehicles", "Event Security"],
    regions: ["Global - Major metropolitan areas"],
    highlights: ["2-hour minimum notice", "Armored and luxury fleet", "Former government/military personnel"],
    contactMethod: "Dedicated concierge line",
    icon: Car,
  },
  // AI Technology
  {
    id: "ontarget-couriers",
    name: "OnTarget Couriers",
    category: "AI Technology",
    description: "AI-optimized premium courier and logistics service offering real-time tracking and predictive delivery windows for luxury goods and secure documents.",
    specialty: "AI-optimized premium logistics",
    services: ["Same-Day Delivery", "Secure Document Transport", "Luxury Goods Handling", "White Glove Service"],
    regions: ["Global Network"],
    highlights: ["1-4 hour metropolitan delivery", "Real-time AI tracking", "Guaranteed discretion"],
    contactMethod: "API integration or concierge",
    icon: Truck,
  },
  {
    id: "ontarget-webdesigns",
    name: "OnTarget WebDesigns",
    category: "AI Technology",
    description: "AI-enhanced bespoke web design agency creating sophisticated digital experiences for luxury brands and discerning individuals.",
    specialty: "AI-enhanced luxury web design",
    services: ["Luxury Brand Websites", "Member Portals", "Digital Experiences", "E-commerce"],
    regions: ["Global - Remote delivery"],
    highlights: ["2-4 week project delivery", "24/7 maintenance available", "AI-driven optimization"],
    contactMethod: "Project consultation",
    icon: Laptop,
  },
  // Hospitality
  {
    id: "aman-resorts",
    name: "Aman Resorts",
    category: "Hospitality",
    description: "Collection of ultra-luxury resorts and hotels in the most remarkable destinations, known for serene privacy and exceptional service.",
    specialty: "Ultra-luxury destination resorts",
    services: ["Luxury Accommodations", "Wellness Programs", "Private Experiences", "Residences"],
    regions: ["Asia", "Europe", "Americas", "Middle East"],
    highlights: ["Room upgrade guaranteed", "Breakfast included", "$100 resort credit"],
    contactMethod: "Direct reservations team",
    icon: Globe,
  },
  {
    id: "four-seasons",
    name: "Four Seasons",
    category: "Hospitality",
    description: "World-renowned luxury hospitality brand offering exceptional accommodations and service across hotels and resorts worldwide.",
    specialty: "Consistent global luxury",
    services: ["Hotels", "Resorts", "Residences", "Private Jet"],
    regions: ["Global - 120+ properties"],
    highlights: ["Preferred Partner benefits", "Early check-in/late checkout", "Complimentary breakfast"],
    contactMethod: "Preferred Partner portal",
    icon: Globe,
  },
  {
    id: "rosewood",
    name: "Rosewood Hotels",
    category: "Hospitality",
    description: "Collection of design-forward luxury properties offering A Sense of Place philosophy with ultra-personalized service.",
    specialty: "Design-forward new properties",
    services: ["Ultra-Luxury Hotels", "Residences", "Spa & Wellness"],
    regions: ["Global"],
    highlights: ["Elite benefits", "New property expertise", "Distinctive design"],
    contactMethod: "Elite reservations",
    icon: Globe,
  },
  // Fine Dining
  {
    id: "private-chef-network",
    name: "Private Chef Network",
    category: "Fine Dining",
    description: "Exclusive network of 50+ private chefs globally, including Michelin-starred talent available for private events and residences.",
    specialty: "Michelin-starred private dining",
    services: ["Private Events", "In-Residence Dining", "Yacht Catering", "Cooking Classes"],
    regions: ["Global"],
    highlights: ["48-72 hour advance booking", "Dietary customization", "Wine pairing available"],
    contactMethod: "Concierge coordination",
    icon: Utensils,
  },
];

export const getPartnerById = (id: string): Partner | undefined => {
  return partnersData.find(p => p.id === id);
};

export const getPartnersByCategory = (category: string): Partner[] => {
  return partnersData.filter(p => p.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(partnersData.map(p => p.category))];
};
