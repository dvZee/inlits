import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAudio } from "@/lib/audio-context";
import {
  Loader2,
  AlertCircle,
  Heart,
  Bookmark,
  Share2,
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  User,
  Clock,
  Headphones,
  BookOpen,
  Check,
  Reply,
} from "lucide-react";
import { formatTimeAgo, formatDate } from "@/lib/utils";
import { getTextLanguageClass } from "@/lib/utils";

interface AudioContent {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  price: number;
  narrator?: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
  };
  chapters: Array<{
    id: number;
    title: string;
    audio_url: string;
    duration: string;
  }>;
  type: "audiobook" | "podcast";
  created_at: string;
  view_count: number;
  avg_rating: number;
  total_ratings: number;
  user_rating?: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
  };
  likes: number;
  is_liked: boolean;
  replies?: Comment[];
}

export function PlayerPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const {
    setCurrentAudio,
    setPlayerVisible,
    setIsPlaying,
    playlist,
    currentTrackIndex,
    playNext,
    playPrevious,
    currentChapter,
    setCurrentChapter,
  } = useAudio();
  const [content, setContent] = useState<AudioContent | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">(
    "idle"
  );
  const [viewCount, setViewCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: number }>(
    {}
  );
  const [userCommentLikes, setUserCommentLikes] = useState<{
    [key: string]: boolean;
  }>({});

  // Track listening time for real listener counting
  const [listeningStartTime, setListeningStartTime] = useState<number | null>(
    null
  );
  const [hasCountedAsListener, setHasCountedAsListener] = useState(false);

  // Get content type and ID from the URL
  const [contentType, contentId] = id?.includes("-")
    ? [id.split("-")[0], id.substring(id.indexOf("-") + 1)]
    : [null, null];

  // Track audio play/pause for listener counting
  useEffect(() => {
    const handleAudioPlay = () => {
      if (!hasCountedAsListener) {
        setListeningStartTime(Date.now());
      }
    };

    const handleAudioPause = () => {
      if (listeningStartTime && !hasCountedAsListener) {
        const listeningDuration = Date.now() - listeningStartTime;
        if (listeningDuration >= 30000) {
          // 30 seconds
          recordRealListener();
        }
      }
    };

    // Listen for audio events from the audio player
    window.addEventListener("audio:play", handleAudioPlay);
    window.addEventListener("audio:pause", handleAudioPause);

    return () => {
      window.removeEventListener("audio:play", handleAudioPlay);
      window.removeEventListener("audio:pause", handleAudioPause);
    };
  }, [listeningStartTime, hasCountedAsListener]);

  const recordRealListener = async () => {
    if (!user || !contentId || !contentType || hasCountedAsListener) return;

    try {
      // Check if user already has a view record for this content
      const { data: existingView } = await supabase
        .from("content_views")
        .select("id")
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .eq("viewer_id", user.id)
        .maybeSingle();

      if (!existingView) {
        // Record the view (this will trigger the increment_view_count function)
        await supabase.from("content_views").insert({
          content_id: contentId,
          content_type: contentType,
          viewer_id: user.id,
          viewed_at: new Date().toISOString(),
          view_duration: "00:00:30", // Minimum 30 seconds
        });

        setHasCountedAsListener(true);
        setViewCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error recording real listener:", error);
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      if (!contentType || !contentId) return;

      try {
        setLoading(true);
        setError(null);

        let contentData;

        if (contentType === "audiobook") {
          const { data, error } = await supabase
            .from("audiobooks")
            .select(
              `
              *,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                username,
                avatar_url
              ),
              chapters:audiobook_chapters (
                id,
                title,
                audio_url,
                duration,
                "order"
              )
            `
            )
            .eq("id", contentId)
            .eq("status", "published")
            .single();

          if (error) throw error;
          contentData = { ...data, type: "audiobook" };
        } else if (contentType === "podcast") {
          const { data, error } = await supabase
            .from("podcast_episodes")
            .select(
              `
              *,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                username,
                avatar_url
              )
            `
            )
            .eq("id", contentId)
            .eq("status", "published")
            .single();

          if (error) throw error;
          contentData = {
            ...data,
            type: "podcast",
            chapters: data.audio_url
              ? [
                  {
                    id: 1,
                    title: data.title,
                    audio_url: data.audio_url,
                    duration: data.duration,
                  },
                ]
              : [],
          };
        }

        if (!contentData) throw new Error("Content not found");

        // Get stats and user interactions
        const [
          ratingsResult,
          userRatingResult,
          userLikeResult,
          userBookmarkResult,
        ] = await Promise.all([
          // Get all ratings
          supabase
            .from("ratings")
            .select("rating")
            .eq("content_id", contentId)
            .eq("content_type", contentType),

          // User specific data (if logged in)
          user
            ? supabase
                .from("ratings")
                .select("rating")
                .eq("content_id", contentId)
                .eq("content_type", contentType)
                .eq("user_id", user.id)
                .maybeSingle()
            : Promise.resolve({ data: null }),

          user
            ? supabase
                .from("ratings")
                .select("*")
                .eq("content_id", contentId)
                .eq("content_type", contentType)
                .eq("user_id", user.id)
                .eq("rating", 5)
                .maybeSingle()
            : Promise.resolve({ data: null }),

          user
            ? supabase
                .from("bookmarks")
                .select("*")
                .eq("content_id", contentId)
                .eq("content_type", contentType)
                .eq("user_id", user.id)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        // Process results
        const ratings = ratingsResult.data || [];
        const likesCount = ratings.filter((r) => r.rating === 5).length;

        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        // Use view_count from the content table (updated by database trigger)
        setViewCount(contentData.view_count || 0);

        // Sort chapters by order
        if (contentData.chapters) {
          contentData.chapters.sort((a: any, b: any) => a.order - b.order);
        }

        const processedContent: AudioContent = {
          ...contentData,
          view_count: contentData.view_count || 0,
          avg_rating: avgRating,
          total_ratings: ratings.length,
          user_rating: userRatingResult.data?.rating || 0,
          is_liked: !!userLikeResult.data,
          is_bookmarked: !!userBookmarkResult.data,
        };

        setContent(processedContent);
        setUserRating(processedContent.user_rating);
        setIsLiked(processedContent.is_liked);
        setIsBookmarked(processedContent.is_bookmarked);
        setLikeCount(likesCount);

        const isPremium = profile?.subscription_status === 'active' || profile?.role === 'creator';
        const isLockedAudiobook = contentType === "audiobook" && currentChapter > 0 && !isPremium;

        // Set up audio player
        setCurrentAudio({
          title: contentData.title,
          author: contentData.author.name,
          authorId: contentData.author.id,
          authorUsername: contentData.author.username,
          thumbnail:
            contentData.cover_url ||
            `https://source.unsplash.com/random/800x800?${contentType}&sig=${contentId}`,
          contentUrl: `/player/${contentType}-${contentId}`,
          chapters: contentData.chapters,
          type: contentType as "audiobook" | "podcast",
          audioUrl: contentData.chapters?.[0]?.audio_url,
          currentTime: 0,
        });
        setCurrentChapter(0);
        setPlayerVisible(true);
        setIsPlaying(!isLockedAudiobook);
      } catch (err) {
        console.error("Error loading content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentType, contentId, user, profile, currentChapter, setCurrentAudio, setPlayerVisible, setIsPlaying, setCurrentChapter]);

  // Load comments with likes data
  useEffect(() => {
    const loadComments = async () => {
      if (!contentId || !contentType) return;

      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            user_id,
            parent_id,
            user:profiles!comments_user_id_fkey (
              id,
              name,
              username,
              avatar_url
            )
          `
          )
          .eq("content_id", contentId)
          .eq("content_type", contentType)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;

        if (commentsData && commentsData.length > 0) {
          // Load comment likes from localStorage with content-specific keys
          if (user) {
            try {
              const savedLikes = localStorage.getItem(
                `comment_likes_${user.id}_${contentId}`
              );
              const savedLikeCounts = localStorage.getItem(
                `comment_like_counts_${contentId}`
              );

              if (savedLikes) {
                const parsedLikes = JSON.parse(savedLikes);
                setUserCommentLikes(parsedLikes);
              }
              if (savedLikeCounts) {
                const parsedCounts = JSON.parse(savedLikeCounts);
                setCommentLikes(parsedCounts);
              }
            } catch (error) {
              console.error(
                "Error loading comment likes from localStorage:",
                error
              );
            }
          }

          const formattedComments: Comment[] = commentsData
            .filter((comment) => !comment.parent_id) // Only top-level comments
            .map((comment) => {
              const profile = comment.user;
              const replies = commentsData
                .filter((reply) => reply.parent_id === comment.id)
                .map((reply) => {
                  const replyProfile = reply.user;
                  return {
                    id: reply.id,
                    content: reply.content,
                    created_at: reply.created_at,
                    parent_id: reply.parent_id,
                    user: {
                      id: replyProfile?.id || reply.user_id,
                      name:
                        replyProfile?.name ||
                        replyProfile?.username ||
                        "Anonymous",
                      username: replyProfile?.username || "anonymous",
                      avatar_url:
                        replyProfile?.avatar_url ||
                        `https://source.unsplash.com/random/100x100?face&sig=${reply.user_id}`,
                    },
                    likes: commentLikes[reply.id] || 0,
                    is_liked: userCommentLikes[reply.id] || false,
                  };
                });

              return {
                id: comment.id,
                content: comment.content,
                created_at: comment.created_at,
                user: {
                  id: profile?.id || comment.user_id,
                  name: profile?.name || profile?.username || "Anonymous",
                  username: profile?.username || "anonymous",
                  avatar_url:
                    profile?.avatar_url ||
                    `https://source.unsplash.com/random/100x100?face&sig=${comment.user_id}`,
                },
                likes: commentLikes[comment.id] || 0,
                is_liked: userCommentLikes[comment.id] || false,
                replies,
              };
            });

          setComments(formattedComments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        setComments([]);
      }
    };

    loadComments();
  }, [contentId, contentType, user]);

  const handleLike = async () => {
    if (!user || !content) {
      navigate("/signin");
      return;
    }

    try {
      const newLikedState = !isLiked;

      // Optimistic update
      setIsLiked(newLikedState);
      setLikeCount((prev) =>
        newLikedState ? prev + 1 : Math.max(0, prev - 1)
      );

      if (!newLikedState) {
        // Remove like
        await supabase
          .from("ratings")
          .delete()
          .eq("content_id", content.id)
          .eq("content_type", content.type)
          .eq("user_id", user.id)
          .eq("rating", 5);
      } else {
        // Check if rating already exists
        const { data: existingRating } = await supabase
          .from("ratings")
          .select("id")
          .eq("content_id", content.id)
          .eq("content_type", content.type)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingRating) {
          // Update existing rating
          const { error } = await supabase
            .from("ratings")
            .update({ rating: 5 })
            .eq("id", existingRating.id);

          if (error) throw error;
        } else {
          // Insert new rating
          const { error } = await supabase.from("ratings").insert({
            content_id: content.id,
            content_type: content.type,
            user_id: user.id,
            rating: 5,
          });

          if (error) throw error;
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setIsLiked(!newLikedState);
      setLikeCount((prev) =>
        !newLikedState ? prev + 1 : Math.max(0, prev - 1)
      );
    }
  };

  const handleBookmark = async () => {
    if (!user || !content) {
      navigate("/signin");
      return;
    }

    try {
      const newBookmarkedState = !isBookmarked;

      // Optimistic update
      setIsBookmarked(newBookmarkedState);

      if (!newBookmarkedState) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("content_id", content.id)
          .eq("content_type", content.type)
          .eq("user_id", user.id);
      } else {
        await supabase.from("bookmarks").insert({
          content_id: content.id,
          content_type: content.type,
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert optimistic update on error
      setIsBookmarked(!newBookmarkedState);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = content?.title || "";
    const text = `Listen to "${title}" by ${content?.author.name}`;
    let finalStatus: "idle" | "copied" | "shared" = "idle";

    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          finalStatus = "shared";
        } catch (shareError) {
          // If share fails (e.g., Permission denied), fall back to clipboard
          if (shareError instanceof Error && shareError.name !== "AbortError") {
            await navigator.clipboard.writeText(url);
            finalStatus = "copied";
          }
        }
      } else {
        await navigator.clipboard.writeText(url);
        finalStatus = "copied";
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    } finally {
      if (finalStatus !== "idle") {
        setShareStatus(finalStatus);
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !content) {
      navigate("/signin");
      return;
    }

    try {
      setUserRating(rating);

      // Check if rating already exists
      const { data: existingRating } = await supabase
        .from("ratings")
        .select("id, rating")
        .eq("content_id", content.id)
        .eq("content_type", content.type)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("ratings")
          .update({ rating: rating })
          .eq("id", existingRating.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase.from("ratings").insert({
          content_id: content.id,
          content_type: content.type,
          user_id: user.id,
          rating: rating,
        });

        if (error) throw error;
      }

      // Update content rating
      setContent((prev) =>
        prev
          ? {
              ...prev,
              user_rating: rating,
              total_ratings: prev.user_rating
                ? prev.total_ratings
                : prev.total_ratings + 1,
              avg_rating: prev.user_rating
                ? (prev.avg_rating * prev.total_ratings -
                    prev.user_rating +
                    rating) /
                  prev.total_ratings
                : (prev.avg_rating * prev.total_ratings + rating) /
                  (prev.total_ratings + 1),
            }
          : null
      );
    } catch (error) {
      console.error("Error rating content:", error);
      setUserRating(content.user_rating);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content || !newComment.trim()) return;

    try {
      setSubmittingComment(true);

      const { data: commentData, error } = await supabase
        .from("comments")
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          content_id: content.id,
          content_type: content.type,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Get user profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, name, username, avatar_url")
        .eq("id", user.id)
        .single();

      const newCommentObj: Comment = {
        id: commentData.id,
        content: commentData.content,
        created_at: commentData.created_at,
        user: {
          id: user.id,
          name: userProfile?.name || userProfile?.username || "Anonymous",
          username: userProfile?.username || "anonymous",
          avatar_url:
            userProfile?.avatar_url ||
            `https://source.unsplash.com/random/100x100?face&sig=${user.id}`,
        },
        likes: 0,
        is_liked: false,
        replies: [],
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    try {
      const isCurrentlyLiked = userCommentLikes[commentId] || false;
      const currentLikes = commentLikes[commentId] || 0;

      const newLikedState = !isCurrentlyLiked;
      const newLikeCount = newLikedState
        ? currentLikes + 1
        : Math.max(0, currentLikes - 1);

      // Optimistic update
      const updatedUserLikes = {
        ...userCommentLikes,
        [commentId]: newLikedState,
      };
      const updatedCommentLikes = {
        ...commentLikes,
        [commentId]: newLikeCount,
      };

      setUserCommentLikes(updatedUserLikes);
      setCommentLikes(updatedCommentLikes);

      // Persist to localStorage with content-specific keys (non-blocking)
      setTimeout(() => {
        try {
          localStorage.setItem(
            `comment_likes_${user.id}_${contentId}`,
            JSON.stringify(updatedUserLikes)
          );
          localStorage.setItem(
            `comment_like_counts_${contentId}`,
            JSON.stringify(updatedCommentLikes)
          );
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }, 0);

      // TODO: When comment_likes table is implemented, save to database here
      console.log(`${newLikedState ? "Liked" : "Unliked"} comment:`, commentId);
    } catch (error) {
      console.error("Error liking comment:", error);
      // Revert optimistic update
      setUserCommentLikes(userCommentLikes);
      setCommentLikes(commentLikes);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const handleReplySubmit = async (
    e: React.FormEvent,
    parentCommentId: string
  ) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;

    try {
      setSubmittingReply(true);

      const { data: replyData, error } = await supabase
        .from("comments")
        .insert({
          content: replyContent.trim(),
          user_id: user.id,
          content_id: content!.id,
          content_type: content!.type,
          parent_id: parentCommentId,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Get user profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, name, username, avatar_url")
        .eq("id", user.id)
        .single();

      const newReply: Comment = {
        id: replyData.id,
        content: replyData.content,
        created_at: replyData.created_at,
        parent_id: parentCommentId,
        user: {
          id: user.id,
          name: userProfile?.name || userProfile?.username || "Anonymous",
          username: userProfile?.username || "anonymous",
          avatar_url:
            userProfile?.avatar_url ||
            `https://source.unsplash.com/random/100x100?face&sig=${user.id}`,
        },
        likes: 0,
        is_liked: false,
      };

      // Add reply to the parent comment
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );

      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleProfileClick = (userId: string, username: string) => {
    navigate(`/user/${username}`);
  };

  if (!contentType || !contentId) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading {contentType}...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Content not found</h1>
          <p className="text-muted-foreground">
            {error ||
              "The content you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column - Content Info */}
          <div className="space-y-6">
            {/* Book Cover with Audio Waves - Centered */}
            <div className="flex justify-center">
              <div className="flex items-center gap-3 sm:gap-6">
                {/* Left Audio Waves */}
                <div className="hidden sm:flex items-center gap-1">
                  {[8, 12, 26, 34, 46, 58].map((height, i) => (
                    <div
                      key={`left-${i}`}
                      className="w-1 bg-primary/70 rounded-full animate-pulse"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: `${1.8 + i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Book Cover - Responsive size */}
                <div className="w-64 h-42 rounded-xl overflow-hidden shadow-2xl bg-muted">
                  <img
                    src={
                      content.cover_url ||
                      `https://source.unsplash.com/random/800x500?${contentType}&sig=${contentId}`
                    }
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Audio Waves */}
                <div className="hidden sm:flex items-center gap-1">
                  {[58, 42, 34, 26, 12, 8].map((height, i) => (
                    <div
                      key={`right-${i}`}
                      className="w-1 bg-primary/70 rounded-full animate-pulse"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.15 + 0.6}s`,
                        animationDuration: `${1.8 + i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className={`text-center lg:text-left px-4 lg:px-0`}>
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground reader-title ${getTextLanguageClass(
                  content.title
                )}`}
              >
                {content.title}
              </h1>
            </div>

            {/* Creator Info & Actions - Same Line */}
            <div className="flex items-center justify-between gap-3 px-4 lg:px-0">
              {/* Creator Info - Mobile: Only avatar, Desktop: Full info */}
              <button
                onClick={() =>
                  handleProfileClick(content.author.id, content.author.username)
                }
                className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-background shadow-lg flex-shrink-0">
                  <img
                    src={
                      content.author.avatar_url ||
                      `https://source.unsplash.com/random/100x100?face&sig=${content.author.id}`
                    }
                    alt={content.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {content.author.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">
                    @{content.author.username}
                  </p>
                </div>
              </button>

              {/* Action Buttons - Compact */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-xs sm:text-sm ${
                    isLiked
                      ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  title="Like"
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span className="font-medium">{likeCount || 0}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className={`p-1.5 rounded-lg transition-all ${
                    isBookmarked
                      ? "text-primary bg-primary/10"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  title="Save"
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Publishing Details & Metadata */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4 lg:px-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Published {formatTimeAgo(content.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{content.chapters?.length || 0} chapters</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>{viewCount.toLocaleString()} listeners</span>
              </div>
            </div>
            <hr />
            {/* Description */}
            <div className={`px-4 lg:px-0`}>
              <p
                className={`text-sm sm:text-base text-muted-foreground leading-relaxed reader-content ${getTextLanguageClass(
                  content.description
                )}`}
              >
                {content.description}
              </p>
            </div>
          </div>

          {/* Right Column - Reviews & Discussions */}
          <div className="space-y-6">
            {/* Playlist/Queue Section */}
            {playlist.length > 1 && (
              <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm mx-4 lg:mx-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Queue</h3>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {playlist.length} tracks
                  </span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {playlist.map((track, index) => {
                    const isCurrent = currentTrackIndex === index;
                    return (
                      <button
                        key={`${track.type}-${track.id}`}
                        onClick={() => {
                          // Just navigate to the track, don't use playAudio
                          window.location.href = track.contentUrl;
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/48x48?text=Track";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium line-clamp-1 text-sm">
                            {track.title}
                          </div>
                          <div className="text-xs opacity-70 line-clamp-1">
                            {track.author}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {isCurrent && (
                            <div className="flex items-center gap-1">
                              <div
                                className="w-1 h-3 bg-current rounded-full animate-pulse"
                                style={{ animationDelay: "0s" }}
                              />
                              <div
                                className="w-1 h-4 bg-current rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <div
                                className="w-1 h-3 bg-current rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </div>
                          )}
                          <span className="text-xs opacity-50">
                            {index + 1}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm mx-4 lg:mx-0">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                Rate this {contentType}
              </h3>

              {/* Overall Rating Display */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-xl sm:text-2xl font-bold">
                    {(content.avg_rating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(content.avg_rating || 0)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  ({(content.total_ratings || 0).toLocaleString()}{" "}
                  {(content.total_ratings || 0) === 1 ? "rating" : "ratings"})
                </span>
              </div>

              {/* User Rating */}
              {user ? (
                <div>
                  <p className="text-xs sm:text-sm font-medium mb-3">
                    Your rating:
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            i < (hoverRating || userRating)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground hover:text-yellow-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 sm:py-4">
                  <button
                    onClick={() => navigate("/signin")}
                    className="text-xs sm:text-sm text-primary hover:underline"
                  >
                    Sign in to rate this {contentType}
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm mx-4 lg:mx-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-6">
                <h3 className="text-base sm:text-lg font-semibold">
                  Discussions
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {comments.reduce(
                      (total, comment) =>
                        total + 1 + (comment.replies?.length || 0),
                      0
                    )}{" "}
                    {comments.reduce(
                      (total, comment) =>
                        total + 1 + (comment.replies?.length || 0),
                      0
                    ) === 1
                      ? "comment"
                      : "comments"}
                  </span>
                </div>
              </div>

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleComment} className="mb-4 sm:mb-6">
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Share your thoughts about this ${contentType}...`}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm rounded-lg border bg-background resize-none min-h-[80px] sm:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-6 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Join the discussion
                  </p>
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Sign in to comment
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      {/* Main Comment */}
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={() =>
                            handleProfileClick(
                              comment.user.id,
                              comment.user.username
                            )
                          }
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={comment.user.avatar_url}
                            alt={comment.user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = `https://source.unsplash.com/random/100x100?face&sig=${comment.user.id}`;
                            }}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                            <button
                              onClick={() =>
                                handleProfileClick(
                                  comment.user.id,
                                  comment.user.username
                                )
                              }
                              className="font-medium text-xs sm:text-sm truncate hover:text-primary transition-colors text-left"
                            >
                              {comment.user.name}
                            </button>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground mb-2 sm:mb-3 leading-relaxed break-words">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              disabled={!user}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                userCommentLikes[comment.id]
                                  ? "text-primary"
                                  : user
                                  ? "text-muted-foreground hover:text-primary"
                                  : "text-muted-foreground opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <ThumbsUp
                                className={`w-4 h-4 ${
                                  userCommentLikes[comment.id]
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                              <span>
                                {commentLikes[comment.id] || comment.likes}
                              </span>
                            </button>
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!user}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                user
                                  ? "text-muted-foreground hover:text-primary"
                                  : "text-muted-foreground opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <Reply className="w-4 h-4" />
                              Reply
                            </button>
                          </div>

                          {/* Reply Form */}
                          {replyingTo === comment.id && (
                            <div className="mt-4 flex gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={
                                    user?.user_metadata?.avatar_url ||
                                    `https://source.unsplash.com/random/100x100?face&sig=${user?.id}`
                                  }
                                  alt="Your avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <form
                                  onSubmit={(e) =>
                                    handleReplySubmit(e, comment.id)
                                  }
                                >
                                  <textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                      setReplyContent(e.target.value)
                                    }
                                    placeholder="Write a reply..."
                                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent("");
                                      }}
                                      className="px-2 py-1 text-xs rounded-lg border hover:bg-accent transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={
                                        !replyContent.trim() || submittingReply
                                      }
                                      className="px-2 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                      {submittingReply ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          Posting...
                                        </>
                                      ) : (
                                        "Reply"
                                      )}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex gap-2 ml-4 pl-4 border-l-2 border-muted"
                                >
                                  <button
                                    onClick={() =>
                                      handleProfileClick(
                                        reply.user.id,
                                        reply.user.username
                                      )
                                    }
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex-shrink-0 hover:opacity-80 transition-opacity"
                                  >
                                    <img
                                      src={reply.user.avatar_url}
                                      alt={reply.user.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const img =
                                          e.target as HTMLImageElement;
                                        img.src = `https://source.unsplash.com/random/100x100?face&sig=${reply.user.id}`;
                                      }}
                                    />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <button
                                        onClick={() =>
                                          handleProfileClick(
                                            reply.user.id,
                                            reply.user.username
                                          )
                                        }
                                        className="font-medium text-xs sm:text-sm hover:text-primary transition-colors"
                                      >
                                        {reply.user.name}
                                      </button>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm mb-2 leading-relaxed">
                                      {reply.content}
                                    </p>
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={() =>
                                          handleCommentLike(reply.id)
                                        }
                                        disabled={!user}
                                        className={`flex items-center gap-1 text-xs transition-colors ${
                                          userCommentLikes[reply.id]
                                            ? "text-primary"
                                            : user
                                            ? "text-muted-foreground hover:text-primary"
                                            : "text-muted-foreground opacity-50 cursor-not-allowed"
                                        }`}
                                      >
                                        <ThumbsUp
                                          className={`w-3 h-3 ${
                                            userCommentLikes[reply.id]
                                              ? "fill-current"
                                              : ""
                                          }`}
                                        />
                                        <span>
                                          {commentLikes[reply.id] ||
                                            reply.likes}
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => handleReply(reply.id)}
                                        disabled={!user}
                                        className={`flex items-center gap-1 text-xs transition-colors ${
                                          user
                                            ? "text-muted-foreground hover:text-primary"
                                            : "text-muted-foreground opacity-50 cursor-not-allowed"
                                        }`}
                                      >
                                        <Reply className="w-3 h-3" />
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium mb-2">
                      No comments yet
                    </p>
                    <p className="text-xs sm:text-sm">
                      Be the first to share your thoughts about this{" "}
                      {contentType}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Status Toast */}
      {shareStatus !== "idle" && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-popover border rounded-lg shadow-lg text-sm flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-green-500" />
          <span>
            {shareStatus === "copied"
              ? "Link copied to clipboard"
              : "Shared successfully"}
          </span>
        </div>
      )}
    </div>
  );
}
