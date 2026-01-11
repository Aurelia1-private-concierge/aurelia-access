import React, { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AVATAR_MODELS, AvatarModelType } from "./index";

interface AvatarModelSelectorProps {
  currentModel: AvatarModelType;
  onSelect: (model: AvatarModelType) => void;
  compact?: boolean;
}

const AvatarModelSelector: React.FC<AvatarModelSelectorProps> = ({
  currentModel,
  onSelect,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex gap-2">
        {AVATAR_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
              currentModel === model.id
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            title={model.name}
          >
            {model.preview}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {AVATAR_MODELS.map((model) => (
        <motion.button
          key={model.id}
          onClick={() => onSelect(model.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-4 rounded-xl border text-left transition-all ${
            currentModel === model.id
              ? "bg-primary/10 border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
        >
          {currentModel === model.id && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="text-2xl mb-2">{model.preview}</div>
          <div className="font-medium text-sm">{model.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
        </motion.button>
      ))}
    </div>
  );
};

export default memo(AvatarModelSelector);
