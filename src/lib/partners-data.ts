// Partner display data for public-facing pages
import { Car, Truck, Laptop } from "lucide-react";
import chauffeurLuxuryVideo from "@/assets/chauffeur-luxury.mp4";
import heroVideoExtended from "@/assets/hero-video-extended.mp4";
import demoVisionVideo from "@/assets/demo-vision.mp4";
import bodyguardsTeam from "@/assets/partners/bodyguards-team.jpg";
import chauffeurDriver from "@/assets/partners/chauffeur-driver.jpg";

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
  },
  // Logistics & Removals
  {
    id: "ontarget-couriers",
    name: "OnTarget Couriers",
    category: "Logistics & Removals",
    description: "Premium UK courier, delivery and house removal service with a fleet of Mercedes Sprinters and Luton vans. From urgent same-day deliveries to full home relocations, we handle your possessions with care and precision.",
    specialty: "Premium courier, delivery & house removals",
    services: ["Same-Day Courier", "House Removals", "Office Relocations", "Furniture Delivery", "White Glove Service"],
    regions: ["United Kingdom"],
    highlights: ["Mercedes & Luton van fleet", "Fully insured removals", "Professional packing service"],
    contactMethod: "Concierge booking",
    icon: Truck,
    heroImage: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Your Move. Our Mission.",
    stats: [
      { label: "Delivery Speed", value: "Same Day" },
      { label: "Van Fleet", value: "50+" },
      { label: "UK Coverage", value: "100%" },
      { label: "Client Rating", value: "5.0★" },
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
