import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Tag, Search, User, TrendingUp, BookOpen, Rss } from "lucide-react";
import { Logo } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SocialShareButtons from "@/components/SocialShareButtons";
import BlogArticleSchema from "@/components/blog/BlogArticleSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { generateVideoListSchema, VIDEO_LIBRARY } from "@/lib/video-seo-schema";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "future-of-luxury-travel-2026",
    title: "The Future of Luxury Travel in 2026: AI-Powered Personalization",
    excerpt: "Discover how artificial intelligence is revolutionizing the way ultra-high-net-worth individuals experience luxury travel, from predictive booking to hyper-personalized itineraries.",
    content: "",
    author: "Alexandra Sterling",
    authorRole: "Head of Travel Experiences",
    publishedAt: "2026-01-10",
    readTime: 8,
    category: "Travel",
    tags: ["AI", "Luxury Travel", "Technology", "UHNW"],
    featured: true,
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80"
  },
  {
    id: "2",
    slug: "private-jet-charter-guide",
    title: "The Complete Guide to Private Jet Charter: What Every Discerning Traveler Should Know",
    excerpt: "From fractional ownership to on-demand charter, we break down the options for accessing private aviation and how to choose the right solution for your lifestyle.",
    content: "",
    author: "Marcus Chen",
    authorRole: "Aviation Specialist",
    publishedAt: "2026-01-08",
    readTime: 12,
    category: "Aviation",
    tags: ["Private Jets", "Charter", "Aviation", "Luxury"],
    featured: true,
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80"
  },
  {
    id: "3",
    slug: "superyacht-destinations-2026",
    title: "Top 10 Superyacht Destinations for 2026: Beyond the Mediterranean",
    excerpt: "While the French Riviera remains timeless, adventurous yacht owners are exploring new waters. Discover the emerging destinations that are captivating the superyacht community.",
    content: "",
    author: "Isabella Romano",
    authorRole: "Marine Concierge Director",
    publishedAt: "2026-01-05",
    readTime: 10,
    category: "Yachting",
    tags: ["Superyachts", "Destinations", "Mediterranean", "Adventure"],
    featured: false,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
  },
  {
    id: "4",
    slug: "art-collecting-uhnw",
    title: "Building a World-Class Art Collection: Insights from Leading Collectors",
    excerpt: "Expert collectors share their strategies for acquiring museum-quality pieces, navigating the auction world, and building collections that appreciate over generations.",
    content: "",
    author: "Dr. Victoria Hayes",
    authorRole: "Art Advisory Partner",
    publishedAt: "2026-01-03",
    readTime: 15,
    category: "Art & Culture",
    tags: ["Art Collection", "Investment", "Auctions", "Culture"],
    featured: false,
    image: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80"
  },
  {
    id: "5",
    slug: "wellness-retreats-billionaires",
    title: "The Rise of Ultra-Exclusive Wellness Retreats: Where Billionaires Go to Recharge",
    excerpt: "From private island detox programs to bespoke longevity clinics, explore the world's most exclusive wellness experiences designed for the global elite.",
    content: "",
    author: "Dr. Sophia Laurent",
    authorRole: "Wellness Curator",
    publishedAt: "2025-12-28",
    readTime: 9,
    category: "Wellness",
    tags: ["Wellness", "Health", "Retreats", "Longevity"],
    featured: false,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
  },
  {
    id: "6",
    slug: "real-estate-off-market",
    title: "Off-Market Real Estate: Accessing Properties That Never Hit the Listings",
    excerpt: "The most exceptional properties never appear on public listings. Learn how UHNW buyers access exclusive off-market opportunities and navigate private transactions.",
    content: "",
    author: "Jonathan Blake",
    authorRole: "Real Estate Advisor",
    publishedAt: "2025-12-20",
    readTime: 11,
    category: "Real Estate",
    tags: ["Real Estate", "Off-Market", "Investment", "Luxury Homes"],
    featured: false,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
  }
];

const categories = ["All", "Travel", "Aviation", "Yachting", "Art & Culture", "Wellness", "Real Estate"];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  // Inject video schema on mount
  useEffect(() => {
    const videoSchema = generateVideoListSchema(VIDEO_LIBRARY);
    const existingVideoScript = document.querySelector('script[data-video-list-schema]');
    if (existingVideoScript) existingVideoScript.remove();
    
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-video-list-schema", "true");
    script.textContent = JSON.stringify(videoSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <>
      <SEOHead 
        title="The Aurelia Journal | Luxury Lifestyle Insights & Guides"
        description="Expert perspectives on luxury travel, private aviation, superyachts, art collecting, and exceptional living. Curated content for discerning individuals."
      />
      <FAQSchema pageType="home" />

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <header className="border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/">
                <Logo size="sm" />
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </Link>
                <Link to="/membership" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Membership
                </Link>
                <Link to="/blog" className="text-sm text-foreground font-medium">
                  Journal
                </Link>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </nav>
              <Link to="/auth">
                <Button variant="outline" size="sm">Client Login</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 md:py-32 border-b border-border/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
                <BookOpen className="w-3 h-3 mr-1" />
                The Aurelia Journal
              </Badge>
              <h1 className="font-serif text-4xl md:text-6xl text-foreground mb-6">
                Insights for the <span className="text-primary">Discerning</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Expert perspectives on luxury travel, private aviation, art collecting, 
                and the art of exceptional living.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-card border-border/50"
                />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{blogPosts.length} Articles</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Updated Weekly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rss className="w-4 h-4 text-primary" />
                  <span>Subscribe</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-b border-border/30 sticky top-[73px] bg-background/95 backdrop-blur-sm z-40">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <h2 className="font-serif text-2xl text-foreground mb-8">Featured</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden group cursor-pointer border-border/30 hover:border-primary/30 transition-colors h-full">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary">{post.category}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime} min read
                          </span>
                        </div>
                        <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{post.author}</p>
                              <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="font-serif text-2xl text-foreground mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group cursor-pointer border-border/30 hover:border-primary/30 transition-colors h-full">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{post.readTime} min</span>
                      </div>
                      <h3 className="font-serif text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">{post.author}</span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 border-t border-border/30">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-serif text-3xl text-foreground mb-4">
                Subscribe to The Aurelia Journal
              </h2>
              <p className="text-muted-foreground mb-8">
                Receive exclusive insights, early access to experiences, and curated content for discerning individuals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input placeholder="Enter your email" className="flex-1" />
                <Button className="whitespace-nowrap">
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Share Section */}
        <section className="py-12 bg-muted/30 border-t border-border/30">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="font-serif text-xl text-foreground mb-4">Share The Aurelia Journal</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Know someone who would appreciate exceptional content?
              </p>
              <SocialShareButtons 
                url="https://aurelia-privateconcierge.com/blog"
                title="The Aurelia Journal - Insights for the Discerning"
                description="Expert perspectives on luxury travel, private aviation, art collecting, and the art of exceptional living."
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
