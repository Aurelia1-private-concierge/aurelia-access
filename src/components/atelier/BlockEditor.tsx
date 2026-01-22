import { motion } from "framer-motion";
import { GripVertical, ChevronRight, FileText, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_CONFIGS, type SiteBlock } from "@/lib/atelier-templates";

interface BlockEditorProps {
  block: SiteBlock;
  isSelected: boolean;
  onClick: () => void;
  onChange: (updates: Partial<SiteBlock>) => void;
}

const BlockEditor = ({ block, isSelected, onClick }: BlockEditorProps) => {
  const config = BLOCK_CONFIGS[block.type];
  const iconName = config?.icon as keyof typeof Icons;
  const IconComponent: LucideIcon = (Icons[iconName] as LucideIcon) || FileText;
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-muted/50"
      )}
    >
      <div className="text-muted-foreground cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className={cn(
        "w-8 h-8 rounded flex items-center justify-center shrink-0",
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <IconComponent className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {config?.name || block.type}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {config?.description || "Block content"}
        </p>
      </div>

      <ChevronRight className={cn(
        "w-4 h-4 shrink-0 transition-transform",
        isSelected && "rotate-90"
      )} />
    </motion.button>
  );
};

export default BlockEditor;
