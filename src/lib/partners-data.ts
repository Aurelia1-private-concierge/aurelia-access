// Partner display data for public-facing pages
// Enhanced with SEO-optimized content and marketing keywords
import { Car, Truck, Laptop } from "lucide-react";
import chauffeurLuxuryVideo from "@/assets/chauffeur-luxury.mp4";
import demoVisionVideo from "@/assets/demo-vision.mp4";
import bodyguardsTeam from "@/assets/partners/bodyguards-team.jpg";
import chauffeurDriver from "@/assets/partners/chauffeur-driver.jpg";
import ontargetDeliveryVideo from "@/assets/ontarget-delivery.mp4";
import homeRelocation from "@/assets/partners/home-relocation.jpg";
import parcelDelivery from "@/assets/partners/parcel-delivery.jpg";
import vanInterior from "@/assets/partners/van-interior.jpg";
import deliveryFleet from "@/assets/partners/delivery-fleet.jpg";

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
  icon: typeof Car;
  heroImage: string;
  heroVideo?: string;
  galleryImages: string[];
  tagline: string;
  stats: { label: string; value: string }[];
  // Enhanced marketing fields
  marketingKeywords?: string[];
  uniqueSellingPoints?: string[];
  testimonialQuote?: string;
  certifications?: string[];
}

