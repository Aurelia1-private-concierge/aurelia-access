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
  heroImage: string;
  galleryImages: string[];
  tagline: string;
  stats: { label: string; value: string }[];
}

export const partnersData: Partner[] = [
  // Private Aviation
  {
    id: "netjets",
    name: "NetJets",
    category: "Private Aviation",
    description: "The world's largest private jet company, offering fractional ownership, jet cards, and on-demand charter services with the highest standards of safety and service. With over 750 aircraft, NetJets provides unparalleled access to the skies, ensuring you arrive at your destination in absolute comfort and style.",
    specialty: "Light to ultra-long-range aircraft",
    services: ["Fractional Ownership", "Jet Cards", "On-Demand Charter", "Aircraft Management"],
    regions: ["Global"],
    highlights: ["4-6 hour minimum lead time", "Dedicated Aurelia desk", "Strategic alliance partner"],
    contactMethod: "Direct API integration",
    icon: Plane,
    heroImage: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "The Sky is Yours",
    stats: [
      { label: "Aircraft", value: "750+" },
      { label: "Destinations", value: "5,000+" },
      { label: "Safety Record", value: "Perfect" },
      { label: "Years of Excellence", value: "60+" },
    ],
  },
  {
    id: "vistajet",
    name: "VistaJet",
    category: "Private Aviation",
    description: "Global business aviation company offering access to a fleet of silver and red branded aircraft, known for consistent luxury experience worldwide. VistaJet's distinctive fleet ensures the same exceptional standard whether you're flying from New York to Dubai or Tokyo to London.",
    specialty: "Global coverage with consistent experience",
    services: ["Subscription Programs", "On-Demand Charter", "Corporate Solutions"],
    regions: ["Global - 187 countries"],
    highlights: ["6-12 hour lead time", "Preferred partner status", "Distinctive silver and red fleet"],
    contactMethod: "Concierge hotline",
    icon: Plane,
    heroImage: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Fly. As You Are.",
    stats: [
      { label: "Countries", value: "187" },
      { label: "Fleet Size", value: "70+" },
      { label: "Member Satisfaction", value: "98%" },
      { label: "Average Response", value: "6hrs" },
    ],
  },
  {
    id: "xo",
    name: "XO",
    category: "Private Aviation",
    description: "Revolutionary private aviation platform combining technology with luxury, offering shared flights and exclusive access to empty leg opportunities. XO makes private aviation more accessible without compromising on the exceptional experience you deserve.",
    specialty: "Empty legs and shared flights",
    services: ["Shared Flights", "Empty Legs", "On-Demand Charter", "Membership Programs"],
    regions: ["North America", "Europe"],
    highlights: ["2-4 hour availability for shared flights", "App integration", "50-75% savings on empty legs"],
    contactMethod: "App or concierge",
    icon: Plane,
    heroImage: "https://images.unsplash.com/photo-1559686043-aef1dbc6e6c3?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605776988089-7c8c7a3d6a0f?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Private Aviation, Reimagined",
    stats: [
      { label: "Savings on Empty Legs", value: "75%" },
      { label: "Booking Speed", value: "2hrs" },
      { label: "Annual Flights", value: "25,000+" },
      { label: "App Rating", value: "4.9★" },
    ],
  },
  // Yacht Charter
  {
    id: "burgess-yachts",
    name: "Burgess Yachts",
    category: "Yacht Charter",
    description: "Premier superyacht brokerage specializing in the world's finest luxury vessels over 50 meters, with expertise in Mediterranean and Caribbean waters. Burgess represents an unmatched portfolio of the ocean's most magnificent yachts.",
    specialty: "50m+ superyachts",
    services: ["Yacht Charter", "Yacht Sales", "Yacht Management", "New Construction"],
    regions: ["Mediterranean", "Caribbean"],
    highlights: ["48-hour confirmation", "Superyacht specialists", "Premium crew vetting"],
    contactMethod: "Direct broker relationship",
    icon: Ship,
    heroImage: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605281317010-fe5gy7b1c91d?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583916874088-c2e16f0cf413?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Extraordinary Voyages Await",
    stats: [
      { label: "Superyachts", value: "500+" },
      { label: "Avg. Length", value: "65m" },
      { label: "Crew Excellence", value: "5-Star" },
      { label: "Charter Value", value: "$2B+" },
    ],
  },
  {
    id: "fraser-yachts",
    name: "Fraser Yachts",
    category: "Yacht Charter",
    description: "Full-service yacht company offering exceptional charter experiences across all vessel sizes, renowned for thorough crew selection and global coverage. Fraser's legacy of excellence spans over eight decades of maritime luxury.",
    specialty: "Full range with excellent crew vetting",
    services: ["Charter", "Sales", "Management", "Crew Placement"],
    regions: ["Global"],
    highlights: ["24-48 hour confirmation", "Rigorous crew standards", "Wide vessel selection"],
    contactMethod: "Direct broker relationship",
    icon: Ship,
    heroImage: "https://images.unsplash.com/photo-1554254464-7e35f6525d07?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586972905731-8a2c29a9df7f?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Where Sea Meets Splendor",
    stats: [
      { label: "Heritage", value: "80+ yrs" },
      { label: "Fleet Range", value: "20-150m" },
      { label: "Destinations", value: "Global" },
      { label: "Client Rating", value: "4.9★" },
    ],
  },
  {
    id: "northrop-johnson",
    name: "Northrop & Johnson",
    category: "Yacht Charter",
    description: "Leading yacht brokerage with deep expertise in American and Caribbean waters, offering personalized charter experiences that define maritime excellence.",
    specialty: "Americas and Caribbean expertise",
    services: ["Charter", "Sales", "Management", "Insurance"],
    regions: ["Americas", "Caribbean"],
    highlights: ["24-hour confirmation", "Americas specialist", "Comprehensive yacht services"],
    contactMethod: "Direct broker relationship",
    icon: Ship,
    heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535089780340-34cc939f9996?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Caribbean Elegance",
    stats: [
      { label: "Founded", value: "1949" },
      { label: "Specialists", value: "Americas" },
      { label: "Response", value: "24hrs" },
      { label: "Satisfaction", value: "97%" },
    ],
  },
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
    heroImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=100&auto=format&fit=crop",
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
  // Hospitality
  {
    id: "aman-resorts",
    name: "Aman Resorts",
    category: "Hospitality",
    description: "Collection of ultra-luxury resorts and hotels in the most remarkable destinations, known for serene privacy and exceptional service. Aman creates sanctuaries where tranquility and impeccable design converge.",
    specialty: "Ultra-luxury destination resorts",
    services: ["Luxury Accommodations", "Wellness Programs", "Private Experiences", "Residences"],
    regions: ["Asia", "Europe", "Americas", "Middle East"],
    highlights: ["Room upgrade guaranteed", "Breakfast included", "$100 resort credit"],
    contactMethod: "Direct reservations team",
    icon: Globe,
    heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Peace. Serenity. Aman.",
    stats: [
      { label: "Destinations", value: "35+" },
      { label: "Staff Ratio", value: "4:1" },
      { label: "Avg. Suite Size", value: "200m²" },
      { label: "Michelin Stars", value: "12" },
    ],
  },
  {
    id: "four-seasons",
    name: "Four Seasons",
    category: "Hospitality",
    description: "World-renowned luxury hospitality brand offering exceptional accommodations and service across hotels and resorts worldwide. The gold standard in hospitality excellence.",
    specialty: "Consistent global luxury",
    services: ["Hotels", "Resorts", "Residences", "Private Jet"],
    regions: ["Global - 120+ properties"],
    highlights: ["Preferred Partner benefits", "Early check-in/late checkout", "Complimentary breakfast"],
    contactMethod: "Preferred Partner portal",
    icon: Globe,
    heroImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Luxury Is Our Service",
    stats: [
      { label: "Properties", value: "120+" },
      { label: "Countries", value: "50+" },
      { label: "Forbes Stars", value: "5-Star" },
      { label: "Legacy", value: "60+ yrs" },
    ],
  },
  {
    id: "rosewood",
    name: "Rosewood Hotels",
    category: "Hospitality",
    description: "Collection of design-forward luxury properties offering A Sense of Place philosophy with ultra-personalized service. Each Rosewood property is a masterpiece reflecting its unique locale.",
    specialty: "Design-forward new properties",
    services: ["Ultra-Luxury Hotels", "Residences", "Spa & Wellness"],
    regions: ["Global"],
    highlights: ["Elite benefits", "New property expertise", "Distinctive design"],
    contactMethod: "Elite reservations",
    icon: Globe,
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "A Sense of Place",
    stats: [
      { label: "Destinations", value: "30+" },
      { label: "Design Awards", value: "100+" },
      { label: "Spa Excellence", value: "World Class" },
      { label: "Experience", value: "Bespoke" },
    ],
  },
  // Fine Dining
  {
    id: "private-chef-network",
    name: "Private Chef Network",
    category: "Fine Dining",
    description: "Exclusive network of 50+ private chefs globally, including Michelin-starred talent available for private events and residences. Culinary artistry delivered to your doorstep.",
    specialty: "Michelin-starred private dining",
    services: ["Private Events", "In-Residence Dining", "Yacht Catering", "Cooking Classes"],
    regions: ["Global"],
    highlights: ["48-72 hour advance booking", "Dietary customization", "Wine pairing available"],
    contactMethod: "Concierge coordination",
    icon: Utensils,
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=3840&q=100&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=100&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&q=100&auto=format&fit=crop",
    ],
    tagline: "Culinary Excellence, Curated",
    stats: [
      { label: "Michelin Chefs", value: "50+" },
      { label: "Cuisines", value: "25+" },
      { label: "Countries", value: "Global" },
      { label: "Events Annually", value: "5,000+" },
    ],
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
