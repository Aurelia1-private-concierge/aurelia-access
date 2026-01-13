import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Bell,
  ThumbsUp,
  MessageCircle,
  Share2,
  ExternalLink,
  Video,
  Eye,
  X
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import aureliaSocialLogo from "@/assets/aurelia-social-logo.png";
import aureliaSocialBanner from "@/assets/aurelia-social-banner.png";
import heroJet from "@/assets/hero-jet.mp4";
import heroYacht from "@/assets/hero-yacht.mp4";
import heroPenthouse from "@/assets/hero-penthouse.mp4";
import luxuryCar from "@/assets/luxury-car.mp4";
import luxuryWatch from "@/assets/luxury-watch.mp4";
import luxuryHotel from "@/assets/luxury-hotel.mp4";
// YouTube icon component
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const videos = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=640&h=360&fit=crop",
    title: "Introducing Aurelia Private Concierge | The Art of Bespoke Living",
    views: "2.4K views",
    uploaded: "2 weeks ago",
    duration: "4:32",
    description: "Discover what makes Aurelia the new standard in luxury concierge...",
    videoSrc: heroJet
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=640&h=360&fit=crop",
    title: "A Day in the Life | Private Yacht Experience",
    views: "1.8K views",
    uploaded: "1 week ago",
    duration: "6:15",
    description: "Experience the possibilities aboard a luxury superyacht...",
    videoSrc: heroYacht
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=640&h=360&fit=crop",
    title: "Meet Orla | Your AI Concierge",
    views: "3.1K views",
    uploaded: "1 week ago",
    duration: "3:28",
    description: "Introducing Orla, the AI that anticipates your every need...",
    videoSrc: heroPenthouse
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&h=360&fit=crop",
    title: "Luxury Lifestyle Awaits | Aurelia Preview",
    views: "987 views",
    uploaded: "3 days ago",
    duration: "2:34",
    description: "A glimpse into the world of extraordinary experiences...",
    videoSrc: luxuryCar
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=640&h=360&fit=crop",
    title: "The Art of Collecting | Aurelia Services",
    views: "1.2K views",
    uploaded: "5 days ago",
    duration: "5:11",
    description: "Discover how we source rare timepieces and collectibles...",
    videoSrc: luxuryWatch
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&h=360&fit=crop",
    title: "Exclusive Destinations | Coming Soon",
    views: "845 views",
    uploaded: "1 week ago",
    duration: "4:45",
    description: "Preview of hidden luxury resorts in our growing network...",
    videoSrc: luxuryHotel
  }
];

const shorts = [
  {
    thumbnail: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=700&fit=crop",
    views: "4.2K",
    videoSrc: heroJet
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=700&fit=crop",
    views: "2.8K",
    videoSrc: heroYacht
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=700&fit=crop",
    views: "5.1K",
    videoSrc: heroPenthouse
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=700&fit=crop",
    views: "1.9K",
    videoSrc: luxuryCar
  }
];


const YOUTUBE_URL = "https://youtube.com/@aureliaprivateconcierge";

const YouTubeProfile = () => {
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    toast({
      title: isSubscribed ? "Unsubscribed" : "Subscribed!",
      description: isSubscribed ? "You've unsubscribed from Aurelia Private Concierge" : "Thanks for subscribing to Aurelia Private Concierge",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Aurelia Private Concierge - YouTube",
        text: "Check out Aurelia Private Concierge on YouTube",
        url: YOUTUBE_URL,
      });
    } else {
      navigator.clipboard.writeText(YOUTUBE_URL);
      toast({
        title: "Link copied!",
        description: "Channel link copied to clipboard",
      });
    }
  };

  const handleVideoClick = (video: typeof videos[0]) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        {/* Channel Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-40 md:h-56 rounded-xl relative overflow-hidden mb-6"
        >
          <img src={aureliaSocialBanner} alt="Aurelia Banner" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </motion.div>

        {/* Channel Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-6 mb-8"
        >
          {/* Channel Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-xl">
              <img 
                src={aureliaSocialLogo} 
                alt="Aurelia" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Channel Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Aurelia Private Concierge</h1>
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
              <span>@aureliaprivateconcierge</span>
              <span>•</span>
              <span>1.2K subscribers</span>
              <span>•</span>
              <span>6 videos</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              The world's most exclusive private concierge service. Experience luxury through our lens — private jets, superyachts, off-market properties, and impossible experiences.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button 
                className={`rounded-full gap-2 ${isSubscribed ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                onClick={handleSubscribe}
              >
                <Bell className="w-4 h-4" />
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => window.open(YOUTUBE_URL, '_blank')}>
                Join
              </Button>
              <Button variant="outline" className="rounded-full gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-4 mb-6 overflow-x-auto">
            <TabsTrigger 
              value="home" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-1 font-medium"
            >
              Home
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-1 font-medium"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="shorts" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-1 font-medium"
            >
              Shorts
            </TabsTrigger>
            <TabsTrigger 
              value="playlists" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-1 font-medium"
            >
              Playlists
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-1 font-medium"
            >
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-0">
            {/* Featured Video */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Featured</h3>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-4"
              >
                <div 
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => handleVideoClick(videos[0])}
                >
                  <img 
                    src={videos[0].thumbnail} 
                    alt={videos[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {videos[0].duration}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-semibold text-lg mb-2">{videos[0].title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{videos[0].views} • {videos[0].uploaded}</p>
                  <p className="text-sm text-muted-foreground">{videos[0].description}</p>
                </div>
              </motion.div>
            </div>

            {/* Popular uploads */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Popular uploads</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {videos.slice(1, 4).map((video, index) => (
                  <VideoCard key={video.id} video={video} index={index} onClick={() => handleVideoClick(video)} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            <div className="grid md:grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} onClick={() => handleVideoClick(video)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shorts" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shorts.map((short, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedVideo({ ...videos[0], thumbnail: short.thumbnail, videoSrc: short.videoSrc })}
                >
                  <img 
                    src={short.thumbnail} 
                    alt={`Short ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    {short.views}
                  </div>
                  <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No playlists yet</p>
              <p className="text-sm">Playlists created by this channel will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No community posts</p>
              <p className="text-sm">Community posts from this channel will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Button 
            size="lg"
            className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
            onClick={() => window.open(YOUTUBE_URL, '_blank')}
          >
            <YouTubeIcon className="w-5 h-5" />
            Subscribe on YouTube
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <div className="relative aspect-video">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            {selectedVideo && (
              <video
                src={selectedVideo.videoSrc}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>
          {selectedVideo && (
            <div className="p-4 bg-card">
              <h3 className="font-semibold text-lg text-foreground mb-2">{selectedVideo.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedVideo.views} • {selectedVideo.uploaded}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Like
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Video Card Component
const VideoCard = ({ video, index, onClick }: { video: typeof videos[0]; index: number; onClick: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="cursor-pointer group"
    onClick={onClick}
  >
    <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
      <img 
        src={video.thumbnail} 
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
      </div>
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
        {video.duration}
      </div>
    </div>
    <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
      {video.title}
    </h4>
    <p className="text-xs text-muted-foreground">
      {video.views} • {video.uploaded}
    </p>
  </motion.div>
);

export default YouTubeProfile;
