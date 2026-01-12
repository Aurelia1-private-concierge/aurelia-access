import { motion } from "framer-motion";
import { 
  Instagram, 
  Grid3X3, 
  PlayCircle, 
  Bookmark, 
  UserCircle,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Settings,
  ExternalLink
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stories = [
  { title: "Monaco", image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=150&h=150&fit=crop" },
  { title: "Jets", image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=150&h=150&fit=crop" },
  { title: "Yachts", image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=150&h=150&fit=crop" },
  { title: "Events", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&h=150&fit=crop" },
  { title: "Travel", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop" },
  { title: "Dining", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=150&h=150&fit=crop" }
];

const posts = [
  {
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&h=600&fit=crop",
    likes: 12847,
    comments: 342,
    isVideo: false
  },
  {
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&h=600&fit=crop",
    likes: 9523,
    comments: 186,
    isVideo: false
  },
  {
    image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&h=600&fit=crop",
    likes: 15234,
    comments: 428,
    isVideo: true
  },
  {
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=600&fit=crop",
    likes: 8764,
    comments: 156,
    isVideo: false
  },
  {
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop",
    likes: 11432,
    comments: 289,
    isVideo: false
  },
  {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
    likes: 7891,
    comments: 134,
    isVideo: true
  },
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    likes: 6234,
    comments: 98,
    isVideo: false
  },
  {
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=600&fit=crop",
    likes: 13567,
    comments: 367,
    isVideo: false
  },
  {
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&h=600&fit=crop",
    likes: 10234,
    comments: 245,
    isVideo: false
  }
];

const InstagramProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10"
        >
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500">
              <div className="w-full h-full rounded-full bg-background p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src="/logos/aurelia-icon.svg" 
                    alt="Aurelia Private Concierge"
                    className="w-full h-full object-cover bg-primary p-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-xl font-medium text-foreground">tye12085</h1>
              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-lg">
                  Follow
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg">
                  Message
                </Button>
                <Button size="icon" variant="ghost" className="rounded-lg">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-foreground">48</div>
                <div className="text-sm text-muted-foreground">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">2,847</div>
                <div className="text-sm text-muted-foreground">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">156</div>
                <div className="text-sm text-muted-foreground">following</div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <div className="font-semibold text-foreground">Aurelia Private Concierge</div>
              <div className="text-muted-foreground text-sm">
                ✨ Your Private World, Perfected<br />
                🌍 Elite concierge for discerning clients<br />
                ✈️ Private Jets • Yachts • Experiences<br />
                🤖 Meet Orla, your AI concierge
              </div>
              <a href="https://aurelia.com" className="text-primary text-sm font-medium hover:underline">
                aurelia.com
              </a>
            </div>
          </div>
        </motion.div>

        {/* Story Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide"
        >
          {stories.map((story) => (
            <div key={story.title} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-background p-0.5">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-foreground">{story.title}</span>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-center bg-transparent border-t border-border rounded-none h-auto p-0">
            <TabsTrigger 
              value="posts" 
              className="flex-1 rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">POSTS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reels" 
              className="flex-1 rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">REELS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex-1 rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">SAVED</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tagged" 
              className="flex-1 rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">TAGGED</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-1"
            >
              {posts.map((post, index) => (
                <div 
                  key={index}
                  className="relative aspect-square group cursor-pointer overflow-hidden"
                >
                  <img 
                    src={post.image} 
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.isVideo && (
                    <PlayCircle className="absolute top-2 right-2 w-6 h-6 text-white drop-shadow-lg" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <Heart className="w-5 h-5 fill-white" />
                      {(post.likes / 1000).toFixed(1)}K
                    </div>
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      {post.comments}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="reels" className="mt-0">
            <div className="grid grid-cols-3 gap-1">
              {posts.filter(p => p.isVideo).map((post, index) => (
                <div 
                  key={index}
                  className="relative aspect-[9/16] group cursor-pointer overflow-hidden"
                >
                  <img 
                    src={post.image} 
                    alt={`Reel ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <PlayCircle className="absolute top-2 right-2 w-6 h-6 text-white drop-shadow-lg" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-sm font-medium">
                    <PlayCircle className="w-4 h-4" />
                    {(post.likes / 1000).toFixed(1)}K
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Only you can see what you've saved</p>
            </div>
          </TabsContent>

          <TabsContent value="tagged" className="mt-0">
            <div className="py-20 text-center text-muted-foreground">
              <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Photos and videos of Aurelia</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button 
            size="lg"
            className="gap-2"
            onClick={() => window.open('https://www.instagram.com/tye12085', '_blank')}
          >
            <Instagram className="w-5 h-5" />
            Follow on Instagram
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default InstagramProfile;
