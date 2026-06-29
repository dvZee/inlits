import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { s as supabase } from "./server-build-BGC-wbDo.js";
import { I as Input } from "./input-bCdpbejb.js";
import { L as Label } from "./label-B7hQ0ymw.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "lucide-react";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    try {
      const { error: error2 } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error2) throw error2;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsx("div", { className: "container max-w-[400px] mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 text-primary px-6 py-8 rounded-lg text-center space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Check your email" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "We've sent you a password reset link. Please check your email and follow the instructions." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/signin"),
          className: "text-sm hover:underline",
          children: "Back to Sign In"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "container max-w-[400px] mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-2 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Reset your password" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your email address and we'll send you a password reset link" })
    ] }),
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
      error && /* @__PURE__ */ jsx("div", { className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          disabled: loading,
          children: loading ? "Sending reset link..." : "Send reset link"
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
  ForgotPasswordPage
};
