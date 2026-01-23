import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  ChevronLeft,
  ChevronRight,
  PictureInPicture2
} from 'lucide-react';
import { GalleryVideo, formatDuration } from '@/lib/video-gallery-data';

interface VideoLightboxProps {
  video: GalleryVideo | null;
  videos: GalleryVideo[];
  onClose: () => void;
  onNavigate: (video: GalleryVideo) => void;
}

const VideoLightbox = ({ video, videos, onClose, onNavigate }: VideoLightboxProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex = videos.findIndex(v => v.id === video?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Picture-in-Picture
  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported:', err);
    }
  }, []);

  // Seek on progress bar click
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  }, []);

  // Navigate to prev/next
  const goToPrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(videos[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, videos, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      onNavigate(videos[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, videos, onNavigate]);

  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, togglePlay, goToPrev, goToNext, toggleMute, toggleFullscreen]);

  // Video event handlers
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      const percent = (videoEl.currentTime / videoEl.duration) * 100;
      setProgress(percent);
      setCurrentTime(formatTime(videoEl.currentTime));
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(videoEl.duration));
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (hasNext) {
        goToNext();
      } else {
        setIsPlaying(false);
      }
    };

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [video, hasNext, goToNext]);

  // Reset state when video changes
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    setCurrentTime('0:00');
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay blocked
      });
    }
  }, [video?.id]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!video) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
        onClick={onClose}
        onMouseMove={showControlsTemporarily}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
          aria-label="Close video"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous button */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Next button */}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
            aria-label="Next video"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Video container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-6xl mx-6 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
            onClick={togglePlay}
          />

          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-12 h-12 border-2 border-primary/30 rounded-full border-t-primary animate-spin" />
            </div>
          )}

          {/* Play overlay when paused */}
          {!isPlaying && !isLoading && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              aria-label="Play video"
            >
              <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </button>
          )}

          {/* Controls bar */}
          <motion.div
            initial={false}
            animate={{ opacity: showControls ? 1 : 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12"
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="h-1 bg-foreground/20 rounded-full cursor-pointer mb-4 group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>

                {/* Time */}
                <span className="text-sm text-foreground/80">
                  {currentTime} / {duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* PiP */}
                <button
                  onClick={togglePiP}
                  className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Video info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center max-w-2xl px-6"
        >
          <h2 className="text-xl font-medium text-foreground mb-2">{video.title}</h2>
          <p className="text-sm text-muted-foreground">{video.description}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoLightbox;
