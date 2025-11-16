import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { u as useAuth } from "./server-build-CQlMvEI0.js";
import { I as Input } from "./input-bMzHZGfT.js";
import { L as Label } from "./label-C6HnzAcQ.js";
import { ChevronLeft, Users, Target, Zap, EyeOff, Eye, Loader2, ChevronRight, FileText, BookOpen, Headphones, Mic } from "lucide-react";
import { C as CATEGORIES } from "./categories-Cr-YSiwM.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function BecomeCreatorPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    username: "",
    password: "",
    // Creator Info
    bio: "",
    expertise: [],
    contentTypes: [],
    sampleWork: "",
    socialLinks: {
      website: "",
      twitter: "",
      linkedin: "",
      youtube: ""
    }
  });
  const contentTypeOptions = [
    { value: "articles", label: "Articles & Blog Posts", icon: /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5" }) },
    { value: "books", label: "Books & E-books", icon: /* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5" }) },
    { value: "audiobooks", label: "Audiobooks", icon: /* @__PURE__ */ jsx(Headphones, { className: "w-5 h-5" }) },
    { value: "podcasts", label: "Podcasts", icon: /* @__PURE__ */ jsx(Mic, { className: "w-5 h-5" }) }
  ];
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => {
        const parentKey = parent;
        const parentValue = prev[parentKey];
        if (typeof parentValue !== "object" || parentValue === null) {
          return prev;
        }
        return {
          ...prev,
          [parentKey]: {
            ...parentValue,
            [child]: value
          }
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };
  const toggleExpertise = (category) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(category) ? prev.expertise.filter((c) => c !== category) : [...prev.expertise, category]
    }));
  };
  const toggleContentType = (type) => {
    setFormData((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type) ? prev.contentTypes.filter((t) => t !== type) : [...prev.contentTypes, type]
    }));
  };
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!formData.bio.trim()) {
      setError("Bio is required");
      return false;
    }
    if (formData.expertise.length === 0) {
      setError("Please select at least one area of expertise");
      return false;
    }
    if (formData.contentTypes.length === 0) {
      setError("Please select at least one content type you plan to create");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      if (user) {
        setError("Role upgrade for existing users will be available soon");
        return;
      }
      await signUp(
        formData.email,
        formData.password,
        formData.username,
        "creator"
      );
      localStorage.setItem("creatorOnboardingData", JSON.stringify({
        fullName: formData.fullName,
        bio: formData.bio,
        expertise: formData.expertise,
        contentTypes: formData.contentTypes,
        sampleWork: formData.sampleWork,
        socialLinks: formData.socialLinks
      }));
      navigate("/signin", {
        state: {
          message: "Creator account created successfully! Please sign in to complete your profile setup."
        }
      });
    } catch (err) {
      console.error("Creator signup error:", err);
      setError(err instanceof Error ? err.message : "Failed to create creator account");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-4xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "p-2 hover:bg-accent rounded-lg transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Become a Creator" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Share your knowledge and build an audience on Inlits" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-lg bg-card border", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Build Your Audience" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Reach thousands of engaged learners who are hungry for quality content" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-lg bg-card border", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Target, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Monetize Your Knowledge" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Earn money from your content through subscriptions and one-time purchases" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-lg bg-card border", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Powerful Tools" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Access advanced analytics, publishing tools, and community features" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-xl p-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Personal Information" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "fullName",
                value: formData.fullName,
                onChange: (e) => handleInputChange("fullName", e.target.value),
                placeholder: "Your full name",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                value: formData.email,
                onChange: (e) => handleInputChange("email", e.target.value),
                placeholder: "your@email.com",
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "username", children: "Username" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "username",
                value: formData.username,
                onChange: (e) => handleInputChange("username", e.target.value),
                placeholder: "your_username",
                required: true
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "This will be your unique identifier on Inlits" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  type: showPassword ? "text" : "password",
                  value: formData.password,
                  onChange: (e) => handleInputChange("password", e.target.value),
                  placeholder: "Create a strong password",
                  className: "pr-10",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowPassword(!showPassword),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Creator Information" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "bio",
              value: formData.bio,
              onChange: (e) => handleInputChange("bio", e.target.value),
              placeholder: "Tell us about yourself and what you create...",
              className: "w-full px-3 py-2 rounded-md border bg-background min-h-[100px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary",
              required: true
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            formData.bio.length,
            "/500 characters"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Areas of Expertise" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Select the topics you're knowledgeable about" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2", children: CATEGORIES.slice(0, 16).map((category) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleExpertise(category),
              className: `p-2 text-sm rounded-lg border transition-colors ${formData.expertise.includes(category) ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: category
            },
            category
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Content Types You Plan to Create" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: contentTypeOptions.map((option) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleContentType(option.value),
              className: `p-4 rounded-lg border-2 transition-all text-left ${formData.contentTypes.includes(option.value) ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                option.icon,
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: option.label })
              ] })
            },
            option.value
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "sampleWork", children: "Sample Work or Portfolio (Optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "sampleWork",
              value: formData.sampleWork,
              onChange: (e) => handleInputChange("sampleWork", e.target.value),
              placeholder: "Share links to your previous work, portfolio, or describe your experience...",
              className: "w-full px-3 py-2 rounded-md border bg-background min-h-[80px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Social Links (Optional)" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "website", children: "Website" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "website",
                type: "url",
                value: formData.socialLinks.website,
                onChange: (e) => handleInputChange("socialLinks.website", e.target.value),
                placeholder: "https://yourwebsite.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "twitter", children: "Twitter" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "twitter",
                value: formData.socialLinks.twitter,
                onChange: (e) => handleInputChange("socialLinks.twitter", e.target.value),
                placeholder: "@yourusername"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "linkedin", children: "LinkedIn" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "linkedin",
                type: "url",
                value: formData.socialLinks.linkedin,
                onChange: (e) => handleInputChange("socialLinks.linkedin", e.target.value),
                placeholder: "https://linkedin.com/in/yourprofile"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "youtube", children: "YouTube" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "youtube",
                type: "url",
                value: formData.socialLinks.youtube,
                onChange: (e) => handleInputChange("socialLinks.youtube", e.target.value),
                placeholder: "https://youtube.com/@yourchannel"
              }
            )
          ] })
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "p-4 bg-destructive/10 text-destructive rounded-lg text-sm", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-6 border-t", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "By creating an account, you agree to our",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/terms", className: "text-primary hover:underline", children: "Terms of Service" }),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/privacy", className: "text-primary hover:underline", children: "Privacy Policy" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
              "Creating Account..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Create Creator Account",
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            ] })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "text-center mt-8", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Already have an account? " }),
      /* @__PURE__ */ jsx(Link, { to: "/signin", className: "text-primary hover:underline font-medium", children: "Login here" })
    ] })
  ] }) });
}
export {
  BecomeCreatorPage
};
