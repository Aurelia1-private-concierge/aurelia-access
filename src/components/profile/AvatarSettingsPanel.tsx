import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image, Zap, Monitor, Info, Volume2, VolumeX, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAvatarPreferences, AvatarMode } from "@/hooks/useAvatarPreferences";
import { OrlaExpression } from "@/hooks/useOrlaExpression";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";
import { useToast } from "@/hooks/use-toast";

const AvatarSettingsPanel = () => {
  const { toast } = useToast();
  const { 
    mode, 
    reducedMotion, 
    isLowEndDevice, 
    supportsWebGL,
    setMode, 
    toggleReducedMotion,
    shouldUse3D 
  } = useAvatarPreferences();
  
  const [previewExpression, setPreviewExpression] = useState<OrlaExpression>("neutral");
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("orla-sound-enabled") !== "false";
  });

  const modeOptions: { value: AvatarMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: "auto",
      label: "Auto (Recommended)",
      description: "Automatically selects based on your device capabilities",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      value: "3d",
      label: "3D Animated",
      description: "Full 3D avatar with animations and effects",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      value: "static",
      label: "Static Image",
      description: "Simple static avatar for best performance",
      icon: <Image className="w-4 h-4" />,
    },
  ];

  const expressions: { value: OrlaExpression; label: string; emoji: string }[] = [
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "thinking", label: "Thinking", emoji: "🤔" },
    { value: "listening", label: "Listening", emoji: "👂" },
    { value: "speaking", label: "Speaking", emoji: "🗣️" },
    { value: "surprised", label: "Surprised", emoji: "😮" },
    { value: "sleepy", label: "Sleepy", emoji: "😴" },
  ];

  const handleModeChange = useCallback((newMode: AvatarMode) => {
    setMode(newMode);
    toast({
      title: "Avatar mode updated",
      description: `Switched to ${newMode === "auto" ? "automatic" : newMode} mode`,
    });
  }, [setMode, toast]);

  const handleSoundToggle = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("orla-sound-enabled", String(newValue));
    toast({
      title: newValue ? "Sound enabled" : "Sound disabled",
      description: newValue ? "Avatar transitions will play sounds" : "Avatar transitions are now silent",
    });
  }, [soundEnabled, toast]);

  const playExpressionDemo = useCallback(() => {
    setIsPreviewActive(true);
    const expressionSequence: OrlaExpression[] = ["happy", "thinking", "listening", "speaking", "surprised", "neutral"];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < expressionSequence.length) {
        setPreviewExpression(expressionSequence[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsPreviewActive(false);
        setPreviewExpression("neutral");
      }
    }, 1200);
  }, []);

  return (
    <Card className="border-border/30 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Sparkles className="w-5 h-5 text-primary" />
          Orla Avatar Settings
        </CardTitle>
        <CardDescription>
          Customize how Orla's avatar appears throughout the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Preview with Expression Demo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              key={previewExpression}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <OrlaMiniAvatar 
                size={100} 
                isActive={isPreviewActive}
                showSparkles 
                expression={previewExpression}
                isSpeaking={previewExpression === "speaking"}
                isListening={previewExpression === "listening"}
              />
            </motion.div>
            <div className="flex items-center gap-2">
              <Badge variant={shouldUse3D() ? "default" : "secondary"} className="text-xs">
                {shouldUse3D() ? "3D" : "Static"}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {previewExpression}
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isLowEndDevice && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Monitor className="w-3 h-3" />
                        Low-end device
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your device has been detected as having limited resources.</p>
                      <p>Static mode is recommended for best performance.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!supportsWebGL && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <Info className="w-3 h-3" />
                  WebGL unavailable
                </Badge>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={playExpressionDemo}
              disabled={isPreviewActive}
              className="gap-2"
            >
              <Play className="w-3 h-3" />
              {isPreviewActive ? "Playing demo..." : "Play expression demo"}
            </Button>
            
            {/* Expression Quick Select */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {expressions.map((expr) => (
                <motion.button
                  key={expr.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewExpression(expr.value)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    previewExpression === expr.value 
                      ? "bg-primary/20 ring-2 ring-primary" 
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  title={expr.label}
                >
                  {expr.emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Avatar Mode</Label>
          <RadioGroup
            value={mode}
            onValueChange={(value) => handleModeChange(value as AvatarMode)}
            className="space-y-3"
          >
            {modeOptions.map((option) => (
              <motion.label
                key={option.value}
                htmlFor={`mode-${option.value}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                  mode === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border hover:bg-muted/30"
                } ${option.value === "3d" && !supportsWebGL ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`mode-${option.value}`}
                  disabled={option.value === "3d" && !supportsWebGL}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{option.icon}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                    {option.value === "auto" && (
                      <Badge variant="outline" className="text-xs">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </motion.label>
            ))}
          </RadioGroup>
        </div>

        {/* Settings Toggles */}
        <div className="space-y-3">
          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-sm font-medium cursor-pointer">
                Reduced Motion
              </Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations for accessibility or performance
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={toggleReducedMotion}
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="space-y-0.5 flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-primary" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="sound-toggle" className="text-sm font-medium cursor-pointer">
                  Transition Sounds
                </Label>
                <p className="text-xs text-muted-foreground">
                  Play subtle sounds during avatar transitions
                </p>
              </div>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Avatar settings are saved locally and will persist across sessions. 
            The auto mode respects your system's reduced motion preferences.
            Expressions change automatically based on Orla's current state.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSettingsPanel;
