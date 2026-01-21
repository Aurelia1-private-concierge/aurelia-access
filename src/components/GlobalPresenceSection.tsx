import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Headphones } from "lucide-react";

const locations = [
  { city: "London", country: "UK", timezone: "GMT", flagship: true },
  { city: "Geneva", country: "CH", timezone: "CET", flagship: true },
  { city: "Singapore", country: "SG", timezone: "SGT", flagship: true },
  { city: "Dubai", country: "UAE", timezone: "GST", flagship: false },
  { city: "New York", country: "USA", timezone: "EST", flagship: false },
  { city: "Hong Kong", country: "HK", timezone: "HKT", flagship: false },
];

const GlobalPresenceSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Global Network
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Wherever You Are
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Dedicated teams across six continents, always within reach.
          </p>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <div className="inline-flex items-center gap-6 px-6 py-4 bg-card/30 border border-border/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Headphones className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
                <p className="text-xs text-foreground">Online 24/7</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/20" />
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Response</p>
                <p className="text-xs text-foreground">&lt; 60s</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/20" />
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Direct</p>
                <p className="text-xs text-foreground">Always</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Locations */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {locations.map((location, index) => (
            <motion.div
              key={location.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`group relative p-6 text-center transition-all duration-500 ${
                location.flagship 
                  ? 'bg-card/40 border border-primary/20 hover:border-primary/30' 
                  : 'bg-card/20 border border-border/10 hover:border-border/20'
              }`}
            >
              {location.flagship && (
                <span className="absolute top-2 right-2 text-[8px] uppercase tracking-wider text-primary/50">
                  HQ
                </span>
              )}
              
              <MapPin className={`w-4 h-4 mx-auto mb-3 transition-colors duration-300 ${
                location.flagship ? 'text-primary/70' : 'text-muted-foreground/50 group-hover:text-primary/50'
              }`} strokeWidth={1.5} />
              
              <h3 
                className="text-sm text-foreground mb-0.5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {location.city}
              </h3>
              <p className="text-[10px] text-muted-foreground/50">{location.timezone}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] text-muted-foreground/40 mt-10"
        >
          + 180 partner locations worldwide
        </motion.p>
      </div>
    </section>
  );
};

export default GlobalPresenceSection;
