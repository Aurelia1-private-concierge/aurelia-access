import { motion } from "framer-motion";

const SkipLink = () => {
  return (
    <motion.a
      href="#main-content"
      initial={{ y: -100 }}
      whileFocus={{ y: 0 }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wide uppercase -translate-y-full focus:translate-y-4 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      Skip to main content
    </motion.a>
  );
};

export default SkipLink;
