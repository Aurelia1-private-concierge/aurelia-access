import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles, Wind, Sun, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAvatarStyle, AvatarStyle } from "@/hooks/useAvatarStyle";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";
import { useToast } from "@/hooks/use-toast";

const AvatarStyleGallery = () => {
  const { toast } = useToast();
  const { styles, currentStyle, currentStyleId, setStyle } = useAvatarStyle();
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  const handleStyleSelect = (styleId: string) => {
    setStyle(styleId);
    const style = styles.find(s => s.id === styleId);
    toast({
      title: "Style Applied",
      description: `Switched to ${style?.name} theme`,
    });
  };

  const getEffectIcons = (style: AvatarStyle) => {
    const icons = [];
    if (style.effects.sparkles) icons.push({ icon: Sparkles, label: "Sparkles" });
    if (style.effects.particles) icons.push({ icon: Wind, label: "Particles" });
    if (style.effects.glow) icons.push({ icon: Sun, label: "Glow" });
    if (style.effects.pulse) icons.push({ icon: Circle, label: "Pulse" });
    return icons;
  };

  return (
    <Card className="border-border/30 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Palette className="w-5 h-5 text-primary" />
          Avatar Style Gallery
        </CardTitle>
        <CardDescription>
          Choose a unique color theme for Orla's appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Style Preview */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30 border border-border/30">
          <motion.div
            key={currentStyleId}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 20px ${currentStyle.colors.glow})`,
            }}
          >
            <OrlaMiniAvatar 
              size={80} 
              isActive 
              showSparkles={currentStyle.effects.sparkles}
            />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentStyle.preview}</span>
              <h4 className="font-medium">{currentStyle.name}</h4>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{currentStyle.description}</p>
            <div className="flex gap-2">
              {getEffectIcons(currentStyle).map(({ icon: Icon, label }) => (
                <Badge key={label} variant="outline" className="text-xs gap-1">
                  <Icon className="w-3 h-3" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Style Grid */}
        <ScrollArea className="h-[320px] pr-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {styles.map((style) => {
              const isSelected = style.id === currentStyleId;
              const isHovered = style.id === hoveredStyle;
              
              return (
                <motion.button
                  key={style.id}
                  onMouseEnter={() => setHoveredStyle(style.id)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  onClick={() => handleStyleSelect(style.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border bg-muted/20 hover:bg-muted/40"
                  }`}
                  style={{
                    boxShadow: isHovered || isSelected 
                      ? `0 0 20px ${style.colors.glow}` 
                      : "none",
                  }}
                >
                  {/* Selected indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Color preview */}
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                      style={{ 
                        backgroundColor: style.colors.secondary,
                        border: `2px solid ${style.colors.primary}`,
                      }}
                    >
                      {style.preview}
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: style.colors.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: style.colors.accent }}
                      />
                    </div>
                  </div>
                  
                  {/* Style name */}
                  <h5 className="font-medium text-sm truncate">{style.name}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {style.description}
                  </p>
                  
                  {/* Effect indicators */}
                  <div className="flex gap-1 mt-2">
                    {style.effects.sparkles && <Sparkles className="w-3 h-3 text-muted-foreground" />}
                    {style.effects.particles && <Wind className="w-3 h-3 text-muted-foreground" />}
                    {style.effects.glow && <Sun className="w-3 h-3 text-muted-foreground" />}
                    {style.effects.pulse && <Circle className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AvatarStyleGallery;
