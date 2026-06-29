import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { s as supabase } from "./server-build-BGC-wbDo.js";
import { MailCheck } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [error, setError] = useState(null);
  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const token = new URLSearchParams(location.search).get("token");
        const type = new URLSearchParams(location.search).get("type");
        if (!token || type !== "email_verification") {
          throw new Error("Invalid verification link");
        }
        const { error: error2 } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email"
        });
        if (error2) throw error2;
        setVerificationStatus("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
        setVerificationStatus("error");
      }
    };
    handleEmailVerification();
  }, [location.search]);
  return /* @__PURE__ */ jsx("div", { className: "container max-w-[400px] mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-6 text-center", children: [
    verificationStatus === "loading" && /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsx("p", { children: "Verifying your email..." }) }),
    verificationStatus === "success" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(MailCheck, { className: "w-6 h-6 text-primary" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Email verified!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Your email has been successfully verified. You can now sign in to your account." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/signin"),
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
          children: "Sign in"
        }
      )
    ] }),
    verificationStatus === "error" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-destructive", children: "Verification failed" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: error || "Unable to verify your email. Please try again or contact support." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/signup"),
          className: "text-sm text-primary hover:underline",
          children: "Back to Sign up"
        }
      )
    ] })
  ] }) });
}
export {
  VerifyEmailPage
};
