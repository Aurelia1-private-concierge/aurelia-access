import { motion } from "framer-motion";
import { 
  Facebook, 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  MapPin,
  Globe,
  Mail,
  Clock,
  Star,
  Users,
  Image as ImageIcon,
  Video,
  Calendar,
  ExternalLink,
  Phone,
  CheckCircle2
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import aureliaSocialLogo from "@/assets/aurelia-social-logo.png";
import aureliaSocialBanner from "@/assets/aurelia-social-banner.png";

const posts = [
  {
    id: 1,
    content: "Experience the extraordinary. Our latest yacht charter took clients through the crystal waters of the Mediterranean, stopping at exclusive ports accessible only to the privileged few. ✨🛥️",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=500&fit=crop",
    likes: 2847,
    comments: 156,
    shares: 89,
    time: "2 hours ago"
  },
  {
    id: 2,
    content: "When only the best will do. Private aviation redefined with Aurelia. From booking to landing, every moment is curated for perfection. ✈️",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=500&fit=crop",
    likes: 3521,
    comments: 234,
    shares: 167,
    time: "5 hours ago"
  },
  {
    id: 3,
    content: "Monaco Grand Prix 2026 - Our members enjoyed unprecedented access to the paddock, exclusive parties, and the best views on the circuit. Limited spots available for next year. 🏎️🏆",
    image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=500&fit=crop",
    likes: 5234,
    comments: 428,
    shares: 312,
    time: "1 day ago"
  },
  {
    id: 4,
    content: "Fine dining elevated. Last night's private chef experience in a centuries-old Tuscan villa. Some experiences cannot be bought—they must be curated. 🍷",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
    likes: 1892,
    comments: 98,
    shares: 45,
    time: "2 days ago"
  }
];

const photos = [
  "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&h=300&fit=crop"
];

const reviews = [
  {
    author: "Marcus Wellington",
    rating: 5,
    text: "Absolutely exceptional service. Aurelia arranged an impossible dinner reservation and private jet in under 24 hours. Worth every penny.",
    date: "January 2026"
  },
  {
    author: "Victoria Chen",
    rating: 5,
    text: "The level of discretion and attention to detail is unmatched. My family has used Aurelia for two years now—couldn't imagine life without them.",
    date: "December 2025"
  },
  {
    author: "Alexander Rothschild",
    rating: 5,
    text: "From yacht charters to securing tickets to sold-out events, Aurelia consistently delivers the extraordinary.",
    date: "November 2025"
  }
];

const FacebookProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-72 lg:h-96 overflow-hidden">
          <img 
            src={aureliaSocialBanner}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          {/* Profile Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative -mt-16 md:-mt-20 mb-6"
          >
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              {/* Profile Picture */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-xl overflow-hidden">
                <img 
                  src={aureliaSocialLogo} 
                  alt="Aurelia" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left pb-4">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Aurelia Private Concierge</h1>
                  <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
                <p className="text-muted-foreground mb-2">@aureliaprivateconcierge · Luxury Concierge Service</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    125K followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    5.0 (847 reviews)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Follow
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-6 overflow-x-auto">
              <TabsTrigger 
                value="posts" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                About
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Photos
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
              {/* Left Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* About Card */}
                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">About</h3>
                  <p className="text-sm text-muted-foreground">
                    The world's most exclusive private concierge for those who demand the extraordinary. Serving discerning clients worldwide since 2020.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <a href="https://aurelia-privateconcierge.com" className="text-primary hover:underline">
                        aurelia-privateconcierge.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      concierge@aurelia-privateconcierge.com
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      Available to members only
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      London • Geneva • Singapore
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      24/7 Concierge Service
                    </div>
                  </div>
                </Card>

                {/* Photos Preview */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Photos</h3>
                    <span className="text-sm text-primary cursor-pointer hover:underline">See all</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                    {photos.slice(0, 9).map((photo, index) => (
                      <img 
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="aspect-square object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </div>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                <TabsContent value="posts" className="mt-0 space-y-4">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="overflow-hidden">
                        {/* Post Header */}
                        <div className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden">
                            <img 
                              src="/logos/aurelia-logo-light.svg" 
                              alt="Aurelia" 
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-foreground">Aurelia Private Concierge</span>
                              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">{post.time}</span>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="px-4 pb-3">
                          <p className="text-foreground">{post.content}</p>
                        </div>

                        {/* Post Image */}
                        <img 
                          src={post.image}
                          alt="Post"
                          className="w-full aspect-video object-cover"
                        />

                        {/* Engagement Stats */}
                        <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b border-border">
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-1">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <ThumbsUp className="w-3 h-3 text-white" />
                              </div>
                              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-xs">❤️</span>
                              </div>
                            </div>
                            <span>{post.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-4">
                            <span>{post.comments} comments</span>
                            <span>{post.shares} shares</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-4 py-2 flex items-center justify-around">
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-muted/50">
                            <ThumbsUp className="w-5 h-5" />
                            <span>Like</span>
                          </button>
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-muted/50">
                            <MessageCircle className="w-5 h-5" />
                            <span>Comment</span>
                          </button>
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-muted/50">
                            <Share2 className="w-5 h-5" />
                            <span>Share</span>
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="about" className="mt-0">
                  <Card className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">About Aurelia Private Concierge</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Aurelia is the world's most exclusive private concierge service, dedicated to fulfilling the extraordinary desires of discerning individuals. 
                        From private aviation and yacht charters to securing impossible reservations and exclusive event access, we transform the unattainable into reality.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Our Services</h4>
                      <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li>✈️ Private Aviation</li>
                        <li>🛥️ Yacht Charters</li>
                        <li>🏠 Luxury Real Estate</li>
                        <li>🎭 Exclusive Events</li>
                        <li>🍽️ Fine Dining</li>
                        <li>🔐 Security Services</li>
                        <li>🛍️ Personal Shopping</li>
                        <li>🌍 Bespoke Travel</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>📧 concierge@aurelia-privateconcierge.com</p>
                        <p>🌐 aurelia-privateconcierge.com</p>
                        <p>📍 London • Geneva • Singapore</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="photos" className="mt-0">
                  <Card className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative group cursor-pointer"
                        >
                          <img 
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="aspect-square object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-0 space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl font-bold text-foreground">5.0</div>
                      <div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">Based on 847 reviews</p>
                      </div>
                    </div>
                  </Card>

                  {reviews.map((review, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-foreground">{review.author}</span>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                            <p className="text-muted-foreground text-sm">{review.text}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </div>
            </div>
          </Tabs>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="py-12 text-center"
          >
            <Button 
              size="lg"
              className="gap-2"
              onClick={() => window.open('https://facebook.com/aureliaprivateconcierge', '_blank')}
            >
              <Facebook className="w-5 h-5" />
              Follow on Facebook
              <ExternalLink className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FacebookProfile;
