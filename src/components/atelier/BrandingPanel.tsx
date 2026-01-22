import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LUXURY_FONTS, LUXURY_PALETTES, type SiteBranding } from "@/lib/atelier-templates";

interface BrandingPanelProps {
  branding: SiteBranding;
  onChange: (updates: Partial<SiteBranding>) => void;
  onClose: () => void;
}

const BrandingPanel = ({ branding, onChange, onClose }: BrandingPanelProps) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium">Branding</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Color Palettes */}
        <div className="space-y-3">
          <Label>Color Palette</Label>
          <div className="grid grid-cols-2 gap-2">
            {LUXURY_PALETTES.map((palette) => (
              <button
                key={palette.name}
                onClick={() => onChange({
                  primaryColor: palette.primary,
                  secondaryColor: palette.secondary,
                  accentColor: palette.accent,
                })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  branding.primaryColor === palette.primary
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: palette.accent }}
                  />
                </div>
                <p className="text-xs font-medium">{palette.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-3">
          <Label>Custom Colors</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Primary</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Secondary</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={branding.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Accent</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={branding.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <Label>Typography</Label>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Heading Font</Label>
              <Select
                value={branding.fontHeading}
                onValueChange={(value) => onChange({ fontHeading: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LUXURY_FONTS.heading.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Body Font</Label>
              <Select
                value={branding.fontBody}
                onValueChange={(value) => onChange({ fontBody: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LUXURY_FONTS.body.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-3">
          <Label>Logo URL</Label>
          <Input
            value={branding.logoUrl || ""}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground">
            Add your logo image URL
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;
