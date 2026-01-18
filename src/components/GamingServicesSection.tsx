import { motion } from "framer-motion";
import { Gamepad2, Server, Globe, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const serverTypes = [
  {
    name: "Vanilla",
    description: "Official Mojang experience",
    icon: "🎮",
    badge: "Classic",
    features: ["Pure gameplay", "Official support", "Stable performance"],
  },
  {
    name: "Spigot/Paper",
    description: "High-performance with plugins",
    icon: "⚡",
    badge: "Popular",
    features: ["Plugin support", "Optimized", "Custom features"],
  },
  {
    name: "Forge",
    description: "Full modding capabilities",
    icon: "🔧",
    badge: "Modded",
    features: ["Mod support", "Custom content", "Extensive library"],
  },
  {
    name: "Bedrock",
    description: "Cross-platform gaming",
    icon: "🌐",
    badge: "Universal",
    features: ["Windows/Console/Phone", "Cross-play", "Wide reach"],
  },
  {
    name: "Fabric",
    description: "Lightweight modding loader",
    icon: "🪶",
    badge: "Light",
    features: ["Fast loading", "Modern mods", "Performance"],
  },
];

const premiumFeatures = [
  {
    icon: Server,
    title: "Dedicated Hardware",
    description: "Enterprise-grade servers with NVMe storage and unlimited bandwidth",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Military-grade security with automatic threat mitigation",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Your private server online within minutes, fully configured",
  },
  {
    icon: Users,
    title: "White-Glove Support",
    description: "24/7 dedicated gaming concierge for technical assistance",
  },
];

const GamingServicesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="text-primary uppercase tracking-[0.3em] text-sm font-medium">
              Private Gaming
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Exclusive Gaming Servers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Private, high-performance gaming experiences curated for discerning members. 
            Your personal Minecraft realm, managed by our dedicated team.
          </p>
        </motion.div>

        {/* Server Types Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16"
        >
          {serverTypes.map((server, index) => (
            <motion.div
              key={server.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 h-full group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{server.icon}</div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {server.badge}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {server.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {server.description}
                  </p>
                  <ul className="space-y-1">
                    {server.features.map((feature) => (
                      <li key={feature} className="text-xs text-muted-foreground/80">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-foreground font-semibold mb-2">{feature.title}</h4>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            <Globe className="w-5 h-5 mr-2" />
            Request Private Server
          </Button>
          <p className="text-muted-foreground text-sm mt-4">
            Available exclusively to Prestige and Black Card members
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GamingServicesSection;
