import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar, AlertTriangle, X, Save, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAdSpendManagement, useCurrencyFormat, SUPPORTED_AD_PLATFORMS } from "@/hooks/useAdSpendManagement";

interface BudgetManagerProps {
  onClose?: () => void;
  isModal?: boolean;
}

const BudgetManager = forwardRef<HTMLDivElement, BudgetManagerProps>(({ onClose, isModal = false }, ref) => {
  const { budgets, createBudget, updateBudget, loading } = useAdSpendManagement();
  const formatCurrency = useCurrencyFormat("USD");

  const [showForm, setShowForm] = useState(isModal);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    budget_amount: "",
    daily_limit: "",
    alert_threshold: "80",
    start_date: "",
    end_date: "",
    currency: "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.platform || !formData.budget_amount) {
      return;
    }

    if (editingBudget) {
      await updateBudget(editingBudget, {
        platform: formData.platform,
        budget_amount: parseFloat(formData.budget_amount),
        daily_limit: formData.daily_limit ? parseFloat(formData.daily_limit) : null,
        alert_threshold: parseFloat(formData.alert_threshold) / 100,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        currency: formData.currency,
      });
    } else {
      await createBudget({
        platform: formData.platform,
        budget_amount: parseFloat(formData.budget_amount),
        daily_limit: formData.daily_limit ? parseFloat(formData.daily_limit) : undefined,
        alert_threshold: parseFloat(formData.alert_threshold) / 100,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        currency: formData.currency,
      });
    }

    resetForm();
    if (isModal && onClose) onClose();
  };

  const resetForm = () => {
    setFormData({
      platform: "",
      budget_amount: "",
      daily_limit: "",
      alert_threshold: "80",
      start_date: "",
      end_date: "",
      currency: "USD",
    });
    setShowForm(false);
    setEditingBudget(null);
  };

  const startEditing = (budget: typeof budgets[0]) => {
    setEditingBudget(budget.id);
    setFormData({
      platform: budget.platform,
      budget_amount: budget.budget_amount.toString(),
      daily_limit: budget.daily_limit?.toString() || "",
      alert_threshold: (budget.alert_threshold * 100).toString(),
      start_date: budget.start_date || "",
      end_date: budget.end_date || "",
      currency: budget.currency,
    });
    setShowForm(true);
  };

  const BudgetForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select
            value={formData.platform}
            onValueChange={(value) => setFormData({ ...formData, platform: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_AD_PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    {p.icon} {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CHF">CHF (Fr)</SelectItem>
              <SelectItem value="AED">AED (د.إ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Total Budget</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="10,000"
              className="pl-9"
              value={formData.budget_amount}
              onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Daily Limit (Optional)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="500"
              className="pl-9"
              value={formData.daily_limit}
              onChange={(e) => setFormData({ ...formData, daily_limit: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alert Threshold (%)</Label>
        <div className="flex items-center gap-4">
          <Input
            type="range"
            min="50"
            max="100"
            step="5"
            value={formData.alert_threshold}
            onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-right">{formData.alert_threshold}%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          You'll be alerted when spending reaches this percentage of the budget
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {editingBudget ? "Update Budget" : "Create Budget"}
        </Button>
        <Button type="button" variant="outline" onClick={isModal ? onClose : resetForm}>
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div ref={ref} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl">
              {editingBudget ? "Edit Budget" : "Create New Budget"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Set spending limits and alert thresholds
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {BudgetForm}
      </div>
    );
  }

  return (
    <Card ref={ref}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Manager
            </CardTitle>
            <CardDescription>
              Manage ad spend limits across platforms
            </CardDescription>
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              Add Budget
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {BudgetForm}
          </motion.div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No budgets configured</p>
            <p className="text-sm">Create a budget to start tracking ad spend</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const platform = SUPPORTED_AD_PLATFORMS.find((p) => p.id === budget.platform);
              const utilization = budget.budget_amount > 0
                ? (budget.spent_amount / budget.budget_amount) * 100
                : 0;
              const isNearLimit = utilization >= budget.alert_threshold * 100;
              const isOverLimit = utilization >= 100;

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border rounded-lg ${
                    isOverLimit
                      ? "border-destructive/50 bg-destructive/5"
                      : isNearLimit
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${platform?.color || "bg-muted"} rounded-lg flex items-center justify-center text-white text-xl`}>
                        {platform?.icon || "💰"}
                      </div>
                      <div>
                        <p className="font-medium">{platform?.name || budget.platform}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {budget.start_date && (
                            <span>
                              {new Date(budget.start_date).toLocaleDateString()} - {budget.end_date ? new Date(budget.end_date).toLocaleDateString() : "Ongoing"}
                            </span>
                          )}
                          {budget.daily_limit && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(budget.daily_limit)}/day limit
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNearLimit && (
                        <AlertTriangle className={`h-5 w-5 ${isOverLimit ? "text-destructive" : "text-yellow-500"}`} />
                      )}
                      <Badge variant={budget.status === "active" ? "default" : "secondary"}>
                        {budget.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => startEditing(budget)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(budget.spent_amount)} spent</span>
                      <span>{formatCurrency(budget.budget_amount)} budget</span>
                    </div>
                    <Progress
                      value={Math.min(utilization, 100)}
                      className={`h-2 ${isOverLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{utilization.toFixed(1)}% used</span>
                      <span>{formatCurrency(Math.max(0, budget.budget_amount - budget.spent_amount))} remaining</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BudgetManager.displayName = "BudgetManager";

export default BudgetManager;
