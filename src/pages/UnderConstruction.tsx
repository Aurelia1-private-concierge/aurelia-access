import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Sparkles, ArrowRight, Check, Loader2, Mail, Bell, Rocket, Star, 
  Globe, Shield, Users, Plane, Ship, Building2,
  Instagram, Linkedin, Twitter, Facebook, Play, Pause, Volume2, VolumeX,
  Bot, Clock, Zap, Diamond, HeartHandshake, Lock
} from "lucide-react";
import aureliaDemo from "@/assets/aurelia-demo.mp4";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AnimatedLogo from "@/components/brand/AnimatedLogo";

const waitlistSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

// SEO structured data for the launch page
const launchPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Aurelia Private Concierge - Coming Soon",
  "description": "Join the waitlist for the world's most exclusive private concierge service. Early access to private jets, superyachts, off-market real estate, and impossible experiences.",
  "url": "https://aurelia-privateconcierge.com",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Aurelia Private Concierge",
    "url": "https://aurelia-privateconcierge.com"
  },
  "about": {
    "@type": "Organization",
    "name": "Aurelia Private Concierge",
    "description": "Ultra-exclusive concierge service for billionaires and UHNW individuals"
  },
  "potentialAction": {
    "@type": "JoinAction",
    "name": "Join Waitlist",
    "target": "https://aurelia-privateconcierge.com"
  }
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/aureliaprivate", label: "Instagram", color: "hover:text-pink-400" },
  { icon: Linkedin, href: "https://linkedin.com/company/aurelia-private-concierge", label: "LinkedIn", color: "hover:text-blue-400" },
  { icon: Twitter, href: "https://twitter.com/AureliaPrivate", label: "X (Twitter)", color: "hover:text-sky-400" },
  { icon: Facebook, href: "https://facebook.com/aureliaprivateconcierge", label: "Facebook", color: "hover:text-blue-500" },
];

const highlights = [
  { icon: Globe, label: "Global Network", desc: "Launching Worldwide" },
  { icon: Shield, label: "By Invitation", desc: "Exclusive Access" },
  { icon: Users, label: "Founding Members", desc: "Limited Spots" },
  { icon: Rocket, label: "Coming Soon", desc: "Early 2026" },
];

const services = [
  { icon: Plane, label: "Private Aviation" },
  { icon: Ship, label: "Yacht Charters" },
  { icon: Building2, label: "Off-Market Real Estate" },
  { icon: Shield, label: "Security Services" },
  { icon: Star, label: "Exclusive Access" },
  { icon: Globe, label: "Global Network" },
];

const demoFeatures = [
  {
    icon: Bot,
    title: "Meet Orla",
    description: "Your 24/7 AI concierge who learns your preferences and anticipates your needs before you ask.",
  },
  {
    icon: Clock,
    title: "Instant Response",
    description: "From private jets to impossible dinner reservations, executed in minutes — not days.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "500+ vetted luxury partners across 6 continents, with exclusive off-market access.",
  },
  {
    icon: Zap,
    title: "Seamless Experience",
    description: "One request handles everything — travel, accommodations, security, and experiences.",
  },
  {
    icon: Diamond,
    title: "Ultra-Exclusive Access",
    description: "Art auctions, sold-out events, off-market properties — we unlock what others can't.",
  },
  {
    icon: Lock,
    title: "Complete Discretion",
    description: "Bank-grade encryption and absolute confidentiality. Your privacy is paramount.",
  },
];

// Royalty-free ambient luxury music URL (no API needed)
const AMBIENT_MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3";

const DemoVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

  // Scroll-triggered autoplay (muted for browser compliance)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoPlayed && videoRef.current) {
            videoRef.current.play();
            setHasAutoPlayed(true);
            // Show unmute hint after autoplay starts
            setShowUnmuteHint(true);
            setTimeout(() => setShowUnmuteHint(false), 4000);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAutoPlayed]);

  // Sync audio with video playback
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const handleVideoPlay = () => {
      if (!isMuted) {
        audio.play().catch(() => {});
      }
    };

    const handleVideoPause = () => {
      audio.pause();
    };

    const handleVideoEnded = () => {
      audio.currentTime = 0;
    };

    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('ended', handleVideoEnded);

    return () => {
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [isMuted]);

  // Progress bar update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        audioRef.current?.pause();
      } else {
        videoRef.current.play();
        // When user manually plays, unmute for better experience
        if (isMuted) {
          setIsMuted(false);
          audioRef.current?.play().catch(() => {});
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setShowUnmuteHint(false);
    
    if (audioRef.current) {
      if (newMuted) {
        audioRef.current.pause();
      } else if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Hidden audio element for background music */}
      <audio ref={audioRef} src={AMBIENT_MUSIC_URL} preload="auto" loop />
      {/* Section Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4"
        >
          <Play className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">See Aurelia in Action</span>
        </motion.div>
        <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
          The Future of <span className="text-primary">Luxury Service</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover how Aurelia transforms the way the world's most discerning individuals experience life.
        </p>
      </div>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="relative max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl border border-primary/20"
      >
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={aureliaDemo}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            poster=""
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Aurelia Logo Overlay - Top Left */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="px-4 py-2 backdrop-blur-md bg-black/40 rounded-lg border border-primary/30"
            >
              <span className="text-sm md:text-base font-light tracking-[0.3em] text-primary">AURELIA</span>
            </motion.div>
          </div>
          
          {/* Video Overlay - Play Button */}
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10"
              onClick={togglePlay}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl"
              >
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </motion.button>
            </motion.div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="relative">
                {/* Unmute Hint */}
                {showUnmuteHint && isMuted && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
                  >
                    <div className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg shadow-lg flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <span>Tap for sound</span>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-primary rotate-45" />
                    </div>
                  </motion.div>
                )}
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full backdrop-blur-sm border text-white transition-colors ${
                    isMuted 
                      ? 'bg-primary/50 border-primary/50 hover:bg-primary/70 animate-pulse' 
                      : 'bg-black/50 border-white/10 hover:bg-black/70'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {demoFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 + i * 0.1 }}
            className="p-5 rounded-xl bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA after demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20"
      >
        <HeartHandshake className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Ready to Experience Extraordinary?
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Join our exclusive waitlist and be among the first to access the world's most sophisticated concierge service.
        </p>
        <p className="text-sm text-primary font-medium">
          ↑ Enter your email above to secure your spot
        </p>
      </motion.div>
    </motion.section>
  );
};

const UnderConstruction = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Add structured data to head
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'launch-page-schema';
    script.textContent = JSON.stringify(launchPageSchema);
    document.head.appendChild(script);

    // Update meta tags for launch page
    document.title = "Aurelia Private Concierge | Join the Exclusive Waitlist - Coming Soon";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Be first to access the world\'s most exclusive private concierge. Join discerning individuals on our waitlist for priority membership to private jets, superyachts & impossible experiences.');
    }

    return () => {
      const existingScript = document.getElementById('launch-page-schema');
      if (existingScript) existingScript.remove();
    };
  }, []);

  // Fetch waitlist count for social proof
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('launch_signups')
        .select('*', { count: 'exact', head: true });
      if (count !== null) setWaitlistCount(count);
    };
    fetchCount();
  }, [isSubmitted]);

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: WaitlistForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("launch_signups")
        .insert({ email: data.email, source: "under_construction" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already on the list!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome to the future!");
      }
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.4, 0.6],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <AnimatedLogo size="lg" />
            </motion.div>

            {/* Status badge with waitlist count */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-primary">
                {waitlistCount !== null && waitlistCount > 0 
                  ? `${waitlistCount.toLocaleString()}+ Already Joined` 
                  : "Exclusive Access Opening Soon"}
              </span>
            </motion.div>

            {/* Main heading - SEO optimized */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="text-foreground">The World's Most</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Exclusive Concierge
              </span>
              <br />
              <span className="text-foreground">is Coming</span>
            </motion.h1>

            {/* SEO-rich description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed"
            >
              Private jets. Superyachts. Off-market real estate. Rare art. 
              <span className="text-foreground font-medium"> 24/7 white-glove service</span> for those who expect nothing less than extraordinary.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-10 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                By Invitation Only
              </span>
              <span className="text-primary/30">|</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" />
                UHNW Clientele
              </span>
              <span className="text-primary/30">|</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-accent" />
                Global Coverage
              </span>
            </motion.div>

            {/* Waitlist form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              {!isSubmitted ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                placeholder="Enter your email"
                                className="h-14 pl-12 pr-4 bg-secondary/50 border-primary/20 focus:border-primary text-base rounded-xl"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-left mt-1" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-base group"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">You're on the exclusive list!</p>
                      <p className="text-sm text-muted-foreground">Priority access when we launch.</p>
                    </div>
                  </div>
                  
                  {/* Share CTA after signup */}
                  <p className="text-sm text-muted-foreground">
                    Share with those who deserve extraordinary experiences
                  </p>
                  <div className="flex items-center gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full bg-secondary/50 border border-primary/10 text-muted-foreground ${social.color} transition-colors`}
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Highlights strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto"
            >
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-center p-3 rounded-xl bg-secondary/20 border border-primary/10"
                >
                  <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Services preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-16"
            >
              {services.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground text-center">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Demo Video Section */}
            <DemoVideoSection />
          </div>
        </div>

        {/* Footer with social links */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 py-8 border-t border-primary/10"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social links */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Follow us:</span>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full bg-secondary/50 border border-primary/10 text-muted-foreground ${social.color} transition-colors`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Notify prompt */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="w-4 h-4" />
                <span>Be among the first to experience exclusive access</span>
              </div>

              {/* Copyright */}
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Aurelia Private Concierge
              </p>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default UnderConstruction;
