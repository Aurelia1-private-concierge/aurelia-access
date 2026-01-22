import { useState } from "react";
import { X, Sparkles, Send, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SiteBlock } from "@/lib/atelier-templates";

interface OrlaContentAssistProps {
  selectedBlock: SiteBlock | null;
  onInsertContent: (content: string) => void;
  onClose: () => void;
}

const PROMPT_TEMPLATES = [
  { id: "bio", label: "Write my bio", prompt: "Write a sophisticated, prestigious biography" },
  { id: "mission", label: "Define my mission", prompt: "Write an inspiring mission statement" },
  { id: "venture", label: "Describe my venture", prompt: "Write a compelling venture description" },
  { id: "invitation", label: "Event invitation", prompt: "Write an elegant event invitation" },
  { id: "legacy", label: "Family legacy", prompt: "Write about our family's legacy and heritage" },
];

const TONES = [
  { id: "prestigious", label: "Prestigious" },
  { id: "warm", label: "Warm & Personal" },
  { id: "formal", label: "Formal" },
  { id: "inspiring", label: "Inspiring" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "it", label: "Italian" },
  { id: "es", label: "Spanish" },
];

const OrlaContentAssist = ({ selectedBlock, onInsertContent, onClose }: OrlaContentAssistProps) => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("prestigious");
  const [language, setLanguage] = useState("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-site-content", {
        body: {
          prompt: prompt.trim(),
          tone,
          language,
          blockType: selectedBlock?.type,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
    } catch (err) {
      console.error("Content generation error:", err);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (generatedContent) {
      onInsertContent(generatedContent);
      setGeneratedContent(null);
      setPrompt("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Orla Content Assist</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Quick prompts */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Prompts</Label>
            <div className="flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPrompt(template.prompt)}
                  className="px-3 py-1.5 text-xs rounded-full border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div className="space-y-2">
            <Label>What would you like me to write?</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what content you need..."
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate button */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {/* Selected block indicator */}
          {selectedBlock && (
            <p className="text-xs text-muted-foreground text-center">
              Content will be inserted into: {selectedBlock.type}
            </p>
          )}

          {/* Generated content */}
          {generatedContent && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Generated Content</Label>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {generatedContent}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInsert} disabled={!selectedBlock}>
                  Insert into Block
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setGeneratedContent(null)}
                >
                  Discard
                </Button>
              </div>
              {!selectedBlock && (
                <p className="text-xs text-amber-500">
                  Select a block in the editor to insert this content
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OrlaContentAssist;
