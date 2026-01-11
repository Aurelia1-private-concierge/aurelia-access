import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Loader2,
  ChevronUp,
  ChevronDown,
  Repeat,
  Sparkles,
  Clock,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MusicGenre {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'luxury' | 'jazz' | 'nature' | 'world' | 'modern';
}

const MUSIC_GENRES: MusicGenre[] = [
  // Luxury & Elegant
  { id: 'luxury', name: 'Luxury', icon: '✨', description: 'Elegant piano & orchestra', category: 'luxury' },
  { id: 'classical', name: 'Classical', icon: '🎻', description: 'Romantic orchestral', category: 'luxury' },
  { id: 'piano', name: 'Solo Piano', icon: '🎹', description: 'Modern classical piano', category: 'luxury' },
  
  // Jazz & Lounge
  { id: 'jazz', name: 'Jazz Lounge', icon: '🎷', description: 'Smooth saxophone vibes', category: 'jazz' },
  { id: 'bossa', name: 'Bossa Nova', icon: '🌴', description: 'Brazilian café', category: 'jazz' },
  { id: 'lounge', name: 'Chill Lounge', icon: '🎧', description: 'Modern electronic', category: 'jazz' },
  
  // Nature & Ambient
  { id: 'nature', name: 'Forest', icon: '🌿', description: 'Rain & forest sounds', category: 'nature' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', description: 'Calming waves', category: 'nature' },
  { id: 'rain', name: 'Rain', icon: '🌧️', description: 'Cozy rainfall', category: 'nature' },
  { id: 'fireplace', name: 'Fireplace', icon: '🔥', description: 'Crackling warmth', category: 'nature' },
  
  // World & Cultural
  { id: 'mediterranean', name: 'Mediterranean', icon: '🌅', description: 'Coastal evening', category: 'world' },
  { id: 'arabic', name: 'Arabian', icon: '🏜️', description: 'Exotic oud melodies', category: 'world' },
  { id: 'asian', name: 'Zen Garden', icon: '🎋', description: 'Eastern serenity', category: 'world' },
  
  // Modern & Electronic
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', description: 'Epic orchestral', category: 'modern' },
  { id: 'synthwave', name: 'Synthwave', icon: '🌆', description: 'Retro-futuristic', category: 'modern' },
  { id: 'minimal', name: 'Minimal', icon: '◯', description: 'Ambient drones', category: 'modern' },
];

const DURATION_OPTIONS = [
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];

const CATEGORY_LABELS: Record<string, string> = {
  luxury: 'Luxury & Elegant',
  jazz: 'Jazz & Lounge',
  nature: 'Nature & Ambient',
  world: 'World & Cultural',
  modern: 'Modern & Electronic',
};

const MusicPlayer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>(MUSIC_GENRES[0]);
  const [selectedDuration, setSelectedDuration] = useState(120);
  const [volume, setVolume] = useState(0.4);
  const [isLooping, setIsLooping] = useState(true);
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
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

  // Track playback time
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setTotalDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef.current]);

  const generateMusic = useCallback(async (genre: string, duration: number) => {
    const cacheKey = `${genre}-${duration}`;
    
    // Check cache first
    if (audioCache.current.has(cacheKey)) {
      return audioCache.current.get(cacheKey)!;
    }

    const { data, error } = await supabase.functions.invoke('generate-ambient-music', {
      body: { genre, duration },
    });

    if (error) throw error;
    if (!data?.audioUrl) throw new Error('No audio URL received');

    // Use the curated audio URL directly
    audioCache.current.set(cacheKey, data.audioUrl);
    return data.audioUrl;
  }, []);

  const playGenre = useCallback(async (genre: MusicGenre, duration?: number) => {
    setIsLoading(true);
    setSelectedGenre(genre);
    const dur = duration || selectedDuration;

    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      toast({
        title: `${genre.icon} Generating ${genre.name}`,
        description: `Creating ${dur / 60} minute track...`,
      });

      const audioUrl = await generateMusic(genre.id, dur);
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
        title: `${genre.icon} Now Playing`,
        description: `${genre.name} - ${genre.description}`,
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
  }, [generateMusic, isLooping, volume, selectedDuration]);

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
      await playGenre(selectedGenre);
    }
  }, [isPlaying, playGenre, selectedGenre]);

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

  const skipToNext = useCallback(() => {
    const currentIndex = MUSIC_GENRES.findIndex(g => g.id === selectedGenre.id);
    const nextIndex = (currentIndex + 1) % MUSIC_GENRES.length;
    playGenre(MUSIC_GENRES[nextIndex]);
  }, [selectedGenre, playGenre]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Group genres by category
  const genresByCategory = MUSIC_GENRES.reduce((acc, genre) => {
    if (!acc[genre.category]) acc[genre.category] = [];
    acc[genre.category].push(genre);
    return acc;
  }, {} as Record<string, MusicGenre[]>);

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      {/* Compact Player */}
      <motion.div
        layout
        className={`bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-[320px] sm:w-[380px]' : 'w-auto'
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

          {/* Visualizer & Current Genre */}
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

            {/* Current Genre Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedGenre.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedGenre.name}
                  </p>
                  {isExpanded && totalDuration > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skip Button */}
          {isPlaying && (
            <button
              onClick={skipToNext}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <SkipForward className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

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

              {/* Duration & Loop Controls */}
              <div className="px-4 pb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mr-2">Duration:</span>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedDuration === opt.value
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={toggleLoop}
                  className={`p-2 rounded-full transition-colors ${
                    isLooping ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Genre Selector Toggle */}
              <div className="border-t border-border/50">
                <button
                  onClick={() => setShowGenreSelector(!showGenreSelector)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Choose Genre</span>
                    <Badge variant="outline" className="text-[10px]">
                      {MUSIC_GENRES.length} genres
                    </Badge>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showGenreSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Genre Grid by Category */}
                <AnimatePresence>
                  {showGenreSelector && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden max-h-[300px] overflow-y-auto"
                    >
                      <div className="px-3 pb-3 space-y-4">
                        {Object.entries(genresByCategory).map(([category, genres]) => (
                          <div key={category}>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">
                              {CATEGORY_LABELS[category]}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {genres.map((genre) => (
                                <motion.button
                                  key={genre.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    playGenre(genre);
                                    setShowGenreSelector(false);
                                  }}
                                  disabled={isLoading}
                                  className={`p-3 rounded-xl text-left transition-all ${
                                    selectedGenre.id === genre.id
                                      ? 'bg-primary/20 border border-primary/40'
                                      : 'bg-muted/50 border border-transparent hover:border-primary/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{genre.icon}</span>
                                    <span className="text-sm font-medium text-foreground">{genre.name}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{genre.description}</p>
                                </motion.button>
                              ))}
                            </div>
                          </div>
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
