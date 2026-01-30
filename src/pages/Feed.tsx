import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, MoreHorizontal, Send, Image, X, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePosts, Post, PostComment } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function FeedPage() {
  const { user } = useAuth();
  const { posts, loading, fetchPosts, createPost, likePost, deletePost } = usePosts();
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setIsPosting(true);
    const result = await createPost({ content: newPostContent.trim() });
    if (result) {
      setNewPostContent('');
      fetchPosts();
    }
    setIsPosting(false);
  };

  if (loading && posts.length === 0) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">Feed</h1>
          <p className="text-muted-foreground">Stay connected with your network</p>
        </div>

        {/* Create Post */}
        {user && (
          <Card className="mb-6 border-border/50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share an update, article, or insight..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 text-base"
                  />
                  <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="gap-1.5">
                        <Image className="h-4 w-4" />
                        Photo
                      </Button>
                    </div>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isPosting}
                      className="gap-2"
                    >
                      {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
              >
                <PostCard 
                  post={post} 
                  onLike={() => likePost(post.id)}
                  onDelete={user?.id === post.author_id ? () => deletePost(post.id) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ 
  post, 
  onLike, 
  onDelete 
}: { 
  post: Post; 
  onLike: () => void;
  onDelete?: () => void;
}) {
  const { user } = useAuth();
  const { getComments, addComment } = usePosts();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const loadComments = async () => {
    setIsLoadingComments(true);
    const data = await getComments(post.id);
    setComments(data);
    setIsLoadingComments(false);
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    const result = await addComment(post.id, newComment.trim());
    if (result) {
      setComments(prev => [...prev, result]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast({ title: 'Link copied to clipboard' });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.author?.display_name?.substring(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{post.author?.display_name || 'Unknown'}</span>
              {post.author?.company && (
                <span className="text-muted-foreground text-sm">• {post.author.company}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {post.title && (
          <h3 className="font-medium text-lg mb-2">{post.title}</h3>
        )}
        <p className="whitespace-pre-wrap">{post.content}</p>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img 
              src={post.media_urls[0]} 
              alt="" 
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50 text-sm text-muted-foreground">
          <span>{post.likes_count} likes</span>
          <span>{post.comments_count} comments</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 gap-2 ${post.is_liked ? 'text-red-500' : ''}`}
            onClick={onLike}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleToggleComments}
          >
            <MessageSquare className="h-4 w-4" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              {/* Add Comment */}
              {user && (
                <div className="flex gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[36px] h-9 py-2 resize-none text-sm"
                    />
                    <Button
                      size="icon"
                      disabled={!newComment.trim() || isSubmittingComment}
                      onClick={handleAddComment}
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function CommentItem({ comment }: { comment: PostComment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {comment.author?.display_name?.substring(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <span className="font-medium text-sm">{comment.author?.display_name || 'Unknown'}</span>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
          <button className="hover:text-foreground">Like</button>
          <button className="hover:text-foreground">Reply</button>
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-border/50">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
