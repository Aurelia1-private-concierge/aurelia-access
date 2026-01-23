import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { GalleryVideo, formatDuration, CATEGORY_LABELS } from '@/lib/video-gallery-data';

interface VideoCardProps {
  video: GalleryVideo;
  onClick: () => void;
  index: number;
}

const VideoCard = ({ video, onClick, index }: VideoCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Play ${video.title}`}
    >
      {/* Card container */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-card border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10">
        
        {/* Thumbnail / Video Preview */}
        <div className="absolute inset-0">
          {/* Static thumbnail */}
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isHovering && !videoError ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          {/* Video preview on hover */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            preload="none"
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovering && !videoError ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Play button */}
        <motion.div
          initial={false}
          animate={{ 
            scale: isHovering ? 1.1 : 1,
            opacity: isHovering ? 1 : 0.8,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </motion.div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-foreground/90 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded text-xs font-medium text-primary-foreground uppercase tracking-wider">
          {CATEGORY_LABELS[video.category]}
        </div>

        {/* Featured badge */}
        {video.featured && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-accent/90 backdrop-blur-sm rounded text-xs font-medium text-accent-foreground">
            Featured
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>
      </div>
    </motion.article>
  );
};

export default VideoCard;
