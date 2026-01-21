import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "default" | "wide" | "minimal" | "ornate";
  className?: string;
}

const SectionDivider = forwardRef<HTMLDivElement, SectionDividerProps>(
  ({ variant = "default", className }, ref) => {
    if (variant === "minimal") {
      return (
        <div ref={ref} className={cn("py-8", className)}>
          <div className="h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
        </div>
      );
    }

    if (variant === "wide") {
      return (
        <div ref={ref} className={cn("py-12", className)}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
          </div>
        </div>
      );
    }

    if (variant === "ornate") {
      return (
        <div ref={ref} className={cn("py-16 flex items-center justify-center", className)}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-border/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-border/30" />
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("py-10", className)}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
        </div>
      </div>
    );
  }
);

SectionDivider.displayName = "SectionDivider";

export default SectionDivider;
