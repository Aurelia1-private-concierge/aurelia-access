import { Toaster as Sonner, toast } from "sonner";
import { forwardRef } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = forwardRef<HTMLDivElement, ToasterProps>((props, _ref) => {
  // Use system preference for theme
  const prefersDark = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : true;
  const theme = prefersDark ? "dark" : "light";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
});

Toaster.displayName = "Toaster";

export { Toaster, toast };
