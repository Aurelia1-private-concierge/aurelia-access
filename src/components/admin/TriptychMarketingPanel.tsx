import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Linkedin, Twitter, Instagram, Mail, FileText, Megaphone, Download } from "lucide-react";
import { toast } from "sonner";

const TRIPTYCH_MARKETING_ASSETS = {
  social: {
    linkedin: [
      {
        type: "Announcement Post",
        content: `🌟 TRIPTYCH: A Restricted Cultural Immersion

Between June 19–24, 2025, an unprecedented cultural passage unfolds in Rio de Janeiro.

TRIPTYCH is not a journey in the conventional sense. It is a composed passage—where time, sound, territory, aesthetics, and human presence are treated as living material.

Two symbolic encounters await:
• The Night of Passage — A symphonic encounter created for a single time and context
• The Gathering of Living Culture — Where culture is not observed from a distance, but lived from within

Four dimensions of immersion. 200 positions. By application only.

Applications close April 30, 2025.

#LuxuryTravel #CulturalImmersion #Brazil #RioDeJaneiro #ExclusiveExperiences #UHNW #BeyondPriveBrasilis`,
        hashtags: "#LuxuryTravel #CulturalImmersion #Brazil #RioDeJaneiro #ExclusiveExperiences"
      },
      {
        type: "Thought Leadership",
        content: `Some places are visited. Others are revealed.

This is the philosophy behind TRIPTYCH—a restricted cultural immersion that redefines what it means to experience Brazil.

In a world of algorithmic travel recommendations and commodified experiences, TRIPTYCH offers something increasingly rare: meaning.

Each moment is designed not as programming, but as atmosphere—unfolding gradually, guiding the guest from the exterior world into a more interior, perceptive state.

June 19–24, 2025 | Rio de Janeiro | Applications close April 30

#ThoughtLeadership #LuxuryLifestyle #ExperientialTravel #TransformativeJourneys`,
        hashtags: "#ThoughtLeadership #LuxuryLifestyle #ExperientialTravel #TransformativeJourneys"
      }
    ],
    instagram: [
      {
        type: "Carousel Intro",
        content: `TRIPTYCH
A Restricted Cultural Immersion
Rio de Janeiro | June 19–24, 2025

Slide 1: The title and dramatic Rio twilight
Slide 2: "Some places are visited. Others are revealed."
Slide 3: The Night of Passage — Symphonic encounter
Slide 4: The Gathering of Living Culture
Slide 5: Four access categories: EXIMIUS to UNUM
Slide 6: Applications close April 30, 2025

—

Link in bio for inquiries.

#TRIPTYCH #RioDeJaneiro #BrazilTravel #LuxuryExperiences #CulturalImmersion #ExclusiveAccess #BeyondPriveBrasilis #ByInvitationOnly`,
        hashtags: "#TRIPTYCH #RioDeJaneiro #BrazilTravel #LuxuryExperiences #CulturalImmersion"
      },
      {
        type: "Story Series",
        content: `Story 1: "TRIPTYCH" title reveal with countdown sticker to April 30
Story 2: "Rio de Janeiro | June 19–24, 2025"
Story 3: Poll — "Have you experienced Brazil beyond the surface?"
Story 4: "200 positions. Four dimensions of immersion."
Story 5: Swipe up/Link for inquiries

Use: Dark, cinematic aesthetic. Gold accents. Minimal text.`,
        hashtags: ""
      }
    ],
    twitter: [
      {
        type: "Thread Opener",
        content: `TRIPTYCH: A Restricted Cultural Immersion

Rio de Janeiro | June 19–24, 2025

Some places are visited. Others are revealed.

A 🧵 on what makes this different from anything else:`,
        hashtags: ""
      },
      {
        type: "Single Post",
        content: `TRIPTYCH isn't a travel experience.

It's a composed passage—where time, sound, territory, and human presence are treated as living material.

Rio de Janeiro | June 19–24, 2025
200 positions | Applications close April 30

By invitation only.`,
        hashtags: ""
      }
    ]
  },
  email: [
    {
      type: "VIP Invitation",
      subject: "An Invitation to TRIPTYCH — Rio de Janeiro, June 2025",
      content: `Dear [Name],

You are among a select group receiving early access to TRIPTYCH—a restricted cultural immersion unfolding in Rio de Janeiro from June 19–24, 2025.

TRIPTYCH is not a journey in the conventional sense. It is a composed passage where time, sound, territory, aesthetics, and human presence are treated as living material. Each moment is designed not as programming, but as atmosphere—unfolding gradually, guiding you from the exterior world into a more interior, perceptive state.

TWO SYMBOLIC ENCOUNTERS

The Night of Passage
A symphonic encounter created for a single time and context, where contemporary Brazilian voices meet orchestral language in a work that exists only in that evening's breath.

The Gathering of Living Culture
An elegant and vibrant convergence where music circulates, presence replaces performance, and culture is not observed from a distance, but lived from within.

FOUR DIMENSIONS OF IMMERSION

• EXIMIUS — Essential Immersion ($206,000)
• SINGULARIS — Cultural Depth ($274,000)
• EGREGIUS — Elevated Access ($342,000)
• UNUM — Founding Circle ($456,000)

Those present at this inaugural immersion become Founding Members of Beyond Privé Brasilis—a highly restricted circle of belonging dedicated to rare cultural access within Brazil.

Applications close April 30, 2025. Maximum 200 guests.

To express interest, please reply directly to this email or visit our secure inquiry portal.

With warm regards,

[Concierge Name]
Aurelia Private Concierge`
    },
    {
      type: "Follow-Up",
      subject: "TRIPTYCH — Your Inquiry Awaits",
      content: `Dear [Name],

I wanted to ensure you received our invitation to TRIPTYCH, the inaugural cultural immersion from Beyond Privé Brasilis.

With applications closing April 30 and only 200 positions available across four access categories, I wanted to personally reach out to understand if this experience aligns with your interests.

Would you be available for a brief call this week to discuss the details? I would be honored to walk you through the experience and answer any questions.

Alternatively, you may express interest directly through our secure portal.

Respectfully,

[Concierge Name]
Aurelia Private Concierge`
    }
  ],
  ads: [
    {
      platform: "LinkedIn Sponsored Content",
      headline: "TRIPTYCH: Where Brazil Reveals Itself",
      primaryText: "Some places are visited. Others are revealed. June 19–24, 2025 in Rio de Janeiro. By application only.",
      cta: "Express Interest"
    },
    {
      platform: "Google Search",
      headlines: [
        "TRIPTYCH | Rio Cultural Immersion",
        "Exclusive Brazil Experience 2025",
        "By Invitation Only | June 2025"
      ],
      descriptions: [
        "Unprecedented symphonic encounters & private access. June 19-24, 2025. Applications close April 30.",
        "Beyond tourism. 200 positions. Four dimensions of immersion. Founding member access to Brazil's cultural heart."
      ]
    },
    {
      platform: "Meta (Facebook/Instagram)",
      primaryText: "TRIPTYCH: A Restricted Cultural Immersion. Rio de Janeiro, June 19–24, 2025. An unprecedented symphonic encounter, high-level Brazilian gastronomy, and forms of access that are never publicly announced.",
      headline: "Applications Close April 30",
      description: "200 positions. By invitation only.",
      cta: "Learn More"
    }
  ],
  pressRelease: {
    title: "Beyond Privé Brasilis Announces TRIPTYCH: A Restricted Cultural Immersion in Rio de Janeiro",
    content: `FOR IMMEDIATE RELEASE

Beyond Privé Brasilis Announces TRIPTYCH: A Restricted Cultural Immersion in Rio de Janeiro

Inaugural Experience Offers Unprecedented Access to Brazil's Cultural Heart
June 19–24, 2025 | Limited to 200 Guests | Applications Close April 30

LONDON — Beyond Privé Brasilis, in partnership with Aurelia Private Concierge, today announced TRIPTYCH, a restricted cultural immersion taking place in Rio de Janeiro from June 19–24, 2025.

TRIPTYCH represents an unprecedented approach to cultural experience—a composed passage where time, sound, territory, aesthetics, and human presence are treated as living material. The experience is designed not as programming, but as atmosphere, unfolding gradually to guide guests from the exterior world into a more interior, perceptive state.

"TRIPTYCH is not a journey in the conventional sense," said [Spokesperson Name]. "It is an invitation to experience Brazil not as visitors, but as participants in something living and unrepeatable."

The experience centers on two symbolic encounters:

THE NIGHT OF PASSAGE
A symphonic encounter created for a single time and context, where contemporary Brazilian voices meet orchestral language in a work that exists only in that evening's breath.

THE GATHERING OF LIVING CULTURE
An elegant and vibrant Brazilian convergence where music circulates, presence replaces performance, and culture is lived from within.

Four access categories are available, ranging from EXIMIUS ($206,000) to UNUM ($456,000), each offering different depths of immersion. Maximum 50 guests per category ensures an intimate experience. Those present at this inaugural immersion become Founding Members of Beyond Privé Brasilis.

Applications are open now through April 30, 2025. Interested parties may inquire at aurelia-privateconcierge.com/experiences/triptych.

ABOUT BEYOND PRIVÉ BRASILIS
Beyond Privé Brasilis is a highly restricted circle of belonging dedicated to rare cultural access within Brazil. TRIPTYCH marks its inaugural moment.

ABOUT AURELIA PRIVATE CONCIERGE
Aurelia Private Concierge is an ultra-premium lifestyle management service serving UHNW individuals and families worldwide. With 24/7 availability and a philosophy of discretion, Aurelia transforms the impossible into the effortless.

MEDIA CONTACT
[Contact Name]
[Email]
[Phone]

###`
  }
};

