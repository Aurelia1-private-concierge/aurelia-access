import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

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

// Static fallback audio path
const FALLBACK_AUDIO = '/audio/ambient-luxury.mp3';

export const useContextualSoundscapes = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [useFallback, setUseFallback] = useState(false);
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

  // Change soundscape when section changes (only if not using fallback)
  useEffect(() => {
    if (!isEnabled || !isPlaying || useFallback) return;
    
    const sectionConfig = SECTION_SOUNDSCAPES.find(s => s.section === currentSection);
    if (sectionConfig && audioCache.current.has(currentSection)) {
      transitionToSoundscape(currentSection);
    }
  }, [currentSection, isEnabled, isPlaying, useFallback]);

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
          }).catch(console.error);
        }
      }
    }, 50);
  }, [volume]);

  const initializeAudio = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Use static fallback audio (ElevenLabs music API requires special permissions)
      console.log('Initializing ambient audio...');
      audioRef.current = new Audio(FALLBACK_AUDIO);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      setUseFallback(true);
    } catch (error) {
      console.error('Error initializing audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [volume]);

  const toggleSoundscapes = useCallback(async () => {
    if (!isEnabled) {
      setIsEnabled(true);
      if (!audioRef.current) {
        await initializeAudio();
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing audio:', error);
          toast.error('Unable to play audio', {
            description: 'Please try again or check your browser settings',
          });
        }
      }
    }
  }, [isEnabled, isPlaying, initializeAudio]);

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
    useFallback,
  };
};

export default useContextualSoundscapes;
