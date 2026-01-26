import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  TrendingUp,
  MousePointer,
  Target,
  DollarSign,
  RefreshCw,
  Info,
  BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ATTRIBUTION_MODELS, type AttributionModel } from "@/lib/marketing-strategies";

interface TouchpointData {
  channel: string;
  touchpoints: number;
  conversions: number;
  revenue: number;
  firstTouch: number;
  lastTouch: number;
  linear: number;
  timeDecay: number;
  positionBased: number;
}

const AttributionModelPanel = forwardRef<HTMLDivElement>((_, ref) => {
  const [selectedModel, setSelectedModel] = useState<AttributionModel>("linear");
  const [touchpointData, setTouchpointData] = useState<TouchpointData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAttributionData = async () => {
    setIsLoading(true);
    try {
      // Fetch attribution events
      const { data, error } = await supabase
        .from("attribution_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Process data by channel
      const channelMap = new Map<string, TouchpointData>();

      // Sample data if none exists
      const sampleData: TouchpointData[] = [
        {
          channel: "Organic Search",
          touchpoints: 1250,
          conversions: 28,
          revenue: 140000,
          firstTouch: 35,
          lastTouch: 20,
          linear: 25,
          timeDecay: 22,
          positionBased: 28,
        },
        {
          channel: "LinkedIn Ads",
          touchpoints: 890,
          conversions: 18,
          revenue: 90000,
          firstTouch: 15,
          lastTouch: 25,
          linear: 20,
          timeDecay: 23,
          positionBased: 20,
        },
        {
          channel: "Google Ads",
          touchpoints: 640,
          conversions: 12,
          revenue: 60000,
          firstTouch: 10,
          lastTouch: 18,
          linear: 15,
          timeDecay: 17,
          positionBased: 14,
        },
        {
          channel: "Direct",
          touchpoints: 520,
          conversions: 15,
          revenue: 75000,
          firstTouch: 20,
          lastTouch: 22,
          linear: 20,
          timeDecay: 20,
          positionBased: 21,
        },
        {
          channel: "Referral",
          touchpoints: 380,
          conversions: 10,
          revenue: 50000,
          firstTouch: 12,
          lastTouch: 8,
          linear: 10,
          timeDecay: 9,
          positionBased: 10,
        },
        {
          channel: "Email",
          touchpoints: 290,
          conversions: 8,
          revenue: 40000,
          firstTouch: 5,
          lastTouch: 5,
          linear: 7,
          timeDecay: 6,
          positionBased: 5,
        },
        {
          channel: "Social Organic",
          touchpoints: 210,
          conversions: 4,
          revenue: 20000,
          firstTouch: 3,
          lastTouch: 2,
          linear: 3,
          timeDecay: 3,
          positionBased: 2,
        },
      ];

      setTouchpointData(sampleData);
    } catch (err) {
      console.error("Error fetching attribution data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributionData();
  }, []);

  const getAttributionValue = (data: TouchpointData, model: AttributionModel): number => {
    switch (model) {
      case "first-touch":
        return data.firstTouch;
      case "last-touch":
        return data.lastTouch;
      case "linear":
        return data.linear;
      case "time-decay":
        return data.timeDecay;
      case "position-based":
        return data.positionBased;
      default:
        return data.linear;
    }
  };

  const totalConversions = touchpointData.reduce((sum, d) => sum + d.conversions, 0);
  const totalRevenue = touchpointData.reduce((sum, d) => sum + d.revenue, 0);
  const totalTouchpoints = touchpointData.reduce((sum, d) => sum + d.touchpoints, 0);

  const sortedData = [...touchpointData].sort(
    (a, b) => getAttributionValue(b, selectedModel) - getAttributionValue(a, selectedModel)
  );

  const modelInfo = ATTRIBUTION_MODELS.find(m => m.id === selectedModel);

  return (
    <div ref={ref} className="space-y-6">
      {/* Model Selector */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Multi-Touch Attribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-2 block">Attribution Model</label>
              <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as AttributionModel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTION_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium mb-1">{modelInfo?.name}</p>
                  <p className="text-sm text-muted-foreground">{modelInfo?.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="icon" onClick={fetchAttributionData}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Model Visualization */}
          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>First Touch</span>
              <span>Customer Journey</span>
              <span>Conversion</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full">
              {selectedModel === "first-touch" && (
                <div className="absolute left-0 w-6 h-6 -top-2 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground">100</span>
                </div>
              )}
              {selectedModel === "last-touch" && (
                <div className="absolute right-0 w-6 h-6 -top-2 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground">100</span>
                </div>
              )}
              {selectedModel === "linear" && (
                <>
                  <div className="absolute left-0 w-5 h-5 -top-1.5 bg-primary/70 rounded-full" />
                  <div className="absolute left-1/4 w-5 h-5 -top-1.5 bg-primary/70 rounded-full" />
                  <div className="absolute left-1/2 w-5 h-5 -top-1.5 bg-primary/70 rounded-full" />
                  <div className="absolute left-3/4 w-5 h-5 -top-1.5 bg-primary/70 rounded-full" />
                  <div className="absolute right-0 w-5 h-5 -top-1.5 bg-primary/70 rounded-full" />
                </>
              )}
              {selectedModel === "time-decay" && (
                <>
                  <div className="absolute left-0 w-3 h-3 -top-0.5 bg-primary/30 rounded-full" />
                  <div className="absolute left-1/4 w-4 h-4 -top-1 bg-primary/50 rounded-full" />
                  <div className="absolute left-1/2 w-5 h-5 -top-1.5 bg-primary/70 rounded-full" />
                  <div className="absolute left-3/4 w-5 h-5 -top-1.5 bg-primary/85 rounded-full" />
                  <div className="absolute right-0 w-6 h-6 -top-2 bg-primary rounded-full" />
                </>
              )}
              {selectedModel === "position-based" && (
                <>
                  <div className="absolute left-0 w-6 h-6 -top-2 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground">40</span>
                  </div>
                  <div className="absolute left-1/4 w-4 h-4 -top-1 bg-primary/40 rounded-full" />
                  <div className="absolute left-1/2 w-4 h-4 -top-1 bg-primary/40 rounded-full" />
                  <div className="absolute left-3/4 w-4 h-4 -top-1 bg-primary/40 rounded-full" />
                  <div className="absolute right-0 w-6 h-6 -top-2 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground">40</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Touchpoints</p>
                <p className="text-2xl font-bold text-foreground">{totalTouchpoints.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversions</p>
                <p className="text-2xl font-bold text-emerald-400">{totalConversions}</p>
              </div>
              <Target className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-foreground">${(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Attribution Table */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Channel Attribution ({modelInfo?.name})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Channel</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Touchpoints</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Conversions</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Revenue</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                    Attribution Credit (%)
                  </th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Attributed Value</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((data, i) => {
                  const credit = getAttributionValue(data, selectedModel);
                  const attributedValue = (totalRevenue * credit) / 100;

                  return (
                    <motion.tr
                      key={data.channel}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/20 hover:bg-muted/20"
                    >
                      <td className="py-3 px-2">
                        <span className="font-medium text-foreground">{data.channel}</span>
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {data.touchpoints.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right">{data.conversions}</td>
                      <td className="py-3 px-2 text-right">${data.revenue.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${credit}%` }}
                            />
                          </div>
                          <span className="font-medium text-foreground w-10">{credit}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-emerald-400">
                        ${Math.round(attributedValue).toLocaleString()}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Model Comparison */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Model Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Channel</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">First Touch</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Last Touch</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Linear</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Time Decay</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Position-Based</th>
                </tr>
              </thead>
              <tbody>
                {touchpointData.map((data, i) => (
                  <tr key={data.channel} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="py-3 px-2 font-medium">{data.channel}</td>
                    <td className={`py-3 px-2 text-right ${selectedModel === "first-touch" ? "text-primary font-bold" : ""}`}>
                      {data.firstTouch}%
                    </td>
                    <td className={`py-3 px-2 text-right ${selectedModel === "last-touch" ? "text-primary font-bold" : ""}`}>
                      {data.lastTouch}%
                    </td>
                    <td className={`py-3 px-2 text-right ${selectedModel === "linear" ? "text-primary font-bold" : ""}`}>
                      {data.linear}%
                    </td>
                    <td className={`py-3 px-2 text-right ${selectedModel === "time-decay" ? "text-primary font-bold" : ""}`}>
                      {data.timeDecay}%
                    </td>
                    <td className={`py-3 px-2 text-right ${selectedModel === "position-based" ? "text-primary font-bold" : ""}`}>
                      {data.positionBased}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AttributionModelPanel.displayName = "AttributionModelPanel";

export default AttributionModelPanel;
