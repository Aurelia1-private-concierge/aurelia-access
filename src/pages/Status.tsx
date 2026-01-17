import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Server,
  Database,
  Shield,
  Globe,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down" | "checking";
  latency?: number;
  icon: React.ReactNode;
}

const Status = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Frontend Application", status: "checking", icon: <Globe className="w-5 h-5" /> },
    { name: "Database", status: "checking", icon: <Database className="w-5 h-5" /> },
    { name: "Authentication", status: "checking", icon: <Shield className="w-5 h-5" /> },
    { name: "Edge Functions", status: "checking", icon: <Zap className="w-5 h-5" /> },
    { name: "API Gateway", status: "checking", icon: <Server className="w-5 h-5" /> },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServices = async () => {
    setIsRefreshing(true);
    const newServices: ServiceStatus[] = [];

    // Check Frontend
    newServices.push({
      name: "Frontend Application",
      status: "operational",
      latency: Math.round(performance.now()),
      icon: <Globe className="w-5 h-5" />,
    });

    // Check Database
    try {
      const start = performance.now();
      const { error } = await supabase.from("app_settings").select("id").limit(1);
      const latency = Math.round(performance.now() - start);
      newServices.push({
        name: "Database",
        status: error ? "degraded" : "operational",
        latency,
        icon: <Database className="w-5 h-5" />,
      });
    } catch {
      newServices.push({
        name: "Database",
        status: "down",
        icon: <Database className="w-5 h-5" />,
      });
    }

    // Check Authentication
    try {
      const start = performance.now();
      const { error } = await supabase.auth.getSession();
      const latency = Math.round(performance.now() - start);
      newServices.push({
        name: "Authentication",
        status: error ? "degraded" : "operational",
        latency,
        icon: <Shield className="w-5 h-5" />,
      });
    } catch {
      newServices.push({
        name: "Authentication",
        status: "down",
        icon: <Shield className="w-5 h-5" />,
      });
    }

    // Check Edge Functions
    try {
      const start = performance.now();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather-service`,
        {
          method: "OPTIONS",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const latency = Math.round(performance.now() - start);
      newServices.push({
        name: "Edge Functions",
        status: response.ok || response.status === 204 ? "operational" : "degraded",
        latency,
        icon: <Zap className="w-5 h-5" />,
      });
    } catch {
      newServices.push({
        name: "Edge Functions",
        status: "degraded",
        icon: <Zap className="w-5 h-5" />,
      });
    }

    // API Gateway (Supabase REST)
    try {
      const start = performance.now();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`,
        {
          method: "OPTIONS",
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const latency = Math.round(performance.now() - start);
      newServices.push({
        name: "API Gateway",
        status: response.ok || response.status === 200 ? "operational" : "degraded",
        latency,
        icon: <Server className="w-5 h-5" />,
      });
    } catch {
      newServices.push({
        name: "API Gateway",
        status: "degraded",
        icon: <Server className="w-5 h-5" />,
      });
    }

    setServices(newServices);
    setLastChecked(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "down":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />;
    }
  };

  const overallStatus = services.every((s) => s.status === "operational")
    ? "All Systems Operational"
    : services.some((s) => s.status === "down")
    ? "Partial Outage"
    : "Degraded Performance";

  const overallColor = services.every((s) => s.status === "operational")
    ? "text-green-500"
    : services.some((s) => s.status === "down")
    ? "text-red-500"
    : "text-yellow-500";

  return (
    <>
      <SEOHead
        title="System Status | Aurelia Private Concierge"
        description="Real-time status of Aurelia Private Concierge services and infrastructure."
      />
      
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              System Status
            </h1>
            <p className={`text-2xl font-medium ${overallColor}`}>
              {overallStatus}
            </p>
            {lastChecked && (
              <p className="text-sm text-muted-foreground mt-2">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </motion.div>

          <div className="space-y-4 mb-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-primary">{service.icon}</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {service.latency && (
                        <span className="text-sm text-muted-foreground">
                          {service.latency}ms
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        <span className={`text-sm capitalize ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={checkServices}
              disabled={isRefreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>

          <Card className="mt-12 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">About This Page</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
              <p>
                This page displays real-time status of Aurelia Private Concierge 
                infrastructure and services.
              </p>
              <p>
                For historical uptime data or incident reports, please contact 
                your dedicated concierge liaison.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Status;
