import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar,
  MapPin,
  Link as LinkIcon,
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  ExternalLink,
  Verified
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import aureliaSocialLogo from "@/assets/aurelia-social-logo.png";
import aureliaSocialBanner from "@/assets/aurelia-social-banner.png";

// X/Twitter icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const tweets = [
  {
    id: 1,
    content: "Aurelia Private Concierge is officially live. ✈️\n\nBespoke luxury lifestyle management, redefined for the modern era.\n\nWelcome to the beginning of something extraordinary.",
    timestamp: "2h",
    replies: 12,
    reposts: 34,
    likes: 89,
    views: "1.2K"
  },
  {
    id: 2,
    content: "The future of luxury isn't about having more. It's about having exactly what you need, precisely when you need it.\n\nMeet Orla, our AI concierge who learns your preferences before you even know them yourself.",
    timestamp: "8h",
    replies: 8,
    reposts: 19,
    likes: 67,
    views: "892"
  },
  {
    id: 3,
    content: "Private jets. Superyachts. Impossible reservations. Exclusive access.\n\nThis is what we do.\n\nWelcome to Aurelia.",
    timestamp: "1d",
    replies: 23,
    reposts: 56,
    likes: 145,
    views: "2.1K"
  },
  {
    id: 4,
    content: "\"Money can't buy time.\"\n\nDisagree. Our members will save 40+ hours per month on logistics, bookings, and arrangements.\n\nTime is the ultimate luxury. We give it back to you.",
    timestamp: "2d",
    replies: 31,
    reposts: 89,
    likes: 234,
    views: "3.4K"
  },
  {
    id: 5,
    content: "Building our global partner network—from Michelin-starred restaurants to private aviation providers.\n\nThe access you deserve is coming. 🍣",
    timestamp: "3d",
    replies: 15,
    reposts: 42,
    likes: 121,
    views: "1.8K"
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

const TWITTER_URL = "https://x.com/AureliaPrivate_";

const TwitterProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedTweets, setLikedTweets] = useState<number[]>([]);
  const [repostedTweets, setRepostedTweets] = useState<number[]>([]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: isFollowing ? "You've unfollowed Aurelia Private Concierge" : "You're now following Aurelia Private Concierge",
    });
  };

  const handleLike = (tweetId: number) => {
    if (likedTweets.includes(tweetId)) {
      setLikedTweets(likedTweets.filter(id => id !== tweetId));
    } else {
      setLikedTweets([...likedTweets, tweetId]);
    }
  };

  const handleRepost = (tweetId: number) => {
    if (repostedTweets.includes(tweetId)) {
      setRepostedTweets(repostedTweets.filter(id => id !== tweetId));
    } else {
      setRepostedTweets([...repostedTweets, tweetId]);
      toast({
        title: "Reposted!",
        description: "This post has been reposted to your timeline",
      });
    }
  };

  const handleShare = (tweet?: typeof tweets[0]) => {
    const url = tweet ? `${TWITTER_URL}/status/${tweet.id}` : TWITTER_URL;
    if (navigator.share) {
      navigator.share({
        title: "Aurelia Private Concierge",
        text: tweet?.content || "Check out Aurelia Private Concierge on X",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-2xl">
        {/* Cover Image */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-48 rounded-t-xl relative overflow-hidden"
        >
          <img src={aureliaSocialBanner} alt="Aurelia Banner" className="absolute inset-0 w-full h-full object-cover" />
        </motion.div>

        {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-4 pb-4 border-b border-border"
        >
          {/* Profile Picture */}
          <div className="absolute -top-16 left-4">
            <div className="w-32 h-32 rounded-full ring-4 ring-background overflow-hidden">
              <img 
                src={aureliaSocialLogo} 
                alt="Aurelia" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Follow Button */}
          <div className="flex justify-end pt-3 mb-16">
            <Button 
              className={`rounded-full px-6 ${isFollowing ? 'bg-transparent border border-border text-foreground hover:border-red-500 hover:text-red-500' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          {/* Name and Handle */}
          <div className="mb-3">
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold text-foreground">Aurelia Private Concierge</h1>
              <Verified className="w-5 h-5 text-primary fill-primary" />
            </div>
            <p className="text-muted-foreground">@aureliaprivate</p>
          </div>

          {/* Bio */}
          <div className="text-foreground mb-3 space-y-1">
            <p>✨ Your Private World, Perfected</p>
            <p>🌍 Elite concierge for discerning clients</p>
            <p>✈️ Private Jets • Yachts • Experiences</p>
            <p>🤖 Meet Orla, your AI concierge</p>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              London • Dubai • Monaco
            </span>
            <a 
              href="https://aurelia-privateconcierge.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <LinkIcon className="w-4 h-4" />
              aurelia-privateconcierge.com
            </a>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined January 2024
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <span className="hover:underline cursor-pointer">
              <strong className="text-foreground">56</strong>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
            <span className="hover:underline cursor-pointer">
              <strong className="text-foreground">1,254</strong>{" "}
              <span className="text-muted-foreground">Followers</span>
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0">
            <TabsTrigger 
              value="posts" 
              className="flex-1 max-w-[120px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-semibold"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="replies" 
              className="flex-1 max-w-[120px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-semibold"
            >
              Replies
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="flex-1 max-w-[120px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-semibold"
            >
              Media
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="flex-1 max-w-[120px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-semibold"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <div className="divide-y divide-border">
              {tweets.map((tweet, index) => (
                <motion.article 
                  key={tweet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={aureliaSocialLogo} 
                        alt="Aurelia" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold text-foreground truncate">Aurelia Private Concierge</span>
                        <Verified className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                        <span className="text-muted-foreground truncate">@aureliaprivate · {tweet.timestamp}</span>
                      </div>

                      {/* Content */}
                      <p className="text-foreground whitespace-pre-line mb-3">
                        {tweet.content}
                      </p>

                      {/* Actions */}
                      <div className="flex justify-between max-w-md text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors group">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{formatNumber(tweet.replies)}</span>
                        </button>
                        <button 
                          className={`flex items-center gap-1 transition-colors group ${repostedTweets.includes(tweet.id) ? 'text-green-500' : 'hover:text-green-500'}`}
                          onClick={(e) => { e.stopPropagation(); handleRepost(tweet.id); }}
                        >
                          <Repeat2 className="w-4 h-4" />
                          <span className="text-sm">{formatNumber(tweet.reposts + (repostedTweets.includes(tweet.id) ? 1 : 0))}</span>
                        </button>
                        <button 
                          className={`flex items-center gap-1 transition-colors group ${likedTweets.includes(tweet.id) ? 'text-red-500' : 'hover:text-red-500'}`}
                          onClick={(e) => { e.stopPropagation(); handleLike(tweet.id); }}
                        >
                          <Heart className={`w-4 h-4 ${likedTweets.includes(tweet.id) ? 'fill-red-500' : ''}`} />
                          <span className="text-sm">{formatNumber(tweet.likes + (likedTweets.includes(tweet.id) ? 1 : 0))}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <span className="text-sm">{tweet.views}</span>
                        </button>
                        <button 
                          className="hover:text-primary transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleShare(tweet); }}
                        >
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="replies" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No replies yet</p>
              <p className="text-sm">When @aureliaprivate replies, they'll show up here.</p>
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <div className="grid grid-cols-3 gap-1 p-1">
              {[
                "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop"
              ].map((img, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square cursor-pointer overflow-hidden"
                >
                  <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No likes yet</p>
              <p className="text-sm">Posts @aureliaprivate likes will show up here.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button 
            size="lg"
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-full"
            onClick={() => window.open(TWITTER_URL, '_blank')}
          >
            <XIcon className="w-5 h-5" />
            Follow on X
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default TwitterProfile;
