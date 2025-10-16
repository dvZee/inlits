import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  ChevronUp,
  Send,
  Loader2,
  ThumbsUp,
  Reply
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { detectUrduText, getTextLanguageClass, formatDate, formatTimeAgo } from '@/lib/utils';

interface ArticleReaderProps {
  article: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar: string;
      username?: string;
    };
    publishedAt: string;
    readTime: string;
    claps: number;
    comments: ArticleComment[];
    category?: string;
    cover_url?: string;
  };
}

interface ArticleComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parent_id?: string | null;
  replies?: ArticleComment[];
}

export function ArticleReader({ article }: ArticleReaderProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.claps);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentLikes, setCommentLikes] = useState<{[key: string]: number}>({});
  const [userCommentLikes, setUserCommentLikes] = useState<{[key: string]: boolean}>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [totalCommentCount, setTotalCommentCount] = useState(article.comments?.length || 0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const isBrowser = typeof window !== 'undefined';
  const [isMobile, setIsMobile] = useState(
    () => (isBrowser ? window.innerWidth < 768 : false)
  );

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isBrowser]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      
      try {
        // Get current like count from database
        const { data: likesData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('content_id', article.id)
          .eq('content_type', 'article')
          .eq('rating', 5);
        
        const currentLikeCount = likesData?.length || 0;
        setLikeCount(currentLikeCount);
        
        // Check if user has liked this article
        const { data: likeData } = await supabase
          .from('ratings')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_id', article.id)
          .eq('content_type', 'article')
          .maybeSingle();
        
        setIsLiked(!!likeData);

        // Check if user has bookmarked this article
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_id', article.id)
          .eq('content_type', 'article')
          .maybeSingle();
        
        setIsBookmarked(!!bookmarkData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, [user, article.id]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        // Get total like count from database
        const { data: likesData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('content_id', article.id)
          .eq('content_type', 'article')
          .eq('rating', 5);
        
        const currentLikeCount = likesData?.length || 0;
        setLikeCount(currentLikeCount);

        // Fetch comments with basic data only
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            parent_id
          `)
          .eq('content_id', article.id)
          .eq('content_type', 'article')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading comments:', error);
          return;
        }

        if (commentsData && commentsData.length > 0) {
          // Get unique user IDs
          const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
          
          // Fetch user profiles separately
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .in('id', userIds);

          if (profilesError) {
            console.error('Error loading profiles:', profilesError);
            return;
          }

          // Create a map of user profiles
          const profilesMap = new Map();
          profilesData?.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });

          // Load comment likes from database (if we had a comment_likes table)
          // For now, we'll use localStorage as fallback
          let commentLikesData: Record<string, number> = {};
          let userCommentLikesData: Record<string, boolean> = {};
          
          if (user) {
            try {
              const savedLikes = localStorage.getItem(`comment_likes_${user.id}_${article.id}`);
              const savedCounts = localStorage.getItem(`comment_like_counts_${article.id}`);
              
              if (savedLikes) {
                userCommentLikesData = JSON.parse(savedLikes) as Record<string, boolean>;
              }
              if (savedCounts) {
                commentLikesData = JSON.parse(savedCounts) as Record<string, number>;
              }
            } catch (error) {
              console.error('Error loading comment likes from localStorage:', error);
            }
          }

          setUserCommentLikes(userCommentLikesData);
          setCommentLikes(commentLikesData);
          const formattedComments = commentsData.map(comment => {
            const profile = profilesMap.get(comment.user_id);
            return {
              id: comment.id,
              content: comment.content,
              createdAt: comment.created_at,
              parent_id: comment.parent_id,
              author: {
                id: profile?.id || comment.user_id,
                name: profile?.name || profile?.username || 'Anonymous',
                avatar: profile?.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${comment.user_id}`,
                username: profile?.username
              },
              likes: commentLikesData[comment.id] || 0
            };
          });
          
          // Separate top-level comments and replies
          const topLevelComments = formattedComments.filter(c => !c.parent_id);
          const replies = formattedComments.filter(c => c.parent_id);
          
          // Add replies to their parent comments
          const commentsWithReplies = topLevelComments.map(comment => ({
            ...comment,
            replies: replies.filter(reply => reply.parent_id === comment.id)
          }));
          
          setComments(commentsWithReplies);
          
          // Calculate total comment count (including replies)
          const totalCount = formattedComments.length;
          setTotalCommentCount(totalCount);
        } else {
          setComments([]);
          setTotalCommentCount(0);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();
  }, [article.id, user]);

  // Handle scroll for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollToTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      if (isLiked) {
        // Unlike - remove rating
        const { error } = await supabase
          .from('ratings')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', article.id)
          .eq('content_type', 'article');

        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like - add rating
        const { error } = await supabase
          .from('ratings')
          .insert({
            user_id: user.id,
            content_id: article.id,
            content_type: 'article',
            rating: 5
          });

        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', article.id)
          .eq('content_type', 'article');

        if (error) throw error;
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            content_id: article.id,
            content_type: 'article'
          });

        if (error) throw error;
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleShare = async (platform?: string) => {
    try {
      const url = window.location.href;
      const title = article.title;
      const text = `Check out "${title}" by ${article.author.name}`;
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } else if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 2000);
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
      
      setShowShareMenu(false);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setCommentError(null);
      setCommentSuccess(false);
      
      // Insert comment without trying to fetch profile data
      const { data: newCommentData, error: commentInsertError } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          content_id: article.id,
          content_type: 'article',
          parent_id: null
        })
        .select('id, content, created_at, user_id')
        .single();

      if (commentInsertError) throw commentInsertError;

      // Fetch user profile separately
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        // Use fallback data
      }

      const profile = userProfile || {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        username: user.user_metadata?.username,
        avatar_url: user.user_metadata?.avatar_url
      };

      // Create new comment object
      const newCommentObj: ArticleComment = {
        id: newCommentData.id,
        content: newCommentData.content,
        createdAt: newCommentData.created_at,
        parent_id: null,
        author: {
          id: profile.id,
          name: profile.name || profile.username || 'Anonymous',
          avatar: profile.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${profile.id}`,
          username: profile.username
        },
        likes: 0,
        replies: []
      };

      // Add to comments list
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      setCommentSuccess(true);
      setTotalCommentCount(prev => prev + 1);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentError('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      const isCurrentlyLiked = userCommentLikes[commentId] || false;
      const currentLikes = commentLikes[commentId] || 0;
      
      const newLikedState = !isCurrentlyLiked;
      const newLikeCount = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);
      
      // Optimistic update
      const updatedUserLikes = {
        ...userCommentLikes,
        [commentId]: newLikedState
      };
      const updatedCommentLikes = {
        ...commentLikes,
        [commentId]: newLikeCount
      };
      
      setUserCommentLikes(updatedUserLikes);
      setCommentLikes(updatedCommentLikes);
      
      // Persist to localStorage immediately
      try {
        localStorage.setItem(`comment_likes_${user.id}_${article.id}`, JSON.stringify(updatedUserLikes));
        localStorage.setItem(`comment_like_counts_${article.id}`, JSON.stringify(updatedCommentLikes));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      // TODO: When comment_likes table is implemented, save to database here
      console.log(`${newLikedState ? 'Liked' : 'Unliked'} comment:`, commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update
      setUserCommentLikes(userCommentLikes);
      setCommentLikes(commentLikes);
    }
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
    setReplyError(null);
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) {
      setReplyError('Reply content is required');
      return;
    }

    try {
      setSubmittingReply(true);
      setReplyError(null);
      
      // Insert reply
      const { data: replyData, error: replyError } = await supabase
        .from('comments')
        .insert({
          content: replyContent.trim(),
          user_id: user.id,
          content_id: article.id,
          content_type: 'article',
          parent_id: commentId
        })
        .select('id, content, created_at, user_id')
        .single();

      if (replyError) throw replyError;

      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .eq('id', user.id)
        .single();

      const profile = userProfile || {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        username: user.user_metadata?.username,
        avatar_url: user.user_metadata?.avatar_url
      };

      // Create reply object
      const newReply = {
        id: replyData.id,
        content: replyData.content,
        createdAt: replyData.created_at,
        parent_id: commentId,
        author: {
          id: profile.id,
          name: profile.name || profile.username || 'Anonymous',
          avatar: profile.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${profile.id}`,
          username: profile.username
        },
        likes: 0
      };

      // Add reply to the parent comment
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      
      // Update total comment count
      setTotalCommentCount(prev => prev + 1);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting reply:', error);
      setReplyError('Failed to post reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Detect if content is in Urdu using the utility function
  const isUrduContent = detectUrduText(article.content);
  const titleLanguageClass = getTextLanguageClass(article.title);
  const contentLanguageClass = getTextLanguageClass(article.content);

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="container max-w-3xl mx-auto px-4 py-8 overflow-x-hidden">
        {/* Category */}
        {article.category && (
          <div className="mb-6">
            <span className="text-sm text-primary font-medium uppercase tracking-wide">
              {article.category}
            </span>
          </div>
        )}
        
        {/* Title */}
        <h1 className={`text-3xl md:text-5xl font-bold mb-8 leading-tight text-foreground reader-title break-words overflow-hidden ${titleLanguageClass}`}>
          {article.title}
        </h1>

        {/* Creator Details, Time, and Save Button */}
        <div className="flex items-center justify-between mb-8 gap-4 overflow-hidden">
          <Link 
            to={`/user/${article.author.username || article.author.id}`}
            className="flex items-center gap-3 group hover:text-primary transition-colors min-w-0 flex-1"
          >
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-muted bg-muted flex-shrink-0"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = `https://source.unsplash.com/random/100x100?face&sig=${article.author.id}`;
              }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                {article.author.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
                <span>{formatDate(article.publishedAt)}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </Link>
          
          {/* Bookmark button */}
          <button
            onClick={handleBookmark}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-white bg-primary' 
                : 'hover:bg-primary hover:text-white'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Cover Image */}
        {article.cover_url && (
          <div className="mb-12 rounded-lg overflow-hidden max-w-full">
            <img
              src={article.cover_url}
              alt={article.title}
              className="w-full h-auto object-cover max-w-full"
            />
          </div>
        )}

        {/* Article Content */}
        <article 
          ref={contentRef}
          className={`prose prose-xl max-w-none mb-16 reader-content break-words overflow-x-hidden ${contentLanguageClass}`}
          style={{ 
            width: '100%', 
            maxWidth: '100%', 
            boxSizing: 'border-box',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            overflowX: 'hidden'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Social Actions */}
        <div className="flex items-center justify-center gap-4 md:gap-8 py-8 border-t border-b mb-12 overflow-hidden">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-full transition-all ${
              isLiked 
                ? 'text-white bg-primary' 
                : user
                  ? 'hover:bg-primary hover:text-white'
                  : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium text-sm md:text-base">{likeCount}</span>
          </button>

          <button
            onClick={scrollToComments}
            className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">{totalCommentCount}</span>
          </button>

          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium text-sm md:text-base hidden sm:inline">Share</span>
            </button>

            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-popover border rounded-lg shadow-lg p-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors"
                >
                  {shareStatus === 'copied' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {shareStatus === 'copied' ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <section ref={commentsRef} className="space-y-8">
          <h2 className="text-2xl font-bold">Responses ({totalCommentCount})</h2>
          
          {commentSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg">
              Comment posted successfully!
            </div>
          )}
          
          {user ? (
            <form onSubmit={handleComment} className="space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={user.user_metadata?.avatar_url || profile?.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${user.id}`}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover bg-muted border"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = `https://source.unsplash.com/random/100x100?face&sig=${user.id}`;
                  }}
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full px-4 py-3 rounded-lg border bg-background resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  {commentError && (
                    <p className="mt-2 text-sm text-destructive">{commentError}</p>
                  )}
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submittingComment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Respond
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-lg p-8 text-center bg-muted/30">
              <p className="mb-4 text-lg">Join the conversation</p>
              <Link 
                to="/signin" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Sign in to respond
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full object-cover bg-muted border"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = `https://source.unsplash.com/random/100x100?face&sig=${comment.author.id}`;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{comment.author.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mb-3 leading-relaxed break-words">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleCommentLike(comment.id)}
                      disabled={!user}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        userCommentLikes[comment.id]
                          ? 'text-primary'
                          : user
                            ? 'text-muted-foreground hover:text-primary'
                            : 'text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${userCommentLikes[comment.id] ? 'fill-current' : ''}`} />
                      <span>{commentLikes[comment.id] || comment.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleReply(comment.id)}
                      disabled={!user}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        user 
                          ? 'text-muted-foreground hover:text-primary' 
                          : 'text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 flex gap-3">
                      <img
                        src={user?.user_metadata?.avatar_url || profile?.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${user?.id}`}
                        alt="Your avatar"
                        className="w-8 h-8 rounded-full object-cover bg-muted border"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = `https://source.unsplash.com/random/100x100?face&sig=${user?.id}`;
                        }}
                      />
                      <div className="flex-1">
                        <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                          {replyError && (
                            <p className="mt-1 text-xs text-destructive">{replyError}</p>
                          )}
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                                setReplyError(null);
                              }}
                              className="px-3 py-1 text-sm rounded-lg border hover:bg-accent transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!replyContent.trim() || submittingReply}
                              className="px-3 py-1 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {submittingReply ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                'Reply'
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Display Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 ml-8 pl-4 border-l-2 border-muted">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            className="w-8 h-8 rounded-full object-cover bg-muted border"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = `https://source.unsplash.com/random/100x100?face&sig=${reply.author.id}`;
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm">{reply.author.name}</h5>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm mb-2 leading-relaxed break-words">{reply.content}</p>
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => handleCommentLike(reply.id)}
                                disabled={!user}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  userCommentLikes[reply.id]
                                    ? 'text-primary'
                                    : user
                                      ? 'text-muted-foreground hover:text-primary'
                                      : 'text-muted-foreground opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${userCommentLikes[reply.id] ? 'fill-current' : ''}`} />
                                <span>{commentLikes[reply.id] || reply.likes}</span>
                              </button>
                              <button 
                                onClick={() => handleReply(reply.id)}
                                disabled={!user}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  user 
                                    ? 'text-muted-foreground hover:text-primary' 
                                    : 'text-muted-foreground opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <Reply className="w-3 h-3" />
                                Reply
                              </button>
                            </div>
                            
                            {/* Reply to Reply Form */}
                            {replyingTo === reply.id && (
                              <div className="mt-3 flex gap-2">
                                <img
                                  src={user?.user_metadata?.avatar_url || profile?.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${user?.id}`}
                                  alt="Your avatar"
                                  className="w-6 h-6 rounded-full object-cover bg-muted border"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = `https://source.unsplash.com/random/100x100?face&sig=${user?.id}`;
                                  }}
                                />
                                <div className="flex-1">
                                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                                    <textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Write a reply..."
                                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
                                      required
                                    />
                                    {replyError && (
                                      <p className="mt-1 text-xs text-destructive">{replyError}</p>
                                    )}
                                    <div className="flex justify-end gap-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent('');
                                          setReplyError(null);
                                        }}
                                        className="px-2 py-1 text-xs rounded-lg border hover:bg-accent transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={!replyContent.trim() || submittingReply}
                                        className="px-2 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {submittingReply ? (
                                          <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Posting...
                                          </>
                                        ) : (
                                          'Reply'
                                        )}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No responses yet</p>
                <p className="text-sm">Be the first to share your thoughts</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Sidebar - Desktop only, positioned on right */}
      {!isMobile && (
        <div className="fixed top-1/2 -translate-y-1/2 right-8 z-30">
          <div className="flex flex-col gap-4 p-3 rounded-full border shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`p-3 rounded-full transition-all relative group ${
                isLiked 
                  ? 'text-white bg-primary' 
                  : user 
                    ? 'hover:bg-primary hover:text-white' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {likeCount} likes
              </div>
            </button>

            <button
              onClick={scrollToComments}
              className="p-3 rounded-full hover:bg-primary hover:text-white transition-colors relative group"
            >
              <MessageSquare className="w-5 h-5" />
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {totalCommentCount} responses
              </div>
            </button>

            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-3 rounded-full hover:bg-primary hover:text-white transition-colors relative group"
            >
              <Share2 className="w-5 h-5" />
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Share article
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Actions Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 border-t p-4 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isLiked 
                  ? 'text-white bg-primary' 
                  : user 
                    ? 'hover:bg-primary hover:text-white' 
                    : 'opacity-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{likeCount}</span>
            </button>

            <button
              onClick={scrollToComments}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">{totalCommentCount}</span>
            </button>

            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Share</span>
            </button>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-40 bg-background border hover:bg-primary hover:text-white ${
            isMobile ? 'bottom-24 right-6' : 'bottom-6 right-6'
          }`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Share Status Toast */}
      {shareStatus === 'copied' && (
        <div className={`fixed left-1/2 -translate-x-1/2 px-4 py-2 bg-background border rounded-lg shadow-lg text-sm flex items-center gap-2 z-50 ${
          isMobile ? 'bottom-24' : 'bottom-6'
        }`}>
          <Check className="w-4 h-4 text-green-500" />
          <span>Link copied to clipboard</span>
        </div>
      )}
    </div>
  );
}
