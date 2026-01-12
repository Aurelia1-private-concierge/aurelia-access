import { useEffect } from "react";

interface BlogArticleSchemaProps {
  title: string;
  description: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  modifiedAt?: string;
  image: string;
  category: string;
  tags: string[];
  url: string;
  readTime: number;
}

const BlogArticleSchema = ({
  title,
  description,
  author,
  authorRole,
  publishedAt,
  modifiedAt,
  image,
  category,
  tags,
  url,
  readTime
}: BlogArticleSchemaProps) => {
  useEffect(() => {
    // Remove any existing article schema
    const existingScript = document.querySelector('script[data-article-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": image.startsWith("http") ? image : `https://aurelia-privateconcierge.com${image}`,
      "author": {
        "@type": "Person",
        "name": author,
        "jobTitle": authorRole,
        "worksFor": {
          "@type": "Organization",
          "name": "Aurelia Private Concierge"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "Aurelia Private Concierge",
        "logo": {
          "@type": "ImageObject",
          "url": "https://aurelia-privateconcierge.com/logos/aurelia-logo-dark.svg"
        }
      },
      "datePublished": publishedAt,
      "dateModified": modifiedAt || publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "articleSection": category,
      "keywords": tags.join(", "),
      "wordCount": readTime * 200, // Approximate word count
      "timeRequired": `PT${readTime}M`,
      "isAccessibleForFree": true,
      "inLanguage": "en-US"
    };

    // Create and inject script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-article-schema", "true");
    script.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [title, description, author, authorRole, publishedAt, modifiedAt, image, category, tags, url, readTime]);

  return null;
};

export default BlogArticleSchema;
