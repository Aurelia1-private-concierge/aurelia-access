import { motion } from "framer-motion";
import { Sparkles, Image, Zap, Monitor, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAvatarPreferences, AvatarMode } from "@/hooks/useAvatarPreferences";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";

const AvatarSettingsPanel = () => {
  const { 
    mode, 
    reducedMotion, 
    isLowEndDevice, 
    supportsWebGL,
    setMode, 
    toggleReducedMotion,
    shouldUse3D 
  } = useAvatarPreferences();

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
        {/* Avatar Preview */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex flex-col items-center gap-2">
            <OrlaMiniAvatar size={80} isActive showSparkles />
            <span className="text-xs text-muted-foreground">Current</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={shouldUse3D() ? "default" : "secondary"} className="text-xs">
                {shouldUse3D() ? "3D Mode Active" : "Static Mode Active"}
              </Badge>
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
            </div>
            {!supportsWebGL && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                WebGL not supported - 3D mode unavailable
              </p>
            )}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Avatar Mode</Label>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as AvatarMode)}
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

        {/* Info Note */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Avatar settings are saved locally and will persist across sessions. 
            The auto mode respects your system's reduced motion preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSettingsPanel;
