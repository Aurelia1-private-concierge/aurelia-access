/**
 * Pricing Management Panel
 * Admin interface for managing dynamic pricing rules
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Settings,
  History,
  Calculator,
  Save,
  Plus,
  Trash2,
  Edit2,
  Clock,
  TrendingUp,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { usePricingRules } from "@/hooks/usePricingRules";
import { PricingRule, PricingContext } from "@/lib/dynamic-pricing";
import { CurrencyConverter } from "@/components/CurrencyConverter";

// Category display names
const CATEGORY_LABELS: Record<string, string> = {
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  collectibles: "Collectibles",
  events_access: "Events Access",
  security: "Security",
  wellness: "Wellness",
  travel: "Travel",
  dining: "Dining",
  chauffeur: "Chauffeur",
  shopping: "Shopping",
};

export const PricingManagementPanel: React.FC = () => {
  const {
    rules,
    history,
    isLoading,
    fetchRules,
    updateRule,
    fetchHistory,
    calculateCost,
  } = usePricingRules();

  const [activeTab, setActiveTab] = useState("categories");
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PricingRule>>({});
  const [expandedTiers, setExpandedTiers] = useState<string | null>(null);

  // Preview calculator state
  const [previewCategory, setPreviewCategory] = useState("private_aviation");
  const [previewPrice, setPreviewPrice] = useState("50000");
  const [previewPriority, setPreviewPriority] = useState("standard");
  const [previewResult, setPreviewResult] = useState<number | null>(null);
  const [previewBreakdown, setPreviewBreakdown] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle edit mode
  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule.id);
    setEditValues({
      base_credits: rule.base_credits,
      is_active: rule.is_active,
    });
  };

  // Save changes
  const handleSave = async (ruleId: string) => {
    const success = await updateRule(ruleId, editValues);
    if (success) {
      setEditingRule(null);
      setEditValues({});
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingRule(null);
    setEditValues({});
  };

  // Calculate preview
  const handlePreview = async () => {
    const context: PricingContext = {
      category: previewCategory,
      partnerServicePrice: parseFloat(previewPrice) || 0,
      priority: previewPriority,
    };

    const result = await calculateCost(context);
    setPreviewResult(result.finalCost);
    setPreviewBreakdown(result.breakdown);
  };

  // Update multiplier
  const handleMultiplierUpdate = async (
    ruleId: string,
    multiplierType: "priority_multipliers" | "time_multipliers",
    key: string,
    value: number
  ) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const currentMultipliers = rule[multiplierType] as Record<string, number>;
    const updatedMultipliers = {
      ...currentMultipliers,
      [key]: value,
    };

    await updateRule(ruleId, { [multiplierType]: updatedMultipliers });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Pricing Management
          </h2>
          <p className="text-muted-foreground">
            Configure dynamic pricing rules, multipliers, and credit costs
          </p>
        </div>
        <Button onClick={() => fetchRules()} variant="outline" size="sm">
          <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categories" className="gap-2">
            <Settings className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="multipliers" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Multipliers
          </TabsTrigger>
          <TabsTrigger value="tiers" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Price Tiers
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2">
            <Calculator className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Category Credits Tab */}
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Base Credit Costs by Category</CardTitle>
              <CardDescription>
                Set the base credit cost for each service category before multipliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Base Credits</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {CATEGORY_LABELS[rule.category] || rule.category}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRule === rule.id ? (
                          <Input
                            type="number"
                            value={editValues.base_credits ?? rule.base_credits}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                base_credits: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-20 text-center mx-auto"
                            min={1}
                          />
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            {rule.base_credits}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRule === rule.id ? (
                          <Switch
                            checked={editValues.is_active ?? rule.is_active}
                            onCheckedChange={(checked) =>
                              setEditValues({ ...editValues, is_active: checked })
                            }
                          />
                        ) : (
                          <Badge variant={rule.is_active ? "default" : "outline"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingRule === rule.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(rule.id)}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multipliers Tab */}
        <TabsContent value="multipliers" className="mt-6 space-y-6">
          {/* Priority Multipliers */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Multipliers</CardTitle>
              <CardDescription>
                Multiply base credits based on request priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rules.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(rules[0].priority_multipliers).map(
                    ([priority, multiplier]) => (
                      <div key={priority} className="space-y-2">
                        <Label className="capitalize">{priority}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={multiplier}
                            onChange={(e) =>
                              handleMultiplierUpdate(
                                rules[0].id,
                                "priority_multipliers",
                                priority,
                                parseFloat(e.target.value) || 1
                              )
                            }
                            step={0.1}
                            min={0.1}
                            className="w-20"
                          />
                          <span className="text-muted-foreground">×</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Multipliers */}
          <Card>
            <CardHeader>
              <CardTitle>Time-Based Multipliers</CardTitle>
              <CardDescription>
                Adjust pricing based on booking timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rules.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Peak Season
                    </Label>
                    <Input
                      type="number"
                      value={rules[0].time_multipliers.peak_season}
                      onChange={(e) =>
                        handleMultiplierUpdate(
                          rules[0].id,
                          "time_multipliers",
                          "peak_season",
                          parseFloat(e.target.value) || 1
                        )
                      }
                      step={0.05}
                      min={0.5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dec-Jan, Jul-Aug
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Minute
                    </Label>
                    <Input
                      type="number"
                      value={rules[0].time_multipliers.last_minute}
                      onChange={(e) =>
                        handleMultiplierUpdate(
                          rules[0].id,
                          "time_multipliers",
                          "last_minute",
                          parseFloat(e.target.value) || 1
                        )
                      }
                      step={0.05}
                      min={0.5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Less than 48 hours notice
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Advance Booking
                    </Label>
                    <Input
                      type="number"
                      value={rules[0].time_multipliers.advance_booking}
                      onChange={(e) =>
                        handleMultiplierUpdate(
                          rules[0].id,
                          "time_multipliers",
                          "advance_booking",
                          parseFloat(e.target.value) || 1
                        )
                      }
                      step={0.05}
                      min={0.5}
                    />
                    <p className="text-xs text-muted-foreground">
                      More than 30 days ahead (discount)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Tiers Tab */}
        <TabsContent value="tiers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Price Tier Adjustments</CardTitle>
              <CardDescription>
                Add credit adjustments based on partner service value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((rule) => (
                <Collapsible
                  key={rule.id}
                  open={expandedTiers === rule.id}
                  onOpenChange={(open) =>
                    setExpandedTiers(open ? rule.id : null)
                  }
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>{CATEGORY_LABELS[rule.category] || rule.category}</span>
                      {expandedTiers === rule.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-3">
                    {rule.partner_price_tiers.tiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            ${tier.min_price.toLocaleString()} -{" "}
                            {tier.max_price
                              ? `$${tier.max_price.toLocaleString()}`
                              : "Unlimited"}
                          </span>
                        </div>
                        <Badge
                          variant={tier.credit_adjustment > 0 ? "default" : "secondary"}
                        >
                          {tier.credit_adjustment > 0 ? "+" : ""}
                          {tier.credit_adjustment} credits
                        </Badge>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Credit Cost Calculator
                </CardTitle>
                <CardDescription>
                  Test how pricing rules affect credit costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={previewCategory}
                    onValueChange={setPreviewCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Service Price ($)</Label>
                  <Input
                    type="number"
                    value={previewPrice}
                    onChange={(e) => setPreviewPrice(e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={previewPriority}
                    onValueChange={setPreviewPriority}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handlePreview} className="w-full">
                  Calculate
                </Button>

                {previewResult !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-primary/10 rounded-lg"
                  >
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        Estimated Cost
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {previewResult} credits
                      </p>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-1 text-sm font-mono">
                      {previewBreakdown.map((line, idx) => (
                        <p
                          key={idx}
                          className={
                            line.includes("────")
                              ? "opacity-50"
                              : line.includes("Total")
                              ? "font-bold"
                              : ""
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Currency Converter */}
            <CurrencyConverter defaultAmount={50000} />
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Pricing Change History
              </CardTitle>
              <CardDescription>
                Audit trail of all pricing modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pricing changes recorded yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">
                          {new Date(entry.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.change_type === "create"
                                ? "default"
                                : entry.change_type === "delete"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {entry.change_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.new_values ? (
                            <code className="text-xs">
                              {JSON.stringify(entry.new_values).slice(0, 100)}...
                            </code>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingManagementPanel;
