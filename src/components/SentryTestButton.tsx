import { useState } from "react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/sentry";
import { Bug, CheckCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Temporary component to test Sentry error reporting.
 * Remove after confirming Sentry is working.
 */
const SentryTestButton = () => {
  const [sent, setSent] = useState(false);

  const triggerTestError = () => {
    try {
      // Intentionally throw an error to test Sentry
      throw new Error("Sentry Test Error - Please ignore this test event");
    } catch (error) {
      captureError(error as Error, {
        test: true,
        timestamp: new Date().toISOString(),
        source: "SentryTestButton",
      });
      setSent(true);
      toast.success("Test error sent to Sentry! Check your dashboard.");
    }
  };

  if (!import.meta.env.VITE_SENTRY_DSN) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
        ⚠️ Sentry DSN not configured. Republish required.
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={triggerTestError}
        variant={sent ? "outline" : "destructive"}
        size="sm"
        className="gap-2"
        disabled={sent}
      >
        {sent ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Test Sent
          </>
        ) : (
          <>
            <Bug className="h-4 w-4" />
            Test Sentry
          </>
        )}
      </Button>
    </div>
  );
};

export default SentryTestButton;
