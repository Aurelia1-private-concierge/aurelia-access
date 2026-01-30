import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { SITE_CONFIG } from "@/lib/site-config";

const TriptychSEO = () => {
  const siteUrl = SITE_CONFIG.productionDomain;

  useEffect(() => {
    // Remove any existing TRIPTYCH schema
    const existingScript = document.querySelector('script[data-triptych-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create comprehensive JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        // Event Schema
        {
          "@type": "Event",
          "@id": `${siteUrl}/experiences/triptych#event`,
          "name": "TRIPTYCH: A Restricted Cultural Immersion",
          "description": "An unprecedented symphonic encounter, high-level Brazilian gastronomy, and forms of access that are never publicly announced. A composed passage where time, sound, territory, aesthetics, and human presence are treated as living material.",
          "startDate": "2025-06-19",
          "endDate": "2025-06-24",
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {
            "@type": "Place",
            "name": "Rio de Janeiro",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Rio de Janeiro",
              "addressCountry": "BR"
            }
          },
          "organizer": {
            "@type": "Organization",
            "name": "Journeys Beyond Limits",
            "url": siteUrl
          },
          "performer": {
            "@type": "Organization",
            "name": "Beyond Privé Brasilis"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "EXIMIUS - Essential Immersion",
              "price": "206000",
              "priceCurrency": "USD",
              "availability": "https://schema.org/LimitedAvailability",
              "validFrom": "2025-01-01",
              "validThrough": "2025-04-30",
              "url": `${siteUrl}/experiences/triptych#inquiry`
            },
            {
              "@type": "Offer",
              "name": "SINGULARIS - Cultural Depth",
              "price": "274000",
              "priceCurrency": "USD",
              "availability": "https://schema.org/LimitedAvailability",
              "validFrom": "2025-01-01",
              "validThrough": "2025-04-30",
              "url": `${siteUrl}/experiences/triptych#inquiry`
            },
            {
              "@type": "Offer",
              "name": "EGREGIUS - Elevated Access",
              "price": "342000",
              "priceCurrency": "USD",
              "availability": "https://schema.org/LimitedAvailability",
              "validFrom": "2025-01-01",
              "validThrough": "2025-04-30",
              "url": `${siteUrl}/experiences/triptych#inquiry`
            },
            {
              "@type": "Offer",
              "name": "UNUM - Founding Circle",
              "price": "456000",
              "priceCurrency": "USD",
              "availability": "https://schema.org/LimitedAvailability",
              "validFrom": "2025-01-01",
              "validThrough": "2025-04-30",
              "url": `${siteUrl}/experiences/triptych#inquiry`
            }
          ],
          "image": `${siteUrl}/og-image.png`,
          "maximumAttendeeCapacity": 200
        },
        // Product Schema for the experience
        {
          "@type": "Product",
          "@id": `${siteUrl}/experiences/triptych#product`,
          "name": "TRIPTYCH Cultural Immersion Experience",
          "description": "A restricted cultural immersion in Rio de Janeiro featuring an unprecedented symphonic encounter, high-level Brazilian gastronomy, and exclusive access to Brazil's cultural heart.",
          "brand": {
            "@type": "Brand",
            "name": "Beyond Privé Brasilis"
          },
          "category": "Luxury Experience",
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "206000",
            "highPrice": "456000",
            "priceCurrency": "USD",
            "offerCount": 4,
            "availability": "https://schema.org/LimitedAvailability"
          },
          "audience": {
            "@type": "Audience",
            "audienceType": "UHNW Individuals, Cultural Patrons, Luxury Travelers"
          }
        },
        // FAQ Schema
        {
          "@type": "FAQPage",
          "@id": `${siteUrl}/experiences/triptych#faq`,
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is TRIPTYCH?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "TRIPTYCH is a restricted cultural immersion in Rio de Janeiro (June 19-24, 2025) featuring an unprecedented symphonic encounter, high-level Brazilian gastronomy, and forms of access never publicly announced. It is the inaugural moment of Beyond Privé Brasilis."
              }
            },
            {
              "@type": "Question",
              "name": "How many guests can attend TRIPTYCH?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Maximum 200 guests total, with 50 positions available per access category (EXIMIUS, SINGULARIS, EGREGIUS, and UNUM)."
              }
            },
            {
              "@type": "Question",
              "name": "What are the access categories and pricing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Four categories are available: EXIMIUS ($206,000) for essential immersion, SINGULARIS ($274,000) for cultural depth, EGREGIUS ($342,000) for elevated access, and UNUM ($456,000) for the founding circle with complete immersion."
              }
            },
            {
              "@type": "Question",
              "name": "When is the application deadline?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Applications close on April 30, 2025. Early application is encouraged due to limited availability."
              }
            }
          ]
        },
        // BreadcrumbList
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Experiences",
              "item": `${siteUrl}/experiences`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "TRIPTYCH",
              "item": `${siteUrl}/experiences/triptych`
            }
          ]
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-triptych-schema", "true");
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-triptych-schema]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [siteUrl]);

  return (
    <SEOHead
      title="TRIPTYCH | A Restricted Cultural Immersion | Rio de Janeiro June 2025"
      description="Experience an unprecedented symphonic encounter, high-level Brazilian gastronomy, and exclusive cultural access in Rio de Janeiro. June 19-24, 2025. By invitation only. Applications close April 30."
      type="product"
    />
  );
};

export default TriptychSEO;
