import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  author_id: string;
  company_id: string | null;
  title: string | null;
  content: string;
  content_type: string;
  media_urls: string[] | null;
  tags: string[] | null;
  visibility: string;
  is_pinned: boolean;
  is_featured: boolean;
  status: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    company: string | null;
  };
  company?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  is_liked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  replies?: PostComment[];
}

interface CreatePostInput {
  content: string;
  title?: string;
  content_type?: string;
  media_urls?: string[];
  tags?: string[];
  visibility?: string;
  company_id?: string;
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async (filters?: {
    author_id?: string;
    company_id?: string;
    tags?: string[];
    search?: string;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select(`
          *,
          company:companies (
            id, name, logo_url
          )
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.author_id) {
        query = query.eq('author_id', filters.author_id);
      }
      if (filters?.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      if (filters?.search) {
        query = query.or(`content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author profiles separately
      if (data && data.length > 0) {
        const authorIds = [...new Set(data.map(p => p.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, company')
          .in('user_id', authorIds);

        const postsWithAuthors = data.map(p => {
          const authorProfile = profiles?.find(pr => pr.user_id === p.author_id);
          return {
            ...p,
            author: authorProfile ? {
              id: p.author_id,
              display_name: authorProfile.display_name || 'Unknown',
              avatar_url: authorProfile.avatar_url,
              company: authorProfile.company,
            } : undefined,
          };
        });

        // Check which posts are liked by current user
        if (user) {
          const { data: likes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', data.map(p => p.id));

          const likedSet = new Set((likes || []).map(l => l.post_id));
          setLikedPosts(likedSet);
          
          const postsWithLikes = postsWithAuthors.map(p => ({
            ...p,
            is_liked: likedSet.has(p.id),
          }));
          setPosts(postsWithLikes as Post[]);
          return postsWithLikes as Post[];
        }

        setPosts(postsWithAuthors as Post[]);
        return postsWithAuthors as Post[];
      }

      setPosts([]);
      return [];
    } catch (err) {
      console.error('Error fetching posts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMyPosts = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyPosts((data || []) as Post[]);
      return data as Post[];
    } catch (err) {
      console.error('Error fetching my posts:', err);
      return [];
    }
  }, [user]);

  const getPost = useCallback(async (id: string): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          company:companies (
            id, name, logo_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, company')
        .eq('user_id', data.author_id)
        .single();

      const postWithAuthor = {
        ...data,
        author: profile ? {
          id: data.author_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          company: profile.company,
        } : undefined,
      };

      // Check if liked
      if (user) {
        const { data: like } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        return { ...postWithAuthor, is_liked: !!like } as Post;
      }

      return postWithAuthor as Post;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    }
  }, [user]);

  const createPost = useCallback(async (input: CreatePostInput): Promise<Post | null> => {
    if (!user) {
      toast({ title: 'Authentication Required', variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...input,
          author_id: user.id,
          status: 'published',
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Post Created', description: 'Your post has been published.' });
      await fetchMyPosts();
      return data as Post;
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast({ title: 'Error', description: err.message || 'Failed to create post.', variant: 'destructive' });
      return null;
    }
  }, [user, fetchMyPosts]);

  const updatePost = useCallback(async (id: string, input: Partial<CreatePostInput>): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Post Updated' });
      return data as Post;
    } catch (err: any) {
      console.error('Error updating post:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  }, []);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Post Deleted' });
      await fetchMyPosts();
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  }, [fetchMyPosts]);

  const likePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Please sign in to like posts', variant: 'destructive' });
      return false;
    }

    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        await supabase.from('post_likes').delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1), is_liked: false } : p
        ));
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
        setLikedPosts(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: p.likes_count + 1, is_liked: true } : p
        ));
      }
      return true;
    } catch (err) {
      console.error('Error liking post:', err);
      return false;
    }
  }, [user, likedPosts]);

  // Comments
  const getComments = useCallback(async (postId: string): Promise<PostComment[]> => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'active')
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Fetch author profiles
      const authorIds = [...new Set(data.map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', authorIds);

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(data.map(async (comment) => {
        const { data: replies } = await supabase
          .from('post_comments')
          .select('*')
          .eq('parent_id', comment.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        // Fetch reply author profiles
        let replyProfiles: any[] = [];
        if (replies && replies.length > 0) {
          const replyAuthorIds = [...new Set(replies.map(r => r.author_id))];
          const { data: rp } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .in('user_id', replyAuthorIds);
          replyProfiles = rp || [];
        }

        const author = profiles?.find(p => p.user_id === comment.author_id);
        
        return {
          ...comment,
          author: author ? {
            id: comment.author_id,
            display_name: author.display_name,
            avatar_url: author.avatar_url,
          } : undefined,
          replies: (replies || []).map(r => {
            const replyAuthor = replyProfiles.find(p => p.user_id === r.author_id);
            return {
              ...r,
              author: replyAuthor ? {
                id: r.author_id,
                display_name: replyAuthor.display_name,
                avatar_url: replyAuthor.avatar_url,
              } : undefined,
            };
          }),
        };
      }));

      return commentsWithReplies as PostComment[];
    } catch (err) {
      console.error('Error fetching comments:', err);
      return [];
    }
  }, []);

  const addComment = useCallback(async (postId: string, content: string, parentId?: string): Promise<PostComment | null> => {
    if (!user) {
      toast({ title: 'Please sign in to comment', variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      return {
        ...data,
        author: profile ? {
          id: user.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        } : undefined,
      } as PostComment;
    } catch (err: any) {
      console.error('Error adding comment:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  }, [user]);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ status: 'removed' })
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchMyPosts();
    }
  }, [fetchPosts, fetchMyPosts, user]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('posts-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return {
    posts,
    myPosts,
    loading,
    fetchPosts,
    fetchMyPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    isLiked: (postId: string) => likedPosts.has(postId),
    getComments,
    addComment,
    deleteComment,
  };
}
