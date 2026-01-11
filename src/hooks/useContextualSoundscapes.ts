import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SoundscapeConfig {
  section: string;
  style: string;
  description: string;
}

const SECTION_SOUNDSCAPES: SoundscapeConfig[] = [
  { section: 'hero', style: 'luxury', description: 'Elegant piano & strings' },
  { section: 'experiences', style: 'adventure', description: 'Inspiring orchestral' },
  { section: 'services', style: 'professional', description: 'Sophisticated jazz' },
  { section: 'security', style: 'trust', description: 'Calm & reassuring' },
  { section: 'testimonials', style: 'warm', description: 'Soft emotional strings' },
  { section: 'contact', style: 'welcoming', description: 'Gentle ambient' },
  { section: 'membership', style: 'exclusive', description: 'Premium lounge' },
  { section: 'global', style: 'worldly', description: 'Cultural fusion' },
];

export const useContextualSoundscapes = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  const lastSectionRef = useRef<string>('');

  // Monitor scroll position to detect current section
  useEffect(() => {
    if (!isEnabled) return;

    const handleScroll = () => {
      const sections = ['hero', 'experiences', 'services', 'security', 'testimonials', 'membership', 'contact', 'global'];
      const scrollY = window.scrollY + window.innerHeight / 2;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const absoluteTop = rect.top + window.scrollY;
          const absoluteBottom = absoluteTop + rect.height;

          if (scrollY >= absoluteTop && scrollY < absoluteBottom) {
            if (sectionId !== lastSectionRef.current) {
              setCurrentSection(sectionId);
              lastSectionRef.current = sectionId;
            }
            break;
          }
        }
      }
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [isEnabled]);

  // Change soundscape when section changes
  useEffect(() => {
    if (!isEnabled || !isPlaying) return;
    
    const sectionConfig = SECTION_SOUNDSCAPES.find(s => s.section === currentSection);
    if (sectionConfig && audioCache.current.has(currentSection)) {
      transitionToSoundscape(currentSection);
    }
  }, [currentSection, isEnabled, isPlaying]);

  const transitionToSoundscape = useCallback((section: string) => {
    const cachedAudio = audioCache.current.get(section);
    if (!cachedAudio || !audioRef.current) return;

    // Fade out current audio
    const fadeOut = setInterval(() => {
      if (audioRef.current && audioRef.current.volume > 0.05) {
        audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
      } else {
        clearInterval(fadeOut);
        if (audioRef.current) {
          audioRef.current.src = cachedAudio;
          audioRef.current.volume = 0;
          audioRef.current.play().then(() => {
            // Fade in new audio
            const fadeIn = setInterval(() => {
              if (audioRef.current && audioRef.current.volume < volume) {
                audioRef.current.volume = Math.min(volume, audioRef.current.volume + 0.05);
              } else {
                clearInterval(fadeIn);
              }
            }, 50);
          });
        }
      }
    }, 50);
  }, [volume]);

  const preloadSoundscapes = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Preload hero section first
      const { data, error } = await supabase.functions.invoke('generate-ambient-music', {
        body: { genre: 'luxury' },
      });

      if (error) throw error;
      if (data?.audioUrl) {
        audioCache.current.set('hero', data.audioUrl);
        
        // Initialize audio element
        audioRef.current = new Audio(data.audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
      }
    } catch (error) {
      console.error('Error preloading soundscapes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [volume]);

  const toggleSoundscapes = useCallback(async () => {
    if (!isEnabled) {
      setIsEnabled(true);
      if (!audioRef.current) {
        await preloadSoundscapes();
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isEnabled, isPlaying, preloadSoundscapes]);

  const setAudioVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const getCurrentSoundscape = useCallback(() => {
    return SECTION_SOUNDSCAPES.find(s => s.section === currentSection) || SECTION_SOUNDSCAPES[0];
  }, [currentSection]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    isEnabled,
    setIsEnabled,
    isPlaying,
    isLoading,
    currentSection,
    volume,
    setVolume: setAudioVolume,
    toggleSoundscapes,
    getCurrentSoundscape,
    soundscapes: SECTION_SOUNDSCAPES,
  };
};

export default useContextualSoundscapes;
