// Brand Assets Management
// Centralized exports for consistent branding across the app

export { Logo, LogoIcon, LogoWordmark, default as BrandLogo } from "./Logo";
export { default as AnimatedLogo } from "./AnimatedLogo";

// Brand Constants
export const BRAND = {
  name: "AURELIA",
  tagline: "Engineered for sovereignty, curated for legacy.",
  description: "The world's most exclusive private concierge for those who demand the extraordinary.",
  entity: "Ontarget webdesigns.",
  email: "concierge@aurelia-privateconcierge.com",
  locations: ["London", "Geneva", "Singapore"],
  year: 2026,
  legal: {
    copyright: "All rights reserved. Unauthorized reproduction prohibited.",
    trademark: "AURELIA® is a registered trademark of Aurelia Holdings Ltd.",
    jurisdiction: "Registered in the United Kingdom. All disputes subject to London jurisdiction.",
  },
  copy: {
    heroTagline: "Where impossibility becomes itinerary.",
    valueProposition: "Access the inaccessible. Experience the unimaginable. Own the extraordinary.",
    exclusivity: "Membership by invitation only. Vetted. Verified. Uncompromising.",
    trust: "Trusted by sovereigns, industrialists, and the world's most discerning families.",
    privacy: "Your privacy is sacrosanct. We operate with Swiss-bank discretion.",
    service: "One request. Any desire. Anywhere on Earth.",
    orla: "Meet Orla—your AI confidante who anticipates needs before you voice them.",
    security: "Fortress-grade security. AAA+ rated. Bank-level encryption.",
  },
} as const;
