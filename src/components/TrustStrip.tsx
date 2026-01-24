import { motion } from "framer-motion";
const partners = [{
  name: "Forbes",
  category: "Wealth"
}, {
  name: "Bloomberg",
  category: "Markets"
}, {
  name: "Robb Report",
  category: "Luxury"
}, {
  name: "Tatler",
  category: "Society"
}, {
  name: "Financial Times",
  category: "Global"
}, {
  name: "Monocle",
  category: "Culture"
}];
const TrustStrip = () => {
  return <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-platinum">
            As Featured In
          </span>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-platinum">
          {partners.map((partner, index) => <motion.div key={partner.name} initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.05
        }} className="group cursor-default">
              <span className="text-lg md:text-xl tracking-[0.15em] transition-colors duration-500 text-platinum" style={{
            fontFamily: "'Cormorant Garamond', serif"
          }}>
                {partner.name}
              </span>
            </motion.div>)}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
    </section>;
};
export default TrustStrip;