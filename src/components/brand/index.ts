// Brand Assets Management
// Centralized exports for consistent branding across the app

export { Logo, LogoIcon, LogoWordmark, default as BrandLogo } from "./Logo";

// Brand Constants
export const BRAND = {
  name: "AURELIA",
  tagline: "Engineered for sovereignty, curated for legacy.",
  description: "The world's most exclusive concierge service.",
  entity: "Aurelia Holdings Ltd.",
  email: "liaison@aurelia.com",
  locations: ["Geneva", "London", "Singapore"],
  year: 2024,
} as const;
