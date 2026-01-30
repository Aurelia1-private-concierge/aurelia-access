import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const TriptychDeadlineBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="bg-primary/10 border-y border-primary/20"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-3 text-center">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="text-primary font-medium">Limited Availability</span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-muted-foreground">Applications close </span>
            <span className="text-foreground font-medium">April 30, 2025</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TriptychDeadlineBanner;
