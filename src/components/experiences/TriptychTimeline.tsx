import { motion } from "framer-motion";
import { Plane, Sparkles, Music, Users, Moon, ArrowRight } from "lucide-react";

const timelineEvents = [
  {
    date: "June 19",
    title: "Arrival",
    description: "VIP airport reception, private transfers, and dedicated multilingual concierges ensuring a seamless transition into the experience.",
    icon: Plane,
  },
  {
    date: "June 20",
    title: "Immersion Begins",
    description: "Category-specific cultural encounters. In the afternoon, a private styling environment opens with couture, jewelry, and personal guidance.",
    icon: Sparkles,
  },
  {
    date: "June 21",
    title: "The Night of Passage",
    description: "A day devoted to beauty, preparation, and unhurried anticipation in private spaces, culminating in the evening's symphonic convergence.",
    icon: Music,
  },
  {
    date: "June 22",
    title: "The Gathering",
    description: "Distinct experiences by category, before all gather for The Gathering of Living Culture — a moment of connection, rhythm, and shared presence.",
    icon: Users,
  },
  {
    date: "June 23",
    title: "Final Encounters",
    description: "The final layers of curated encounters, balanced with intentional time for rest, privacy, and quiet assimilation.",
    icon: Moon,
  },
  {
    date: "June 24",
    title: "Departure",
    description: "Coordinated departures with the same discretion and care that shape every arrival.",
    icon: ArrowRight,
  },
];

const TriptychTimeline = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-card/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-4">
            The Journey
          </span>
          <h2 
            className="text-3xl md:text-4xl text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Six Days of Transformation
          </h2>
        </motion.div>

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/30 -translate-x-1/2 hidden md:block" />

          <div className="space-y-8 md:space-y-0">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.date}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative md:flex md:items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <div className="bg-card/50 border border-border/20 p-6 md:p-8">
                    <span className="text-primary text-xs uppercase tracking-[0.3em] mb-2 block">
                      {event.date}
                    </span>
                    <h3 
                      className="text-xl text-foreground mb-3"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Center icon */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-background border border-primary/30 rounded-full items-center justify-center z-10">
                  <event.icon className="w-5 h-5 text-primary" />
                </div>

                {/* Mobile icon */}
                <div className="md:hidden flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-background border border-primary/30 rounded-full flex items-center justify-center">
                    <event.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-primary text-xs uppercase tracking-[0.3em]">
                    {event.date}
                  </span>
                </div>

                {/* Spacer for alignment */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-12 max-w-2xl mx-auto"
        >
          Every operational detail exists to protect the atmosphere: luxury vehicles with staggered 
          movements, invisible security, controlled artistic photography, NDA-protected privacy, 
          and private spaces available whenever withdrawal is desired.
        </motion.p>
      </div>
    </section>
  );
};

export default TriptychTimeline;
