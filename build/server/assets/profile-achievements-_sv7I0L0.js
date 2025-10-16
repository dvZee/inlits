import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X, Upload, Loader2, AlertCircle, CheckCircle, Edit, Target, Clock, BookOpen, Pause, Users, MessageSquare } from "lucide-react";
import { u as useAuth, s as supabase, f as formatTimeAgo } from "./server-build-yCr6HHQW.js";
import { I as Input } from "./input-BNFtwTqC.js";
import { L as Label } from "./label-hXa1UKZq.js";
import { Link } from "react-router-dom";
function EditProfileDialog({ onClose }) {
  const { user, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || ""
      });
      setAvatarPreview(profile.avatar_url || "");
      setCoverPreview(profile.cover_url || "");
    }
  }, [profile]);
  const handleAvatarChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image must be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };
  const handleCoverChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError(null);
  };
  const uploadImage = async (file, bucket) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user == null ? void 0 : user.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;
      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrl = await uploadImage(avatarFile, "article-covers");
      }
      if (coverFile) {
        setUploadingCover(true);
        coverUrl = await uploadImage(coverFile, "article-covers");
      }
      const { error: updateError } = await supabase.from("profiles").update({
        name: formData.name,
        bio: formData.bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", user.id);
      if (updateError) throw updateError;
      setProfile({
        ...profile,
        name: formData.name,
        bio: formData.bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-background rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Edit Profile" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-2 hover:bg-accent rounded-full transition-colors",
                  children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-4 space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Cover Image" }),
                /* @__PURE__ */ jsxs("div", { className: "relative aspect-video rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors overflow-hidden", children: [
                  coverPreview ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: coverPreview,
                      alt: "Cover preview",
                      className: "w-full h-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-8 h-8 mb-2" }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Click to upload cover image" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      onChange: handleCoverChange,
                      className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    }
                  ),
                  uploadingCover && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-white" }) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Recommended size: 1600x400. Maximum file size: 5MB" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Profile Picture" }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-24 h-24 rounded-full border-2 border-dashed hover:border-primary/50 transition-colors overflow-hidden", children: [
                  avatarPreview ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: avatarPreview,
                      alt: "Avatar preview",
                      className: "w-full h-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-6 h-6 mb-1" }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-center", children: "Upload" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      onChange: handleAvatarChange,
                      className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    }
                  ),
                  uploadingAvatar && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin text-white" }) })
                ] }) }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Recommended size: 400x400. Maximum file size: 2MB" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "name",
                    value: formData.name,
                    onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
                    placeholder: "Enter your full name"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    id: "bio",
                    value: formData.bio,
                    onChange: (e) => setFormData((prev) => ({ ...prev, bio: e.target.value })),
                    className: "w-full px-3 py-2 rounded-md border bg-background min-h-[80px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary",
                    placeholder: "Tell us about yourself...",
                    maxLength: 500
                  }
                ),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  formData.bio.length,
                  "/500 characters"
                ] })
              ] }),
              error && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
              ] }),
              success && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400", children: [
                /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Profile updated successfully!" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    className: "px-4 py-2 text-sm rounded-lg border hover:bg-accent transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: loading || uploadingAvatar || uploadingCover,
                    className: "px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2",
                    children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                      "Saving..."
                    ] }) : "Save Changes"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function ProfileHeader({ profile, isOwnProfile = true }) {
  const { profile: authProfile } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const userProfile = profile || authProfile;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "h-32 md:h-48 rounded-xl overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: (userProfile == null ? void 0 : userProfile.cover_url) || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
            alt: "Cover",
            className: "w-full h-full object-cover opacity-60"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative px-4 md:px-6 pb-4 md:pb-6 -mt-16 md:-mt-24", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center md:items-start md:flex-row gap-4 md:gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "shrink-0 text-center md:text-left", children: /* @__PURE__ */ jsx("div", { className: "w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background overflow-hidden bg-muted mx-auto md:mx-0", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: (userProfile == null ? void 0 : userProfile.avatar_url) || `https://source.unsplash.com/random/200x200?portrait&sig=${userProfile == null ? void 0 : userProfile.id}`,
            alt: (userProfile == null ? void 0 : userProfile.name) || (userProfile == null ? void 0 : userProfile.username),
            className: "w-full h-full object-cover"
          }
        ) }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl md:text-2xl font-bold", children: (userProfile == null ? void 0 : userProfile.name) || (userProfile == null ? void 0 : userProfile.username) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base text-muted-foreground", children: (userProfile == null ? void 0 : userProfile.bio) || "Learning and growing every day" })
          ] }),
          isOwnProfile && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 md:gap-3", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowEditDialog(true),
              className: "inline-flex items-center justify-center rounded-lg border bg-background px-3 md:px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary",
              children: [
                /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4 mr-2" }),
                /* @__PURE__ */ jsx("span", { children: "Edit Profile" })
              ]
            }
          ) })
        ] }) })
      ] }) })
    ] }),
    showEditDialog && /* @__PURE__ */ jsx(
      EditProfileDialog,
      {
        onClose: () => setShowEditDialog(false)
      }
    )
  ] });
}
function IntellectualIdentity({ stats }) {
  const { user, profile } = useAuth();
  const [readingStats, setReadingStats] = useState({
    want_to_consume: 0,
    consuming: 0,
    completed: 0,
    paused: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadReadingStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from("reading_status").select("status").eq("user_id", user.id);
        if (error) throw error;
        const statusCounts = (data || []).reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});
        setReadingStats({
          want_to_consume: statusCounts.want_to_consume || 0,
          consuming: statusCounts.consuming || 0,
          completed: statusCounts.completed || 0,
          paused: statusCounts.paused || 0
        });
      } catch (error) {
        console.error("Error loading reading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadReadingStats();
  }, [user]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4 md:space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Intellectual Identity" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted mx-auto mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "h-6 bg-muted rounded mb-1" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded" })
      ] }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 md:space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Intellectual Identity" }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/library",
          className: "text-sm text-primary hover:underline",
          children: "Update Preferences"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Target, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.want_to_consume }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Want to Experience" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.consuming }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Currently Experiencing" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.completed }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Experienced" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 md:p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4 md:w-5 md:h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl font-bold", children: readingStats.paused }),
        /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Paused" })
      ] })
    ] })
  ] });
}
function ProfileCircles() {
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Circles" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connect with like-minded learners" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-8 h-8 text-primary" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Circles Coming Soon!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4 max-w-sm mx-auto", children: "We're working on exciting features to help you connect with like-minded learners and form study circles." }),
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsx("span", { children: "Feature in development" })
      ] })
    ] })
  ] });
}
function ProfileContributions({ recentActivity }) {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadContributions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { data: commentsData, error: commentsError } = await supabase.from("comments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
        if (commentsError) throw commentsError;
        const { data: ratingsData, error: ratingsError } = await supabase.from("ratings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
        if (ratingsError) throw ratingsError;
        const allContributions = [
          ...(commentsData || []).map((comment) => ({
            id: comment.id,
            type: "comment",
            title: `Comment on ${comment.content_type}`,
            excerpt: comment.content.substring(0, 100) + (comment.content.length > 100 ? "..." : ""),
            content_type: comment.content_type,
            content_id: comment.content_id,
            timestamp: comment.created_at
          })),
          ...(ratingsData || []).map((rating) => ({
            id: rating.id,
            type: "rating",
            title: `Rated ${rating.content_type}`,
            excerpt: `Gave ${rating.rating} star${rating.rating !== 1 ? "s" : ""}`,
            content_type: rating.content_type,
            content_id: rating.content_id,
            timestamp: rating.created_at,
            rating: rating.rating
          }))
        ];
        allContributions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setContributions(allContributions.slice(0, 5));
      } catch (err) {
        console.error("Error loading contributions:", err);
        setError(err instanceof Error ? err.message : "Failed to load contributions");
      } finally {
        setLoading(false);
      }
    };
    loadContributions();
  }, [user]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8 text-center", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 text-destructive mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error })
      ] }) })
    ] });
  }
  if (contributions.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No contributions yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Start engaging with content by leaving comments and ratings" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contributions" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("button", { className: "text-sm text-primary hover:underline", children: "View all" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: contributions.map((contribution) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-card border rounded-lg p-6 space-y-4",
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: contribution.type }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { children: formatTimeAgo(contribution.timestamp) }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: contribution.content_type })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: contribution.title })
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: contribution.excerpt }),
          contribution.type === "rating" && contribution.rating && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(
            "span",
            {
              className: `text-lg ${i < contribution.rating ? "text-yellow-500" : "text-muted-foreground"}`,
              children: "★"
            },
            i
          )) })
        ]
      },
      contribution.id
    )) })
  ] });
}
function ProfileAchievements({ stats }) {
  const achievements = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first content",
      icon: "🎯",
      progress: Math.min((stats == null ? void 0 : stats.completed_content) || 0, 1),
      total: 1,
      unlocked: ((stats == null ? void 0 : stats.completed_content) || 0) >= 1
    },
    {
      id: "2",
      name: "Bookworm",
      description: "Experience 10 pieces of content",
      icon: "📚",
      progress: Math.min((stats == null ? void 0 : stats.completed_content) || 0, 10),
      total: 10,
      unlocked: ((stats == null ? void 0 : stats.completed_content) || 0) >= 10
    },
    {
      id: "3",
      name: "Engaged Learner",
      description: "Write 5 comments or reviews",
      icon: "💬",
      progress: Math.min((stats == null ? void 0 : stats.totalComments) || 0, 5),
      total: 5,
      unlocked: ((stats == null ? void 0 : stats.totalComments) || 0) >= 5
    },
    {
      id: "4",
      name: "Community Member",
      description: "Join your first book club",
      icon: "👥",
      progress: Math.min((stats == null ? void 0 : stats.bookClubsJoined) || 0, 1),
      total: 1,
      unlocked: ((stats == null ? void 0 : stats.bookClubsJoined) || 0) >= 1
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Achievements" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Track your progress" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "text-sm text-primary hover:underline", disabled: true, children: "View all" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: achievements.map((achievement) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "space-y-2",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg", children: /* @__PURE__ */ jsx("span", { className: achievement.unlocked ? "" : "grayscale opacity-50", children: achievement.icon }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: achievement.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: achievement.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
              achievement.progress,
              "/",
              achievement.total
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full transition-all ${achievement.unlocked ? "bg-primary" : "bg-muted-foreground"}`,
              style: {
                width: `${achievement.progress / achievement.total * 100}%`
              }
            }
          ) })
        ]
      },
      achievement.id
    )) })
  ] });
}
export {
  IntellectualIdentity as I,
  ProfileHeader as P,
  ProfileContributions as a,
  ProfileCircles as b,
  ProfileAchievements as c
};
