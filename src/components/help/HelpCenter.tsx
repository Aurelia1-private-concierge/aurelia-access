import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, Search, Book, MessageCircle, Phone, Mail,
  ChevronRight, Sparkles, Shield, CreditCard, Calendar,
  Globe, Users, FileText, Settings, ArrowRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Sparkles,
    description: "New to Aurelia? Start here",
    articles: [
      { title: "How to create your account", content: "Visit the Sign Up page, enter your details, and verify your email. You'll be guided through our onboarding process to personalize your experience." },
      { title: "Understanding membership tiers", content: "Signature offers core concierge with 24h response. Prestige provides priority access and 4h response. Black Card delivers instant response, unlimited credits, and exclusive access." },
      { title: "Setting up your Travel DNA", content: "Complete your Travel DNA profile in the dashboard. This helps us personalize recommendations based on your travel style, preferences, and interests." },
      { title: "How to contact your concierge", content: "Use Orla (our AI concierge) for instant help, or message your dedicated liaison through the Secure Messaging feature in your dashboard." },
    ],
  },
  {
    id: "services",
    title: "Services & Booking",
    icon: Calendar,
    description: "Learn about our offerings",
    articles: [
      { title: "Private aviation bookings", content: "Submit a request through Orla or the service request form. Specify your travel dates, passengers, and preferences. We'll source the best options within your budget." },
      { title: "Yacht charter arrangements", content: "Tell us your desired destination, dates, and group size. We work with exclusive charter companies to find vessels matching your requirements." },
      { title: "Fine dining reservations", content: "Request reservations at exclusive restaurants worldwide. We maintain relationships with Michelin-starred establishments and private dining venues." },
      { title: "Event access & VIP experiences", content: "From fashion weeks to sporting events, we secure access to invite-only occasions. Premium members receive priority allocation." },
    ],
  },
  {
    id: "account",
    title: "Account & Billing",
    icon: CreditCard,
    description: "Manage your membership",
    articles: [
      { title: "How credits work", content: "Credits are used for service requests. Simple tasks cost 1-2 credits, complex bookings 5-10 credits. Your tier includes monthly credit allocations that refresh each billing cycle." },
      { title: "Upgrading your membership", content: "Visit Portfolio Overview in your dashboard and click 'Upgrade Tier'. You can upgrade anytime; the price difference is prorated." },
      { title: "Billing and payment methods", content: "We accept all major credit cards and wire transfers for annual memberships. Billing is processed securely through Stripe." },
      { title: "Cancellation policy", content: "Monthly memberships can be cancelled anytime. Annual memberships are non-refundable but can be transferred. Contact your liaison for details." },
    ],
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: Shield,
    description: "Your data protection",
    articles: [
      { title: "How we protect your data", content: "All data is encrypted at rest and in transit. We use bank-level security protocols and never share your information with third parties without consent." },
      { title: "Two-factor authentication", content: "Enable 2FA in Settings → Security. We support authenticator apps and SMS verification for additional account protection." },
      { title: "Managing connected devices", content: "View and manage all devices logged into your account from Dashboard → Device Connections. Remove any unrecognized devices immediately." },
      { title: "Data export and deletion", content: "Request a full data export or account deletion through Settings → Privacy. We comply with GDPR and all applicable data protection regulations." },
    ],
  },
];

const quickLinks = [
  { label: "Contact Support", icon: MessageCircle, action: "support" },
  { label: "Call Concierge", icon: Phone, action: "call" },
  { label: "Email Us", icon: Mail, action: "email" },
  { label: "User Guide", icon: Book, action: "guide" },
];

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string } | null>(null);

  const filteredCategories = searchQuery
    ? helpCategories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(
          a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               a.content.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : helpCategories;

  const handleQuickLink = (action: string) => {
    switch (action) {
      case "support":
        window.open("mailto:support@aurelia-privateconcierge.com", "_blank");
        break;
      case "call":
        window.open("tel:+442012345678", "_blank");
        break;
      case "email":
        window.open("mailto:concierge@aurelia-privateconcierge.com", "_blank");
        break;
      case "guide":
        window.location.href = "/guide";
        onClose();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-5 h-5 text-primary" />
            Help Center
          </DialogTitle>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/30"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Links */}
          {!selectedCategory && !searchQuery && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.action}
                  onClick={() => handleQuickLink(link.action)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{link.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Article Detail View */}
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <motion.div
                key="article"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to categories
                </button>
                <h3 className="text-lg font-medium text-foreground">{selectedArticle.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedArticle.content}</p>
                
                <div className="pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">Was this helpful?</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">Yes, thanks!</Button>
                    <Button variant="ghost" size="sm">No, contact support</Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Categories */}
                {filteredCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-medium text-foreground">{category.title}</h3>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.articles.length} articles
                      </Badge>
                    </div>
                    
                    <Accordion type="single" collapsible>
                      {category.articles.map((article, idx) => (
                        <AccordionItem key={idx} value={`${category.id}-${idx}`} className="border-b-0">
                          <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2 hover:no-underline">
                            {article.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground/80 pb-4">
                            {article.content}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}

                {filteredCategories.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30 bg-secondary/20">
          <p className="text-xs text-center text-muted-foreground">
            Can't find what you need?{" "}
            <button 
              onClick={() => handleQuickLink("support")}
              className="text-primary hover:underline"
            >
              Contact our support team
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
