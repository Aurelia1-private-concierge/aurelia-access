import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { AVATAR_MODELS, AvatarModelType } from "./index";

interface AvatarModelSelectorProps {
  currentModel: AvatarModelType;
  onSelect: (model: AvatarModelType) => void;
  compact?: boolean;
}

// Animated preview states for each model
const PREVIEW_ANIMATIONS: Record<AvatarModelType, { scale: number[]; rotate: number[] }> = {
  classic: { scale: [1, 1.1, 1], rotate: [0, 5, 0] },
  realistic: { scale: [1, 1.05, 1], rotate: [0, -3, 0] },
  anime: { scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] },
  robotic: { scale: [1, 1.08, 1], rotate: [0, -5, 5, 0] },
  elf: { scale: [1, 1.1, 1.05, 1], rotate: [0, 8, 0] },
  steampunk: { scale: [1, 1.05, 1], rotate: [0, -8, 8, 0] },
  minimalist: { scale: [1, 1.12, 1], rotate: [0, 15, 0] },
  masculine: { scale: [1, 1.04, 1], rotate: [0, -4, 0] },
  abstract: { scale: [1, 1.2, 0.95, 1], rotate: [0, 20, 0] },
  cyberpunk: { scale: [1, 1.1, 0.98, 1], rotate: [0, -10, 10, 0] },
  tyrone: { scale: [1, 1.06, 1], rotate: [0, -5, 0] },
};

const AnimatedPreview: React.FC<{ 
  preview: string; 
  modelId: AvatarModelType;
  isSelected: boolean;
  isHovered: boolean;
}> = ({ preview, modelId, isSelected, isHovered }) => {
  const animation = PREVIEW_ANIMATIONS[modelId] || PREVIEW_ANIMATIONS.classic;
  
  return (
    <motion.div
      className="text-2xl"
      animate={isHovered || isSelected ? {
        scale: animation.scale,
        rotate: animation.rotate,
      } : { scale: 1, rotate: 0 }}
      transition={{
        duration: 1.5,
        repeat: isHovered || isSelected ? Infinity : 0,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      {preview}
    </motion.div>
  );
};

const AvatarModelSelector: React.FC<AvatarModelSelectorProps> = ({
  currentModel,
  onSelect,
  compact = false,
}) => {
  const [hoveredModel, setHoveredModel] = useState<AvatarModelType | null>(null);

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap justify-center">
        {AVATAR_MODELS.map((model) => (
          <motion.button
            key={model.id}
            onClick={() => onSelect(model.id)}
            onMouseEnter={() => setHoveredModel(model.id)}
            onMouseLeave={() => setHoveredModel(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
              currentModel === model.id
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            title={model.name}
          >
            <AnimatedPreview
              preview={model.preview}
              modelId={model.id}
              isSelected={currentModel === model.id}
              isHovered={hoveredModel === model.id}
            />
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {AVATAR_MODELS.map((model) => (
        <motion.button
          key={model.id}
          onClick={() => onSelect(model.id)}
          onMouseEnter={() => setHoveredModel(model.id)}
          onMouseLeave={() => setHoveredModel(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-4 rounded-xl border text-left transition-all ${
            currentModel === model.id
              ? "bg-primary/10 border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
        >
          {currentModel === model.id && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
          <div className="mb-2">
            <AnimatedPreview
              preview={model.preview}
              modelId={model.id}
              isSelected={currentModel === model.id}
              isHovered={hoveredModel === model.id}
            />
          </div>
          <div className="font-medium text-sm">{model.name}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{model.description}</div>
        </motion.button>
      ))}
    </div>
  );
};

export default memo(AvatarModelSelector);
