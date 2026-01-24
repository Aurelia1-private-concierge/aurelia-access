import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Send, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  keywords: string[] | null;
  status: "draft" | "review" | "published" | "archived";
  published_at: string | null;
  created_at: string;
}

const SEO_KEYWORDS = [
  "luxury concierge services",
  "private jet charter",
  "exclusive travel experiences",
  "personal concierge",
  "VIP access services",
  "luxury lifestyle management",
  "bespoke travel planning",
  "ultra high net worth services",
  "private members club",
  "exclusive event access"
];

const TONES = [
  { value: "prestigious", label: "Prestigious & Exclusive" },
  { value: "warm", label: "Warm & Inviting" },
  { value: "formal", label: "Formal & Professional" },
  { value: "inspiring", label: "Inspiring & Aspirational" }
];

export const ContentGeneratorPanel = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Generator form
  const [keyword, setKeyword] = useState(SEO_KEYWORDS[0]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [tone, setTone] = useState<"prestigious" | "warm" | "formal" | "inspiring">("prestigious");
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    content: string;
    metaDescription: string;
  } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async () => {
    const targetKeyword = customKeyword || keyword;
    if (!targetKeyword) {
      toast({
        title: "Keyword required",
        description: "Please select or enter a keyword.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo-content", {
        body: {
          keyword: targetKeyword,
          tone,
          type: "blog_post"
        }
      });

      if (error) throw error;

      setGeneratedContent({
        title: data.title,
        content: data.content,
        metaDescription: data.metaDescription
      });

      toast({
        title: "Content generated",
        description: "Review and publish your new blog post."
      });
    } catch (error) {
      console.error("Failed to generate content:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePost = async (status: "draft" | "review" | "published") => {
    if (!generatedContent) return;

    try {
      const slug = generatedContent.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { error } = await supabase.from("blog_posts").insert({
        title: generatedContent.title,
        slug: `${slug}-${Date.now()}`,
        content: generatedContent.content,
        meta_description: generatedContent.metaDescription,
        keywords: [customKeyword || keyword],
        status,
        published_at: status === "published" ? new Date().toISOString() : null
      });

      if (error) throw error;

      toast({
        title: status === "published" ? "Post published!" : "Post saved",
        description: status === "published" 
          ? "Your blog post is now live." 
          : "Post saved as draft for review."
      });

      setGeneratedContent(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to save post:", error);
      toast({
        title: "Save failed",
        description: "Could not save the post.",
        variant: "destructive"
      });
    }
  };

  const updatePostStatus = async (postId: string, status: BlogPost["status"]) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          status,
          published_at: status === "published" ? new Date().toISOString() : null
        })
        .eq("id", postId);

      if (error) throw error;

      toast({ title: "Post updated" });
      fetchPosts();
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({ title: "Post deleted" });
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const getStatusColor = (status: BlogPost["status"]) => {
    switch (status) {
      case "published": return "bg-green-500/10 text-green-500";
      case "review": return "bg-yellow-500/10 text-yellow-500";
      case "draft": return "bg-gray-500/10 text-gray-500";
      case "archived": return "bg-red-500/10 text-red-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">AI Content Generator</h2>
          <p className="text-muted-foreground">Generate SEO-optimized blog posts for organic traffic</p>
        </div>
        <Button variant="outline" onClick={fetchPosts}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === "published").length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === "review").length}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === "draft").length}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-gold" />
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="posts">Manage Posts</TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                Generate Blog Post
              </CardTitle>
              <CardDescription>
                AI will create a full blog post optimized for your target keyword
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Keyword</label>
                  <Select value={keyword} onValueChange={setKeyword}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEO_KEYWORDS.map(kw => (
                        <SelectItem key={kw} value={kw}>{kw}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Or Custom Keyword</label>
                  <Input
                    placeholder="Enter custom keyword..."
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateContent} 
                disabled={isGenerating}
                className="w-full bg-gold hover:bg-gold/90 text-gold-foreground"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content Preview */}
          {generatedContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-gold/30">
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                      value={generatedContent.title}
                      onChange={(e) => setGeneratedContent({
                        ...generatedContent,
                        title: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Description</label>
                    <Textarea 
                      value={generatedContent.metaDescription}
                      onChange={(e) => setGeneratedContent({
                        ...generatedContent,
                        metaDescription: e.target.value
                      })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea 
                      value={generatedContent.content}
                      onChange={(e) => setGeneratedContent({
                        ...generatedContent,
                        content: e.target.value
                      })}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => savePost("draft")}>
                      Save as Draft
                    </Button>
                    <Button variant="outline" onClick={() => savePost("review")}>
                      Send to Review
                    </Button>
                    <Button 
                      onClick={() => savePost("published")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No blog posts yet. Generate your first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                            {post.keywords?.map(kw => (
                              <Badge key={kw} variant="outline" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                          <h3 className="font-medium truncate">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPost(post)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{post.title}</DialogTitle>
                              </DialogHeader>
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-muted-foreground italic">{post.meta_description}</p>
                                <hr />
                                <div className="whitespace-pre-wrap">{post.content}</div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {post.status !== "published" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updatePostStatus(post.id, "published")}
                            >
                              <Send className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentGeneratorPanel;
