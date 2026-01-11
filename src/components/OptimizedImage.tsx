import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Width for blur placeholder generation (default: 20) */
  blurWidth?: number;
  /** Enable blur-up effect placeholder */
  enableBlur?: boolean;
}

/**
 * Generates Unsplash srcset for responsive images with WebP auto-format
 * Uses Unsplash's URL API to request optimized image sizes
 */
const generateUnsplashSrcSet = (baseUrl: string): string => {
  if (!baseUrl.includes("unsplash.com")) {
    return "";
  }

  const cleanUrl = getCleanUrl(baseUrl);
  const separator = cleanUrl.includes("?") ? "&" : "?";
  const widths = [320, 480, 640, 768, 1024, 1280, 1536, 1920];
  
  return widths
    .map((w) => `${cleanUrl}${separator}w=${w}&fm=webp&auto=format&fit=crop&q=80 ${w}w`)
    .join(", ");
};

/**
 * Gets optimized default src with WebP format
 */
const getOptimizedSrc = (baseUrl: string, defaultWidth = 640): string => {
  if (!baseUrl.includes("unsplash.com")) {
    return baseUrl;
  }

  const cleanUrl = getCleanUrl(baseUrl);
  const separator = cleanUrl.includes("?") ? "&" : "?";
  
  return `${cleanUrl}${separator}w=${defaultWidth}&fm=webp&auto=format&fit=crop&q=80`;
};

/**
 * Gets a tiny blur placeholder URL (LQIP - Low Quality Image Placeholder)
 */
const getBlurPlaceholder = (baseUrl: string, width = 20): string => {
  if (!baseUrl.includes("unsplash.com")) {
    return "";
  }

  const cleanUrl = getCleanUrl(baseUrl);
  const separator = cleanUrl.includes("?") ? "&" : "?";
  
  // Tiny image with heavy blur for placeholder
  return `${cleanUrl}${separator}w=${width}&blur=50&fm=webp&q=30`;
};

/**
 * Cleans URL by removing existing width/format parameters
 */
const getCleanUrl = (baseUrl: string): string => {
  const urlWithoutParams = baseUrl
    .replace(/&?w=\d+/, "")
    .replace(/\?w=\d+&?/, "?")
    .replace(/&?fm=\w+/, "")
    .replace(/&?blur=\d+/, "")
    .replace(/&?q=\d+/, "");
  return urlWithoutParams.replace(/\?$/, "").replace(/&$/, "");
};

const OptimizedImage = ({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  fetchPriority = "auto",
  blurWidth = 20,
  enableBlur = true,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);

  const srcSet = generateUnsplashSrcSet(src);
  const optimizedSrc = getOptimizedSrc(src);
  const blurSrc = getBlurPlaceholder(src, blurWidth);

  // Generate blur data URL for placeholder
  useEffect(() => {
    if (!enableBlur || !blurSrc || hasError) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setBlurDataUrl(canvas.toDataURL("image/webp", 0.3));
        }
      } catch {
        // CORS or canvas error, skip blur
      }
    };
    img.onerror = () => {
      // Blur placeholder failed, continue without it
    };
    img.src = blurSrc;
  }, [blurSrc, enableBlur, hasError]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {enableBlur && blurDataUrl && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 transform"
        />
      )}
      
      {/* Main image */}
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
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export default OptimizedImage;
export { generateUnsplashSrcSet, getOptimizedSrc, getBlurPlaceholder, getCleanUrl };
