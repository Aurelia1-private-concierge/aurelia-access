import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
}

const DEFAULT_TITLE = "Aurelia | Private Concierge for the Discerning Few";
const DEFAULT_DESCRIPTION = "The world's most exclusive private concierge service. Private aviation, yacht charters, rare collectibles, and bespoke experiences—curated for those who expect nothing less than extraordinary.";
const DEFAULT_IMAGE = "/og-image.png";
const BASE_URL = "https://www.aurelia-privateconciege.com";

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
}: SEOHeadProps) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | Aurelia` : DEFAULT_TITLE;
  const fullUrl = `${BASE_URL}${location.pathname}`;
  const fullImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (meta) {
        meta.setAttribute("content", content);
      }
    };

    // Update Open Graph tags
    updateMeta("og:title", fullTitle);
    updateMeta("og:description", description);
    updateMeta("og:url", fullUrl);
    updateMeta("og:image", fullImage);
    updateMeta("og:type", type);

    // Update Twitter tags
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:url", fullUrl);
    updateMeta("twitter:image", fullImage);

    // Update description
    updateMeta("description", description);

    // Handle noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (robotsMeta) {
      robotsMeta.setAttribute("content", noIndex ? "noindex, nofollow" : "index, follow");
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.setAttribute("href", fullUrl);
    }
  }, [fullTitle, description, fullUrl, fullImage, type, noIndex]);

  return null; // This component only updates document head
};

export default SEOHead;
