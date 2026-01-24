import { motion } from "framer-motion";
import { 
  Plane, Ship, Building2, Shield, Gem, Globe, 
  Brain, Headphones, Clock, Lock, Award, Users 
} from "lucide-react";

const skills = [
  {
    category: "Luxury Travel",
    icon: Plane,
    items: ["Private Aviation", "Yacht Charter", "Bespoke Itineraries", "VIP Airport Services"]
  },
  {
    category: "Lifestyle Management",
    icon: Gem,
    items: ["Art Acquisition", "Real Estate", "Event Access", "Personal Shopping"]
  },
  {
    category: "Technology",
    icon: Brain,
    items: ["AI Concierge (Orla)", "24/7 Digital Platform", "Secure Communications", "Smart Automation"]
  },
  {
    category: "Security & Privacy",
    icon: Shield,
    items: ["Executive Protection", "Cybersecurity", "Discretion Protocols", "Risk Assessment"]
  },
  {
    category: "Global Network",
    icon: Globe,
    items: ["50+ Countries", "Partner Ecosystem", "Local Expertise", "Multilingual Support"]
  },
  {
    category: "Client Excellence",
    icon: Award,
    items: ["White-Glove Service", "Anticipatory Care", "Crisis Management", "Legacy Planning"]
  }
];

const coreCompetencies = [
  { icon: Headphones, label: "24/7 Availability", value: "Always On" },
  { icon: Clock, label: "Response Time", value: "<15 min" },
  { icon: Lock, label: "Confidentiality", value: "Bank-Grade" },
  { icon: Users, label: "Client Retention", value: "98%" }
];

export default function TeamSkillsShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] text-primary/60 uppercase mb-4 block">
            Our Expertise
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Unparalleled Capabilities
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A curated team of specialists delivering excellence across every dimension of luxury lifestyle management.
          </p>
        </motion.div>

        {/* Core Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {coreCompetencies.map((comp, idx) => (
            <div
              key={idx}
              className="bg-card border border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-colors"
            >
              <comp.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-serif text-foreground mb-1">{comp.value}</div>
              <div className="text-sm text-muted-foreground">{comp.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <skill.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">{skill.category}</h3>
              </div>
              <ul className="space-y-2">
                {skill.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* LinkedIn Skills Reference (Hidden, for copy-paste) */}
        <div className="sr-only" aria-hidden="true">
          <h4>LinkedIn Top Skills for Aurelia Team:</h4>
          <ul>
            <li>Luxury Lifestyle Management</li>
            <li>Private Aviation Coordination</li>
            <li>UHNW Client Relations</li>
            <li>Bespoke Travel Planning</li>
            <li>VIP Event Management</li>
            <li>Executive Protection Liaison</li>
            <li>Art & Collectibles Advisory</li>
            <li>Real Estate Concierge</li>
            <li>Crisis Management</li>
            <li>AI-Powered Service Delivery</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
