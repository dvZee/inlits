import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { u as useAuth } from "./server-build-JgBpkKvy.js";
import { I as Input } from "./input-Dp_I0MuG.js";
import { L as Label } from "./label-DgwxdtmE.js";
import { EyeOff, Eye } from "lucide-react";
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
function SignInPage() {
  var _a, _b, _c;
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const message = (_a = location.state) == null ? void 0 : _a.message;
  const from = ((_c = (_b = location.state) == null ? void 0 : _b.from) == null ? void 0 : _c.pathname) || "/";
  const { profile } = useAuth();
  useEffect(() => {
    if (user && profile && !authLoading) {
      if (from === "/") {
        navigate(`/dashboard/${profile.username}`, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate, from]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await signIn(email, password);
      const currentProfile = useAuth.getState().profile;
      if (currentProfile && from === "/") {
        navigate(`/dashboard/${currentProfile.username}`, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };
  if (authLoading) {
    return /* @__PURE__ */ jsx("div", { className: "container max-w-[400px] mx-auto px-4 py-8 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) });
  }
  if (user) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "container max-w-[400px] mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-2 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Welcome back" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your email to sign in to your account" })
    ] }),
    message && /* @__PURE__ */ jsx("div", { className: "bg-primary/10 text-primary px-4 py-3 rounded-md text-sm", children: message }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "email",
            name: "email",
            type: "email",
            placeholder: "name@example.com",
            required: true,
            autoComplete: "email"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx("a", { href: "/forgot-password", className: "text-sm text-primary hover:underline", children: "Forgot password?" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              name: "password",
              type: showPassword ? "text" : "password",
              required: true,
              autoComplete: "current-password",
              className: "pr-10"
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
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          disabled: loading,
          children: loading ? "Signing in..." : "Sign in"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center text-sm", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/signup", className: "text-primary hover:underline", children: "Sign up" })
    ] })
  ] }) });
}
export {
  SignInPage
};
