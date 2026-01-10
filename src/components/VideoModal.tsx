import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
}

const VideoModal = ({ isOpen, onClose, videoSrc, title = "Experience Aurelia" }: VideoModalProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="w-8 h-px bg-primary/40" />
                <h3 
                  className="text-lg text-foreground/80 tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-card border border-border/20 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-6 h-6 z-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-primary/40" />
                <div className="absolute top-0 left-0 w-px h-full bg-primary/40" />
              </div>
              <div className="absolute top-3 right-3 w-6 h-6 z-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-px bg-primary/40" />
                <div className="absolute top-0 right-0 w-px h-full bg-primary/40" />
              </div>
              <div className="absolute bottom-3 left-3 w-6 h-6 z-20 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-px bg-primary/40" />
                <div className="absolute bottom-0 left-0 w-px h-full bg-primary/40" />
              </div>
              <div className="absolute bottom-3 right-3 w-6 h-6 z-20 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-px bg-primary/40" />
                <div className="absolute bottom-0 right-0 w-px h-full bg-primary/40" />
              </div>

              <video
                ref={videoRef}
                src={videoSrc}
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
                onClick={togglePlay}
              />

              {/* Play overlay */}
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/40 cursor-pointer"
                  onClick={togglePlay}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>
              )}

              {/* Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/50 transition-all duration-300"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Footer text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center text-xs text-muted-foreground/50 mt-6 tracking-wide"
            >
              Press ESC or click outside to close
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;