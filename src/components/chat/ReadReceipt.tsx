import React, { forwardRef } from "react";
import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";

interface ReadReceiptProps {
  isRead: boolean;
  readAt?: string | null;
  sentAt: string;
  variant?: "icon-only" | "with-time" | "detailed";
  className?: string;
}

const ReadReceipt = forwardRef<HTMLDivElement, ReadReceiptProps>(
  ({ isRead, readAt, sentAt, variant = "icon-only", className = "" }, ref) => {
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      if (isToday(date)) {
        return format(date, "h:mm a");
      }
      if (isYesterday(date)) {
        return `Yesterday ${format(date, "h:mm a")}`;
      }
      return format(date, "MMM d, h:mm a");
    };

    if (variant === "icon-only") {
      return (
        <div ref={ref} className={`flex items-center ${className}`}>
          {isRead ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </motion.div>
          ) : (
            <Check className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
        </div>
      );
    }

    if (variant === "with-time") {
      return (
        <div ref={ref} className={`flex items-center gap-1.5 text-xs ${className}`}>
          <span className="text-muted-foreground/60">{formatTime(sentAt)}</span>
          {isRead ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            </motion.div>
          ) : (
            <Check className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
        </div>
      );
    }

    // Detailed variant
    return (
      <div ref={ref} className={`flex flex-col items-end gap-0.5 ${className}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/60">
            Sent {formatTime(sentAt)}
          </span>
          {isRead ? (
            <CheckCheck className="h-3 w-3 text-primary" />
          ) : (
            <Check className="h-3 w-3 text-muted-foreground/60" />
          )}
        </div>
        {isRead && readAt && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-primary/70"
          >
            Read {formatTime(readAt)}
          </motion.span>
        )}
      </div>
    );
  }
);

ReadReceipt.displayName = "ReadReceipt";

export default ReadReceipt;
