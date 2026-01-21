import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { META_DESCRIPTIONS, PAGE_TITLES, getPageKeywords } from "@/lib/seo-keywords";
import { SITE_CONFIG } from "@/lib/site-config";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  pageType?: keyof typeof META_DESCRIPTIONS;
}

const DEFAULT_TITLE = SITE_CONFIG.seo.defaultTitle;
const DEFAULT_DESCRIPTION = SITE_CONFIG.seo.defaultDescription;
const DEFAULT_IMAGE = SITE_CONFIG.seo.defaultImage;

export const SEOHead = ({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  pageType,
}: SEOHeadProps) => {
  const location = useLocation();
  
  // Use page-specific SEO data if pageType is provided
  const pageTitle = pageType && PAGE_TITLES[pageType as keyof typeof PAGE_TITLES];
  const pageDescription = pageType && META_DESCRIPTIONS[pageType as keyof typeof META_DESCRIPTIONS];
  const pageKeywords = pageType ? getPageKeywords(pageType) : "";
  
  const fullTitle = title || pageTitle || DEFAULT_TITLE;
  const finalDescription = description || pageDescription || DEFAULT_DESCRIPTION;
  const fullUrl = SITE_CONFIG.getCanonicalUrl(location.pathname);
  const fullImage = SITE_CONFIG.getAssetUrl(image);

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
      } else {
        // Create meta tag if it doesn't exist
        const newMeta = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          newMeta.setAttribute("property", property);
        } else {
          newMeta.setAttribute("name", property);
        }
        newMeta.setAttribute("content", content);
        document.head.appendChild(newMeta);
      }
    };

    // Update Open Graph tags
    updateMeta("og:title", fullTitle);
    updateMeta("og:description", finalDescription);
    updateMeta("og:url", fullUrl);
    updateMeta("og:image", fullImage);
    updateMeta("og:type", type);

    // Update Twitter tags
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", finalDescription);
    updateMeta("twitter:url", fullUrl);
    updateMeta("twitter:image", fullImage);

    // Update description
    updateMeta("description", finalDescription);

    // Update keywords if available
    if (pageKeywords) {
      updateMeta("keywords", pageKeywords);
    }

    // Handle noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (robotsMeta) {
      robotsMeta.setAttribute("content", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.setAttribute("href", fullUrl);
    }

    // Update structured data for page-specific content
    if (pageType) {
      updatePageStructuredData(pageType, fullTitle, finalDescription, fullUrl);
    }
  }, [fullTitle, finalDescription, fullUrl, fullImage, type, noIndex, pageType, pageKeywords]);

  return null;
};

// Add page-specific structured data
function updatePageStructuredData(
  pageType: string,
  title: string,
  description: string,
  url: string
) {
  // Remove existing page-specific structured data
  const existingScript = document.querySelector('script[data-page-schema]');
  if (existingScript) {
    existingScript.remove();
  }

  let schemaData: object | null = null;

  switch (pageType) {
    case "services":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Aurelia Luxury Concierge Services",
        "description": description,
        "url": url,
        "numberOfItems": 11,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Private Aviation" },
          { "@type": "ListItem", "position": 2, "name": "Yacht Charters" },
          { "@type": "ListItem", "position": 3, "name": "Real Estate" },
          { "@type": "ListItem", "position": 4, "name": "Rare Collectibles" },
          { "@type": "ListItem", "position": 5, "name": "Exclusive Access" },
          { "@type": "ListItem", "position": 6, "name": "Security & Protection" },
          { "@type": "ListItem", "position": 7, "name": "Chauffeur Services" },
          { "@type": "ListItem", "position": 8, "name": "Culinary Excellence" },
          { "@type": "ListItem", "position": 9, "name": "Bespoke Travel" },
          { "@type": "ListItem", "position": 10, "name": "Wellness & Medical" },
          { "@type": "ListItem", "position": 11, "name": "Personal Shopping" }
        ]
      };
      break;

    case "membership":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Aurelia Membership",
        "description": description,
        "url": url,
        "brand": {
          "@type": "Brand",
          "name": "Aurelia Private Concierge"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Signature Membership",
            "price": "2500",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "name": "Prestige Membership",
            "price": "7500",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "name": "Black Card Membership",
            "price": "25000",
            "priceCurrency": "USD",
            "availability": "https://schema.org/LimitedAvailability"
          }
        ]
      };
      break;

    case "orla":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Orla AI Concierge",
        "applicationCategory": "LifestyleApplication",
        "description": description,
        "url": url,
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Included with Aurelia membership"
        }
      };
      break;

    case "contact":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Aurelia",
        "description": description,
        "url": url,
        "mainEntity": {
          "@type": "Organization",
          "name": "Aurelia Private Concierge",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["English", "French", "Arabic", "Mandarin", "Russian"]
          }
        }
      };
      break;
  }

  if (schemaData) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-page-schema", "true");
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }
}

export default SEOHead;
