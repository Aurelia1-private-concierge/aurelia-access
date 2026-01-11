import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Loader2,
  X,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AmbientAudioControls: React.FC = () => {
  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Narrator state
  const [isNarratorPlaying, setIsNarratorPlaying] = useState(false);
  const [isNarratorLoading, setIsNarratorLoading] = useState(false);
  const narratorAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // UI state
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Dismiss tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const generateAmbientMusic = useCallback(async () => {
    setIsMusicLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ambient-music', {
        body: { style: 'luxury' },
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content received');

      // Create audio element with base64 data
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = musicVolume;
      
      musicAudioRef.current = audio;
      await audio.play();
      setIsMusicPlaying(true);
      
      toast({
        title: 'Ambient Music',
        description: 'Soft piano & strings now playing',
      });
    } catch (error: any) {
      console.error('Music generation error:', error);
      toast({
        title: 'Music Unavailable',
        description: 'Could not generate ambient music. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMusicLoading(false);
    }
  }, [musicVolume]);

  const toggleMusic = useCallback(async () => {
    if (musicAudioRef.current) {
      if (isMusicPlaying) {
        musicAudioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        await musicAudioRef.current.play();
        setIsMusicPlaying(true);
      }
    } else {
      await generateAmbientMusic();
    }
  }, [isMusicPlaying, generateAmbientMusic]);

  const handleMusicVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setMusicVolume(newVolume);
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = newVolume;
    }
  }, []);

  const startNarrator = useCallback(async () => {
    setIsNarratorLoading(true);
    try {
      // Lower music volume during narration
      if (musicAudioRef.current && isMusicPlaying) {
        musicAudioRef.current.volume = musicVolume * 0.3;
      }

      const { data, error } = await supabase.functions.invoke('narrate-tour', {
        body: {},
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content received');

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audio.volume = 1;
      
      audio.onended = () => {
        setIsNarratorPlaying(false);
        // Restore music volume
        if (musicAudioRef.current && isMusicPlaying) {
          musicAudioRef.current.volume = musicVolume;
        }
      };
      
      narratorAudioRef.current = audio;
      await audio.play();
      setIsNarratorPlaying(true);
      
      toast({
        title: 'Audio Tour Started',
        description: 'Your personal guide to Aurelia',
      });
    } catch (error: any) {
      console.error('Narrator error:', error);
      toast({
        title: 'Tour Unavailable',
        description: 'Could not start audio tour. Please try again.',
        variant: 'destructive',
      });
      // Restore music volume on error
      if (musicAudioRef.current && isMusicPlaying) {
        musicAudioRef.current.volume = musicVolume;
      }
    } finally {
      setIsNarratorLoading(false);
    }
  }, [isMusicPlaying, musicVolume]);

  const toggleNarrator = useCallback(async () => {
    if (narratorAudioRef.current && isNarratorPlaying) {
      narratorAudioRef.current.pause();
      narratorAudioRef.current.currentTime = 0;
      setIsNarratorPlaying(false);
      // Restore music volume
      if (musicAudioRef.current && isMusicPlaying) {
        musicAudioRef.current.volume = musicVolume;
      }
    } else {
      await startNarrator();
    }
  }, [isNarratorPlaying, startNarrator, isMusicPlaying, musicVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
      if (narratorAudioRef.current) {
        narratorAudioRef.current.pause();
        narratorAudioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-lg px-4 py-2 shadow-lg max-w-[200px]"
          >
            <p className="text-sm text-muted-foreground">
              <span className="text-primary">✨</span> Enhance your experience with ambient music & audio tour
            </p>
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 p-1 bg-card rounded-full border border-border"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-5 shadow-2xl min-w-[280px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Headphones className="w-4 h-4 text-primary" />
                Audio Experience
              </h3>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Ambient Music Section */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Ambient Music
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMusic}
                  disabled={isMusicLoading}
                  className="h-8 px-3"
                >
                  {isMusicLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isMusicPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </>
                  )}
                </Button>
              </div>
              
              {/* Volume Slider */}
              <div className="flex items-center gap-3">
                {musicVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
                <Slider
                  value={[musicVolume]}
                  onValueChange={handleMusicVolumeChange}
                  max={1}
                  step={0.05}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50 my-4" />

            {/* Audio Tour Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Audio Tour
                </span>
              </div>
              
              <Button
                onClick={toggleNarrator}
                disabled={isNarratorLoading}
                variant={isNarratorPlaying ? "destructive" : "default"}
                className="w-full"
              >
                {isNarratorLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Preparing Tour...
                  </>
                ) : isNarratorPlaying ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Tour
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Guided Tour
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                {isNarratorPlaying 
                  ? "Your personal guide is speaking..."
                  : "A sophisticated voice guide through Aurelia"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative p-4 rounded-full shadow-lg transition-all duration-300
          ${isExpanded || isMusicPlaying || isNarratorPlaying
            ? 'bg-primary text-primary-foreground'
            : 'bg-card/95 backdrop-blur-xl border border-primary/30 text-primary hover:bg-primary/10'
          }
        `}
      >
        <Music className="w-6 h-6" />
        
        {/* Playing indicator */}
        {(isMusicPlaying || isNarratorPlaying) && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        {/* Loading indicator */}
        {(isMusicLoading || isNarratorLoading) && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default AmbientAudioControls;
