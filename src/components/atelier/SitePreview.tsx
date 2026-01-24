import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, Clock, Users, Mail, Phone } from "lucide-react";
import type { MemberSite } from "@/hooks/useAtelier";

interface SitePreviewProps {
  site: MemberSite;
  viewMode: "desktop" | "tablet" | "mobile";
}

const viewportSizes = {
  desktop: { width: "100%", maxWidth: "100%" },
  tablet: { width: "768px", maxWidth: "768px" },
  mobile: { width: "375px", maxWidth: "375px" },
};

const SitePreview = ({ site, viewMode }: SitePreviewProps) => {
  const { branding, content } = site;
  const viewport = viewportSizes[viewMode];

  const previewStyles = useMemo(() => ({
    "--preview-primary": branding.primaryColor,
    "--preview-secondary": branding.secondaryColor,
    "--preview-accent": branding.accentColor,
    "--preview-font-heading": branding.fontHeading,
    "--preview-font-body": branding.fontBody,
  } as React.CSSProperties), [branding]);

  const renderBlock = (block: typeof content[0], index: number) => {
    const blockContent = (block?.content || {}) as Record<string, unknown>;
    const blockType = block?.type || "unknown";

    switch (blockType) {
      case "hero":
        return (
          <section
            key={index}
            className="min-h-[60vh] flex items-center justify-center text-center p-8 relative overflow-hidden"
            style={{ 
              backgroundColor: branding.primaryColor,
              color: branding.accentColor,
            }}
          >
            {/* Subtle gradient overlay */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${branding.secondaryColor}40 0%, transparent 50%, ${branding.accentColor}20 100%)`
              }}
            />
            <div className="relative z-10">
              {branding.logoUrl && (
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-8 object-contain"
                />
              )}
              <h1 
                className="text-4xl md:text-6xl font-serif mb-4"
                style={{ fontFamily: branding.fontHeading }}
              >
                {(blockContent.title as string) || site.name}
              </h1>
              <p 
                className="text-xl opacity-80 max-w-2xl mx-auto"
                style={{ fontFamily: branding.fontBody }}
              >
                {(blockContent.subtitle as string) || "Your story begins here"}
              </p>
              {(blockContent.date as string) && (
                <div className="mt-6 flex items-center justify-center gap-2 opacity-70">
                  <Calendar className="w-4 h-4" />
                  <span style={{ fontFamily: branding.fontBody }}>
                    {blockContent.date as string}
                  </span>
                </div>
              )}
            </div>
          </section>
        );

      case "bio":
      case "story":
      case "mission":
      case "philosophy":
        return (
          <section
            key={index}
            className="py-16 px-8 max-w-3xl mx-auto"
            style={{ color: branding.primaryColor }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-6 text-center"
              style={{ fontFamily: branding.fontHeading }}
            >
              {(blockContent.heading as string) || blockType.charAt(0).toUpperCase() + blockType.slice(1)}
            </h2>
            <p 
              className="text-lg leading-relaxed text-center opacity-80"
              style={{ fontFamily: branding.fontBody }}
            >
              {(blockContent.text as string) || (blockContent.content as string) || "Your content will appear here. Use Orla AI to generate compelling copy."}
            </p>
          </section>
        );

      case "event-details":
      case "details":
        return (
          <section
            key={index}
            className="py-16 px-8"
            style={{ backgroundColor: `${branding.accentColor}15` }}
          >
            <div className="max-w-3xl mx-auto">
              <h2 
                className="text-2xl md:text-3xl font-serif mb-8 text-center"
                style={{ fontFamily: branding.fontHeading, color: branding.primaryColor }}
              >
                Event Details
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <MapPin className="w-6 h-6 mx-auto" style={{ color: branding.secondaryColor }} />
                  <p className="font-medium" style={{ color: branding.primaryColor }}>Location</p>
                  <p className="opacity-70" style={{ color: branding.primaryColor }}>
                    {(blockContent.location as string) || "To be announced"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Clock className="w-6 h-6 mx-auto" style={{ color: branding.secondaryColor }} />
                  <p className="font-medium" style={{ color: branding.primaryColor }}>Time</p>
                  <p className="opacity-70" style={{ color: branding.primaryColor }}>
                    {(blockContent.time as string) || "Evening"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Users className="w-6 h-6 mx-auto" style={{ color: branding.secondaryColor }} />
                  <p className="font-medium" style={{ color: branding.primaryColor }}>Dress Code</p>
                  <p className="opacity-70" style={{ color: branding.primaryColor }}>
                    {(blockContent.dresscode as string) || "Black Tie"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case "rsvp":
        return (
          <section
            key={index}
            className="py-16 px-8"
            style={{ 
              backgroundColor: branding.primaryColor,
              color: branding.accentColor,
            }}
          >
            <div className="max-w-md mx-auto text-center">
              <h2 
                className="text-2xl md:text-3xl font-serif mb-4"
                style={{ fontFamily: branding.fontHeading }}
              >
                RSVP
              </h2>
              <p className="mb-8 opacity-80" style={{ fontFamily: branding.fontBody }}>
                We would be honored by your presence
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded border bg-transparent"
                  style={{ borderColor: `${branding.accentColor}40` }}
                  disabled
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded border bg-transparent"
                  style={{ borderColor: `${branding.accentColor}40` }}
                  disabled
                />
                <button
                  className="w-full px-6 py-3 rounded font-medium transition-opacity hover:opacity-80"
                  style={{ 
                    backgroundColor: branding.secondaryColor,
                    color: branding.primaryColor,
                    fontFamily: branding.fontBody,
                  }}
                  disabled
                >
                  Confirm Attendance
                </button>
              </div>
            </div>
          </section>
        );

      case "gallery":
        const galleryItems = (blockContent.items as unknown[]) || [];
        return (
          <section 
            key={index} 
            className="py-16 px-8"
            style={{ backgroundColor: `${branding.accentColor}10` }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-8 text-center"
              style={{ fontFamily: branding.fontHeading, color: branding.primaryColor }}
            >
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {(galleryItems.length > 0 ? galleryItems : [1, 2, 3, 4, 5, 6]).map((item, n) => (
                <div 
                  key={n}
                  className="aspect-square rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: `${branding.accentColor}30` }}
                >
                  {typeof item === "string" && item.startsWith("http") ? (
                    <img src={item} alt={`Gallery ${n + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm opacity-50" style={{ color: branding.primaryColor }}>
                      Image {n + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "contact":
        return (
          <section
            key={index}
            className="py-16 px-8 text-center"
            style={{ 
              backgroundColor: branding.primaryColor,
              color: branding.accentColor,
            }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-4"
              style={{ fontFamily: branding.fontHeading }}
            >
              Get in Touch
            </h2>
            <div className="space-y-4 mb-8">
              {(blockContent.email as string) && (
                <p className="flex items-center justify-center gap-2 opacity-80" style={{ fontFamily: branding.fontBody }}>
                  <Mail className="w-4 h-4" />
                  {blockContent.email as string}
                </p>
              )}
              {(blockContent.phone as string) && (
                <p className="flex items-center justify-center gap-2 opacity-80" style={{ fontFamily: branding.fontBody }}>
                  <Phone className="w-4 h-4" />
                  {blockContent.phone as string}
                </p>
              )}
              {!(blockContent.email as string) && !(blockContent.phone as string) && (
                <p className="opacity-80" style={{ fontFamily: branding.fontBody }}>
                  contact@example.com
                </p>
              )}
            </div>
            <button
              className="px-6 py-3 rounded font-medium transition-opacity hover:opacity-80"
              style={{ 
                backgroundColor: branding.secondaryColor,
                color: branding.primaryColor,
                fontFamily: branding.fontBody,
              }}
            >
              Contact
            </button>
          </section>
        );

      case "achievements":
      case "impact":
        const stats = (blockContent.stats as Array<{value: string; label: string}>) || [
          { value: "25+", label: "Years Experience" },
          { value: "$2B", label: "Assets Managed" },
          { value: "50+", label: "Global Partners" },
        ];
        return (
          <section
            key={index}
            className="py-16 px-8"
            style={{ 
              backgroundColor: `${branding.accentColor}10`,
              color: branding.primaryColor,
            }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-8 text-center"
              style={{ fontFamily: branding.fontHeading }}
            >
              {blockType === "achievements" ? "Achievements" : "Impact"}
            </h2>
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p 
                    className="text-3xl font-bold mb-2"
                    style={{ color: branding.secondaryColor }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm opacity-70">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "team":
        return (
          <section
            key={index}
            className="py-16 px-8"
            style={{ color: branding.primaryColor }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-8 text-center"
              style={{ fontFamily: branding.fontHeading }}
            >
              Our Team
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[1, 2, 3].map((n) => (
                <div key={n} className="text-center">
                  <div 
                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${branding.accentColor}30` }}
                  >
                    <Users className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="font-medium">Team Member</p>
                  <p className="text-sm opacity-70">Position</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "initiatives":
      case "portfolio":
        return (
          <section
            key={index}
            className="py-16 px-8"
            style={{ backgroundColor: `${branding.accentColor}10` }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-8 text-center"
              style={{ fontFamily: branding.fontHeading, color: branding.primaryColor }}
            >
              {blockType === "initiatives" ? "Initiatives" : "Portfolio"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((n) => (
                <div 
                  key={n} 
                  className="p-6 rounded-lg border"
                  style={{ borderColor: `${branding.accentColor}30`, backgroundColor: "white" }}
                >
                  <h3 
                    className="font-medium mb-2"
                    style={{ color: branding.primaryColor }}
                  >
                    {blockType === "initiatives" ? `Initiative ${n}` : `Investment ${n}`}
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: branding.primaryColor }}>
                    Description coming soon
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return (
          <section
            key={index}
            className="py-12 px-8 text-center border-y border-dashed"
            style={{ borderColor: `${branding.accentColor}40` }}
          >
            <p style={{ color: branding.primaryColor }} className="opacity-60">
              {blockType.charAt(0).toUpperCase() + blockType.slice(1)} Block
            </p>
          </section>
        );
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-auto">
      <div
        className={cn(
          "bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300",
          viewMode !== "desktop" && "ring-8 ring-muted"
        )}
        style={{
          width: viewport.width,
          maxWidth: viewport.maxWidth,
          minHeight: "600px",
          ...previewStyles,
        }}
      >
        {content.length > 0 ? (
          content.map((block, index) => renderBlock(block, index))
        ) : (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            <p>Add blocks to see your site preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitePreview;