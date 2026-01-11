import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Plus, Trash2, QrCode, Download } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "https://aurelia-privateconcierge.com";

interface CampaignLink {
  id: string;
  name: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  createdAt: Date;
}

const PRESET_SOURCES = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter/X" },
  { value: "email", label: "Email" },
  { value: "referral", label: "Referral" },
  { value: "partner", label: "Partner" },
  { value: "print", label: "Print" },
  { value: "event", label: "Event" },
];

const PRESET_MEDIUMS = [
  { value: "cpc", label: "CPC (Paid Search)" },
  { value: "paid_social", label: "Paid Social" },
  { value: "organic_social", label: "Organic Social" },
  { value: "email", label: "Email" },
  { value: "affiliate", label: "Affiliate" },
  { value: "display", label: "Display Ads" },
  { value: "retargeting", label: "Retargeting" },
  { value: "influencer", label: "Influencer" },
  { value: "pr", label: "PR / Press" },
  { value: "direct", label: "Direct" },
];

const LANDING_PAGES = [
  { value: "/", label: "Homepage" },
  { value: "/services", label: "Services" },
  { value: "/membership", label: "Membership" },
  { value: "/orla", label: "Orla AI" },
  { value: "/trial", label: "Trial Application" },
  { value: "/contact", label: "Contact" },
  { value: "/discover", label: "Discover" },
  { value: "/referral", label: "Referral Program" },
];

const CampaignURLBuilder = () => {
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [landingPage, setLandingPage] = useState("/");
  const [savedLinks, setSavedLinks] = useState<CampaignLink[]>([]);

  const generateURL = () => {
    const params = new URLSearchParams();
    if (source) params.set("utm_source", source);
    if (medium) params.set("utm_medium", medium);
    if (campaign) params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    if (term) params.set("utm_term", term);

    const queryString = params.toString();
    return `${BASE_URL}${landingPage}${queryString ? `?${queryString}` : ""}`;
  };

  const generatedURL = generateURL();
  const isValid = source && medium && campaign;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("URL copied to clipboard");
  };

  const saveLink = () => {
    if (!isValid) {
      toast.error("Please fill in source, medium, and campaign");
      return;
    }

    const newLink: CampaignLink = {
      id: crypto.randomUUID(),
      name: `${campaign} - ${source}`,
      url: generatedURL,
      source,
      medium,
      campaign,
      createdAt: new Date(),
    };

    setSavedLinks([newLink, ...savedLinks]);
    toast.success("Campaign link saved");
  };

  const deleteLink = (id: string) => {
    setSavedLinks(savedLinks.filter(link => link.id !== id));
    toast.success("Link removed");
  };

  const exportLinks = () => {
    const csv = [
      ["Name", "URL", "Source", "Medium", "Campaign", "Created"],
      ...savedLinks.map(link => [
        link.name,
        link.url,
        link.source,
        link.medium,
        link.campaign,
        link.createdAt.toISOString(),
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurelia-campaign-links-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Links exported");
  };

  return (
    <div className="space-y-6">
      {/* URL Builder */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Campaign URL Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Landing Page */}
          <div className="space-y-2">
            <Label>Landing Page</Label>
            <Select value={landingPage} onValueChange={setLandingPage}>
              <SelectTrigger>
                <SelectValue placeholder="Select landing page" />
              </SelectTrigger>
              <SelectContent>
                {LANDING_PAGES.map(page => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label} ({page.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source */}
            <div className="space-y-2">
              <Label>
                Source <span className="text-destructive">*</span>
              </Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="e.g., google, facebook" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_SOURCES.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or enter custom source..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Medium */}
            <div className="space-y-2">
              <Label>
                Medium <span className="text-destructive">*</span>
              </Label>
              <Select value={medium} onValueChange={setMedium}>
                <SelectTrigger>
                  <SelectValue placeholder="e.g., cpc, email" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_MEDIUMS.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or enter custom medium..."
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Campaign */}
            <div className="space-y-2">
              <Label>
                Campaign Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., spring_2026_launch"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              />
            </div>

            {/* Content (optional) */}
            <div className="space-y-2">
              <Label>Content (optional)</Label>
              <Input
                placeholder="e.g., banner_v2, cta_button"
                value={content}
                onChange={(e) => setContent(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              />
            </div>

            {/* Term (optional) */}
            <div className="space-y-2 md:col-span-2">
              <Label>Term / Keywords (optional)</Label>
              <Input
                placeholder="e.g., luxury_concierge, private_jet"
                value={term}
                onChange={(e) => setTerm(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              />
            </div>
          </div>

          {/* Generated URL */}
          <div className="space-y-2">
            <Label>Generated URL</Label>
            <div className="flex gap-2">
              <Input
                value={generatedURL}
                readOnly
                className="font-mono text-sm bg-background"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(generatedURL)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(generatedURL, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={saveLink} disabled={!isValid} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Save Campaign Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Links */}
      {savedLinks.length > 0 && (
        <Card className="bg-card/50 border-border/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Saved Campaign Links</CardTitle>
            <Button variant="outline" size="sm" onClick={exportLinks}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedLinks.map(link => (
                <div
                  key={link.id}
                  className="p-4 bg-background/50 rounded-lg border border-border/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{link.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {link.source}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {link.medium}
                        </Badge>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground truncate">
                        {link.url}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reference */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">UTM Parameter Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-primary mb-1">utm_source</p>
              <p className="text-muted-foreground">
                Where traffic comes from (google, facebook, newsletter)
              </p>
            </div>
            <div>
              <p className="font-medium text-primary mb-1">utm_medium</p>
              <p className="text-muted-foreground">
                Marketing medium (cpc, email, social, affiliate)
              </p>
            </div>
            <div>
              <p className="font-medium text-primary mb-1">utm_campaign</p>
              <p className="text-muted-foreground">
                Campaign identifier (spring_sale, product_launch)
              </p>
            </div>
            <div>
              <p className="font-medium text-primary mb-1">utm_content</p>
              <p className="text-muted-foreground">
                A/B test variants or ad creative (banner_a, cta_blue)
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-primary mb-1">utm_term</p>
              <p className="text-muted-foreground">
                Paid search keywords (luxury_concierge, private_jet_charter)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignURLBuilder;
