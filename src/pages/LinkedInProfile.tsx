import { motion } from "framer-motion";
import { 
  Linkedin, 
  MapPin, 
  Users, 
  Globe, 
  Building2, 
  Calendar,
  ExternalLink,
  Award,
  Briefcase,
  TrendingUp
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const teamMembers = [
  {
    name: "Alexandra Sterling",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    linkedin: "#"
  },
  {
    name: "James Rothwell",
    role: "Chief Experience Officer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    linkedin: "#"
  },
  {
    name: "Victoria Chen",
    role: "Head of Private Aviation",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    linkedin: "#"
  },
  {
    name: "Marcus Webb",
    role: "Director of Partnerships",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    linkedin: "#"
  }
];

const recentPosts = [
  {
    content: "Thrilled to announce our expansion into the Asia-Pacific region. Aurelia now serves discerning clients across 40+ countries worldwide.",
    likes: 847,
    comments: 62,
    date: "2 days ago"
  },
  {
    content: "Our AI concierge, Orla, has successfully curated over 10,000 bespoke experiences this quarter. The future of luxury is intelligent and personal.",
    likes: 1243,
    comments: 89,
    date: "1 week ago"
  },
  {
    content: "Proud to be recognized as 'Best Luxury Concierge Service 2025' by Luxury Lifestyle Awards. Thank you to our incredible team and members.",
    likes: 2156,
    comments: 134,
    date: "2 weeks ago"
  }
];

const LinkedInProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=400&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative z-10 pb-20">
        {/* Company Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg -mt-16 md:-mt-20 border-4 border-background">
              <span className="text-3xl md:text-4xl font-serif text-primary-foreground">A</span>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif text-foreground">Aurelia Private Concierge</h1>
                  <p className="text-muted-foreground mt-1">The Art of Bespoke Living</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Luxury Lifestyle Services
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      London, United Kingdom
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      51-200 employees
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    className="gap-2"
                    onClick={() => window.open('https://linkedin.com/company/aurelia-concierge', '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
                    Follow
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border">
                <div>
                  <div className="text-2xl font-semibold text-foreground">47.2K</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">2,847</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">156</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                Aurelia Private Concierge is the world's premier AI-enhanced luxury lifestyle management service. 
                We combine cutting-edge artificial intelligence with white-glove personal service to deliver 
                extraordinary experiences for discerning individuals and families worldwide.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                From private aviation and superyacht charters to exclusive event access and bespoke travel 
                experiences, our dedicated team and AI concierge, Orla, anticipate your needs and exceed 
                your expectations—24 hours a day, 365 days a year.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {['Luxury Concierge', 'Private Aviation', 'Yacht Charter', 'VIP Events', 'Wealth Management', 'AI Technology'].map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Recent Posts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Posts</h2>
              <div className="space-y-6">
                {recentPosts.map((post, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-serif text-primary-foreground">A</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">Aurelia Private Concierge</span>
                          <span className="text-sm text-muted-foreground">• {post.date}</span>
                        </div>
                        <p className="text-muted-foreground">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{post.likes.toLocaleString()} likes</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    </div>
                    {index < recentPosts.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Team */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">Leadership Team</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div 
                    key={member.name}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Company Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-foreground">Website</div>
                    <a href="https://aurelia.com" className="text-primary hover:underline">aurelia.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-foreground">Industry</div>
                    <div className="text-muted-foreground">Luxury Lifestyle Services</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-foreground">Company Size</div>
                    <div className="text-muted-foreground">51-200 employees</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-foreground">Headquarters</div>
                    <div className="text-muted-foreground">London, United Kingdom</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-foreground">Founded</div>
                    <div className="text-muted-foreground">2019</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Awards & Recognition</h3>
              <div className="space-y-4">
                {[
                  { title: 'Best Luxury Concierge 2025', org: 'Luxury Lifestyle Awards' },
                  { title: 'Innovation in AI', org: 'Forbes Travel' },
                  { title: 'Excellence in Service', org: 'Condé Nast Traveler' }
                ].map((award, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{award.title}</div>
                      <div className="text-xs text-muted-foreground">{award.org}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Offices */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Global Offices</h3>
              <div className="space-y-3 text-sm">
                {['London', 'Dubai', 'Monaco', 'Singapore', 'New York'].map((city) => (
                  <div key={city} className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {city}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LinkedInProfile;
