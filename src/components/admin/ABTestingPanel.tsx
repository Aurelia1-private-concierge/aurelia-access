import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, Users, Play, Pause, Plus, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface ABTestVariant {
  id: string;
  test_id: string;
  name: string;
  traffic_percentage: number;
  impressions: number;
  conversions: number;
}

interface ABTest {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  winner_variant_id: string | null;
  created_at: string;
  variants?: ABTestVariant[];
}

const ABTestingPanel = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTestEnabled, setActiveTestEnabled] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestDescription, setNewTestDescription] = useState("");
  const [newVariants, setNewVariants] = useState([
    { name: "Control", traffic: 50 },
    { name: "Variant B", traffic: 50 },
  ]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      // Fetch tests
      const { data: testsData, error: testsError } = await supabase
        .from("ab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (testsError) throw testsError;

      // Fetch variants for each test
      const testsWithVariants = await Promise.all(
        (testsData || []).map(async (test) => {
          const { data: variants } = await supabase
            .from("ab_test_variants")
            .select("*")
            .eq("test_id", test.id);
          return { ...test, variants: variants || [] };
        })
      );

      setTests(testsWithVariants);
      setActiveTestEnabled(testsWithVariants.some((t) => t.status === "running"));
    } catch (error) {
      console.error("Error fetching A/B tests:", error);
      toast({
        title: "Error",
        description: "Failed to load A/B tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTest = async () => {
    if (!newTestName.trim()) {
      toast({ title: "Error", description: "Test name is required", variant: "destructive" });
      return;
    }

    try {
      // Create the test
      const { data: test, error: testError } = await supabase
        .from("ab_tests")
        .insert({
          name: newTestName,
          description: newTestDescription || null,
          status: "draft",
        })
        .select()
        .single();

      if (testError) throw testError;

      // Create variants
      const variantsToInsert = newVariants.map((v) => ({
        test_id: test.id,
        name: v.name,
        traffic_percentage: v.traffic,
      }));

      const { error: variantsError } = await supabase
        .from("ab_test_variants")
        .insert(variantsToInsert);

      if (variantsError) throw variantsError;

      toast({ title: "Success", description: "A/B test created successfully" });
      setCreateDialogOpen(false);
      setNewTestName("");
      setNewTestDescription("");
      setNewVariants([
        { name: "Control", traffic: 50 },
        { name: "Variant B", traffic: 50 },
      ]);
      fetchTests();
    } catch (error) {
      console.error("Error creating test:", error);
      toast({ title: "Error", description: "Failed to create test", variant: "destructive" });
    }
  };

  const toggleTestStatus = async (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === "running" ? "paused" : "running";
    try {
      const updates: any = { status: newStatus };
      if (newStatus === "running" && !tests.find((t) => t.id === testId)?.start_date) {
        updates.start_date = new Date().toISOString();
      }

      const { error } = await supabase.from("ab_tests").update(updates).eq("id", testId);

      if (error) throw error;

      toast({
        title: "Test Updated",
        description: `Test ${newStatus === "running" ? "started" : "paused"}`,
      });
      fetchTests();
    } catch (error) {
      console.error("Error updating test:", error);
      toast({ title: "Error", description: "Failed to update test", variant: "destructive" });
    }
  };

  const declareWinner = async (testId: string, variantId: string) => {
    try {
      const { error } = await supabase
        .from("ab_tests")
        .update({
          status: "completed",
          winner_variant_id: variantId,
          end_date: new Date().toISOString(),
        })
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: "Winner Declared",
        description: "The winning variant will now be shown to all visitors",
      });
      fetchTests();
    } catch (error) {
      console.error("Error declaring winner:", error);
      toast({ title: "Error", description: "Failed to declare winner", variant: "destructive" });
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      const { error } = await supabase.from("ab_tests").delete().eq("id", testId);

      if (error) throw error;

      toast({ title: "Deleted", description: "Test deleted successfully" });
      fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast({ title: "Error", description: "Failed to delete test", variant: "destructive" });
    }
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

  const calculateConversionRate = (variant: ABTestVariant): string => {
    if (variant.impressions === 0) return "0";
    return ((variant.conversions / variant.impressions) * 100).toFixed(1);
  };

  const totalSignups = tests.reduce(
    (sum, test) =>
      sum + (test.variants?.reduce((vSum, v) => vSum + v.conversions, 0) || 0),
    0
  );

  const runningTests = tests.filter((t) => t.status === "running").length;
  const completedTests = tests.filter((t) => t.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <div className="flex items-center gap-4">
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
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
          <Button variant="outline" size="icon" onClick={fetchTests}>
            <RefreshCw className="h-4 w-4" />
          </Button>
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
                <p className="text-xs text-muted-foreground">Total Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      {tests.length === 0 ? (
        <Card className="bg-card/50 border-border/30">
          <CardContent className="py-12 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No A/B Tests Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first test to start optimizing conversions
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                        onClick={() => toggleTestStatus(test.id, test.status)}
                      >
                        {test.status === "running" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTest(test.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {test.description && (
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {test.start_date
                    ? `Started: ${format(new Date(test.start_date), "MMM d, yyyy")}`
                    : `Created: ${format(new Date(test.created_at), "MMM d, yyyy")}`}
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-right">Traffic %</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      {test.status !== "completed" && (
                        <TableHead className="text-right">Action</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(test.variants || []).map((variant) => {
                      const isWinner = test.winner_variant_id === variant.id;
                      const convRate = parseFloat(calculateConversionRate(variant));
                      const bestRate = Math.max(
                        ...(test.variants || []).map((v) =>
                          parseFloat(calculateConversionRate(v))
                        )
                      );
                      const isBest = convRate === bestRate && convRate > 0;

                      return (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isWinner && (
                                <Badge className="bg-emerald-500">Winner</Badge>
                              )}
                              {isBest && !test.winner_variant_id && (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500 text-emerald-500"
                                >
                                  Leading
                                </Badge>
                              )}
                              <span className="text-sm">{variant.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {variant.traffic_percentage}%
                          </TableCell>
                          <TableCell className="text-right">
                            {variant.impressions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {variant.conversions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={isBest ? "text-emerald-500" : ""}>
                              {calculateConversionRate(variant)}%
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
      )}

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Test Name</Label>
              <Input
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="e.g., Headline Copy Test"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={newTestDescription}
                onChange={(e) => setNewTestDescription(e.target.value)}
                placeholder="What are you testing?"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Variants</Label>
              <div className="space-y-2 mt-2">
                {newVariants.map((variant, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={variant.name}
                      onChange={(e) => {
                        const updated = [...newVariants];
                        updated[index].name = e.target.value;
                        setNewVariants(updated);
                      }}
                      placeholder="Variant name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={variant.traffic.toString()}
                      onChange={(e) => {
                        const updated = [...newVariants];
                        updated[index].traffic = parseInt(e.target.value) || 0;
                        setNewVariants(updated);
                      }}
                      className="w-20"
                      min="0"
                      max={100}
                    />
                    <span className="flex items-center text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setNewVariants([...newVariants, { name: "", traffic: 0 }])
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTest}>Create Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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