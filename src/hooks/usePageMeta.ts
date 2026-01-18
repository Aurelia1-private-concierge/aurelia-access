import { useEffect } from "react";

interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export const usePageMeta = ({
  title,
  description,
  keywords,
  ogImage,
  canonical,
}: PageMeta) => {
  useEffect(() => {
    const baseTitle = "Aurelia Private Concierge";

    // Update title
    if (title) {
      document.title = `${title} | ${baseTitle}`;
    }

    // Update meta tags
    const metaTags: Record<string, string | undefined> = {
      description,
      keywords,
      "og:title": title ? `${title} | ${baseTitle}` : undefined,
      "og:description": description,
      "og:image": ogImage,
      "twitter:title": title ? `${title} | ${baseTitle}` : undefined,
      "twitter:description": description,
      "twitter:image": ogImage,
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      if (!content) return;

      let meta = document.querySelector(
        `meta[name="${name}"], meta[property="${name}"]`
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("twitter:")) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    });

    // Update canonical link
    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // Cleanup - restore original title on unmount
    return () => {
      // Don't restore since next page will set its own
    };
  }, [title, description, keywords, ogImage, canonical]);
};

export default usePageMeta;
