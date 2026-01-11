import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import heroVideo from '@/assets/hero-luxury-holiday.mp4';

interface PictureInPictureProps {
  isEnabled?: boolean;
  onClose?: () => void;
}

const PictureInPicture: React.FC<PictureInPictureProps> = ({ isEnabled = true, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Show PiP when user scrolls past hero section
  useEffect(() => {
    if (!isEnabled) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      
      if (scrollY > heroHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isEnabled]);

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (isMinimized ? 120 : 320);
      const maxY = window.innerHeight - (isMinimized ? 70 : 180);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMinimized]);

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

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isEnabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          drag
          dragMomentum={false}
          style={{
            right: position.x === 0 ? 24 : 'auto',
            bottom: position.y === 0 ? 24 : 'auto',
            left: position.x !== 0 ? position.x : 'auto',
            top: position.y !== 0 ? position.y : 'auto',
          }}
          className={`fixed z-50 rounded-xl overflow-hidden shadow-2xl border border-primary/30 bg-card/95 backdrop-blur-xl cursor-move transition-all duration-300 ${
            isMinimized ? 'w-[120px] h-[70px]' : 'w-[320px] h-[180px]'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

          {/* Controls */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-full bg-background/50 hover:bg-background/70 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3 text-foreground" />
                    ) : (
                      <Play className="w-3 h-3 text-foreground" />
                    )}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-full bg-background/50 hover:bg-background/70 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-3 h-3 text-foreground" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-foreground" />
                    )}
                  </button>
                </div>
                
                <span className="text-[10px] text-foreground/80 uppercase tracking-wider">
                  Aurelia Experience
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top controls */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded bg-background/50 hover:bg-background/70 transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-3 h-3 text-foreground" />
              ) : (
                <Minimize2 className="w-3 h-3 text-foreground" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded bg-background/50 hover:bg-background/70 transition-colors"
            >
              <X className="w-3 h-3 text-foreground" />
            </button>
          </div>

          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <div className="flex items-end gap-0.5 h-3">
                {[0.4, 0.7, 0.5, 0.8, 0.3].map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-primary rounded-full"
                    animate={{ height: [`${height * 100}%`, `${(height + 0.3) * 100}%`, `${height * 100}%`] }}
                    transition={{ duration: 0.5 + i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PictureInPicture;
