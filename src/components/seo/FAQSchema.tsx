import { useEffect } from "react";
import { FAQ_ITEMS, FAQItem, generateFAQSchema, getPageFAQSchema } from "@/lib/seo-faq-schema";

interface FAQSchemaProps {
  pageType?: string;
  customFAQs?: FAQItem[];
}

const FAQSchema = ({ pageType, customFAQs }: FAQSchemaProps) => {
  useEffect(() => {
    // Remove any existing FAQ schema
    const existingScript = document.querySelector('script[data-faq-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    let schema;
    if (customFAQs) {
      schema = generateFAQSchema(customFAQs);
    } else if (pageType) {
      schema = getPageFAQSchema(pageType);
    } else {
      schema = generateFAQSchema(FAQ_ITEMS);
    }

    // Create and inject script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-faq-schema", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [pageType, customFAQs]);

  return null;
};

export default FAQSchema;