export const partnersData: Partner[] = [
  // Security & Chauffeur
  {
    id: "velocities",
    name: "Velocities",
    category: "Security & Chauffeur",
    description: "Premium chauffeur and executive protection service offering seamless luxury ground transport with integrated security for discerning clients. Our elite team of former government and military personnel ensures your journey is as secure as it is sophisticated. Available 24/7 across 150+ cities worldwide with a fleet of armored and luxury vehicles.",
    specialty: "Seamless luxury ground transport with integrated executive security",
    services: [
      "Executive Chauffeur Services", 
      "Close Protection Officers", 
      "Armored Vehicle Transport", 
      "Event Security Coordination",
      "Airport VIP Meet & Greet",
      "Secure Corporate Transport"
    ],
    regions: ["Global - 150+ Major Metropolitan Areas", "Priority: London, New York, Dubai, Singapore, Monaco"],
    highlights: [
      "2-hour rapid response availability",
      "Fleet of 500+ armored and luxury vehicles",
      "Former government & military personnel",
      "Multi-lingual security specialists",
      "Real-time GPS tracking & coordination"
    ],
    contactMethod: "Dedicated 24/7 concierge line",
    icon: Car,
    heroImage: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=3840&q=100&auto=format&fit=crop",
    heroVideo: chauffeurLuxuryVideo,
    galleryImages: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&q=100&auto=format&fit=crop",
      bodyguardsTeam,
      chauffeurDriver,
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Arrive in Absolute Security",
    stats: [
      { label: "Response Time", value: "2hrs" },
      { label: "Fleet Vehicles", value: "500+" },
      { label: "Cities Covered", value: "150+" },
      { label: "Zero Incidents", value: "100%" },
    ],
    marketingKeywords: ["luxury chauffeur", "executive protection", "VIP security", "armored transport"],
    uniqueSellingPoints: [
      "Only provider with 100% incident-free record",
      "Exclusive Aurelia priority booking",
      "Discreet celebrity & UHNW specialist"
    ],
    certifications: ["SIA Licensed", "ISO 27001", "PCI Compliant"]
  },
  // Logistics & Removals
  {
    id: "ontarget-couriers",
    name: "OnTarget Couriers",
    category: "Logistics & Removals",
    description: "Premium UK courier, delivery and house removal service with a fleet of Mercedes Sprinters and Luton vans. From urgent same-day deliveries to full home relocations, we handle your possessions with white glove care and precision. Fully insured, GPS-tracked, and committed to exceeding expectations on every job.",
    specialty: "Premium courier, same-day delivery & luxury house removals across the UK",
    services: [
      "Same-Day Express Courier", 
      "Luxury House Removals", 
      "Corporate Office Relocations", 
      "Premium Furniture Delivery", 
      "White Glove Handling Service",
      "Art & Antique Transport",
      "Storage Solutions"
    ],
    regions: ["United Kingdom - 100% Coverage", "Priority: London, Manchester, Birmingham, Edinburgh"],
    highlights: [
      "Mercedes Sprinter & Luton van fleet",
      "Fully insured up to £50,000 per item",
      "Professional packing & assembly service",
      "Real-time GPS tracking for all deliveries",
      "Uniformed, vetted professional team"
    ],
    contactMethod: "Priority Aurelia booking portal",
    icon: Truck,
    heroImage: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=3840&q=100&auto=format&fit=crop",
    heroVideo: ontargetDeliveryVideo,
    galleryImages: [
      homeRelocation,
      parcelDelivery,
      vanInterior,
      deliveryFleet,
    ],
    tagline: "Your Move. Our Mission.",
    stats: [
      { label: "Delivery Speed", value: "Same Day" },
      { label: "Van Fleet", value: "50+" },
      { label: "UK Coverage", value: "100%" },
      { label: "Client Rating", value: "5.0★" },
    ],
    marketingKeywords: ["same day courier UK", "premium house removals", "white glove delivery", "luxury movers"],
    uniqueSellingPoints: [
      "Only courier with 5-star Aurelia rating",
      "Specialist in high-value & fragile items",
      "Carbon-neutral delivery options"
    ],
    certifications: ["Trading Standards Approved", "ICO Registered", "Goods in Transit Insurance"]
  },
  {
    id: "ontarget-webdesigns",
    name: "OnTarget WebDesigns",
    category: "AI Technology",
    description: "AI-enhanced bespoke web design agency creating sophisticated digital experiences for luxury brands and discerning individuals. We combine cutting-edge AI optimization with artisanal design craftsmanship to deliver websites that captivate, convert, and elevate your digital presence. From exclusive member portals to luxury e-commerce platforms.",
    specialty: "AI-enhanced luxury web design & bespoke digital experiences",
    services: [
      "Luxury Brand Website Design", 
      "Private Member Portals", 
      "Immersive Digital Experiences", 
      "Luxury E-commerce Platforms",
      "AI-Powered Optimization",
      "24/7 Maintenance & Support"
    ],
    regions: ["Global - Remote Delivery", "On-site consultations: London, Dubai, New York"],
    highlights: [
      "2-4 week project delivery timeline",
      "24/7 priority maintenance available",
      "AI-driven conversion optimization",
      "Bespoke design, never templates",
      "99.99% uptime guarantee"
    ],
    contactMethod: "Exclusive project consultation",
    icon: Laptop,
    heroImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=3840&q=100&auto=format&fit=crop",
    heroVideo: demoVisionVideo,
    galleryImages: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Digital Excellence Elevated",
    stats: [
      { label: "Delivery", value: "2-4wks" },
      { label: "AI Enhanced", value: "100%" },
      { label: "Client Rating", value: "5.0★" },
      { label: "Uptime", value: "99.99%" },
    ],
    marketingKeywords: ["luxury web design", "AI website", "bespoke digital agency", "UHNW websites"],
    uniqueSellingPoints: [
      "Exclusive Aurelia digital partner",
      "AI-first development approach",
      "Luxury brand specialists since 2015"
    ],
    certifications: ["Google Partner", "ISO 27001", "GDPR Compliant"]
  },
];

// Helper function to get partner by ID
export const getPartnerById = (id: string): Partner | undefined => {
  return partnersData.find(partner => partner.id === id);
};

// Get partners by category
export const getPartnersByCategory = (category: string): Partner[] => {
  return partnersData.filter(partner => partner.category === category);
};

// Get all unique categories
export const getCategories = (): string[] => {
  return [...new Set(partnersData.map(partner => partner.category))];
};

// Get all partners for sitemap
export const getAllPartnerIds = (): string[] => {
  return partnersData.map(partner => partner.id);
};

// Search partners by keyword
export const searchPartners = (keyword: string): Partner[] => {
  const lowerKeyword = keyword.toLowerCase();
  return partnersData.filter(partner => 
    partner.name.toLowerCase().includes(lowerKeyword) ||
    partner.category.toLowerCase().includes(lowerKeyword) ||
    partner.description.toLowerCase().includes(lowerKeyword) ||
    partner.services.some(s => s.toLowerCase().includes(lowerKeyword)) ||
    partner.marketingKeywords?.some(k => k.toLowerCase().includes(lowerKeyword))
  );
};
