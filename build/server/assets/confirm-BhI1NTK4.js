import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-CzlBCFpg.js";
import { Loader2, AlertCircle, CheckCircle, Crown, ArrowRight, Download } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function SubscriptionConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const orderId = searchParams.get("order");
  useEffect(() => {
    const loadTransaction = async () => {
      if (!orderId || !user) {
        setError("Invalid confirmation request");
        setLoading(false);
        return;
      }
      try {
        const { data, error: error2 } = await supabase.from("payment_transactions").select("*").eq("order_id", orderId).eq("user_id", user.id).single();
        if (error2) throw error2;
        setTransaction(data);
        if (data.status === "completed") {
          const expiryDate = /* @__PURE__ */ new Date();
          if (data.plan_id === "weekly") {
            expiryDate.setDate(expiryDate.getDate() + 7);
          } else if (data.plan_id === "monthly") {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (data.plan_id === "annual") {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }
          await supabase.from("profiles").update({
            subscription_plan: data.plan_id,
            subscription_status: "active",
            subscription_expires_at: expiryDate.toISOString()
          }).eq("id", user.id);
        }
      } catch (err) {
        console.error("Error loading transaction:", err);
        setError(err instanceof Error ? err.message : "Failed to load confirmation");
      } finally {
        setLoading(false);
      }
    };
    loadTransaction();
  }, [orderId, user]);
  const plans = {
    weekly: { name: "Weekly", price: 150, period: "week" },
    monthly: { name: "Monthly", price: 399, period: "month" },
    annual: { name: "Annual", price: 3600, period: "year" }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-12 h-12 animate-spin text-primary mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Confirming your subscription..." })
    ] }) });
  }
  if (error || !transaction) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4 max-w-md", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Confirmation Error" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error || "We could not confirm your subscription. Please contact support." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/subscription"),
          className: "text-primary hover:underline",
          children: "Try again"
        }
      )
    ] }) });
  }
  const selectedPlan = plans[transaction.plan_id];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card", children: /* @__PURE__ */ jsx("div", { className: "container max-w-4xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium", children: "4" }),
      /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Confirm" })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "container max-w-2xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-16 h-16 text-green-600 dark:text-green-400" }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Crown, { className: "w-5 h-5 text-primary-foreground" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Welcome to Inlits Premium!" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Your subscription has been activated successfully. Enjoy unlimited access to all premium content." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 text-left space-y-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-center mb-4", children: "Subscription Details" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Plan:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              selectedPlan == null ? void 0 : selectedPlan.name,
              " Subscription"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Amount Paid:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
              "Rs ",
              transaction.amount.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Payment Method:" }),
            /* @__PURE__ */ jsx("span", { className: "capitalize", children: transaction.payment_method })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Order ID:" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: transaction.order_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Next Billing:" }),
            /* @__PURE__ */ jsx("span", { children: new Date(Date.now() + ((selectedPlan == null ? void 0 : selectedPlan.period) === "week" ? 7 * 24 * 60 * 60 * 1e3 : (selectedPlan == null ? void 0 : selectedPlan.period) === "month" ? 30 * 24 * 60 * 60 * 1e3 : 365 * 24 * 60 * 60 * 1e3)).toLocaleDateString() })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-primary/5 border border-primary/20 rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "What's included in your subscription:" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "Unlimited premium content" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "Ad-free experience" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "HD quality streaming" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "Offline downloads" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "Multiple device access" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "Priority support" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate("/"),
            className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2",
            children: [
              "Start Exploring Premium Content",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/library"),
            className: "w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors",
            children: "Go to My Library"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxs("button", { className: "text-sm text-primary hover:underline flex items-center gap-1 mx-auto", children: [
        /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
        "Download Receipt"
      ] }) })
    ] }) })
  ] });
}
export {
  SubscriptionConfirmPage
};
