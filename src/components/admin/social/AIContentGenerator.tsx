import React, { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialPlatform, PLATFORM_INFO } from "@/hooks/useSocialAdvertising";
import { useToast } from "@/hooks/use-toast";

interface AIContentGeneratorProps {
  onGenerate: (baseContent: string, platforms: SocialPlatform[], theme?: string) => Promise<{
    platforms: Record<string, { content: string; hashtags: string[] }>;
  }>;
}

const CONTENT_THEMES = [
  { value: "lifestyle", label: "Lifestyle & Luxury" },
  { value: "investment", label: "Investment & Wealth" },
  { value: "experiences", label: "Exclusive Experiences" },
  { value: "technology", label: "Innovation & Tech" },
  { value: "community", label: "Community & Networking" },
];

const AIContentGenerator = forwardRef<HTMLDivElement, AIContentGeneratorProps>(
  ({ onGenerate }, ref) => {
    const { toast } = useToast();
    const [baseContent, setBaseContent] = useState("");
    const [theme, setTheme] = useState("lifestyle");
    const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["twitter", "linkedin"]);
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState<Record<string, { content: string; hashtags: string[] }> | null>(null);
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

    const togglePlatform = (platform: SocialPlatform) => {
      setSelectedPlatforms(prev =>
        prev.includes(platform)
          ? prev.filter(p => p !== platform)
          : [...prev, platform]
      );
    };

    const handleGenerate = async () => {
      if (!baseContent.trim() || selectedPlatforms.length === 0) {
        toast({
          title: "Missing input",
          description: "Please provide content and select at least one platform",
          variant: "destructive",
        });
        return;
      }

      setGenerating(true);
      setResults(null);

      try {
        const data = await onGenerate(baseContent, selectedPlatforms, theme);
        setResults(data.platforms);
        toast({
          title: "Content generated",
          description: `Created optimized content for ${selectedPlatforms.length} platforms`,
        });
      } catch (error) {
        toast({
          title: "Generation failed",
          description: "Failed to generate content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setGenerating(false);
      }
    };

    const copyToClipboard = async (platform: string, content: string) => {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    };

    return (
      <Card ref={ref} className="border-border/50">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Transform your message into platform-optimized UHNWI content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="base-content">Base Content</Label>
              <Textarea
                id="base-content"
                placeholder="Enter your core message or announcement. The AI will adapt it for each platform's UHNWI audience..."
                className="min-h-[100px]"
                value={baseContent}
                onChange={(e) => setBaseContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Write naturally - AI will handle platform-specific formatting and tone
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Content Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_THEMES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Target Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PLATFORM_INFO) as SocialPlatform[]).map((platform) => {
                  const info = PLATFORM_INFO[platform];
                  const isSelected = selectedPlatforms.includes(platform);

                  return (
                    <div
                      key={platform}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => togglePlatform(platform)}
                    >
                      <Checkbox checked={isSelected} onCheckedChange={() => togglePlatform(platform)} />
                      <span>{info.icon}</span>
                      <span className="text-sm">{info.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || !baseContent.trim() || selectedPlatforms.length === 0}
              className="w-full gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Platform Content
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 pt-4 border-t border-border/50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Generated Content
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>

                <div className="grid gap-4">
                  {Object.entries(results).map(([platform, data], index) => {
                    const info = PLATFORM_INFO[platform as SocialPlatform];
                    if (!info) return null;

                    return (
                      <motion.div
                        key={platform}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-border/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{info.icon}</span>
                            <span className="font-medium">{info.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {data.content.length}/{info.maxLength}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(platform, data.content)}
                          >
                            {copiedPlatform === platform ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
                          {data.content}
                        </p>

                        {data.hashtags && data.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {data.hashtags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }
);

AIContentGenerator.displayName = "AIContentGenerator";

export default AIContentGenerator;
