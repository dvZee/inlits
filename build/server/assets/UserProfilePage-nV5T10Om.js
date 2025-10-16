import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-yCr6HHQW.js";
import { P as ProfileHeader, I as IntellectualIdentity, a as ProfileContributions, b as ProfileCircles, c as ProfileAchievements } from "./profile-achievements-_sv7I0L0.js";
import { AlertCircle } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "clsx";
import "tailwind-merge";
import "./input-BNFtwTqC.js";
import "./label-hXa1UKZq.js";
import "@radix-ui/react-label";
function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [readingHistory, setReadingHistory] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const cleanUsername = (username == null ? void 0 : username.startsWith("@")) ? username.substring(1) : username;
        if (!cleanUsername) {
          throw new Error("Username is required");
        }
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("username", cleanUsername).single();
        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profile not found");
        if (user && profileData.id === user.id) {
          navigate("/profile");
          return;
        }
        setProfile(profileData);
        const { data: userProfileData, error: userProfileError } = await supabase.rpc(
          "get_user_profile",
          { p_username: cleanUsername }
        );
        if (userProfileError) {
          console.error("Error fetching user profile data:", userProfileError);
        } else if (userProfileData && userProfileData.length > 0) {
          const userData = userProfileData[0];
          setUserStats(userData.stats);
          setReadingHistory(userData.reading_history);
          setBookmarks(userData.bookmarks);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username, user, navigate]);
  const isConsumerRoute = location.pathname.startsWith("/consumer/");
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "h-48 bg-muted rounded-xl" }),
      /* @__PURE__ */ jsx("div", { className: "h-32 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "h-64 bg-muted rounded-lg" }),
          /* @__PURE__ */ jsx("div", { className: "h-96 bg-muted rounded-lg" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "h-64 bg-muted rounded-lg" }),
          /* @__PURE__ */ jsx("div", { className: "h-64 bg-muted rounded-lg" })
        ] })
      ] })
    ] });
  }
  if (error || !profile) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Profile not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "The profile you're looking for doesn't exist or has been removed." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "text-primary hover:underline",
          children: "Go back"
        }
      )
    ] });
  }
  if (isConsumerRoute && profile.role === "creator") {
    return /* @__PURE__ */ jsx(Navigate, { to: `/creator/${profile.username}`, replace: true });
  }
  if (!isConsumerRoute && profile.role === "consumer") {
    return /* @__PURE__ */ jsx(Navigate, { to: `/consumer/${profile.username}`, replace: true });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx(ProfileHeader, { profile, isOwnProfile: false }),
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
  ] });
}
export {
  UserProfilePage
};
