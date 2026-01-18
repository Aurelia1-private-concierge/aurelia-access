import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Mail, Bell, ArrowRight, Sparkles, Diamond, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/hero-luxury-holiday.mp4";
import { Logo } from "@/components/brand";

// Luxury particle component
const LuxuryParticle = ({ delay, duration }: { delay: number; duration: number }) => {
  const size = Math.random() * 3 + 1;
  const startX = Math.random() * 100;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        background: `radial-gradient(circle, rgba(212,175,55,${Math.random() * 0.5 + 0.3}) 0%, transparent 70%)`,
        boxShadow: `0 0 ${size * 2}px rgba(212,175,55,0.3)`,
      }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ 
        y: "-10vh", 
        opacity: [0, 1, 1, 0],
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// Animated ring component
const AnimatedRing = ({ size, delay, reverse = false }: { size: number; delay: number; reverse?: boolean }) => (
  <motion.div
    className="absolute rounded-full border border-primary/10"
    style={{
      width: size,
      height: size,
      left: "50%",
      top: "50%",
      marginLeft: -size / 2,
      marginTop: -size / 2,
    }}
    animate={{ 
      rotate: reverse ? -360 : 360,
      scale: [1, 1.02, 1],
    }}
    transition={{
      rotate: { duration: 20 + delay * 5, repeat: Infinity, ease: "linear" },
      scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
    }}
  />
);

// Morphing blob background
const MorphingBlob = () => (
  <motion.div
    className="absolute w-[600px] h-[600px] opacity-20 blur-3xl pointer-events-none"
    style={{
      background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
      left: "50%",
      top: "50%",
      marginLeft: -300,
      marginTop: -300,
    }}
    animate={{
      scale: [1, 1.2, 1],
      borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
    }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
  />
);

const UnderConstruction = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const luxuryWords = useMemo(() => ["Extraordinary", "Exclusive", "Exceptional", "Exquisite"], []);
  
  // Cycle through luxury words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % luxuryWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [luxuryWords.length]);
  
  // Parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const rotateX = useTransform(springY, [-300, 300], [3, -3]);
  const rotateY = useTransform(springX, [-300, 300], [-3, 3]);
  const glowX = useTransform(springX, [-300, 300], [-50, 50]);
  const glowY = useTransform(springY, [-300, 300], [-50, 50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('launch_signups')
        .insert({ 
          email, 
          source: 'coming_soon_page',
          notification_preference: 'email'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("You're already on the exclusive list.");
        } else {
          throw error;
        }
      } else {
        await supabase.functions.invoke('notify-admin', {
          body: { type: 'launch_signup', email, source: 'coming_soon_page' }
        });
        toast.success("Welcome to the inner circle. We'll be in touch.");
      }
      setEmail("");
    } catch (err) {
      console.error('Signup error:', err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Generate particles
  const particles = useMemo(() => 
    [...Array(30)].map((_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: Math.random() * 15 + 10,
    })), 
  []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* Video Background with enhanced overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30 scale-110"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      {/* Morphing blob */}
      <MorphingBlob />

      {/* Animated rings */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        <AnimatedRing size={400} delay={0} />
        <AnimatedRing size={600} delay={1} reverse />
        <AnimatedRing size={800} delay={2} />
      </div>

      {/* Luxury particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <LuxuryParticle key={p.id} delay={p.delay} duration={p.duration} />
        ))}
      </div>

      {/* Mouse-following spotlight */}
      <motion.div
        className="pointer-events-none fixed z-20 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)",
          left: mousePosition.x - 250,
          top: mousePosition.y - 250,
          filter: "blur(40px)",
        }}
      />

      {/* Secondary glow following mouse */}
      <motion.div
        className="pointer-events-none fixed z-20 w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
          left: mousePosition.x - 64,
          top: mousePosition.y - 64,
          x: glowX,
          y: glowY,
        }}
      />

      {/* Logo in corner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 z-50"
      >
        <Logo size="sm" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-30 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Exclusive badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full border border-primary/20 bg-gradient-to-r from-black/80 via-primary/5 to-black/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Diamond className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-sm font-light tracking-[0.3em] text-primary uppercase">
                Invitation Only
              </span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Diamond className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Main Heading with word cycling */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight mb-4">
              <span className="text-white/90">Something</span>
            </h1>
            <div className="h-24 md:h-32 lg:h-40 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ y: 80, opacity: 0, filter: "blur(10px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -80, opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="block text-6xl md:text-8xl lg:text-9xl font-serif font-light"
                  style={{
                    background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 25%, #d4af37 50%, #f4e4bc 75%, #d4af37 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shimmer 3s linear infinite",
                  }}
                >
                  {luxuryWords[currentWord]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Elegant divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/50" />
            <Crown className="w-6 h-6 text-primary/70" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/50" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-white/50 mb-16 max-w-2xl mx-auto font-light leading-relaxed"
          >
            A bespoke experience is being curated for the most discerning individuals. 
            <span className="text-primary/80"> Reserve your place.</span>
          </motion.p>

          {/* Countdown Timer - Luxury style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex justify-center gap-3 md:gap-6 mb-16"
          >
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Minutes", value: countdown.minutes },
              { label: "Seconds", value: countdown.seconds },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative w-20 h-24 md:w-28 md:h-32 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden">
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                    />
                    
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={item.value}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl md:text-5xl font-light text-white tabular-nums"
                      >
                        {String(item.value).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  
                  <span className="block mt-3 text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em] font-light">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Email Signup - Refined */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            onSubmit={handleNotify}
            className="max-w-lg mx-auto mb-16"
          >
            <div className="relative group">
              {/* Glow border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    type="email"
                    placeholder="Your private email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-transparent border-0 text-white placeholder:text-white/30 focus:ring-0 focus-visible:ring-0 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium tracking-wide group/btn rounded-xl"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Request Access
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <p className="mt-4 text-xs text-white/20 tracking-wide">
              Limited availability • By invitation only
            </p>
          </motion.form>

          {/* Social proof / Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex items-center justify-center gap-8"
          >
            {[
              { icon: Star, text: "Ultra-Premium" },
              { icon: Diamond, text: "Exclusive Access" },
              { icon: Crown, text: "White Glove Service" },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2 text-white/20"
                whileHover={{ scale: 1.05, color: "rgba(212,175,55,0.5)" }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase hidden md:block">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Elegant corner frames */}
      <div className="absolute top-12 left-12 w-24 h-24 z-40 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
        <motion.div 
          className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary/40 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
      </div>
      <div className="absolute top-12 right-12 w-24 h-24 z-40 pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-primary/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        />
        <motion.div 
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/40 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        />
      </div>
      <div className="absolute bottom-12 left-12 w-24 h-24 z-40 pointer-events-none">
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-primary/40 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        />
      </div>
      <div className="absolute bottom-12 right-12 w-24 h-24 z-40 pointer-events-none">
        <motion.div 
          className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-primary/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-primary/40 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        />
      </div>

      {/* Add shimmer animation to head */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
};

export default UnderConstruction;
