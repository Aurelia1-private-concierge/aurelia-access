export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
  productIds: string[];
  features: string[];
  highlighted?: boolean;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "silver",
    name: "Silver",
    description: "Essential luxury concierge access with 24/7 support",
    monthlyPrice: 1500,
    annualPrice: 14400,
    monthlyPriceId: "price_1SnP8AArqEFrL3mlSSDHZRBj",
    annualPriceId: "price_1SnP8QArqEFrL3mldq1NgplE",
    productIds: ["prod_TkuyLghfj6iAvD", "prod_TkuyMbYydw2D3z"],
    features: [
      "24/7 Concierge Support",
      "Travel Planning Assistance",
      "Restaurant Reservations",
      "Event Ticket Access",
      "Orla AI Companion",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    description: "Premium luxury concierge with priority access and dedicated manager",
    monthlyPrice: 3500,
    annualPrice: 33600,
    monthlyPriceId: "price_1SnP8gArqEFrL3mliI4kupIo",
    annualPriceId: "price_1SnP90ArqEFrL3ml1MWEs2Qt",
    productIds: ["prod_TkuyEsqqaYVkqj", "prod_Tkuy4Hr5m0YSCZ"],
    features: [
      "Everything in Silver, plus:",
      "Dedicated Account Manager",
      "Priority Response Times",
      "Private Aviation Booking",
      "Yacht Charter Access",
      "VIP Event Invitations",
    ],
    highlighted: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    description: "Ultimate luxury experience with unlimited access and white-glove service",
    monthlyPrice: 7500,
    annualPrice: 72000,
    monthlyPriceId: "price_1SnP9JArqEFrL3mlwquYSICP",
    annualPriceId: "price_1SnPBAArqEFrL3mlqNp6J9yf",
    productIds: ["prod_TkuzCZQ1Wyg24N", "prod_Tkv18can27J3JZ"],
    features: [
      "Everything in Gold, plus:",
      "24/7 Personal Lifestyle Manager",
      "Unlimited Concierge Requests",
      "Global Property Access",
      "Art & Collectibles Advisory",
      "Family Office Integration",
      "Bespoke Experience Curation",
    ],
  },
];

export const getTierByProductId = (productId: string): MembershipTier | undefined => {
  return MEMBERSHIP_TIERS.find((tier) => tier.productIds.includes(productId));
};

export const getTierById = (tierId: string): MembershipTier | undefined => {
  return MEMBERSHIP_TIERS.find((tier) => tier.id === tierId);
};
