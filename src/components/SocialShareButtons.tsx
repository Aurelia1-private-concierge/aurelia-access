import { motion } from "framer-motion";
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link2, 
  Mail,
  MessageCircle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  variant?: "default" | "compact" | "floating";
  className?: string;
}

const SocialShareButtons = ({
  url,
  title,
  description = "",
  hashtags = ["AureliaPrivateConcierge", "LuxuryLifestyle"],
  variant = "default",
  className = ""
}: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => `#${tag}`).join(" ");

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(",")}`,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30"
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "The link has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const handleShare = (shareUrl: string, name: string) => {
    window.open(shareUrl, `share-${name}`, "width=600,height=400,menubar=no,toolbar=no");
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {shareLinks.slice(0, 4).map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.name}
              variant="ghost"
              size="icon"
              className={`w-8 h-8 rounded-full ${link.color}`}
              onClick={() => handleShare(link.url, link.name)}
              aria-label={`Share on ${link.name}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-muted"
          onClick={copyToClipboard}
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 ${className}`}
      >
        {shareLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                size="icon"
                className={`w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm ${link.color}`}
                onClick={() => handleShare(link.url, link.name)}
                aria-label={`Share on ${link.name}`}
              >
                <Icon className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: shareLinks.length * 0.1 }}
        >
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted"
            onClick={copyToClipboard}
            aria-label="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      {shareLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              className={`gap-2 ${link.color}`}
              onClick={() => handleShare(link.url, link.name)}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Button>
          </motion.div>
        );
      })}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shareLinks.length * 0.05 }}
      >
        <Button
          variant="outline"
          className="gap-2 hover:bg-muted"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Copy Link
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default SocialShareButtons;
