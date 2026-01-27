export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  productIds: string[];
  features: string[];
  highlighted?: boolean;
  monthlyCredits: number;
  isUnlimited?: boolean;
  isPaygo?: boolean;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "paygo",
    name: "Pay As You Go",
    description: "No commitment. Purchase credits as needed.",
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceId: null,
    annualPriceId: null,
    productIds: [],
    monthlyCredits: 0,
    isPaygo: true,
    features: [
      "No monthly fee",
      "Purchase credits anytime",
      "Access to all services",
      "Orla AI Companion",
      "Standard response times",
      "Credits never expire",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    description: "Essential luxury concierge access with 24/7 support",
    monthlyPrice: 1500,
    annualPrice: 14400,
    monthlyPriceId: "price_1SuL7CPPYSzPwBucJVUSr1Au",
    annualPriceId: "price_1SuL81PPYSzPwBucOvBlox3T",
    productIds: ["prod_Ts5HAYiH4FXdPJ", "prod_Ts5IziHQ8aBVBk"],
    monthlyCredits: 5,
    features: [
      "5 Service Credits/month",
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
    monthlyPriceId: "price_1SuL8XPPYSzPwBucrVLQJdYt",
    annualPriceId: "price_1SuL95PPYSzPwBuc0pDb4hQH",
    productIds: ["prod_Ts5J8xal3xrVGe", "prod_Ts5JJ4lhh13l9m"],
    monthlyCredits: 15,
    features: [
      "15 Service Credits/month",
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
    monthlyPriceId: "price_1SuLAGPPYSzPwBucsVucbQIJ",
    annualPriceId: "price_1SuLAGPPYSzPwBucsVucbQIJ",
    productIds: ["prod_Ts5KqzhPH0Zbto", "prod_Ts5K3NqvPvE4BO"],
    monthlyCredits: 999,
    isUnlimited: true,
    features: [
      "Unlimited Service Credits",
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

export const getCreditsByTier = (tierId: string): number => {
  const tier = getTierById(tierId);
  return tier?.monthlyCredits ?? 0;
};

export const isUnlimitedTier = (tierId: string): boolean => {
  const tier = getTierById(tierId);
  return tier?.isUnlimited ?? false;
};
