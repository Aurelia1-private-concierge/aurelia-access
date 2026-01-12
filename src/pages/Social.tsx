import { motion } from "framer-motion";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  ExternalLink,
  Users,
  Heart,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// YouTube icon component
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const socialPlatforms = [
  {
    name: "Instagram",
    handle: "@aurelia.concierge",
    description: "Behind-the-scenes glimpses of extraordinary experiences, curated aesthetics, and lifestyle inspiration.",
    icon: Instagram,
    href: "https://instagram.com/aureliaprivateconcierge",
    internalLink: "/instagram",
    color: "from-purple-500 via-pink-500 to-orange-400",
    followers: "125K followers"
  },
  {
    name: "TikTok",
    handle: "@aurelia.concierge",
    description: "Viral luxury content, exclusive access moments, and behind-the-scenes of the extraordinary.",
    icon: TikTokIcon,
    href: "https://tiktok.com/@aurelia.concierge",
    internalLink: "/tiktok",
    color: "from-gray-900 to-gray-800",
    followers: "2.4M followers"
  },
  {
    name: "YouTube",
    handle: "@aureliaprivateconcierge",
    description: "Documentary-style content exploring the world of ultra-luxury travel, properties, and exclusive experiences.",
    icon: YouTubeIcon,
    href: "https://youtube.com/@aureliaprivateconcierge",
    internalLink: "/youtube",
    color: "from-red-600 to-red-500",
    followers: "892K subscribers"
  },
  {
    name: "LinkedIn",
    handle: "Aurelia Private Concierge",
    description: "Professional insights, partnership opportunities, and thought leadership in luxury lifestyle management.",
    icon: Linkedin,
    href: "https://linkedin.com/company/aurelia-private-concierge",
    internalLink: "/linkedin",
    color: "from-blue-700 to-blue-600",
    followers: "47.2K followers"
  },
  {
    name: "Facebook",
    handle: "Aurelia Private Concierge",
    description: "Community updates, event announcements, and stories from our global network of discerning clients.",
    icon: Facebook,
    href: "https://facebook.com/aureliaprivateconcierge",
    internalLink: "/facebook",
    color: "from-blue-600 to-blue-500",
    followers: "125K followers"
  },
  {
    name: "X (Twitter)",
    handle: "@aureliaprivate",
    description: "Real-time updates, industry insights, and conversations about the art of refined living.",
    icon: Twitter,
    href: "https://x.com/aureliaprivate",
    internalLink: "/twitter",
    color: "from-gray-800 to-gray-700",
    followers: "89.2K followers"
  },
  {
    name: "WhatsApp",
    handle: "+44 7309 935106",
    description: "Direct line to our concierge team. Instant assistance for members and inquiries.",
    icon: MessageCircle,
    href: "https://wa.me/+447309935106",
    color: "from-emerald-500 to-emerald-600",
    followers: "Message us directly"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const Social = () => {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute inset-0 hero-overlay opacity-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 border border-border/30 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
              Stay Connected
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-foreground mb-4"
          >
            Join Our <span className="text-primary italic">Community</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground font-light max-w-2xl mx-auto"
          >
            Follow us across platforms for exclusive insights, behind-the-scenes content, 
            and the latest from the world of luxury lifestyle.
          </motion.p>
        </div>
      </section>

      {/* Social Platforms Grid */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6"
          >
            {socialPlatforms.map((platform) => {
              const CardContent = (
                <>
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
                        {typeof platform.icon === 'function' && platform.icon.toString().includes('svg') ? (
                          <platform.icon className="w-6 h-6 text-white" />
                        ) : (
                          <platform.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-serif text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {platform.name}
                    </h3>
                    
                    <p className="text-sm text-primary/80 font-medium mb-3">
                      {platform.handle}
                    </p>
                    
                    <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
                      {platform.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                      <Users className="w-3 h-3" />
                      <span>{platform.followers}</span>
                    </div>
                  </div>
                </>
              );

              // Use internal link if available, otherwise external
              if (platform.internalLink) {
                return (
                  <motion.div key={platform.name} variants={itemVariants}>
                    <Link
                      to={platform.internalLink}
                      className="group relative bg-card/50 border border-border/30 rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 overflow-hidden block hover:scale-[1.02] hover:-translate-y-1"
                    >
                      {CardContent}
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-card/50 border border-border/30 rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                  {CardContent}
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Engagement CTA */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8">
            <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-foreground mb-3">
              Share the <span className="text-primary italic">Experience</span>
            </h2>
            <p className="text-muted-foreground font-light mb-6">
              Know someone who would appreciate the Aurelia lifestyle? 
              Refer them and both of you receive exclusive benefits.
            </p>
            <a
              href="/referral"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-primary/90 gold-glow-hover"
            >
              <span>Start Referring</span>
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Social;