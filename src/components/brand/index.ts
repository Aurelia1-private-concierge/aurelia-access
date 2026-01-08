// Brand Assets Management
// Centralized exports for consistent branding across the app

export { Logo, LogoIcon, LogoWordmark, default as BrandLogo } from "./Logo";
export { default as AnimatedLogo } from "./AnimatedLogo";

// Brand Constants
export const BRAND = {
  name: "AURELIA",
  tagline: "Engineered for sovereignty, curated for legacy.",
  description: "The world's most exclusive concierge service.",
  entity: "Aurelia Holdings Ltd.",
  email: "concierge@aurelia-privateconcierge.com",
  locations: ["Geneva", "London", "Singapore"],
  year: 2026,
  legal: {
    copyright: "All rights reserved. Unauthorized reproduction prohibited.",
    trademark: "AURELIA® is a registered trademark of Aurelia Holdings Ltd.",
    jurisdiction: "Registered in Switzerland. All disputes subject to Geneva jurisdiction.",
  },
} as const;
