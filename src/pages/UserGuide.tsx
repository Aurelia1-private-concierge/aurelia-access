import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  BookOpen, Sparkles, Shield, CreditCard, Calendar, Globe,
  MessageCircle, Settings, Users, FileText, ArrowRight,
  CheckCircle, Lightbulb, Play, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLandingTour } from "@/hooks/useLandingTour";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Sparkles,
    description: "Everything you need to begin your journey with Aurelia",
    subsections: [
      {
        title: "Create Your Account",
        steps: [
          "Visit the Sign Up page from the navigation menu",
          "Enter your email and create a secure password",
          "Verify your email address through the confirmation link",
          "Complete your profile with basic information",
        ],
      },
      {
        title: "Complete Your Travel DNA",
        steps: [
          "Navigate to the onboarding flow after registration",
          "Select your traveler archetype (Explorer, Connoisseur, etc.)",
          "Set your travel pace preferences",
          "Choose accommodation styles and cuisine preferences",
          "Add any special requirements or accessibility needs",
        ],
      },
      {
        title: "Explore the Dashboard",
        steps: [
          "View your Portfolio Overview for membership status",
          "Check exclusive perks available at your tier",
          "Review personalized recommendations based on your DNA",
          "Access Orla, your AI concierge, for instant assistance",
        ],
      },
    ],
  },
  {
    id: "membership",
    title: "Membership Tiers",
    icon: CreditCard,
    description: "Understand our membership levels and their benefits",
    subsections: [
      {
        title: "Signature Tier",
        steps: [
          "Core concierge services with 24-hour response time",
          "10 credits per month for service requests",
          "Access to curated travel recommendations",
          "Secure messaging with your concierge team",
        ],
      },
      {
        title: "Prestige Tier",
        steps: [
          "Priority queue with 4-hour response time",
          "50 credits per month for service requests",
          "Dedicated liaison for personalized service",
          "Early access to exclusive events and experiences",
        ],
      },
      {
        title: "Black Card Tier",
        steps: [
          "Instant response from our premium team",
          "Unlimited credits for any request",
          "Private jet booking and yacht charter access",
          "Estate services and luxury property sourcing",
        ],
      },
    ],
  },
  {
    id: "services",
    title: "Our Services",
    icon: Globe,
    description: "Explore the full range of concierge services",
    subsections: [
      {
        title: "Travel & Transportation",
        steps: [
          "Private aviation: Charter jets and helicopters",
          "Yacht charters: Mediterranean, Caribbean, and beyond",
          "Chauffeur services: Luxury vehicles worldwide",
          "Bespoke itinerary planning for any destination",
        ],
      },
      {
        title: "Dining & Entertainment",
        steps: [
          "Michelin-starred restaurant reservations",
          "Private chef and catering arrangements",
          "VIP event access: Galas, premieres, sporting events",
          "Exclusive club memberships and introductions",
        ],
      },
      {
        title: "Lifestyle & Wellness",
        steps: [
          "Luxury wellness retreats and spa experiences",
          "Personal shopping and wardrobe curation",
          "Art and collectibles acquisition",
          "Security and privacy services",
        ],
      },
    ],
  },
  {
    id: "orla",
    title: "Using Orla",
    icon: MessageCircle,
    description: "Your AI concierge is available 24/7",
    subsections: [
      {
        title: "Starting a Conversation",
        steps: [
          "Click the Orla button in the bottom-right corner",
          "Type your request in natural language",
          "Orla understands context and remembers preferences",
          "Switch between text and voice modes as needed",
        ],
      },
      {
        title: "What Orla Can Do",
        steps: [
          "Answer questions about Aurelia services",
          "Submit service requests on your behalf",
          "Provide personalized recommendations",
          "Track the status of ongoing requests",
          "Connect you with your human concierge team",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: Shield,
    description: "How we protect your information",
    subsections: [
      {
        title: "Account Security",
        steps: [
          "Enable two-factor authentication in Settings",
          "Use a strong, unique password",
          "Review connected devices regularly",
          "Log out from shared or public devices",
        ],
      },
      {
        title: "Data Protection",
        steps: [
          "All data encrypted with bank-level security",
          "GDPR and CCPA compliant data handling",
          "Request data export or deletion anytime",
          "No sharing with third parties without consent",
        ],
      },
    ],
  },
];

const UserGuidePage = () => {
  const { startTour } = useLandingTour();

  return (
    <>
      <Helmet>
        <title>User Guide | Aurelia Private Concierge</title>
        <meta name="description" content="Learn how to use Aurelia's luxury concierge services. Complete guide to membership, services, and getting the most from your experience." />
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 border-b border-border/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="outline" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                User Guide
              </Badge>
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl text-foreground mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Welcome to Aurelia
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Your complete guide to navigating our luxury concierge platform. 
                Everything you need to make the most of your membership.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={startTour} className="gap-2">
                  <Play className="w-4 h-4" />
                  Take Interactive Tour
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-secondary/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/30 hover:border-primary/30 transition-colors"
                >
                  <section.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-center text-foreground">{section.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Sections */}
        {sections.map((section, sectionIdx) => (
          <section
            key={section.id}
            id={section.id}
            className={`py-16 md:py-20 ${sectionIdx % 2 === 1 ? "bg-card/20" : ""}`}
          >
            <div className="max-w-4xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 
                    className="text-2xl md:text-3xl text-foreground"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {section.title}
                  </h2>
                </div>
                <p className="text-muted-foreground">{section.description}</p>
              </motion.div>

              <div className="space-y-8">
                {section.subsections.map((sub, subIdx) => (
                  <motion.div
                    key={subIdx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: subIdx * 0.1 }}
                    className="bg-card border border-border/30 rounded-xl p-6"
                  >
                    <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      {sub.title}
                    </h3>
                    <ul className="space-y-3">
                      {sub.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Pro Tips */}
        <section className="py-16 md:py-20 bg-primary/5 border-t border-primary/10">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <Lightbulb className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 
                className="text-2xl md:text-3xl text-foreground mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Pro Tips
              </h2>
              <p className="text-muted-foreground">Get the most from your Aurelia experience</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Complete your Travel DNA for better recommendations",
                "Use Orla for quick questions before messaging your liaison",
                "Check the Calendar view to track all upcoming experiences",
                "Enable notifications for real-time updates on requests",
                "Refer friends to earn bonus credits and exclusive perks",
                "Review your Document Vault for important confirmations",
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/30"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">{idx + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 
              className="text-2xl md:text-3xl text-foreground mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our concierge team is here to help you 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/#faq">View FAQ</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UserGuidePage;
