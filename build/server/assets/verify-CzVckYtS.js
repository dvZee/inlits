import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-yCr6HHQW.js";
import { ArrowLeft, Smartphone, AlertCircle, Loader2, RefreshCw, ArrowRight, Shield } from "lucide-react";
import { I as Input } from "./input-BNFtwTqC.js";
import { L as Label } from "./label-hXa1UKZq.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function SubscriptionVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const orderId = searchParams.get("order");
  const paymentMethod = searchParams.get("method");
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1e3);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);
  useEffect(() => {
    if (!user || !orderId) {
      navigate("/subscription");
      return;
    }
  }, [user, orderId, navigate]);
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${"https://yvjrakgbqqazedjltflw.supabase.co"}/functions/v1/verify-payfast-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU"}`
          },
          body: JSON.stringify({
            order_id: orderId,
            otp,
            transaction_id: orderId
          })
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "OTP verification failed");
      }
      await supabase.from("payment_transactions").update({
        status: "completed",
        verified_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("order_id", orderId);
      navigate(`/subscription/confirm?order=${orderId}`);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };
  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${"https://yvjrakgbqqazedjltflw.supabase.co"}/functions/v1/resend-payfast-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU"}`
          },
          body: JSON.stringify({
            order_id: orderId,
            transaction_id: orderId
          })
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to resend OTP");
      }
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card", children: /* @__PURE__ */ jsx("div", { className: "container max-w-4xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate(-1),
          className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Back" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium", children: "3" }),
        /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Verify" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "container max-w-md mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(Smartphone, { className: "w-10 h-10 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Verify Your Payment" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "We've sent a 6-digit OTP to your ",
          paymentMethod,
          " account. Please enter it below to complete your subscription."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "otp", children: "Enter OTP" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "otp",
              type: "text",
              value: otp,
              onChange: (e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)),
              placeholder: "123456",
              className: "text-center text-lg tracking-widest",
              maxLength: 6
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxs("div", { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-destructive" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-center", children: canResend ? /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleResendOTP,
            disabled: resendLoading,
            className: "text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto",
            children: resendLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
              "Resending..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
              "Resend OTP"
            ] })
          }
        ) : /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Resend OTP in ",
          formatTime(countdown)
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleVerifyOTP,
          disabled: otp.length !== 6 || loading,
          className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
          children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
            "Verifying..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Verify & Complete Payment",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
          ] })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "bg-muted/30 border rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-primary mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Secure Transaction" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your payment is protected by bank-level security. The OTP ensures only you can complete this transaction." })
        ] })
      ] }) })
    ] }) })
  ] });
}
export {
  SubscriptionVerifyPage
};
