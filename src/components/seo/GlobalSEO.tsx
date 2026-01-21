import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/site-config";

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
  title: `${SITE_CONFIG.brand.name} | ${SITE_CONFIG.brand.tagline}`,
  description: SITE_CONFIG.seo.defaultDescription,
  keywords: SITE_CONFIG.seo.defaultKeywords,
  ogImage: SITE_CONFIG.seo.defaultImage,
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
    ? `${title} | ${SITE_CONFIG.brand.name}`
    : defaultMeta.title;

  const baseUrl = SITE_CONFIG.getBaseUrl();
  const fullCanonical = canonicalUrl
    ? SITE_CONFIG.getCanonicalUrl(canonicalUrl)
    : undefined;
  const fullOgImage = SITE_CONFIG.getAssetUrl(ogImage);

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
      <meta property="og:site_name" content={SITE_CONFIG.brand.name} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Additional SEO */}
      <meta name="author" content={SITE_CONFIG.brand.company} />
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
  name: SITE_CONFIG.brand.name,
  alternateName: SITE_CONFIG.brand.shortName,
  url: SITE_CONFIG.productionDomain,
  logo: `${SITE_CONFIG.productionDomain}/logos/aurelia-logo-light.svg`,
  sameAs: [
    SITE_CONFIG.social.linkedin,
    SITE_CONFIG.social.instagram,
    SITE_CONFIG.social.twitter,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SITE_CONFIG.contact.phone,
    contactType: "customer service",
    email: SITE_CONFIG.contact.email,
    areaServed: SITE_CONFIG.serviceAreas,
    availableLanguage: SITE_CONFIG.supportedLanguages.slice(0, 5),
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE_CONFIG.location.city,
    addressCountry: SITE_CONFIG.location.countryCode,
  },
};

// Local Business schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_CONFIG.brand.name,
  description: `Ultra-premium private concierge and lifestyle management services`,
  url: SITE_CONFIG.productionDomain,
  telephone: SITE_CONFIG.contact.phone,
  email: SITE_CONFIG.contact.email,
  priceRange: "$$$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE_CONFIG.location.city,
    addressCountry: SITE_CONFIG.location.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE_CONFIG.location.coordinates.latitude,
    longitude: SITE_CONFIG.location.coordinates.longitude,
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
