import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Send, Edit2, Trash2, Eye, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { SocialPost, SocialPlatform, PLATFORM_INFO, PostStatus } from "@/hooks/useSocialAdvertising";

interface ContentCalendarProps {
  posts: SocialPost[];
  onCreatePost: (post: Partial<SocialPost>) => Promise<unknown>;
  onPublishPost: (postId: string) => Promise<unknown>;
}

const ContentCalendar = forwardRef<HTMLDivElement, ContentCalendarProps>(
  ({ posts, onCreatePost, onPublishPost }, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [publishing, setPublishing] = useState<string | null>(null);
    const [formData, setFormData] = useState({
      platform: "twitter" as SocialPlatform,
      content: "",
      hashtags: "",
      scheduled_at: "",
    });

    const handleCreate = async () => {
      if (!formData.content) return;
      
      setCreating(true);
      try {
        await onCreatePost({
          platform: formData.platform,
          content: formData.content,
          hashtags: formData.hashtags.split(",").map(h => h.trim()).filter(Boolean),
          scheduled_at: formData.scheduled_at || null,
          status: formData.scheduled_at ? "scheduled" : "draft",
        });

        setDialogOpen(false);
        setFormData({ platform: "twitter", content: "", hashtags: "", scheduled_at: "" });
      } finally {
        setCreating(false);
      }
    };

    const handlePublish = async (postId: string) => {
      setPublishing(postId);
      try {
        await onPublishPost(postId);
      } finally {
        setPublishing(null);
      }
    };

    const getStatusBadge = (status: PostStatus) => {
      switch (status) {
        case "published":
          return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
        case "scheduled":
          return <Badge className="bg-blue-500/10 text-blue-500"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
        case "publishing":
          return <Badge className="bg-yellow-500/10 text-yellow-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Publishing</Badge>;
        case "failed":
          return <Badge className="bg-red-500/10 text-red-500"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
        case "draft":
          return <Badge variant="outline">Draft</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    };

    const getDateLabel = (dateStr: string | null) => {
      if (!dateStr) return "Not scheduled";
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isPast(date)) return format(date, "MMM d") + " (past)";
      return format(date, "MMM d, yyyy");
    };

    const groupedPosts = posts.reduce((acc, post) => {
      const key = post.scheduled_at 
        ? format(parseISO(post.scheduled_at), "yyyy-MM-dd")
        : "unscheduled";
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    }, {} as Record<string, SocialPost[]>);

    const sortedDates = Object.keys(groupedPosts).sort((a, b) => {
      if (a === "unscheduled") return 1;
      if (b === "unscheduled") return -1;
      return a.localeCompare(b);
    });

    return (
      <Card ref={ref} className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                Schedule and manage social media posts across platforms
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Social Post</DialogTitle>
                  <DialogDescription>
                    Compose a post for your UHNWI audience
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Platform</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value as SocialPlatform }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PLATFORM_INFO) as SocialPlatform[]).map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {PLATFORM_INFO[platform].icon} {PLATFORM_INFO[platform].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Content</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.content.length} / {PLATFORM_INFO[formData.platform].maxLength}
                      </span>
                    </div>
                    <Textarea
                      id="content"
                      placeholder="Compose your message..."
                      className="min-h-[120px]"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      maxLength={PLATFORM_INFO[formData.platform].maxLength}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                    <Input
                      id="hashtags"
                      placeholder="luxury, privateaviation, UHNW"
                      value={formData.hashtags}
                      onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="scheduled">Schedule (optional)</Label>
                    <Input
                      id="scheduled"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || !formData.content}>
                    {creating ? "Creating..." : formData.scheduled_at ? "Schedule Post" : "Save Draft"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts scheduled. Create your first post to populate the calendar.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-card py-2">
                    {dateKey === "unscheduled" ? "📝 Drafts" : `📅 ${getDateLabel(dateKey + "T00:00:00")}`}
                  </h4>
                  <div className="space-y-3">
                    {groupedPosts[dateKey].map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 border border-border/50 rounded-lg hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: PLATFORM_INFO[post.platform]?.color + "20" }}
                          >
                            {PLATFORM_INFO[post.platform]?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(post.status)}
                              {post.scheduled_at && (
                                <span className="text-xs text-muted-foreground">
                                  {format(parseISO(post.scheduled_at), "h:mm a")}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground line-clamp-2 mb-2">
                              {post.content}
                            </p>
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {post.hashtags.slice(0, 5).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                                {post.hashtags.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.hashtags.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            {post.error_message && (
                              <p className="text-xs text-red-500 mt-2">
                                Error: {post.error_message}
                              </p>
                            )}
                            {post.platform_url && (
                              <a
                                href={post.platform_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> View Live Post
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {(post.status === "draft" || post.status === "failed") && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePublish(post.id)}
                                disabled={publishing === post.id}
                              >
                                {publishing === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

ContentCalendar.displayName = "ContentCalendar";

export default ContentCalendar;
