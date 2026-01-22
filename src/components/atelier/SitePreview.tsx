import { useMemo } from "react";
import { cn } from "@/lib/utils";
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
    const blockContent = block.content as Record<string, unknown>;

    switch (block.type) {
      case "hero":
        return (
          <section
            key={index}
            className="min-h-[60vh] flex items-center justify-center text-center p-8"
            style={{ 
              backgroundColor: branding.primaryColor,
              color: branding.accentColor,
            }}
          >
            <div>
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
                className="text-xl opacity-80"
                style={{ fontFamily: branding.fontBody }}
              >
                {(blockContent.subtitle as string) || "Your story begins here"}
              </p>
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
              {(blockContent.heading as string) || block.type.charAt(0).toUpperCase() + block.type.slice(1)}
            </h2>
            <p 
              className="text-lg leading-relaxed text-center opacity-80"
              style={{ fontFamily: branding.fontBody }}
            >
              {(blockContent.text as string) || "Your content will appear here. Use Orla AI to generate compelling copy."}
            </p>
          </section>
        );

      case "gallery":
        return (
          <section key={index} className="py-16 px-8 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div 
                  key={n}
                  className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${branding.accentColor}30` }}
                >
                  <span className="text-sm opacity-50">Image {n}</span>
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
            <p 
              className="mb-6 opacity-80"
              style={{ fontFamily: branding.fontBody }}
            >
              {(blockContent.email as string) || "contact@example.com"}
            </p>
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
        return (
          <section
            key={index}
            className="py-16 px-8 bg-gray-50"
            style={{ color: branding.primaryColor }}
          >
            <h2 
              className="text-2xl md:text-3xl font-serif mb-8 text-center"
              style={{ fontFamily: branding.fontHeading }}
            >
              {block.type === "achievements" ? "Achievements" : "Impact"}
            </h2>
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
              {[
                { value: "25+", label: "Years Experience" },
                { value: "$2B", label: "Assets Managed" },
                { value: "50+", label: "Global Partners" },
              ].map((stat, i) => (
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

      default:
        return (
          <section
            key={index}
            className="py-12 px-8 text-center border-y border-dashed border-gray-300"
          >
            <p className="text-muted-foreground">
              {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
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
          viewMode !== "desktop" && "ring-8 ring-gray-200"
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
