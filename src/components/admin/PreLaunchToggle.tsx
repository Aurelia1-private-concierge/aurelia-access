import { useState } from "react";
import { motion } from "framer-motion";
import { Construction, Globe, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePreLaunchMode } from "@/hooks/usePreLaunchMode";
import { toast } from "@/hooks/use-toast";

const PreLaunchToggle = () => {
  const { isPreLaunch, loading, togglePreLaunchMode } = usePreLaunchMode();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    setToggling(true);
    const result = await togglePreLaunchMode(enabled);
    setToggling(false);

    if (result.success) {
      toast({
        title: enabled ? "Pre-Launch Mode Enabled" : "Site Now Live",
        description: enabled
          ? "Visitors will see the Under Construction page."
          : "All visitors can now access the full site.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update pre-launch mode.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`border-border/50 transition-colors ${isPreLaunch ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPreLaunch ? (
                <Construction className="h-5 w-5 text-amber-500" />
              ) : (
                <Globe className="h-5 w-5 text-green-500" />
              )}
              <div>
                <CardTitle className="text-lg">Pre-Launch Mode</CardTitle>
                <CardDescription>
                  Control visitor access to the site
                </CardDescription>
              </div>
            </div>
            <Badge variant={isPreLaunch ? "secondary" : "default"}>
              {isPreLaunch ? "Under Construction" : "Live"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                {isPreLaunch
                  ? "Visitors see the Under Construction page"
                  : "All pages are accessible to visitors"}
              </p>
              <p className="text-xs text-muted-foreground">
                Admins always have full access
              </p>
            </div>
            <Switch
              checked={isPreLaunch ?? false}
              onCheckedChange={handleToggle}
              disabled={toggling}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PreLaunchToggle;
