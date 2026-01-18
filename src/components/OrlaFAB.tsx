import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, startTransition } from "react";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";
import { useAvatarStyle } from "@/hooks/useAvatarStyle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const OrlaFAB = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const { currentStyle } = useAvatarStyle();
  const { user } = useAuth();
  const controls = useAnimation();
  const prevCountRef = useRef(0);
  
  const hasUnreadNotifications = unreadCount > 0;

  // Defer initialization to reduce TBT
  useEffect(() => {
    const scheduleIdle = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        return (window as typeof window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(callback, { timeout: 1000 });
      }
      return setTimeout(callback, 50) as unknown as number;
    };

    const idleId = scheduleIdle(() => {
      startTransition(() => {
        setIsReady(true);
      });
    });

    return () => {
      if ('cancelIdleCallback' in window) {
        (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, []);

  // Fetch unread notifications - defer until ready
  useEffect(() => {
    if (!user || !isReady) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (!error && count !== null) {
        // Trigger bounce if count increased
        if (count > prevCountRef.current) {
          controls.start({
            y: [0, -12, 0, -6, 0],
            transition: { duration: 0.5, ease: "easeOut" }
          });
        }
        prevCountRef.current = count;
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("notifications-fab")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, controls, isReady]);

  // Trigger initial entrance animation
  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      controls.start({ scale: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [controls, isReady]);

  // Don't render until ready to avoid blocking main thread
  if (!isReady) return null;
  
  return (
    <Link to="/orla">
      <motion.div
        initial={{ scale: 0 }}
        animate={controls}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed bottom-28 right-6 md:right-8 z-50 w-14 h-14 rounded-full overflow-hidden border-2 border-primary/60 flex items-center justify-center transition-all duration-300 group cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${currentStyle.colors.primary}E6, ${currentStyle.colors.primary})`,
          boxShadow: `0 0 40px ${currentStyle.colors.glow}`,
          willChange: 'transform',
        }}
      >
        {/* Notification pulse ring effect */}
        {hasUnreadNotifications && (
          <>
            <motion.span 
              animate={{ scale: [1, 1.8, 1.8], opacity: [0.6, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
            />
            <motion.span 
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
            />
          </>
        )}
        
        {/* Animated glow ring */}
        <motion.span 
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: currentStyle.colors.primary, opacity: 0.4 }}
        />
        <motion.span 
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: currentStyle.colors.primary, opacity: 0.3 }}
        />
        
        {/* Style-matched particles on hover */}
        {isHovered && currentStyle.effects.sparkles && (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: currentStyle.colors.primary }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 25,
                  y: Math.sin((i / 6) * Math.PI * 2) * 25,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
        
        {/* Notification Dot */}
        {hasUnreadNotifications && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full z-10 flex items-center justify-center shadow-lg shadow-emerald-500/40"
          >
            <span className="text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.span>
        )}

        {/* Mini Avatar with breathing animation */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <OrlaMiniAvatar size={56} isActive={isHovered} showSparkles={true} forceStatic={true} />
        </motion.div>

        {/* Tooltip on hover */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 backdrop-blur-xl border border-border/30 rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: `${currentStyle.colors.secondary}F2`,
          }}
        >
          <p className="text-xs text-foreground font-medium">Speak with Orla</p>
          <p className="text-[10px] text-muted-foreground">
            {hasUnreadNotifications ? `${unreadCount} unread` : "Voice conversation"}
          </p>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default OrlaFAB;
