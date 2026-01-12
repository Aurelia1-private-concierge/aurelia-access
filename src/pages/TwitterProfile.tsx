import { motion } from "framer-motion";
import { 
  Calendar,
  MapPin,
  Link as LinkIcon,
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  MoreHorizontal,
  ExternalLink,
  Verified,
  Users
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    content: "Just facilitated a last-minute private jet to Monaco for a client's anniversary surprise. From call to takeoff: 47 minutes. ✈️\n\nThis is what bespoke service looks like.",
    timestamp: "2h",
    replies: 127,
    reposts: 342,
    likes: 2841,
    views: "45.2K"
  },
  {
    id: 2,
    content: "The future of luxury isn't about having more. It's about having exactly what you need, precisely when you need it.\n\nMeet Orla, our AI concierge who learns your preferences before you even know them yourself.",
    timestamp: "8h",
    replies: 89,
    reposts: 198,
    likes: 1567,
    views: "28.4K"
  },
  {
    id: 3,
    content: "Off-market property alert: 12,000 sq ft penthouse in Dubai with 360° views just came to our network.\n\nAlready 3 qualified buyers in conversation.\n\nThis is why access matters.",
    timestamp: "1d",
    replies: 234,
    reposts: 567,
    likes: 4521,
    views: "89.1K"
  },
  {
    id: 4,
    content: "\"Money can't buy time.\"\n\nDisagree. Our members save 40+ hours per month on logistics, bookings, and arrangements.\n\nTime is the ultimate luxury. We give it back to you.",
    timestamp: "2d",
    replies: 312,
    reposts: 891,
    likes: 6234,
    views: "124K"
  },
  {
    id: 5,
    content: "New partnership announcement: We've added 15 Michelin-starred restaurants in Tokyo to our priority access network.\n\n48-hour booking window for members.\n\nOmakase season is upon us. 🍣",
    timestamp: "3d",
    replies: 156,
    reposts: 423,
    likes: 3421,
    views: "67.8K"
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

const TwitterProfile = () => {
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
            <Button className="rounded-full px-6">
              Follow
            </Button>
          </div>

          {/* Name and Handle */}
          <div className="mb-3">
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold text-foreground">Aurelia Private Concierge</h1>
              <Verified className="w-5 h-5 text-primary fill-primary" />
            </div>
            <p className="text-muted-foreground">@tye12085</p>
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
            <span className="flex items-center gap-1">
              <LinkIcon className="w-4 h-4" />
              <a href="https://aurelia-privateconcierge.com" className="text-primary hover:underline">
                aurelia-privateconcierge.com
              </a>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined January 2024
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <span>
              <strong className="text-foreground">156</strong>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
            <span>
              <strong className="text-foreground">2,847</strong>{" "}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img 
                        src="/logos/aurelia-logo-light.svg" 
                        alt="Aurelia" 
                        className="w-6 h-6 object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold text-foreground truncate">Aurelia Private Concierge</span>
                        <Verified className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                        <span className="text-muted-foreground truncate">@tye12085 · {tweet.timestamp}</span>
                      </div>

                      {/* Content */}
                      <p className="text-foreground whitespace-pre-line mb-3">
                        {tweet.content}
                      </p>

                      {/* Actions */}
                      <div className="flex justify-between max-w-md text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors group">
                          <MessageCircle className="w-4 h-4 group-hover:bg-primary/10 rounded-full" />
                          <span className="text-sm">{formatNumber(tweet.replies)}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-500 transition-colors group">
                          <Repeat2 className="w-4 h-4" />
                          <span className="text-sm">{formatNumber(tweet.reposts)}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors group">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{formatNumber(tweet.likes)}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <span className="text-sm">{tweet.views}</span>
                        </button>
                        <button className="hover:text-primary transition-colors">
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
              <p className="text-sm">When @tye12085 replies, they'll show up here.</p>
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
              <p className="text-sm">Posts @tye12085 likes will show up here.</p>
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
            onClick={() => window.open('https://x.com/tye12085', '_blank')}
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