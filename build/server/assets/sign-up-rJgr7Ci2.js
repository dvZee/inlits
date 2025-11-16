import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { u as useAuth } from "./server-build-CCRgnkMn.js";
import { I as Input } from "./input-UQRBPDAP.js";
import { L as Label } from "./label-CputJbY-.js";
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
function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const [usernameError, setUsernameError] = useState(null);
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);
  const validateUsername = (value) => {
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    setUsernameError(null);
    return true;
  };
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "username") {
      validateUsername(value);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateUsername(formData.username)) {
      return;
    }
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.username, "consumer");
      navigate("/signin", {
        state: {
          message: "Account created successfully! Please sign in to start your learning journey."
        },
        replace: true
      });
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
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
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Join Inlits" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Start your learning journey today" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "email",
            type: "email",
            value: formData.email,
            onChange: (e) => handleInputChange("email", e.target.value),
            placeholder: "name@example.com",
            required: true,
            autoComplete: "email"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "username", children: "Username" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "username",
            type: "text",
            value: formData.username,
            onChange: (e) => handleInputChange("username", e.target.value),
            placeholder: "johndoe",
            required: true,
            autoComplete: "username",
            className: usernameError ? "border-destructive" : ""
          }
        ),
        usernameError && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: usernameError })
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
      error && /* @__PURE__ */ jsx("div", { className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50",
          disabled: loading || !!usernameError,
          children: loading ? "Creating account..." : "Join Inlits"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center text-sm", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/signin", className: "text-primary hover:underline", children: "Login" })
    ] })
  ] }) });
}
export {
  SignUpPage
};
