export interface SiteTemplate {
  id: string;
  name: string;
  category: "personal" | "event" | "venture" | "family-office";
  description: string;
  previewImage?: string;
  minTier: "gold" | "platinum";
  defaultBlocks: SiteBlock[];
}

export interface SiteBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
}

export type BlockType = 
  | "hero"
  | "bio"
  | "story"
  | "mission"
  | "achievements"
  | "gallery"
  | "initiatives"
  | "impact"
  | "contact"
  | "rsvp"
  | "event-details"
  | "guestbook"
  | "philosophy"
  | "portfolio"
  | "team"
  | "problem"
  | "solution"
  | "expertise"
  | "boards"
  | "publications"
  | "history"
  | "values"
  | "generations"
  | "announcements"
  | "documents"
  | "calendar"
  | "directory"
  | "overview"
  | "timeline"
  | "details";

export interface SiteBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export const DEFAULT_BRANDING: SiteBranding = {
  primaryColor: "#1a1a2e",
  secondaryColor: "#c9a962",
  accentColor: "#e8d5a3",
  fontHeading: "Playfair Display",
  fontBody: "Inter",
};

export const TEMPLATE_CATEGORIES = [
  { id: "personal", name: "Personal Branding", description: "Executive profiles and personal showcases" },
  { id: "event", name: "Event Microsites", description: "Celebrations, invitations, and experience journals" },
  { id: "venture", name: "Venture Showcase", description: "Investment portfolios and startup launches" },
  { id: "family-office", name: "Family Office", description: "Legacy sites and private portals" },
] as const;

export const BLOCK_CONFIGS: Record<BlockType, { name: string; description: string; icon: string }> = {
  hero: { name: "Hero Section", description: "Main headline with background", icon: "Layout" },
  bio: { name: "Biography", description: "Personal or company story", icon: "User" },
  story: { name: "Story Block", description: "Narrative content section", icon: "BookOpen" },
  mission: { name: "Mission Statement", description: "Purpose and vision", icon: "Target" },
  achievements: { name: "Achievements", description: "Awards and milestones", icon: "Award" },
  gallery: { name: "Gallery", description: "Image and media showcase", icon: "Image" },
  initiatives: { name: "Initiatives", description: "Projects and programs", icon: "Rocket" },
  impact: { name: "Impact Stats", description: "Key metrics and numbers", icon: "TrendingUp" },
  contact: { name: "Contact", description: "Contact information", icon: "Mail" },
  rsvp: { name: "RSVP Form", description: "Event response collection", icon: "CheckSquare" },
  "event-details": { name: "Event Details", description: "Date, location, dress code", icon: "Calendar" },
  guestbook: { name: "Guestbook", description: "Visitor messages", icon: "MessageSquare" },
  philosophy: { name: "Philosophy", description: "Investment or business philosophy", icon: "Lightbulb" },
  portfolio: { name: "Portfolio", description: "Holdings and investments", icon: "Briefcase" },
  team: { name: "Team", description: "Team members and leadership", icon: "Users" },
  problem: { name: "Problem", description: "Challenge being addressed", icon: "AlertCircle" },
  solution: { name: "Solution", description: "How you solve it", icon: "CheckCircle" },
  expertise: { name: "Expertise", description: "Areas of specialization", icon: "Star" },
  boards: { name: "Board Positions", description: "Advisory and board roles", icon: "Building" },
  publications: { name: "Publications", description: "Articles and media", icon: "FileText" },
  history: { name: "History Timeline", description: "Historical milestones", icon: "Clock" },
  values: { name: "Values", description: "Core principles", icon: "Heart" },
  generations: { name: "Generations", description: "Family members across generations", icon: "Users" },
  announcements: { name: "Announcements", description: "News and updates", icon: "Bell" },
  documents: { name: "Documents", description: "Secure document storage", icon: "Folder" },
  calendar: { name: "Calendar", description: "Upcoming events", icon: "Calendar" },
  directory: { name: "Directory", description: "Contact directory", icon: "Book" },
  overview: { name: "Overview", description: "Summary section", icon: "FileText" },
  timeline: { name: "Timeline", description: "Chronological events", icon: "GitBranch" },
  details: { name: "Details", description: "Additional information", icon: "Info" },
};

export const TIER_LIMITS = {
  gold: {
    maxSites: 1,
    maxAiWords: 500,
    customDomain: false,
    whiteGlove: false,
    fullDesignAccess: false,
  },
  platinum: {
    maxSites: 5,
    maxAiWords: -1, // Unlimited
    customDomain: true,
    whiteGlove: true,
    fullDesignAccess: true,
  },
} as const;

export const LUXURY_FONTS = {
  heading: [
    { name: "Playfair Display", value: "Playfair Display" },
    { name: "Cormorant Garamond", value: "Cormorant Garamond" },
    { name: "Libre Baskerville", value: "Libre Baskerville" },
    { name: "Cinzel", value: "Cinzel" },
    { name: "Marcellus", value: "Marcellus" },
  ],
  body: [
    { name: "Inter", value: "Inter" },
    { name: "Lato", value: "Lato" },
    { name: "Source Sans Pro", value: "Source Sans Pro" },
    { name: "Open Sans", value: "Open Sans" },
    { name: "Raleway", value: "Raleway" },
  ],
};

export const LUXURY_PALETTES = [
  { name: "Midnight Gold", primary: "#1a1a2e", secondary: "#c9a962", accent: "#e8d5a3" },
  { name: "Champagne", primary: "#2d2926", secondary: "#d4af37", accent: "#f5e6c4" },
  { name: "Onyx Pearl", primary: "#0d0d0d", secondary: "#f5f5f5", accent: "#a0a0a0" },
  { name: "Bordeaux", primary: "#4a0e0e", secondary: "#c9a962", accent: "#e8d5a3" },
  { name: "Emerald Society", primary: "#0a3d2f", secondary: "#c9a962", accent: "#d4e4dc" },
  { name: "Royal Navy", primary: "#0a1628", secondary: "#c9a962", accent: "#d4dce8" },
];
