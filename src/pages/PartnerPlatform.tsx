import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  LineChart,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  Play,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlatformModule {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  gradient: string;
  color: string;
}

const modules: PlatformModule[] = [
  {
    id: "discover",
    title: "Discover",
    tagline: "Automated, data-driven partner discovery, recruitment and optimization",
    description:
      "Tap into Discover's unrivalled ability to find and cultivate the diverse partnerships required to offset the cost of your primary sales and marketing channels. Leverage Discover to easily identify and recruit partnerships that are most relevant to your brand from a limitless selection of categories such as content, influencer, loyalty and coupon.",
    icon: Search,
    features: [
      "AI-powered partner matching",
      "Automated outreach campaigns",
      "Multi-channel recruitment",
      "Performance-based optimization",
    ],
    gradient: "from-violet-500/20 to-purple-500/20",
    color: "text-violet-400",
  },
  {
    id: "track",
    title: "Track",
    tagline: "Partner channel insights with scalable, flexible tracking infrastructure",
    description:
      "Gain necessary transparency into unlimited data points across your partnership program using scalable, flexible tracking infrastructure. Easily implement solutions such as first-party, server-to-server, batch and mobile app tracking or leverage our suite of ecommerce plugins for turnkey activation of your partner program.",
    icon: LineChart,
    features: [
      "First-party tracking",
      "Server-to-server integration",
      "Mobile app attribution",
      "E-commerce plugins",
    ],
    gradient: "from-cyan-500/20 to-blue-500/20",
    color: "text-cyan-400",
  },
  {
    id: "manage",
    title: "Manage",
    tagline: "Communication, collaboration and commissioning flexibility that drives results",
    description:
      "Achieve the necessary flexibility and transparency to deploy effective communications and equitably reward partners for their role in the path to purchase, thereby further incenting these partners to fuel your unique business goals. By enabling effective, mutually beneficial collaborations, you establish alignment that positively affects partner channel outcomes.",
    icon: Users,
    features: [
      "Dynamic commission structures",
      "Real-time messaging",
      "Contract management",
      "Performance incentives",
    ],
    gradient: "from-amber-500/20 to-orange-500/20",
    color: "text-amber-400",
  },
  {
    id: "measure",
    title: "Measure",
    tagline: "Real-time analytics and actionable insights that power data-driven decisions",
    description:
      "Offset your big-picture customer acquisition costs with reliable, actionable analytics that enable quick, data-driven decisioning. With comprehensive visuals, easily-digestible reporting and on-demand performance analytics mapping to limitless customizable parameters, you have full visibility into your partner ecosystem data so that you can turn your advertising into a profit center.",
    icon: BarChart3,
    features: [
      "Real-time dashboards",
      "Custom reporting",
      "Attribution modeling",
      "ROI optimization",
    ],
    gradient: "from-emerald-500/20 to-teal-500/20",
    color: "text-emerald-400",
  },
  {
    id: "pay",
    title: "Pay",
    tagline: "The ability to easily facilitate global partner payments at scale",
    description:
      "Automate payment processes for both you and your partners using integrated solutions for evaluating transactions, generating invoices, and remitting global partner rewards in their desired currencies.",
    icon: CreditCard,
    features: [
      "Multi-currency support",
      "Automated invoicing",
      "Tax compliance",
      "Stripe Connect integration",
    ],
    gradient: "from-rose-500/20 to-pink-500/20",
    color: "text-rose-400",
  },
  {
    id: "protect",
    title: "Protect",
    tagline: '"Always-on" compliance and fraud monitoring that ensures brand safety',
    description:
      "Powered by advanced AI, Protect eliminates the need for manual trademark infringement and web compliance audits without sacrificing your brand integrity or marketing dollars.",
    icon: Shield,
    features: [
      "Fraud detection",
      "Compliance monitoring",
      "Brand safety alerts",
      "Audit automation",
    ],
    gradient: "from-primary/20 to-amber-500/20",
    color: "text-primary",
  },
];

