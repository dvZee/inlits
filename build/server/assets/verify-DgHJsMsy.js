import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-B2NqiNl4.js";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function SubscriptionVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const orderId = searchParams.get("order");
  const tracker = searchParams.get("tracker");
  useEffect(() => {
    if (!user || !orderId) {
      navigate("/subscription");
      return;
    }
    const verifyPayment = async () => {
      if (!tracker) {
        setError("Missing payment tracker");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${void 0}/functions/v1/verify-safepay-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${void 0}`
            },
            body: JSON.stringify({ tracker })
          }
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Payment verification failed");
        }
        if (result.paid) {
          await supabase.from("payment_transactions").update({
            status: "completed",
            verified_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("order_id", orderId);
          setVerified(true);
          setTimeout(() => {
            navigate(`/subscription/confirm?order=${orderId}`);
          }, 2e3);
        } else {
          setError("Payment not completed yet. Please complete the payment on Safepay.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [user, orderId, tracker, navigate]);
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card", children: /* @__PURE__ */ jsx("div", { className: "container max-w-4xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/subscription"),
          className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Back" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium", children: "3" }),
        /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Verify Payment" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "container max-w-md mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
      loading && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(Loader2, { className: "w-10 h-10 text-primary animate-spin" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Verifying Payment" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Please wait while we verify your payment with Safepay..." })
        ] })
      ] }),
      verified && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-10 h-10 text-green-500" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Payment Verified!" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Your payment has been successfully verified. Redirecting you to confirmation page..." })
        ] })
      ] }),
      error && !loading && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(AlertCircle, { className: "w-10 h-10 text-destructive" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Verification Failed" }),
          /* @__PURE__ */ jsx("div", { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleRetry,
            className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors",
            children: "Retry Verification"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/subscription"),
            className: "w-full border border-input hover:bg-accent text-foreground font-medium py-4 px-6 rounded-lg transition-colors",
            children: "Return to Subscription"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-muted/30 border rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-primary mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Secure Transaction" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your payment is protected by Safepay's bank-level security." })
        ] })
      ] }) })
    ] }) })
  ] });
}
export {
  SubscriptionVerifyPage
};
