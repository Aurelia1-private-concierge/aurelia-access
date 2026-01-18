import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "avatar" | "card" | "button" | "custom";
  animate?: boolean;
}

export const LoadingSkeleton = ({
  className,
  variant = "text",
  animate = true,
}: LoadingSkeletonProps) => {
  const variants = {
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full",
    card: "h-48 w-full rounded-xl",
    button: "h-10 w-24 rounded",
    custom: "",
  };

  return (
    <div
      className={cn(
        "bg-secondary/50 relative overflow-hidden",
        animate && "animate-pulse",
        variants[variant],
        className
      )}
    >
      {animate && (
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.05), transparent)",
          }}
        />
      )}
    </div>
  );
};

// Preset skeleton layouts
export const CardSkeleton = () => (
  <div className="p-6 rounded-xl border border-border/20 bg-card space-y-4">
    <LoadingSkeleton variant="avatar" />
    <LoadingSkeleton variant="text" className="w-3/4" />
    <LoadingSkeleton variant="text" className="w-1/2" />
    <div className="pt-4 flex gap-2">
      <LoadingSkeleton variant="button" />
      <LoadingSkeleton variant="button" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <LoadingSkeleton variant="avatar" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