const PartnerPlatform = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Partner Management Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-foreground mb-6 leading-tight">
              The Complete Partner
              <br />
              <span className="text-primary">Ecosystem Platform</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              End-to-end management capabilities that enable you to discover, track, manage, measure,
              pay and protect your entire partner network from a single, unified platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group" asChild>
                <Link to="/contact">
                  Schedule Demo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group">
                <Play className="w-4 h-4 mr-2" />
                Watch Video
              </Button>
            </div>
          </motion.div>

          {/* Module Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {modules.map((module, index) => (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
                className={`
                  relative p-6 rounded-2xl border transition-all duration-300 text-left group
                  ${activeModule === module.id
                    ? `bg-gradient-to-br ${module.gradient} border-primary/50 scale-105`
                    : "bg-card/50 border-border/30 hover:border-primary/30 hover:bg-card/80"
                  }
                `}
              >
                <module.icon
                  className={`w-8 h-8 mb-3 transition-colors ${
                    activeModule === module.id || hoveredModule === module.id
                      ? module.color
                      : "text-muted-foreground"
                  }`}
                />
                <h3 className="font-serif text-lg text-foreground mb-1">{module.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {module.tagline.split(",")[0]}
                </p>

                {/* Active indicator */}
                {activeModule === module.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Module Detail Section */}
      <AnimatePresence mode="wait">
        {activeModule && (
          <motion.section
            key={activeModule}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-20 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto">
              {modules
                .filter((m) => m.id === activeModule)
                .map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-gradient-to-br ${module.gradient} rounded-3xl p-8 md:p-12 border border-primary/20`}
                  >
                    <div className="grid md:grid-cols-2 gap-12">
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl bg-background/50 backdrop-blur`}>
                            <module.icon className={`w-8 h-8 ${module.color}`} />
                          </div>
                          <div>
                            <h2 className="text-3xl font-serif text-foreground">{module.title}</h2>
                            <p className={`text-sm ${module.color}`}>Partner Management Module</p>
                          </div>
                        </div>

                        <p className="text-lg text-foreground/90 leading-relaxed mb-8">
                          {module.description}
                        </p>

                        <Button className="group" asChild>
                          <Link to="/contact">
                            Learn More
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground mb-6">Key Features</h3>
                        {module.features.map((feature, index) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-background/30 backdrop-blur border border-white/10"
                          >
                            <CheckCircle className={`w-5 h-5 ${module.color}`} />
                            <span className="text-foreground">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* All Modules Detail Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools designed for luxury brands and premium service providers
            </p>
          </motion.div>

          <div className="space-y-24">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:grid-flow-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "md:col-start-2" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${module.gradient}`}>
                      <module.icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <h3 className="text-2xl font-serif text-foreground">{module.title}</h3>
                  </div>
                  <p className={`text-sm ${module.color} mb-4`}>{module.tagline}</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">{module.description}</p>
                  <ul className="space-y-3">
                    {module.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className={`w-4 h-4 ${module.color}`} />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`relative h-80 rounded-2xl bg-gradient-to-br ${module.gradient} border border-primary/10 overflow-hidden ${
                    index % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <module.icon className={`w-24 h-24 ${module.color} opacity-30`} />
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "214+", label: "Countries Covered", icon: Globe },
              { value: "500K+", label: "Partners Network", icon: Users },
              { value: "99.9%", label: "Uptime SLA", icon: Zap },
              { value: "$2B+", label: "Revenue Tracked", icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <p className="text-4xl md:text-5xl font-serif text-foreground mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-card/50 border-primary/20 p-8 md:p-12">
              <CardContent className="p-0">
                <blockquote className="text-xl md:text-2xl font-serif text-foreground leading-relaxed mb-8">
                  "The end-to-end management capabilities offered by the Aurelia platform have enabled
                  us to on-board global partners, offers granular analytics and the opportunity to do
                  dynamic commissioning; providing us with the tools needed to understand trends that
                  will grow our business."
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-serif text-lg">JB</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">James Blackwood</p>
                    <p className="text-sm text-muted-foreground">
                      Senior Director of Global Partnerships
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Target className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Ready to Transform Your Partner Ecosystem?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join leading luxury brands using Aurelia to discover, manage, and scale their partner
              networks worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group" asChild>
                <Link to="/contact">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/partner-apply">Partner Application</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerPlatform;