const TriptychMarketingPanel = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, id)}
      className="h-8 w-8 p-0"
    >
      {copiedId === id ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">TRIPTYCH Marketing Package</h2>
          <p className="text-muted-foreground">Ready-to-use marketing assets for the Rio 2025 experience</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Sales Deadline: April 30, 2025
        </Badge>
      </div>

      <Tabs defaultValue="social" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ad Copy
          </TabsTrigger>
          <TabsTrigger value="press" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Press Release
          </TabsTrigger>
        </TabsList>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          {/* LinkedIn */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                <CardTitle className="text-lg">LinkedIn</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {TRIPTYCH_MARKETING_ASSETS.social.linkedin.map((post, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.type}</Badge>
                    <CopyButton text={post.content} id={`linkedin-${index}`} />
                  </div>
                  <Textarea
                    value={post.content}
                    readOnly
                    className="min-h-[200px] text-sm font-mono"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instagram */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-[#E4405F]" />
                <CardTitle className="text-lg">Instagram</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {TRIPTYCH_MARKETING_ASSETS.social.instagram.map((post, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.type}</Badge>
                    <CopyButton text={post.content} id={`instagram-${index}`} />
                  </div>
                  <Textarea
                    value={post.content}
                    readOnly
                    className="min-h-[180px] text-sm font-mono"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Twitter/X */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                <CardTitle className="text-lg">X (Twitter)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {TRIPTYCH_MARKETING_ASSETS.social.twitter.map((post, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.type}</Badge>
                    <CopyButton text={post.content} id={`twitter-${index}`} />
                  </div>
                  <Textarea
                    value={post.content}
                    readOnly
                    className="min-h-[100px] text-sm font-mono"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="email" className="space-y-4">
          {TRIPTYCH_MARKETING_ASSETS.email.map((email, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{email.type}</CardTitle>
                    <CardDescription>Subject: {email.subject}</CardDescription>
                  </div>
                  <CopyButton text={`Subject: ${email.subject}\n\n${email.content}`} id={`email-${index}`} />
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={email.content}
                  readOnly
                  className="min-h-[400px] text-sm font-mono"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Ad Copy Tab */}
        <TabsContent value="ads" className="space-y-4">
          {TRIPTYCH_MARKETING_ASSETS.ads.map((ad, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ad.platform}</CardTitle>
                  <CopyButton 
                    text={JSON.stringify(ad, null, 2)} 
                    id={`ad-${index}`} 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {"headline" in ad && (
                    <div>
                      <span className="font-medium text-muted-foreground">Headline:</span>
                      <p>{ad.headline}</p>
                    </div>
                  )}
                  {"headlines" in ad && (
                    <div>
                      <span className="font-medium text-muted-foreground">Headlines:</span>
                      <ul className="list-disc list-inside">
                        {ad.headlines.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                  {"primaryText" in ad && (
                    <div>
                      <span className="font-medium text-muted-foreground">Primary Text:</span>
                      <p>{ad.primaryText}</p>
                    </div>
                  )}
                  {"descriptions" in ad && (
                    <div>
                      <span className="font-medium text-muted-foreground">Descriptions:</span>
                      <ul className="list-disc list-inside">
                        {ad.descriptions.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                  {"description" in ad && (
                    <div>
                      <span className="font-medium text-muted-foreground">Description:</span>
                      <p>{ad.description}</p>
                    </div>
                  )}
                  {"cta" in ad && (
                    <div>
                      <span className="font-medium text-muted-foreground">CTA:</span>
                      <Badge variant="secondary" className="ml-2">{ad.cta}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Press Release Tab */}
        <TabsContent value="press">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{TRIPTYCH_MARKETING_ASSETS.pressRelease.title}</CardTitle>
                  <CardDescription>Official press release for media distribution</CardDescription>
                </div>
                <CopyButton 
                  text={TRIPTYCH_MARKETING_ASSETS.pressRelease.content} 
                  id="press-release" 
                />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={TRIPTYCH_MARKETING_ASSETS.pressRelease.content}
                readOnly
                className="min-h-[600px] text-sm font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TriptychMarketingPanel;
