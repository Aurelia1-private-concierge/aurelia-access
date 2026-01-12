// Email Nurture Sequence Configuration for Aurelia
// Last updated: January 2026

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  delayDays: number;
  category: 'welcome' | 'education' | 'social_proof' | 'conversion' | 'reengagement';
  content: {
    headline: string;
    body: string;
    cta: string;
    ctaUrl: string;
  };
}

// 7-email drip campaign for waitlist signups
export const WAITLIST_NURTURE_SEQUENCE: EmailTemplate[] = [
  {
    id: "welcome-1",
    name: "Welcome to the Waitlist",
    subject: "Welcome to Aurelia – Your Exclusive Journey Begins",
    previewText: "You've joined an extraordinary community.",
    delayDays: 0,
    category: "welcome",
    content: {
      headline: "Welcome to Aurelia",
      body: "Thank you for joining Aurelia's exclusive waitlist. You've taken the first step toward a life of unparalleled service and extraordinary experiences. As a waitlist member, you'll receive priority access when we open enrollment and exclusive previews of our services.",
      cta: "Explore Our Services",
      ctaUrl: "/services"
    }
  },
  {
    id: "education-2",
    name: "Discover Private Aviation",
    subject: "Private Aviation Redefined – Your World Without Limits",
    previewText: "From 4-hour bookings to empty leg deals.",
    delayDays: 3,
    category: "education",
    content: {
      headline: "Private Aviation, Reimagined",
      body: "Imagine stepping onto a Gulfstream G650 with just 4 hours notice. At Aurelia, we've redefined private aviation with on-demand access to the world's finest aircraft. Our aviation concierge handles everything – from last-minute charters to complex multi-leg itineraries spanning continents.",
      cta: "Learn About Aviation Services",
      ctaUrl: "/services#aviation"
    }
  },
  {
    id: "social-proof-3",
    name: "Member Stories",
    subject: "How Aurelia Members Experience Life Differently",
    previewText: "Real stories from our private community.",
    delayDays: 7,
    category: "social_proof",
    content: {
      headline: "Stories from Our Members",
      body: "\"Aurelia arranged a private viewing at the Louvre after hours for my family – an experience I thought was impossible.\" – Member since 2024. Our members share a common trait: they refuse to accept 'no' as an answer. That's where Aurelia excels.",
      cta: "Read Member Testimonials",
      ctaUrl: "/#testimonials"
    }
  },
  {
    id: "education-4",
    name: "Meet Orla AI",
    subject: "Meet Orla – Your 24/7 AI Concierge",
    previewText: "The future of personalized luxury service.",
    delayDays: 10,
    category: "education",
    content: {
      headline: "Introducing Orla, Your AI Concierge",
      body: "While you sleep, Orla works. Our proprietary AI concierge learns your preferences, anticipates your needs, and is available 24/7 through voice or chat. Whether you need a restaurant recommendation at 2 AM or want to book a superyacht for next week, Orla responds instantly.",
      cta: "Experience Orla",
      ctaUrl: "/orla"
    }
  },
  {
    id: "education-5",
    name: "Exclusive Access",
    subject: "Impossible Experiences Made Possible",
    previewText: "F1 paddock, Met Gala, private islands.",
    delayDays: 14,
    category: "education",
    content: {
      headline: "Access the Inaccessible",
      body: "Monaco Grand Prix from the Red Bull garage. Front row at Fashion Week. A private island in the Maldives for your anniversary. Aurelia's network opens doors that others don't even know exist. We turn 'impossible' into 'when would you like to arrive?'",
      cta: "Explore Experiences",
      ctaUrl: "/discover"
    }
  },
  {
    id: "conversion-6",
    name: "Membership Preview",
    subject: "Your Membership Options – From $2,500/month",
    previewText: "Three tiers designed for discerning individuals.",
    delayDays: 18,
    category: "conversion",
    content: {
      headline: "Choose Your Tier",
      body: "Aurelia offers three membership levels: Signature ($2,500/month) for essential concierge access, Prestige ($7,500/month) for dedicated liaison and priority service, and Black Card ($25,000/month) for unlimited access including private aviation and estate management. Which tier matches your lifestyle?",
      cta: "Compare Membership Tiers",
      ctaUrl: "/membership"
    }
  },
  {
    id: "conversion-7",
    name: "Priority Access Offer",
    subject: "Priority Enrollment Opening Soon – Secure Your Spot",
    previewText: "Limited memberships available.",
    delayDays: 21,
    category: "conversion",
    content: {
      headline: "Your Priority Access Awaits",
      body: "As a waitlist member, you'll receive priority enrollment when we open new membership slots. These opportunities are rare – we maintain exclusivity by limiting our member community. Reply to this email to schedule a private consultation with our membership team.",
      cta: "Schedule Consultation",
      ctaUrl: "/contact"
    }
  }
];

// Re-engagement sequence for inactive waitlist members
export const REENGAGEMENT_SEQUENCE: EmailTemplate[] = [
  {
    id: "reengage-1",
    name: "We Miss You",
    subject: "Still Interested in Extraordinary Service?",
    previewText: "Your waitlist spot is reserved.",
    delayDays: 30,
    category: "reengagement",
    content: {
      headline: "Your Journey Continues",
      body: "We noticed you haven't visited recently. Your waitlist spot remains reserved, and we've been curating new experiences we think you'll love. From new superyacht partnerships to exclusive event access, there's much to explore.",
      cta: "See What's New",
      ctaUrl: "/"
    }
  }
];

// Get email template by ID
export const getEmailTemplate = (id: string): EmailTemplate | undefined => {
  return [...WAITLIST_NURTURE_SEQUENCE, ...REENGAGEMENT_SEQUENCE].find(t => t.id === id);
};

// Get sequence by category
export const getSequenceByCategory = (category: EmailTemplate['category']): EmailTemplate[] => {
  return WAITLIST_NURTURE_SEQUENCE.filter(t => t.category === category);
};

// Calculate send date based on signup date
export const calculateSendDate = (signupDate: Date, delayDays: number): Date => {
  const sendDate = new Date(signupDate);
  sendDate.setDate(sendDate.getDate() + delayDays);
  return sendDate;
};

// Generate email schedule for a new signup
export const generateEmailSchedule = (signupDate: Date) => {
  return WAITLIST_NURTURE_SEQUENCE.map(template => ({
    templateId: template.id,
    templateName: template.name,
    scheduledDate: calculateSendDate(signupDate, template.delayDays),
    status: 'scheduled' as const
  }));
};
