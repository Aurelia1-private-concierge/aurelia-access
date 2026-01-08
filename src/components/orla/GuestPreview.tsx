import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, User, Lock, Sparkles, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import orlaAvatar from "@/assets/orla-avatar.png";
import orlaDemoVideo from "@/assets/orla-demo.mp4";

interface GuestPreviewProps {
  onSignIn: () => void;
}

const GuestPreview = ({ onSignIn }: GuestPreviewProps) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayDemo = () => {
    setShowVideo(true);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  // Demo conversation snippets to show
  const demoConversation = [
    { role: "user", text: "Book me a private jet to Monaco next week" },
    { role: "agent", text: "I'd be happy to arrange that. I'll coordinate with our aviation partners for the best options..." },
    { role: "user", text: "And reserve a suite at the Hôtel de Paris" },
    { role: "agent", text: "Excellent choice. I'll arrange a penthouse suite with sea views..." },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Guest Mode Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-full px-5 py-2.5"
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm text-foreground/80">Guest Preview Mode</span>
      </motion.div>

      {/* Avatar Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-8 flex items-center justify-center"
        style={{ width: 320, height: 320 }}
      >
        {/* Ambient glow for guest */}
        <motion.div
          animate={{
            scale: [0.7, 0.75, 0.7],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute rounded-full bg-primary/20"
          style={{ width: 280, height: 280 }}
        />

        {/* Avatar */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 25px rgba(212, 175, 55, 0.15)",
              "0 0 35px rgba(212, 175, 55, 0.25)",
              "0 0 25px rgba(212, 175, 55, 0.15)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 overflow-hidden relative z-10"
        >
          <img
            src={orlaAvatar}
            alt="Orla"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Overlay for inactive state */}
          <div className="absolute inset-0 bg-background/20" />
        </motion.div>

        {/* Locked indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary/90 border border-border/50 text-muted-foreground px-4 py-1.5 rounded-full flex items-center gap-2 z-20"
        >
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Sign in required
          </span>
        </motion.div>
      </motion.div>

      {/* Name and Description */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Orla</h1>
        <p className="text-primary text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Private Liaison
        </p>
        <p className="text-muted-foreground text-sm mt-4 max-w-md mx-auto font-light">
          Experience personalized concierge service through natural voice conversation
        </p>
      </motion.div>

      {/* Demo Video or Preview Button */}
      <AnimatePresence mode="wait">
        {!showVideo ? (
          <motion.div
            key="preview-button"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Watch Demo Button */}
            <Button
              onClick={handlePlayDemo}
              variant="outline"
              size="lg"
              className="border-primary/40 text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base font-medium group"
            >
              <Play className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>

            {/* Demo Conversation Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm bg-card/30 border border-border/30 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/20">
                <Volume2 className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Sample Conversation</span>
              </div>
              <div className="space-y-2.5">
                {demoConversation.slice(0, 2).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                        msg.role === "user"
                          ? "bg-primary/15 border border-primary/20 text-foreground/90"
                          : "bg-secondary/40 border border-border/20 text-foreground/70"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sign In CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-2"
            >
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to start your conversation
              </p>
              <Button
                onClick={onSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-full text-base font-medium shadow-lg shadow-primary/30"
              >
                <User className="w-5 h-5 mr-2" />
                Sign In to Continue
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="video-player"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/50">
              <video
                ref={videoRef}
                className="w-full aspect-video object-cover"
                autoPlay
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                src={orlaDemoVideo}
              />

              {/* Video Controls Overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={togglePlayPause}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-primary-foreground" />
                  ) : (
                    <Play className="w-7 h-7 text-primary-foreground ml-1" />
                  )}
                </motion.div>
              </div>

              {/* Demo Label */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border border-border/30 rounded-full px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-foreground/80">Demo Preview</span>
              </div>
            </div>

            {/* Sign In CTA Below Video */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Ready to experience Orla yourself?
              </p>
              <Button
                onClick={onSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-full text-base font-medium shadow-lg shadow-primary/30"
              >
                <User className="w-5 h-5 mr-2" />
                Sign In to Start
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestPreview;
