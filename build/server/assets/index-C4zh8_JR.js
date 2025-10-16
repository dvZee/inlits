import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useAuth, s as supabase } from "./server-build-yCr6HHQW.js";
import { P as ProfileHeader, I as IntellectualIdentity, a as ProfileContributions, b as ProfileCircles, c as ProfileAchievements } from "./profile-achievements-_sv7I0L0.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "lucide-react";
import "react-router-dom";
import "zustand";
import "clsx";
import "tailwind-merge";
import "./input-BNFtwTqC.js";
import "./label-hXa1UKZq.js";
import "@radix-ui/react-label";
function ProfilePage() {
  const { user, profile } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [bookClubs, setBookClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  const fetchUserData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [
        readingStatusResult,
        commentsResult,
        ratingsResult,
        bookClubsResult,
        contentViewsResult
      ] = await Promise.all([
        supabase.from("reading_status").select("status, content_type").eq("user_id", user.id),
        supabase.from("comments").select("id, content, created_at, content_type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("ratings").select("rating, content_type").eq("user_id", user.id),
        supabase.from("book_club_members").select(`
            book_clubs (
              id,
              name,
              description,
              current_chapter,
              completion_percentage
            )
          `).eq("user_id", user.id),
        supabase.from("content_views").select("content_type").eq("viewer_id", user.id)
      ]);
      const readingData = readingStatusResult.data || [];
      const commentsData = commentsResult.data || [];
      const ratingsData = ratingsResult.data || [];
      const bookClubsData = bookClubsResult.data || [];
      const viewsData = contentViewsResult.data || [];
      const stats = {
        totalContentViewed: viewsData.length,
        booksRead: readingData.filter((r) => r.content_type === "book" && r.status === "completed").length,
        audiobooksListened: readingData.filter((r) => r.content_type === "audiobook" && r.status === "completed").length,
        articlesRead: readingData.filter((r) => r.content_type === "article" && r.status === "completed").length,
        podcastsListened: readingData.filter((r) => r.content_type === "podcast" && r.status === "completed").length,
        totalComments: commentsData.length,
        totalRatings: ratingsData.length,
        averageRating: ratingsData.length > 0 ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length : 0,
        bookClubsJoined: bookClubsData.length,
        favoriteCategories: []
      };
      setUserStats(stats);
      setRecentActivity(commentsData);
      setBookClubs(bookClubsData.map((item) => item.book_clubs).filter(Boolean));
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };
  if (!user || !profile) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-2", children: "Please sign in" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "You need to be signed in to view your profile." })
    ] }) });
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-48 bg-muted rounded-xl mb-6" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 bg-muted rounded w-1/3" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-1/2" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8", children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-32 bg-muted rounded-lg" }, i)) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8", children: [
    /* @__PURE__ */ jsx(ProfileHeader, { profile }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
        /* @__PURE__ */ jsx(IntellectualIdentity, { stats: userStats }),
        /* @__PURE__ */ jsx(ProfileContributions, {})
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsx(ProfileCircles, {}),
        /* @__PURE__ */ jsx(ProfileAchievements, { stats: userStats })
      ] })
    ] })
  ] }) });
}
export {
  ProfilePage as default
};
