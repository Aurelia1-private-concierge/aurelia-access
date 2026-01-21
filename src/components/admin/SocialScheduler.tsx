import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Plus,
  Trash2,
  Edit,
  Check,
  Send,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format, addHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduled_at: string;
  status: string;
  campaign?: string | null;
  image_url?: string | null;
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-[#0A66C2]" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-[#1877F2]" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "bg-foreground" },
];

const SUGGESTED_TIMES = [
  { label: "Morning (9 AM)", hours: 9 },
  { label: "Lunch (12 PM)", hours: 12 },
  { label: "Afternoon (3 PM)", hours: 15 },
  { label: "Evening (7 PM)", hours: 19 },
];

const SocialScheduler = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  
  // Form state
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [campaign, setCampaign] = useState("");

  // Fetch posts from database
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "Failed to load scheduled posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    if (!content || selectedPlatforms.length === 0 || !scheduledDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    
    try {
      if (editingPost) {
        const { error } = await supabase
          .from("social_posts")
          .update({
            content,
            platforms: selectedPlatforms,
            scheduled_at: scheduledAt,
            campaign: campaign || null,
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast({ title: "Post Updated", description: "Your scheduled post has been updated" });
      } else {
        const { error } = await supabase
          .from("social_posts")
          .insert({
            content,
            platforms: selectedPlatforms,
            scheduled_at: scheduledAt,
            status: "scheduled",
            campaign: campaign || null,
            created_by: user?.id,
          });

        if (error) throw error;
        toast({ title: "Post Scheduled", description: `Scheduled for ${format(new Date(scheduledAt), "PPP 'at' p")}` });
      }

      await fetchPosts();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving post:", error);
      toast({ title: "Error", description: "Failed to save post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setContent("");
    setSelectedPlatforms([]);
    setScheduledDate("");
    setScheduledTime("09:00");
    setCampaign("");
    setEditingPost(null);
  };

  const handleEdit = (post: ScheduledPost) => {
    setEditingPost(post);
    setContent(post.content);
    setSelectedPlatforms(post.platforms);
    setScheduledDate(format(new Date(post.scheduled_at), "yyyy-MM-dd"));
    setScheduledTime(format(new Date(post.scheduled_at), "HH:mm"));
    setCampaign(post.campaign || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPosts(posts.filter((p) => p.id !== id));
      toast({ title: "Post Deleted", description: "Scheduled post has been removed" });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const handleQuickSchedule = (hours: number) => {
    const date = addHours(new Date(), hours);
    setScheduledDate(format(date, "yyyy-MM-dd"));
    setScheduledTime(format(date, "HH:mm"));
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const scheduledPosts = posts.filter((p) => p.status === "scheduled").sort((a, b) => 
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );
  const publishedPosts = posts.filter((p) => p.status === "published");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Social Media Scheduler
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and manage posts across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchPosts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Edit Post" : "Schedule New Post"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Content */}
                <div className="space-y-2">
                  <Label>Post Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content..."
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.length} characters
                  </p>
                </div>

                {/* Platforms */}
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          onClick={() => togglePlatform(platform.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{platform.name}</span>
                          {isSelected && <Check className="h-3 w-3 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Schedule */}
                <div className="space-y-2">
                  <Label>Quick Schedule</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TIMES.map((time) => (
                      <Button
                        key={time.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSchedule(time.hours)}
                      >
                        {time.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Campaign */}
                <div className="space-y-2">
                  <Label>Campaign (Optional)</Label>
                  <Select value={campaign} onValueChange={setCampaign}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="launch">Launch Campaign</SelectItem>
                      <SelectItem value="waitlist">Waitlist Promo</SelectItem>
                      <SelectItem value="luxury-travel">Luxury Travel</SelectItem>
                      <SelectItem value="vip-events">VIP Events</SelectItem>
                      <SelectItem value="organic">Organic Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <Button onClick={handleSubmit} className="w-full gap-2" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {editingPost ? "Update Post" : "Schedule Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-foreground">{scheduledPosts.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-foreground">{publishedPosts.length}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-foreground">
              {new Set(posts.flatMap(p => p.platforms)).size}
            </p>
            <p className="text-xs text-muted-foreground">Platforms</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-foreground">
              {scheduledPosts.length > 0 
                ? format(new Date(scheduledPosts[0].scheduled_at), "MMM d")
                : "-"
              }
            </p>
            <p className="text-xs text-muted-foreground">Next Post</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No posts scheduled. Create your first post!
            </p>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-muted/30 rounded-lg border border-border/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.platforms.map((platformId) => {
                          const platform = PLATFORMS.find((p) => p.id === platformId);
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <div
                              key={platformId}
                              className={`p-1 rounded ${platform.color}`}
                            >
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                          );
                        })}
                        {post.campaign && (
                          <Badge variant="outline" className="text-[10px]">
                            {post.campaign}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 mb-2">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.scheduled_at), "PPP 'at' p")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialScheduler;