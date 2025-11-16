import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { u as useAuth, h as useAudio, g as getTextLanguageClass, f as formatTimeAgo, e as formatDate, s as supabase } from "./server-build-CQlMvEI0.js";
import { Loader2, AlertCircle, Heart, Bookmark, Share2, Clock, BookOpen, Headphones, Star, MessageSquare, Send, ThumbsUp, Reply, Check } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function PlayerPage() {
  var _a;
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    setCurrentAudio,
    setPlayerVisible,
    setIsPlaying,
    playlist,
    currentTrackIndex,
    playNext,
    playPrevious
  } = useAudio();
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareStatus, setShareStatus] = useState(
    "idle"
  );
  const [viewCount, setViewCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [commentLikes, setCommentLikes] = useState(
    {}
  );
  const [userCommentLikes, setUserCommentLikes] = useState({});
  const [listeningStartTime, setListeningStartTime] = useState(
    null
  );
  const [hasCountedAsListener, setHasCountedAsListener] = useState(false);
  const [contentType, contentId] = (id == null ? void 0 : id.includes("-")) ? [id.split("-")[0], id.substring(id.indexOf("-") + 1)] : [null, null];
  useEffect(() => {
    const handleAudioPlay = () => {
      if (!hasCountedAsListener) {
        setListeningStartTime(Date.now());
      }
    };
    const handleAudioPause = () => {
      if (listeningStartTime && !hasCountedAsListener) {
        const listeningDuration = Date.now() - listeningStartTime;
        if (listeningDuration >= 3e4) {
          recordRealListener();
        }
      }
    };
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
      const { data: existingView } = await supabase.from("content_views").select("id").eq("content_id", contentId).eq("content_type", contentType).eq("viewer_id", user.id).maybeSingle();
      if (!existingView) {
        await supabase.from("content_views").insert({
          content_id: contentId,
          content_type: contentType,
          viewer_id: user.id,
          viewed_at: (/* @__PURE__ */ new Date()).toISOString(),
          view_duration: "00:00:30"
          // Minimum 30 seconds
        });
        setHasCountedAsListener(true);
        setViewCount((prev) => prev + 1);
      }
    } catch (error2) {
      console.error("Error recording real listener:", error2);
    }
  };
  useEffect(() => {
    const loadContent = async () => {
      var _a2, _b, _c;
      if (!contentType || !contentId) return;
      try {
        setLoading(true);
        setError(null);
        let contentData;
        if (contentType === "audiobook") {
          const { data, error: error2 } = await supabase.from("audiobooks").select(
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
          ).eq("id", contentId).eq("status", "published").single();
          if (error2) throw error2;
          contentData = { ...data, type: "audiobook" };
        } else if (contentType === "podcast") {
          const { data, error: error2 } = await supabase.from("podcast_episodes").select(
            `
              *,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                username,
                avatar_url
              )
            `
          ).eq("id", contentId).eq("status", "published").single();
          if (error2) throw error2;
          contentData = {
            ...data,
            type: "podcast",
            chapters: data.audio_url ? [
              {
                id: 1,
                title: data.title,
                audio_url: data.audio_url,
                duration: data.duration
              }
            ] : []
          };
        }
        if (!contentData) throw new Error("Content not found");
        const [
          ratingsResult,
          userRatingResult,
          userLikeResult,
          userBookmarkResult
        ] = await Promise.all([
          // Get all ratings
          supabase.from("ratings").select("rating").eq("content_id", contentId).eq("content_type", contentType),
          // User specific data (if logged in)
          user ? supabase.from("ratings").select("rating").eq("content_id", contentId).eq("content_type", contentType).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from("ratings").select("*").eq("content_id", contentId).eq("content_type", contentType).eq("user_id", user.id).eq("rating", 5).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from("bookmarks").select("*").eq("content_id", contentId).eq("content_type", contentType).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null })
        ]);
        const ratings = ratingsResult.data || [];
        const likesCount = ratings.filter((r) => r.rating === 5).length;
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
        setViewCount(contentData.view_count || 0);
        if (contentData.chapters) {
          contentData.chapters.sort((a, b) => a.order - b.order);
        }
        const processedContent = {
          ...contentData,
          view_count: contentData.view_count || 0,
          avg_rating: avgRating,
          total_ratings: ratings.length,
          user_rating: ((_a2 = userRatingResult.data) == null ? void 0 : _a2.rating) || 0,
          is_liked: !!userLikeResult.data,
          is_bookmarked: !!userBookmarkResult.data
        };
        setContent(processedContent);
        setUserRating(processedContent.user_rating);
        setIsLiked(processedContent.is_liked);
        setIsBookmarked(processedContent.is_bookmarked);
        setLikeCount(likesCount);
        setCurrentAudio({
          title: contentData.title,
          author: contentData.author.name,
          authorId: contentData.author.id,
          authorUsername: contentData.author.username,
          thumbnail: contentData.cover_url || `https://source.unsplash.com/random/800x800?${contentType}&sig=${contentId}`,
          contentUrl: `/player/${contentType}-${contentId}`,
          chapters: contentData.chapters,
          type: contentType,
          audioUrl: (_c = (_b = contentData.chapters) == null ? void 0 : _b[0]) == null ? void 0 : _c.audio_url,
          currentTime: 0
        });
        setPlayerVisible(true);
        setIsPlaying(true);
      } catch (err) {
        console.error("Error loading content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [contentType, contentId, user, setCurrentAudio, setPlayerVisible]);
  useEffect(() => {
    const loadComments = async () => {
      if (!contentId || !contentType) return;
      try {
        const { data: commentsData, error: commentsError } = await supabase.from("comments").select(
          `
            id,
            content,
            created_at,
            user_id,
            parent_id
          `
        ).eq("content_id", contentId).eq("content_type", contentType).order("created_at", { ascending: false });
        if (commentsError) throw commentsError;
        if (commentsData && commentsData.length > 0) {
          const userIds = [
            ...new Set(commentsData.map((comment) => comment.user_id))
          ];
          const { data: profilesData, error: profilesError } = await supabase.from("profiles").select(
            `
              id,
              name,
              username,
              avatar_url
            `
          ).in("id", userIds);
          if (profilesError) throw profilesError;
          const profilesMap = /* @__PURE__ */ new Map();
          profilesData == null ? void 0 : profilesData.forEach((profile) => {
            profilesMap.set(profile.id, profile);
          });
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
            } catch (error2) {
              console.error(
                "Error loading comment likes from localStorage:",
                error2
              );
            }
          }
          const formattedComments = commentsData.filter((comment) => !comment.parent_id).map((comment) => {
            const profile = profilesMap.get(comment.user_id);
            const replies = commentsData.filter((reply) => reply.parent_id === comment.id).map((reply) => {
              const replyProfile = profilesMap.get(reply.user_id);
              return {
                id: reply.id,
                content: reply.content,
                created_at: reply.created_at,
                parent_id: reply.parent_id,
                user: {
                  id: (replyProfile == null ? void 0 : replyProfile.id) || reply.user_id,
                  name: (replyProfile == null ? void 0 : replyProfile.name) || (replyProfile == null ? void 0 : replyProfile.username) || "Anonymous",
                  username: (replyProfile == null ? void 0 : replyProfile.username) || "anonymous",
                  avatar_url: (replyProfile == null ? void 0 : replyProfile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${reply.user_id}`
                },
                likes: commentLikes[reply.id] || 0,
                is_liked: userCommentLikes[reply.id] || false
              };
            });
            return {
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              user: {
                id: (profile == null ? void 0 : profile.id) || comment.user_id,
                name: (profile == null ? void 0 : profile.name) || (profile == null ? void 0 : profile.username) || "Anonymous",
                username: (profile == null ? void 0 : profile.username) || "anonymous",
                avatar_url: (profile == null ? void 0 : profile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${comment.user_id}`
              },
              likes: commentLikes[comment.id] || 0,
              is_liked: userCommentLikes[comment.id] || false,
              replies
            };
          });
          setComments(formattedComments);
        } else {
          setComments([]);
        }
      } catch (error2) {
        console.error("Error loading comments:", error2);
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
      const newLikedState2 = !isLiked;
      setIsLiked(newLikedState2);
      setLikeCount(
        (prev) => newLikedState2 ? prev + 1 : Math.max(0, prev - 1)
      );
      if (!newLikedState2) {
        await supabase.from("ratings").delete().eq("content_id", content.id).eq("content_type", content.type).eq("user_id", user.id).eq("rating", 5);
      } else {
        const { data: existingRating } = await supabase.from("ratings").select("id").eq("content_id", content.id).eq("content_type", content.type).eq("user_id", user.id).maybeSingle();
        if (existingRating) {
          const { error: error2 } = await supabase.from("ratings").update({ rating: 5 }).eq("id", existingRating.id);
          if (error2) throw error2;
        } else {
          const { error: error2 } = await supabase.from("ratings").insert({
            content_id: content.id,
            content_type: content.type,
            user_id: user.id,
            rating: 5
          });
          if (error2) throw error2;
        }
      }
    } catch (error2) {
      console.error("Error toggling like:", error2);
      setIsLiked(!newLikedState);
      setLikeCount(
        (prev) => !newLikedState ? prev + 1 : Math.max(0, prev - 1)
      );
    }
  };
  const handleBookmark = async () => {
    if (!user || !content) {
      navigate("/signin");
      return;
    }
    try {
      const newBookmarkedState2 = !isBookmarked;
      setIsBookmarked(newBookmarkedState2);
      if (!newBookmarkedState2) {
        await supabase.from("bookmarks").delete().eq("content_id", content.id).eq("content_type", content.type).eq("user_id", user.id);
      } else {
        await supabase.from("bookmarks").insert({
          content_id: content.id,
          content_type: content.type,
          user_id: user.id
        });
      }
    } catch (error2) {
      console.error("Error toggling bookmark:", error2);
      setIsBookmarked(!newBookmarkedState);
    }
  };
  const handleShare = async () => {
    const url = window.location.href;
    const title = (content == null ? void 0 : content.title) || "";
    const text = `Listen to "${title}" by ${content == null ? void 0 : content.author.name}`;
    let finalStatus = "idle";
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          finalStatus = "shared";
        } catch (shareError) {
          if (shareError instanceof Error && shareError.name !== "AbortError") {
            await navigator.clipboard.writeText(url);
            finalStatus = "copied";
          }
        }
      } else {
        await navigator.clipboard.writeText(url);
        finalStatus = "copied";
      }
    } catch (error2) {
      if (error2 instanceof Error && error2.name !== "AbortError") {
        console.error("Error sharing:", error2);
      }
    } finally {
      if (finalStatus !== "idle") {
        setShareStatus(finalStatus);
        setTimeout(() => setShareStatus("idle"), 2e3);
      }
    }
  };
  const handleRating = async (rating) => {
    if (!user || !content) {
      navigate("/signin");
      return;
    }
    try {
      setUserRating(rating);
      const { data: existingRating } = await supabase.from("ratings").select("id, rating").eq("content_id", content.id).eq("content_type", content.type).eq("user_id", user.id).maybeSingle();
      if (existingRating) {
        const { error: error2 } = await supabase.from("ratings").update({ rating }).eq("id", existingRating.id);
        if (error2) throw error2;
      } else {
        const { error: error2 } = await supabase.from("ratings").insert({
          content_id: content.id,
          content_type: content.type,
          user_id: user.id,
          rating
        });
        if (error2) throw error2;
      }
      setContent(
        (prev) => prev ? {
          ...prev,
          user_rating: rating,
          total_ratings: prev.user_rating ? prev.total_ratings : prev.total_ratings + 1,
          avg_rating: prev.user_rating ? (prev.avg_rating * prev.total_ratings - prev.user_rating + rating) / prev.total_ratings : (prev.avg_rating * prev.total_ratings + rating) / (prev.total_ratings + 1)
        } : null
      );
    } catch (error2) {
      console.error("Error rating content:", error2);
      setUserRating(content.user_rating);
    }
  };
  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !content || !newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const { data: commentData, error: error2 } = await supabase.from("comments").insert({
        content: newComment.trim(),
        user_id: user.id,
        content_id: content.id,
        content_type: content.type
      }).select("*").single();
      if (error2) throw error2;
      const { data: userProfile } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", user.id).single();
      const newCommentObj = {
        id: commentData.id,
        content: commentData.content,
        created_at: commentData.created_at,
        user: {
          id: user.id,
          name: (userProfile == null ? void 0 : userProfile.name) || (userProfile == null ? void 0 : userProfile.username) || "Anonymous",
          username: (userProfile == null ? void 0 : userProfile.username) || "anonymous",
          avatar_url: (userProfile == null ? void 0 : userProfile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${user.id}`
        },
        likes: 0,
        is_liked: false,
        replies: []
      };
      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");
    } catch (error2) {
      console.error("Error posting comment:", error2);
    } finally {
      setSubmittingComment(false);
    }
  };
  const handleCommentLike = async (commentId) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      const isCurrentlyLiked = userCommentLikes[commentId] || false;
      const currentLikes = commentLikes[commentId] || 0;
      const newLikedState2 = !isCurrentlyLiked;
      const newLikeCount = newLikedState2 ? currentLikes + 1 : Math.max(0, currentLikes - 1);
      const updatedUserLikes = {
        ...userCommentLikes,
        [commentId]: newLikedState2
      };
      const updatedCommentLikes = {
        ...commentLikes,
        [commentId]: newLikeCount
      };
      setUserCommentLikes(updatedUserLikes);
      setCommentLikes(updatedCommentLikes);
      try {
        localStorage.setItem(
          `comment_likes_${user.id}_${contentId}`,
          JSON.stringify(updatedUserLikes)
        );
        localStorage.setItem(
          `comment_like_counts_${contentId}`,
          JSON.stringify(updatedCommentLikes)
        );
      } catch (error2) {
        console.error("Error saving to localStorage:", error2);
      }
      console.log(`${newLikedState2 ? "Liked" : "Unliked"} comment:`, commentId);
    } catch (error2) {
      console.error("Error liking comment:", error2);
      setUserCommentLikes(userCommentLikes);
      setCommentLikes(commentLikes);
    }
  };
  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };
  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    try {
      setSubmittingReply(true);
      const { data: replyData, error: error2 } = await supabase.from("comments").insert({
        content: replyContent.trim(),
        user_id: user.id,
        content_id: content.id,
        content_type: content.type,
        parent_id: parentCommentId
      }).select("*").single();
      if (error2) throw error2;
      const { data: userProfile } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", user.id).single();
      const newReply = {
        id: replyData.id,
        content: replyData.content,
        created_at: replyData.created_at,
        parent_id: parentCommentId,
        user: {
          id: user.id,
          name: (userProfile == null ? void 0 : userProfile.name) || (userProfile == null ? void 0 : userProfile.username) || "Anonymous",
          username: (userProfile == null ? void 0 : userProfile.username) || "anonymous",
          avatar_url: (userProfile == null ? void 0 : userProfile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${user.id}`
        },
        likes: 0,
        is_liked: false
      };
      setComments(
        (prev) => prev.map(
          (comment) => comment.id === parentCommentId ? { ...comment, replies: [...comment.replies || [], newReply] } : comment
        )
      );
      setReplyContent("");
      setReplyingTo(null);
    } catch (error2) {
      console.error("Error posting reply:", error2);
    } finally {
      setSubmittingReply(false);
    }
  };
  const handleProfileClick = (userId, username) => {
    navigate(`/user/${username}`);
  };
  if (!contentType || !contentId) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
        "Loading ",
        contentType,
        "..."
      ] })
    ] }) });
  }
  if (error || !content) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Content not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error || "The content you're looking for doesn't exist or has been removed." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.history.back(),
          className: "text-primary hover:underline",
          children: "Go back"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background pb-32 pt-8", children: [
    /* @__PURE__ */ jsx("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 sm:gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "hidden sm:flex items-center gap-1", children: [8, 12, 26, 34, 46, 58].map((height, i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-1 bg-primary/70 rounded-full animate-pulse",
              style: {
                height: `${height}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.8 + i * 0.2}s`
              }
            },
            `left-${i}`
          )) }),
          /* @__PURE__ */ jsx("div", { className: "w-64 h-42 rounded-xl overflow-hidden shadow-2xl bg-muted", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: content.cover_url || `https://source.unsplash.com/random/800x500?${contentType}&sig=${contentId}`,
              alt: content.title,
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "hidden sm:flex items-center gap-1", children: [58, 42, 34, 26, 12, 8].map((height, i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-1 bg-primary/70 rounded-full animate-pulse",
              style: {
                height: `${height}px`,
                animationDelay: `${i * 0.15 + 0.6}s`,
                animationDuration: `${1.8 + i * 0.2}s`
              }
            },
            `right-${i}`
          )) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: `text-center lg:text-left px-4 lg:px-0`, children: /* @__PURE__ */ jsx(
          "h1",
          {
            className: `text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground reader-title ${getTextLanguageClass(
              content.title
            )}`,
            children: content.title
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-4 lg:px-0", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleProfileClick(content.author.id, content.author.username),
              className: "flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-background shadow-lg flex-shrink-0", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: content.author.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${content.author.id}`,
                    alt: content.author.name,
                    className: "w-full h-full object-cover"
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground truncate", children: content.author.name }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate hidden sm:block", children: [
                    "@",
                    content.author.username
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 sm:gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleLike,
                className: `flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-xs sm:text-sm ${isLiked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "hover:bg-primary hover:text-primary-foreground"}`,
                title: "Like",
                children: [
                  /* @__PURE__ */ jsx(
                    Heart,
                    {
                      className: `w-4 h-4 ${isLiked ? "fill-current" : ""}`
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: likeCount || 0 })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleBookmark,
                className: `p-1.5 rounded-lg transition-all ${isBookmarked ? "text-primary bg-primary/10" : "hover:bg-primary hover:text-primary-foreground"}`,
                title: "Save",
                children: /* @__PURE__ */ jsx(
                  Bookmark,
                  {
                    className: `w-4 h-4 ${isBookmarked ? "fill-current" : ""}`
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleShare,
                className: "p-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all",
                title: "Share",
                children: /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4 lg:px-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Published ",
              formatTimeAgo(content.created_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("span", { children: [
              ((_a = content.chapters) == null ? void 0 : _a.length) || 0,
              " chapters"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("span", { children: [
              viewCount.toLocaleString(),
              " listeners"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsx("div", { className: `px-4 lg:px-0`, children: /* @__PURE__ */ jsx(
          "p",
          {
            className: `text-sm sm:text-base text-muted-foreground leading-relaxed reader-content ${getTextLanguageClass(
              content.description
            )}`,
            children: content.description
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        playlist.length > 1 && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-xl p-4 sm:p-6 shadow-sm mx-4 lg:mx-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-semibold", children: "Queue" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs sm:text-sm text-muted-foreground", children: [
              playlist.length,
              " tracks"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: playlist.map((track, index) => {
            const isCurrent = currentTrackIndex === index;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setCurrentTrackIndex(index);
                  playAudio(track);
                },
                className: `w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                children: [
                  /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted", children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: track.thumbnail,
                      alt: track.title,
                      className: "w-full h-full object-cover",
                      onError: (e) => {
                        e.currentTarget.src = "https://placehold.co/48x48?text=Track";
                      }
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium line-clamp-1 text-sm", children: track.title }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs opacity-70 line-clamp-1", children: track.author })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
                    isCurrent && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-1 h-3 bg-current rounded-full animate-pulse",
                          style: { animationDelay: "0s" }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-1 h-4 bg-current rounded-full animate-pulse",
                          style: { animationDelay: "0.2s" }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-1 h-3 bg-current rounded-full animate-pulse",
                          style: { animationDelay: "0.4s" }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs opacity-50", children: index + 1 })
                  ] })
                ]
              },
              `${track.type}-${track.id}`
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-xl p-4 sm:p-6 shadow-sm mx-4 lg:mx-0", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-base sm:text-lg font-semibold mb-4", children: [
            "Rate this ",
            contentType
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xl sm:text-2xl font-bold", children: (content.avg_rating || 0).toFixed(1) }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(
                Star,
                {
                  className: `w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(content.avg_rating || 0) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`
                },
                i
              )) })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs sm:text-sm text-muted-foreground", children: [
              "(",
              (content.total_ratings || 0).toLocaleString(),
              " ",
              (content.total_ratings || 0) === 1 ? "rating" : "ratings",
              ")"
            ] })
          ] }),
          user ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-medium mb-3", children: "Your rating:" }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRating(i + 1),
                onMouseEnter: () => setHoverRating(i + 1),
                onMouseLeave: () => setHoverRating(0),
                className: "transition-colors",
                children: /* @__PURE__ */ jsx(
                  Star,
                  {
                    className: `w-5 h-5 sm:w-6 sm:h-6 ${i < (hoverRating || userRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`
                  }
                )
              },
              i
            )) })
          ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-3 sm:py-4", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => navigate("/signin"),
              className: "text-xs sm:text-sm text-primary hover:underline",
              children: [
                "Sign in to rate this ",
                contentType
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-xl p-4 sm:p-6 shadow-sm mx-4 lg:mx-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-semibold", children: "Discussions" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxs("span", { children: [
                comments.reduce(
                  (total, comment) => {
                    var _a2;
                    return total + 1 + (((_a2 = comment.replies) == null ? void 0 : _a2.length) || 0);
                  },
                  0
                ),
                " ",
                comments.reduce(
                  (total, comment) => {
                    var _a2;
                    return total + 1 + (((_a2 = comment.replies) == null ? void 0 : _a2.length) || 0);
                  },
                  0
                ) === 1 ? "comment" : "comments"
              ] })
            ] })
          ] }),
          user ? /* @__PURE__ */ jsx("form", { onSubmit: handleComment, className: "mb-4 sm:mb-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: newComment,
                onChange: (e) => setNewComment(e.target.value),
                placeholder: `Share your thoughts about this ${contentType}...`,
                className: "w-full px-3 py-2 sm:px-4 sm:py-3 text-sm rounded-lg border bg-background resize-none min-h-[80px] sm:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                required: true
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: !newComment.trim() || submittingComment,
                className: "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50",
                children: submittingComment ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Posting..." })
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Post" })
                ] })
              }
            ) })
          ] }) }) : /* @__PURE__ */ jsxs("div", { className: "mb-4 sm:mb-6 p-3 sm:p-4 md:p-6 rounded-lg bg-muted/30 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mb-3", children: "Join the discussion" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigate("/signin"),
                className: "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
                children: "Sign in to comment"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: comments.length > 0 ? comments.map((comment) => {
            var _a2;
            return /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 sm:gap-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleProfileClick(
                    comment.user.id,
                    comment.user.username
                  ),
                  className: "w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 hover:opacity-80 transition-opacity",
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: comment.user.avatar_url,
                      alt: comment.user.name,
                      className: "w-full h-full object-cover",
                      onError: (e) => {
                        const img = e.target;
                        img.src = `https://source.unsplash.com/random/100x100?face&sig=${comment.user.id}`;
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleProfileClick(
                        comment.user.id,
                        comment.user.username
                      ),
                      className: "font-medium text-xs sm:text-sm truncate hover:text-primary transition-colors text-left",
                      children: comment.user.name
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground flex-shrink-0", children: formatDate(comment.created_at) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-foreground mb-2 sm:mb-3 leading-relaxed break-words", children: comment.content }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => handleCommentLike(comment.id),
                      disabled: !user,
                      className: `flex items-center gap-1 text-xs transition-colors ${userCommentLikes[comment.id] ? "text-primary" : user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                      children: [
                        /* @__PURE__ */ jsx(
                          ThumbsUp,
                          {
                            className: `w-4 h-4 ${userCommentLikes[comment.id] ? "fill-current" : ""}`
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { children: commentLikes[comment.id] || comment.likes })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => handleReply(comment.id),
                      disabled: !user,
                      className: `flex items-center gap-1 text-xs transition-colors ${user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                      children: [
                        /* @__PURE__ */ jsx(Reply, { className: "w-4 h-4" }),
                        "Reply"
                      ]
                    }
                  )
                ] }),
                replyingTo === comment.id && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex-shrink-0", children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: ((_a2 = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a2.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${user == null ? void 0 : user.id}`,
                      alt: "Your avatar",
                      className: "w-full h-full object-cover"
                    }
                  ) }),
                  /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs(
                    "form",
                    {
                      onSubmit: (e) => handleReplySubmit(e, comment.id),
                      children: [
                        /* @__PURE__ */ jsx(
                          "textarea",
                          {
                            value: replyContent,
                            onChange: (e) => setReplyContent(e.target.value),
                            placeholder: "Write a reply...",
                            className: "w-full px-3 py-2 text-sm rounded-lg border bg-background resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary",
                            required: true
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => {
                                setReplyingTo(null);
                                setReplyContent("");
                              },
                              className: "px-2 py-1 text-xs rounded-lg border hover:bg-accent transition-colors",
                              children: "Cancel"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "submit",
                              disabled: !replyContent.trim() || submittingReply,
                              className: "px-2 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1",
                              children: submittingReply ? /* @__PURE__ */ jsxs(Fragment, { children: [
                                /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }),
                                "Posting..."
                              ] }) : "Reply"
                            }
                          )
                        ] })
                      ]
                    }
                  ) })
                ] }),
                comment.replies && comment.replies.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3", children: comment.replies.map((reply) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex gap-2 ml-4 pl-4 border-l-2 border-muted",
                    children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => handleProfileClick(
                            reply.user.id,
                            reply.user.username
                          ),
                          className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex-shrink-0 hover:opacity-80 transition-opacity",
                          children: /* @__PURE__ */ jsx(
                            "img",
                            {
                              src: reply.user.avatar_url,
                              alt: reply.user.name,
                              className: "w-full h-full object-cover",
                              onError: (e) => {
                                const img = e.target;
                                img.src = `https://source.unsplash.com/random/100x100?face&sig=${reply.user.id}`;
                              }
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => handleProfileClick(
                                reply.user.id,
                                reply.user.username
                              ),
                              className: "font-medium text-xs sm:text-sm hover:text-primary transition-colors",
                              children: reply.user.name
                            }
                          ),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(reply.created_at) })
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm mb-2 leading-relaxed", children: reply.content }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                          /* @__PURE__ */ jsxs(
                            "button",
                            {
                              onClick: () => handleCommentLike(reply.id),
                              disabled: !user,
                              className: `flex items-center gap-1 text-xs transition-colors ${userCommentLikes[reply.id] ? "text-primary" : user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                              children: [
                                /* @__PURE__ */ jsx(
                                  ThumbsUp,
                                  {
                                    className: `w-3 h-3 ${userCommentLikes[reply.id] ? "fill-current" : ""}`
                                  }
                                ),
                                /* @__PURE__ */ jsx("span", { children: commentLikes[reply.id] || reply.likes })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxs(
                            "button",
                            {
                              onClick: () => handleReply(reply.id),
                              disabled: !user,
                              className: `flex items-center gap-1 text-xs transition-colors ${user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                              children: [
                                /* @__PURE__ */ jsx(Reply, { className: "w-3 h-3" }),
                                "Reply"
                              ]
                            }
                          )
                        ] })
                      ] })
                    ]
                  },
                  reply.id
                )) })
              ] })
            ] }) }, comment.id);
          }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-6 sm:py-8 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" }),
            /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg font-medium mb-2", children: "No comments yet" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm", children: [
              "Be the first to share your thoughts about this",
              " ",
              contentType
            ] })
          ] }) })
        ] })
      ] })
    ] }) }),
    shareStatus !== "idle" && /* @__PURE__ */ jsxs("div", { className: "fixed bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-popover border rounded-lg shadow-lg text-sm flex items-center gap-2 z-50", children: [
      /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-500" }),
      /* @__PURE__ */ jsx("span", { children: shareStatus === "copied" ? "Link copied to clipboard" : "Shared successfully" })
    ] })
  ] });
}
export {
  PlayerPage
};
