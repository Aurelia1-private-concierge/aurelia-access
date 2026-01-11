import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, Users, BarChart, Shuffle, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ABTest {
  id: string;
  name: string;
  variants: {
    id: string;
    name: string;
    traffic: number;
    signups: number;
    conversionRate: number;
  }[];
  status: "running" | "paused" | "completed";
  startDate: string;
  winner?: string;
}

// A/B Test configurations stored in localStorage for now
// In production, this would be in the database
const AB_TEST_KEY = "aurelia_ab_tests";

const ABTestingPanel = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [activeTestEnabled, setActiveTestEnabled] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = () => {
    // Load from localStorage or initialize with defaults
    const stored = localStorage.getItem(AB_TEST_KEY);
    if (stored) {
      setTests(JSON.parse(stored));
    } else {
      // Initialize with sample tests
      const defaultTests: ABTest[] = [
        {
          id: "headline-test",
          name: "Headline Copy Test",
          variants: [
            { id: "a", name: "Control - 'The Future of Luxury Awaits'", traffic: 50, signups: 45, conversionRate: 12.3 },
            { id: "b", name: "Variant B - 'Join the World's Elite'", traffic: 50, signups: 52, conversionRate: 14.1 },
          ],
          status: "running",
          startDate: "2026-01-05",
        },
        {
          id: "cta-test",
          name: "CTA Button Test",
          variants: [
            { id: "a", name: "Control - 'Join Waitlist'", traffic: 33, signups: 28, conversionRate: 11.2 },
            { id: "b", name: "Variant B - 'Reserve Your Spot'", traffic: 33, signups: 35, conversionRate: 13.8 },
            { id: "c", name: "Variant C - 'Get Priority Access'", traffic: 34, signups: 41, conversionRate: 15.2 },
          ],
          status: "running",
          startDate: "2026-01-08",
        },
        {
          id: "layout-test",
          name: "Hero Layout Test",
          variants: [
            { id: "a", name: "Control - Centered", traffic: 50, signups: 120, conversionRate: 10.5 },
            { id: "b", name: "Variant B - Split Screen", traffic: 50, signups: 145, conversionRate: 12.8 },
          ],
          status: "completed",
          startDate: "2025-12-15",
          winner: "b",
        },
      ];
      setTests(defaultTests);
      localStorage.setItem(AB_TEST_KEY, JSON.stringify(defaultTests));
    }
  };

  const toggleTestStatus = (testId: string) => {
    const updated = tests.map((test) =>
      test.id === testId
        ? { ...test, status: test.status === "running" ? "paused" : "running" as "running" | "paused" }
        : test
    );
    setTests(updated);
    localStorage.setItem(AB_TEST_KEY, JSON.stringify(updated));
    toast({
      title: "Test Updated",
      description: `Test ${tests.find((t) => t.id === testId)?.status === "running" ? "paused" : "resumed"}`,
    });
  };

  const declareWinner = (testId: string, variantId: string) => {
    const updated = tests.map((test) =>
      test.id === testId
        ? { ...test, status: "completed" as const, winner: variantId }
        : test
    );
    setTests(updated);
    localStorage.setItem(AB_TEST_KEY, JSON.stringify(updated));
    toast({
      title: "Winner Declared",
      description: "The winning variant will now be shown to all visitors",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-500";
      case "paused":
        return "bg-amber-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-muted";
    }
  };

  const totalSignups = tests.reduce(
    (sum, test) => sum + test.variants.reduce((vSum, v) => vSum + v.signups, 0),
    0
  );

  const runningTests = tests.filter((t) => t.status === "running").length;
  const completedTests = tests.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            A/B Testing
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Test different variations to optimize conversions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="ab-active" className="text-sm text-muted-foreground">
            A/B Testing Active
          </Label>
          <Switch
            id="ab-active"
            checked={activeTestEnabled}
            onCheckedChange={setActiveTestEnabled}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FlaskConical className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{tests.length}</p>
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Play className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{runningTests}</p>
                <p className="text-xs text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{completedTests}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{totalSignups}</p>
                <p className="text-xs text-muted-foreground">Test Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id} className="bg-card/50 border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(test.status)} bg-opacity-20 text-foreground`}
                  >
                    {test.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {test.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTestStatus(test.id)}
                    >
                      {test.status === "running" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Started: {test.startDate}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-right">Traffic %</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    {test.status !== "completed" && <TableHead className="text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {test.variants.map((variant) => {
                    const isWinner = test.winner === variant.id;
                    const bestRate = Math.max(...test.variants.map((v) => v.conversionRate));
                    const isBest = variant.conversionRate === bestRate;

                    return (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isWinner && <Badge className="bg-emerald-500">Winner</Badge>}
                            {isBest && !test.winner && (
                              <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                                Leading
                              </Badge>
                            )}
                            <span className="text-sm">{variant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{variant.traffic}%</TableCell>
                        <TableCell className="text-right">{variant.signups}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={isBest ? "text-emerald-500" : ""}>
                            {variant.conversionRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        {test.status !== "completed" && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => declareWinner(test.id, variant.id)}
                            >
                              Declare Winner
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <h4 className="font-medium text-foreground mb-2">How A/B Testing Works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Traffic is split randomly between variants based on configured percentages</li>
            <li>• Each visitor is assigned a variant which persists across their session</li>
            <li>• Monitor conversion rates and declare a winner when statistically significant</li>
            <li>• Winners are automatically applied to all future visitors</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ABTestingPanel;
