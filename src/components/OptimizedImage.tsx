import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * Generates Unsplash srcset for responsive images
 * Uses Unsplash's URL API to request optimized image sizes
 */
const generateUnsplashSrcSet = (baseUrl: string): string => {
  // Check if it's an Unsplash URL
  if (!baseUrl.includes("unsplash.com")) {
    return "";
  }

  // Remove existing width parameter and get base URL
  const urlWithoutWidth = baseUrl.replace(/&?w=\d+/, "").replace(/\?w=\d+&?/, "?");
  const cleanUrl = urlWithoutWidth.replace(/\?$/, "");
  const separator = cleanUrl.includes("?") ? "&" : "?";

  // Generate srcset for common breakpoints
  const widths = [320, 480, 640, 768, 1024, 1280, 1536];
  
  return widths
    .map((w) => `${cleanUrl}${separator}w=${w}&auto=format&fit=crop&q=75 ${w}w`)
    .join(", ");
};

/**
 * Gets optimized default src (medium size)
 */
const getOptimizedSrc = (baseUrl: string, defaultWidth = 640): string => {
  if (!baseUrl.includes("unsplash.com")) {
    return baseUrl;
  }

  const urlWithoutWidth = baseUrl.replace(/&?w=\d+/, "").replace(/\?w=\d+&?/, "?");
  const cleanUrl = urlWithoutWidth.replace(/\?$/, "");
  const separator = cleanUrl.includes("?") ? "&" : "?";

  return `${cleanUrl}${separator}w=${defaultWidth}&auto=format&fit=crop&q=75`;
};

const OptimizedImage = ({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  fetchPriority = "auto",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const srcSet = generateUnsplashSrcSet(src);
  const optimizedSrc = getOptimizedSrc(src);

  return (
    <img
      src={hasError ? src : optimizedSrc}
      srcSet={hasError ? undefined : srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
};

export default OptimizedImage;
export { generateUnsplashSrcSet, getOptimizedSrc };
