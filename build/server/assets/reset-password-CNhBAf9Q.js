import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { s as supabase } from "./server-build-CzlBCFpg.js";
import { I as Input } from "./input-B-gCJvDo.js";
import { L as Label } from "./label-B_yhZjUI.js";
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
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hash, setHash] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    const hashFragment = window.location.hash;
    if (hashFragment) {
      setHash(hashFragment.replace("#", ""));
    } else {
      navigate("/forgot-password", {
        state: { message: "Invalid or expired reset link. Please try again." }
      });
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hash) return;
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }
    try {
      const { error: error2 } = await supabase.auth.updateUser({ password });
      if (error2) throw error2;
      navigate("/signin", {
        state: { message: "Password updated successfully. Please sign in with your new password." }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "container max-w-[400px] mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-2 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Set new password" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your new password below" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New Password" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              name: "password",
              type: showPassword ? "text" : "password",
              required: true,
              autoComplete: "new-password",
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
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm New Password" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "confirmPassword",
              name: "confirmPassword",
              type: showConfirmPassword ? "text" : "password",
              required: true,
              autoComplete: "new-password",
              className: "pr-10"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowConfirmPassword(!showConfirmPassword),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
              children: showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
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
          disabled: loading || !hash,
          children: loading ? "Updating password..." : "Update password"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center text-sm", children: [
      "Remember your password?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/signin", className: "text-primary hover:underline", children: "Sign in" })
    ] })
  ] }) });
}
export {
  ResetPasswordPage
};
