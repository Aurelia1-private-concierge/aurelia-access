import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share2,
  Bookmark,
  ExternalLink,
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
import heroVideo from "@/assets/hero-luxury-holiday.mp4";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const videos = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=700&fit=crop",
    views: 12400,
    likes: 2100,
    comments: 89,
    caption: "When your client needs a private jet in 2 hours ✈️ #luxury #concierge #privatejet",
    videoSrc: heroVideo
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=700&fit=crop",
    views: 8900,
    likes: 1560,
    comments: 67,
    caption: "POV: You're on a superyacht in Monaco 🛥️ #yacht #monaco #luxury",
    videoSrc: heroVideo
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=700&fit=crop",
    views: 15200,
    likes: 2890,
    comments: 124,
    caption: "The view from our client's penthouse 🌆 #luxury #lifestyle #penthouse",
    videoSrc: heroVideo
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=700&fit=crop",
    views: 6800,
    likes: 980,
    comments: 43,
    caption: "Backstage access at Fashion Week 👗 #exclusive #events #fashionweek",
    videoSrc: heroVideo
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=700&fit=crop",
    views: 9500,
    likes: 1780,
    comments: 78,
    caption: "3 Michelin star dinner for 2, arranged in 30 mins 🍽️ #finedining #michelin",
    videoSrc: heroVideo
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=700&fit=crop",
    views: 11200,
    likes: 2340,
    comments: 96,
    caption: "Secret spots only locals know about 🏔️ #travel #hidden #exclusive",
    videoSrc: heroVideo
  }
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const TIKTOK_URL = "https://www.tiktok.com/@aurelia.private.concierge";

const TikTokProfile = () => {
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: isFollowing ? "You've unfollowed Aurelia Private Concierge" : "You're now following Aurelia Private Concierge",
    });
  };

  const handleMessage = () => {
    window.open(TIKTOK_URL, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Aurelia Private Concierge - TikTok",
        text: "Check out Aurelia Private Concierge on TikTok",
        url: TIKTOK_URL,
      });
    } else {
      navigator.clipboard.writeText(TIKTOK_URL);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard",
      });
    }
  };

  const handleLike = (videoId: number) => {
    if (likedVideos.includes(videoId)) {
      setLikedVideos(likedVideos.filter(id => id !== videoId));
    } else {
      setLikedVideos([...likedVideos, videoId]);
    }
  };

  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-2xl">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Profile Picture */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <img 
              src={aureliaSocialLogo} 
              alt="Aurelia Private Concierge"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Username */}
          <h1 className="text-xl font-bold text-foreground mb-1">@aurelia.private.concierge</h1>
          <p className="text-muted-foreground text-sm mb-4">Aurelia Private Concierge</p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="font-bold text-foreground">24</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground">125.4K</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground">{formatNumber(totalLikes)}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mb-4">
            <Button 
              className={`px-8 ${isFollowing ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-[#fe2c55] hover:bg-[#fe2c55]/90'}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" className="px-4" onClick={handleMessage}>
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="px-4" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Bio */}
          <p className="text-sm text-foreground max-w-sm mx-auto">
            ✨ Your Private World, Perfected<br />
            🌍 Elite concierge for discerning clients<br />
            ✈️ Private jets • Yachts • Experiences<br />
            🔗 <a href="https://aurelia-privateconcierge.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aurelia-privateconcierge.com</a>
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full justify-center bg-transparent border-b border-border rounded-none h-auto p-0 mb-2">
            <TabsTrigger 
              value="videos" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
              </svg>
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <Heart className="w-5 h-5" />
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <Bookmark className="w-5 h-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-1"
            >
              {videos.map((video, index) => (
                <motion.div 
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-[9/16] group cursor-pointer overflow-hidden rounded-sm"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img 
                    src={video.thumbnail} 
                    alt={`Video ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                    <Play className="w-3 h-3 fill-white" />
                    {formatNumber(video.views)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="liked" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">Videos this user liked</p>
              <p className="text-sm">Videos liked by aurelia.private.concierge</p>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">Favorite videos</p>
              <p className="text-sm">Your favorite videos will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Featured Video Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-card rounded-xl border border-border overflow-hidden cursor-pointer"
          onClick={() => setSelectedVideo(videos[2])}
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Play className="w-4 h-4 text-[#fe2c55]" />
              Most Viral Video
            </h3>
          </div>
          <div className="relative aspect-video">
            <img 
              src={videos[2].thumbnail} 
              alt="Featured video"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground mb-3">{videos[2].caption}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(videos[2].views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {formatNumber(videos[2].likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {formatNumber(videos[2].comments)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button 
            size="lg"
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => window.open(TIKTOK_URL, '_blank')}
          >
            <TikTokIcon className="w-5 h-5" />
            Follow on TikTok
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-black border-none">
          <div className="relative aspect-[9/16]">
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
                loop
              />
            )}
            {/* Side actions */}
            {selectedVideo && (
              <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
                <button 
                  className="flex flex-col items-center"
                  onClick={() => handleLike(selectedVideo.id)}
                >
                  <Heart className={`w-8 h-8 text-white ${likedVideos.includes(selectedVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-white text-xs mt-1">{formatNumber(selectedVideo.likes)}</span>
                </button>
                <button className="flex flex-col items-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                  <span className="text-white text-xs mt-1">{formatNumber(selectedVideo.comments)}</span>
                </button>
                <button className="flex flex-col items-center" onClick={handleShare}>
                  <Share2 className="w-8 h-8 text-white" />
                  <span className="text-white text-xs mt-1">Share</span>
                </button>
              </div>
            )}
          </div>
          {selectedVideo && (
            <div className="p-4 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={aureliaSocialLogo} alt="Aurelia" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">@aurelia.private.concierge</p>
                </div>
              </div>
              <p className="text-sm text-foreground">{selectedVideo.caption}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default TikTokProfile;
