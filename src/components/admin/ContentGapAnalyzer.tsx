import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  Filter,
  BarChart2,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KEYWORD_CLUSTERS, analyzeContentGaps } from "@/lib/local-seo";

interface ContentGap {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty_score: number | null;
  priority: string;
  content_type: string | null;
  target_page: string | null;
  competitor_coverage: any;
  status: string;
  created_at: string;
}

const ContentGapAnalyzer = forwardRef<HTMLDivElement>((_, ref) => {
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();

  const fetchGaps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_gaps")
        .select("*")
        .order("priority", { ascending: true });

      if (error) throw error;
      setGaps(data || []);
    } catch (err) {
      console.error("Error fetching content gaps:", err);
      // Fallback data from keyword clusters
      const fallbackGaps = KEYWORD_CLUSTERS.flatMap(cluster =>
        cluster.keywords.map((kw, i) => ({
          id: `${cluster.cluster}-${i}`,
          keyword: kw,
          search_volume: Math.round(cluster.avgSearchVolume * (0.7 + Math.random() * 0.6)),
          difficulty_score: cluster.difficulty === "high" ? 75 : cluster.difficulty === "medium" ? 50 : 25,
          priority: cluster.priority <= 2 ? "high" : cluster.priority <= 3 ? "medium" : "low",
          content_type: cluster.intent === "informational" ? "blog" : "landing",
          target_page: null,
          competitor_coverage: null,
          status: "identified",
          created_at: new Date().toISOString(),
        }))
      );
      setGaps(fallbackGaps);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      const { data, error } = await supabase
        .from("content_gaps")
        .insert({
          keyword: newKeyword.trim(),
          priority: "medium",
          status: "identified",
        })
        .select()
        .single();

      if (error) throw error;

      setGaps(prev => [...prev, data]);
      setNewKeyword("");
      toast({
        title: "Keyword Added",
        description: `"${newKeyword}" added to content gaps`,
      });
    } catch (err) {
      console.error("Error adding keyword:", err);
      toast({
        title: "Error",
        description: "Could not add keyword",
        variant: "destructive",
      });
    }
  };

  const updateGapStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("content_gaps")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setGaps(prev => prev.map(g => (g.id === id ? { ...g, status: newStatus } : g)));
    } catch (err) {
      console.error("Error updating gap:", err);
    }
  };

  const filteredGaps = gaps.filter(gap => {
    if (priorityFilter !== "all" && gap.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && gap.status !== statusFilter) return false;
    return true;
  });

  const highPriorityCount = gaps.filter(g => g.priority === "high").length;
  const identifiedCount = gaps.filter(g => g.status === "identified").length;
  const inProgressCount = gaps.filter(g => g.status === "in_progress").length;
  const completedCount = gaps.filter(g => g.status === "completed").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "identified":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (score: number | null) => {
    if (!score) return "Unknown";
    if (score >= 70) return "Hard";
    if (score >= 40) return "Medium";
    return "Easy";
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Gaps</p>
                <p className="text-2xl font-bold text-foreground">{gaps.length}</p>
              </div>
              <Search className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">High Priority</p>
                <p className="text-2xl font-bold text-red-400">{highPriorityCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-card/50 border-border/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Content Coverage Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {gaps.length} keywords covered
            </span>
          </div>
          <Progress value={(completedCount / gaps.length) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{identifiedCount} identified</span>
            <span>{inProgressCount} in progress</span>
            <span>{completedCount} completed</span>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Clusters */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Keyword Clusters by Intent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {KEYWORD_CLUSTERS.map((cluster, index) => (
              <div
                key={index}
                className="p-4 border border-border/30 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{cluster.cluster}</h4>
                  <Badge variant="outline" className="capitalize text-xs">
                    {cluster.intent}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>Vol: ~{cluster.avgSearchVolume.toLocaleString()}</span>
                  <Badge
                    variant="outline"
                    className={
                      cluster.difficulty === "high"
                        ? "text-red-400"
                        : cluster.difficulty === "medium"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }
                  >
                    {cluster.difficulty} difficulty
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cluster.keywords.slice(0, 3).map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                  {cluster.keywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{cluster.keywords.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gap List */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="w-5 h-5" />
            Content Gaps
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchGaps}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Keyword */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add new keyword..."
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addKeyword()}
            />
            <Button onClick={addKeyword} disabled={!newKeyword.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Gap Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Keyword</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Volume</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Difficulty</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Priority</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Type</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGaps.slice(0, 15).map((gap, i) => (
                  <motion.tr
                    key={gap.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/20 hover:bg-muted/20"
                  >
                    <td className="py-3 px-2">
                      <span className="font-medium text-foreground">{gap.keyword}</span>
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      {gap.search_volume?.toLocaleString() || "—"}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress
                          value={gap.difficulty_score || 0}
                          className="w-16 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {getDifficultyLabel(gap.difficulty_score)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant="outline" className={getPriorityColor(gap.priority)}>
                        {gap.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {gap.content_type || "TBD"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant="outline" className={getStatusColor(gap.status)}>
                        {gap.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {gap.status === "identified" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateGapStatus(gap.id, "in_progress")}
                        >
                          Start
                        </Button>
                      )}
                      {gap.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-400"
                          onClick={() => updateGapStatus(gap.id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredGaps.length > 15 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing 15 of {filteredGaps.length} content gaps
              </p>
            )}

            {filteredGaps.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No content gaps found matching the filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ContentGapAnalyzer.displayName = "ContentGapAnalyzer";

export default ContentGapAnalyzer;
