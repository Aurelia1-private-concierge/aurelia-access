import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  Repeat,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MusicMood {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const MUSIC_MOODS: MusicMood[] = [
  { id: 'luxury', name: 'Luxury', icon: '✨', description: 'Elegant piano & strings' },
  { id: 'jazz', name: 'Jazz Lounge', icon: '🎷', description: 'Smooth saxophone vibes' },
  { id: 'nature', name: 'Nature', icon: '🌿', description: 'Rain & forest sounds' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', description: 'Calming waves' },
  { id: 'fireplace', name: 'Fireplace', icon: '🔥', description: 'Cozy crackling fire' },
  { id: 'piano', name: 'Piano', icon: '🎹', description: 'Solo piano melodies' },
  { id: 'lounge', name: 'Chill Lounge', icon: '🎧', description: 'Modern electronic' },
  { id: 'classical', name: 'Classical', icon: '🎻', description: 'Orchestral elegance' },
];

const MusicPlayer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MusicMood>(MUSIC_MOODS[0]);
  const [volume, setVolume] = useState(0.4);
  const [isLooping, setIsLooping] = useState(true);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());

  // Visualizer bars
  const [visualizerBars, setVisualizerBars] = useState<number[]>([0.3, 0.5, 0.7, 0.4, 0.6]);

  // Animate visualizer when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVisualizerBars(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const generateMusic = useCallback(async (mood: string) => {
    // Check cache first
    if (audioCache.current.has(mood)) {
      return audioCache.current.get(mood)!;
    }

    const { data, error } = await supabase.functions.invoke('generate-ambient-sfx', {
      body: { mood, duration: 22 },
    });

    if (error) throw error;
    if (!data?.audioContent) throw new Error('No audio content received');

    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    audioCache.current.set(mood, audioUrl);
    return audioUrl;
  }, []);

  const playMood = useCallback(async (mood: MusicMood) => {
    setIsLoading(true);
    setSelectedMood(mood);

    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audioUrl = await generateMusic(mood.id);
      const audio = new Audio(audioUrl);
      audio.loop = isLooping;
      audio.volume = volume;

      audio.onended = () => {
        if (!isLooping) {
          setIsPlaying(false);
        }
      };

      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);

      toast({
        title: `${mood.icon} ${mood.name}`,
        description: mood.description,
      });
    } catch (error: any) {
      console.error('Music generation error:', error);
      toast({
        title: 'Music Unavailable',
        description: 'Could not generate ambient music. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [generateMusic, isLooping, volume]);

  const togglePlayPause = useCallback(async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // First time - generate and play
      await playMood(selectedMood);
    }
  }, [isPlaying, playMood, selectedMood]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => {
      const newValue = !prev;
      if (audioRef.current) {
        audioRef.current.loop = newValue;
      }
      return newValue;
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      {/* Compact Player */}
      <motion.div
        layout
        className={`bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-[280px] sm:w-[320px]' : 'w-auto'
        }`}
      >
        {/* Main Controls Bar */}
        <div className="p-3 flex items-center gap-3">
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`p-3 rounded-full transition-all duration-300 ${
              isPlaying 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-primary/10 text-foreground'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </motion.button>

          {/* Visualizer & Current Mood */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {/* Mini Visualizer */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-4">
                {visualizerBars.map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{ height: `${height * 100}%` }}
                    transition={{ duration: 0.15 }}
                  />
                ))}
              </div>
            )}

            {/* Current Mood Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedMood.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedMood.name}
                  </p>
                  {isExpanded && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {selectedMood.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Volume Toggle */}
          <button
            onClick={() => handleVolumeChange([volume === 0 ? 0.4 : 0])}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50"
            >
              {/* Volume Slider */}
              <div className="px-4 py-3 flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.05}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>

              {/* Loop Toggle */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Auto-repeat</span>
                <button
                  onClick={toggleLoop}
                  className={`p-2 rounded-full transition-colors ${
                    isLooping ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Mood Selector Toggle */}
              <div className="border-t border-border/50">
                <button
                  onClick={() => setShowMoodSelector(!showMoodSelector)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Change Mood</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showMoodSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Mood Grid */}
                <AnimatePresence>
                  {showMoodSelector && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                        {MUSIC_MOODS.map((mood) => (
                          <motion.button
                            key={mood.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              playMood(mood);
                              setShowMoodSelector(false);
                            }}
                            disabled={isLoading}
                            className={`p-3 rounded-xl text-left transition-all ${
                              selectedMood.id === mood.id
                                ? 'bg-primary/20 border border-primary/40'
                                : 'bg-muted/50 border border-transparent hover:border-primary/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{mood.icon}</span>
                              <span className="text-sm font-medium text-foreground">{mood.name}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{mood.description}</p>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Playing indicator pulse */}
      {isPlaying && !isExpanded && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default MusicPlayer;
