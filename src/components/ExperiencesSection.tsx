import { Check } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  "Direct negotiation for off-market real estate.",
  "Private aviation management with tarmac transfers.",
  "Curated art acquisition and secure storage.",
];

const images = [
  {
    src: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?q=80&w=1974&auto=format&fit=crop",
    alt: "Luxury Yacht",
    offset: false,
  },
  {
    src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1988&auto=format&fit=crop",
    alt: "Luxury Watch",
    offset: true,
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
    alt: "Luxury Interiors",
    offset: false,
  },
  {
    src: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop",
    alt: "Private Jet",
    offset: true,
  },
];

const ExperiencesSection = () => {
  return (
    <section id="experiences" className="py-24 bg-secondary/20 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8 order-2 lg:order-1"
        >
          <div className="space-y-4">
            <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
              Private Access
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
              The Unattainable, <br />
              <span className="italic text-muted-foreground">Acquired.</span>
            </h2>
          </div>

          <p className="font-light text-muted-foreground leading-relaxed">
            Aurelia secures what others cannot. From competitive bidding on rare vintage timepieces to last-minute gala access in Monaco. Our network bypasses waiting lists and opens closed doors.
          </p>

          <ul className="space-y-4 pt-4">
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-foreground/80 font-light">{benefit}</span>
              </motion.li>
            ))}
          </ul>

          <button className="text-foreground text-sm tracking-widest uppercase border-b border-primary pb-1 hover:text-primary transition-colors pt-6">
            View Recent Acquisitions
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative order-1 lg:order-2"
        >
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <motion.img
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                src={image.src}
                className={`rounded-sm w-full h-64 object-cover opacity-90 hover:opacity-100 transition-opacity duration-500 ${
                  image.offset ? "translate-y-8" : ""
                }`}
                alt={image.alt}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
