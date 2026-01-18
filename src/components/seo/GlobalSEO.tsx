import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

interface GlobalSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
  children?: ReactNode;
  structuredData?: object;
}

const defaultMeta = {
  title: "Aurelia Private Concierge | Ultra-Premium Lifestyle Management",
  description:
    "Experience unparalleled luxury with Aurelia's private concierge services. Bespoke travel, exclusive access, and 24/7 lifestyle management for discerning individuals.",
  keywords:
    "private concierge, luxury lifestyle, bespoke travel, VIP access, premium services, wealth management, exclusive experiences",
  ogImage: "/og-image-new.png",
};

export const GlobalSEO = ({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  canonicalUrl,
  ogImage = defaultMeta.ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  children,
  structuredData,
}: GlobalSEOProps) => {
  const fullTitle = title
    ? `${title} | Aurelia Private Concierge`
    : defaultMeta.title;

  const baseUrl = "https://aurelia-access.lovable.app";
  const fullCanonical = canonicalUrl
    ? `${baseUrl}${canonicalUrl}`
    : undefined;
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${baseUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical */}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:site_name" content="Aurelia Private Concierge" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Additional SEO */}
      <meta name="author" content="Aurelia Holdings Ltd." />
      <meta name="geo.region" content="GB-LND" />
      <meta name="geo.placename" content="London" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {children}
    </Helmet>
  );
};

// Organization structured data for the brand
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aurelia Private Concierge",
  alternateName: "Aurelia",
  url: "https://aurelia-access.lovable.app",
  logo: "https://aurelia-access.lovable.app/logos/aurelia-logo-light.svg",
  sameAs: [
    "https://www.linkedin.com/company/aurelia-concierge",
    "https://www.instagram.com/aurelia.concierge",
    "https://twitter.com/AureliaConcierge",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+44-7309-935106",
    contactType: "customer service",
    email: "concierge@aurelia-privateconcierge.com",
    areaServed: ["GB", "EU", "US", "AE", "SG"],
    availableLanguage: ["English", "French", "German", "Arabic", "Mandarin"],
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "GB",
  },
};

// Local Business schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Aurelia Private Concierge",
  description:
    "Ultra-premium private concierge and lifestyle management services",
  url: "https://aurelia-access.lovable.app",
  telephone: "+44-7309-935106",
  email: "concierge@aurelia-privateconcierge.com",
  priceRange: "$$$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "United Kingdom",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
};

export default GlobalSEO;
