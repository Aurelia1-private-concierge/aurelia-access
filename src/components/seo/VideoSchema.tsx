import { useEffect } from "react";
import { VideoMetadata, generateVideoSchema } from "@/lib/video-seo-schema";

interface VideoSchemaProps {
  video: VideoMetadata;
  pageUrl?: string;
}

const VideoSchema = ({ video, pageUrl }: VideoSchemaProps) => {
  useEffect(() => {
    // Remove any existing video schema for this video
    const existingScript = document.querySelector(`script[data-video-schema="${video.id}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const currentUrl = pageUrl || `https://aurelia-privateconcierge.com${window.location.pathname}`;
    const schema = generateVideoSchema(video, currentUrl);

    // Create and inject script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-video-schema", video.id);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [video, pageUrl]);

  return null;
};

export default VideoSchema;
