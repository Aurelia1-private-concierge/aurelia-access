// Partner display data for public-facing pages
import { Car, Truck, Laptop } from "lucide-react";
import chauffeurLuxuryVideo from "@/assets/chauffeur-luxury.mp4";
import heroVideoExtended from "@/assets/hero-video-extended.mp4";
import demoVisionVideo from "@/assets/demo-vision.mp4";

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
}

export const partnersData: Partner[] = [
  // Security & Chauffeur
  {
    id: "velocities",
    name: "Velocities",
    category: "Security & Chauffeur",
    description: "Premium chauffeur and executive protection service offering seamless luxury ground transport with integrated security for discerning clients. Our elite team ensures your journey is as secure as it is sophisticated.",
    specialty: "Seamless luxury ground transport with integrated security",
    services: ["Executive Chauffeur", "Close Protection", "Armored Vehicles", "Event Security"],
    regions: ["Global - Major metropolitan areas"],
    highlights: ["2-hour minimum notice", "Armored and luxury fleet", "Former government/military personnel"],
    contactMethod: "Dedicated concierge line",
    icon: Car,
    heroImage: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=3840&q=100&auto=format&fit=crop",
    heroVideo: chauffeurLuxuryVideo,
    galleryImages: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Arrive in Absolute Security",
    stats: [
      { label: "Response Time", value: "2hrs" },
      { label: "Fleet Vehicles", value: "500+" },
      { label: "Cities Covered", value: "150+" },
      { label: "Zero Incidents", value: "100%" },
    ],
  },
  // AI Technology
  {
    id: "ontarget-couriers",
    name: "OnTarget Couriers",
    category: "AI Technology",
    description: "AI-optimized premium courier and logistics service offering real-time tracking and predictive delivery windows for luxury goods and secure documents. Precision meets discretion.",
    specialty: "AI-optimized premium logistics",
    services: ["Same-Day Delivery", "Secure Document Transport", "Luxury Goods Handling", "White Glove Service"],
    regions: ["Global Network"],
    highlights: ["1-4 hour metropolitan delivery", "Real-time AI tracking", "Guaranteed discretion"],
    contactMethod: "API integration or concierge",
    icon: Truck,
    heroImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=3840&q=100&auto=format&fit=crop",
    heroVideo: heroVideoExtended,
    galleryImages: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Precision. Discretion. Delivered.",
    stats: [
      { label: "Delivery Speed", value: "1-4hrs" },
      { label: "AI Accuracy", value: "99.9%" },
      { label: "Global Reach", value: "200+" },
      { label: "Secure Handling", value: "100%" },
    ],
  },
  {
    id: "ontarget-webdesigns",
    name: "OnTarget WebDesigns",
    category: "AI Technology",
    description: "AI-enhanced bespoke web design agency creating sophisticated digital experiences for luxury brands and discerning individuals. Where technology meets artistry.",
    specialty: "AI-enhanced luxury web design",
    services: ["Luxury Brand Websites", "Member Portals", "Digital Experiences", "E-commerce"],
    regions: ["Global - Remote delivery"],
    highlights: ["2-4 week project delivery", "24/7 maintenance available", "AI-driven optimization"],
    contactMethod: "Project consultation",
    icon: Laptop,
    heroImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=3840&q=100&auto=format&fit=crop",
    heroVideo: demoVisionVideo,
    galleryImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Digital Excellence Elevated",
    stats: [
      { label: "Delivery", value: "2-4wks" },
      { label: "AI Enhanced", value: "100%" },
      { label: "Client Rating", value: "5.0★" },
      { label: "Uptime", value: "99.99%" },
    ],
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
