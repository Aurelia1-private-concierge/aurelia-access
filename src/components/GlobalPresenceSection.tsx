import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Headphones } from "lucide-react";

const locations = [
  { city: "Geneva", country: "Switzerland", timezone: "CET", flagship: true },
  { city: "London", country: "United Kingdom", timezone: "GMT", flagship: true },
  { city: "Singapore", country: "Singapore", timezone: "SGT", flagship: true },
  { city: "Dubai", country: "UAE", timezone: "GST", flagship: false },
  { city: "New York", country: "USA", timezone: "EST", flagship: false },
  { city: "Hong Kong", country: "China", timezone: "HKT", flagship: false },
];

const GlobalPresenceSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 1px, transparent 1px),
                           radial-gradient(circle at 80% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="w-12 h-px bg-primary/40" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
              Global Network
            </p>
            <span className="w-12 h-px bg-primary/40" />
          </div>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Wherever You Are, <span className="italic text-muted-foreground/70">We Are</span>
          </h2>
          <p className="text-muted-foreground font-light max-w-2xl mx-auto">
            With dedicated teams across six continents, your concierge is always within reach.
          </p>
        </motion.div>

        {/* 24/7 Availability Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-card/50 border border-border/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Headphones className="w-5 h-5 text-primary" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concierge Status</p>
                <p className="text-sm text-foreground font-medium">Online 24/7</p>
              </div>
            </div>
            <div className="w-px h-10 bg-border/30" />
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Avg. Response</p>
                <p className="text-sm text-foreground font-medium">&lt; 60 seconds</p>
              </div>
            </div>
            <div className="w-px h-10 bg-border/30" />
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Direct Line</p>
                <p className="text-sm text-foreground font-medium">Always Available</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {locations.map((location, index) => (
            <motion.div
              key={location.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative p-6 text-center transition-all duration-500 ${
                location.flagship 
                  ? 'bg-card/50 border border-primary/20 hover:border-primary/40' 
                  : 'bg-card/30 border border-border/10 hover:border-border/30'
              }`}
            >
              {location.flagship && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] uppercase tracking-wider text-primary/60 bg-primary/10 px-2 py-0.5">
                    Flagship
                  </span>
                </div>
              )}
              
              <MapPin className={`w-5 h-5 mx-auto mb-3 transition-colors duration-300 ${
                location.flagship ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              }`} />
              
              <h3 
                className="text-lg text-foreground mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {location.city}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                {location.country}
              </p>
              <p className="text-xs text-primary/60">{location.timezone}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/50 mt-12"
        >
          + 180 partner locations worldwide
        </motion.p>
      </div>
    </section>
  );
};

export default GlobalPresenceSection;