import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Share2, 
  Copy, 
  Check, 
  Mail, 
  MessageCircle,
  Linkedin,
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SocialShareButtonsProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: "horizontal" | "vertical" | "compact";
}

const SocialShareButtons = ({
  url,
  title = "Join Aurelia Private Concierge",
  description = "You've been invited to the world's most exclusive private concierge service. Get priority access to luxury experiences.",
  className,
  variant = "horizontal"
}: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`,
      color: "hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30",
      bgColor: "bg-emerald-500"
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: "hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30",
      bgColor: "bg-blue-500"
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30",
      bgColor: "bg-sky-500"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/30",
      bgColor: "bg-blue-600"
    }
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Referral link copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to Copy",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {shareLinks.map((link) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-10 h-10 rounded-full border border-border/50 flex items-center justify-center",
              "text-muted-foreground transition-all duration-200",
              link.color
            )}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-4 h-4" />
          </motion.a>
        ))}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-10 h-10 rounded-full border border-border/50 flex items-center justify-center",
            "text-muted-foreground transition-all duration-200",
            "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          )}
          title="Copy link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </motion.button>
      </div>
    );
  }

  return (
    <div className={cn(
      variant === "vertical" ? "space-y-3" : "space-y-4",
      className
    )}>
      {/* Native Share (mobile) */}
      <Button
        onClick={handleNativeShare}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Invitation
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground tracking-widest">
            Or share via
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className={cn(
        "grid gap-3",
        variant === "vertical" ? "grid-cols-1" : "grid-cols-2"
      )}>
        {shareLinks.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border border-border/30",
              "bg-card/30 backdrop-blur-sm transition-all duration-200",
              link.color
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              link.bgColor
            )}>
              <link.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {link.name}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Copy Link */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2.5 bg-muted/30 rounded-lg border border-border/30">
          <p className="text-sm text-muted-foreground truncate font-mono">
            {url}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SocialShareButtons;
