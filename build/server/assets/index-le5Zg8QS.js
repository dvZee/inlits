import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { u as useAuth } from "./server-build-CUWZnfIj.js";
import { Check, ArrowRight } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
const plans = [
  {
    id: "weekly",
    name: "Weekly",
    price: 150,
    period: "weekly",
    description: "Perfect for trying out premium features",
    features: [
      "Unlimited audiobooks and podcasts",
      "High-quality audio streaming",
      "Listen on up to 2 devices",
      "Ad-free experience",
      "Premium content library"
    ]
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 399,
    period: "monthly",
    description: "Most popular choice for regular users",
    popular: true,
    features: [
      "Unlimited audiobooks and podcasts",
      "High-quality audio streaming",
      "Listen on up to 5 devices",
      "Ad-free experience",
      "Premium content library",
      "Offline downloads",
      "Priority customer support"
    ]
  },
  {
    id: "annual",
    name: "Annual",
    price: 3600,
    originalPrice: 4788,
    discount: "25% OFF",
    period: "annual",
    description: "Best value with maximum savings",
    features: [
      "Unlimited audiobooks and podcasts",
      "High-quality audio streaming",
      "Listen on up to 5 devices",
      "Ad-free experience",
      "Premium content library",
      "Offline downloads",
      "Priority customer support",
      "Exclusive content access",
      "Early access to new features"
    ]
  }
];
function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [loading, setLoading] = useState(false);
  const handleContinue = () => {
    if (!user) {
      navigate("/signin", {
        state: {
          from: { pathname: "/subscription" },
          message: "Please sign in to continue with your subscription"
        }
      });
      return;
    }
    navigate(`/subscription/payment?plan=${selectedPlan.id}`);
  };
  const formatPrice = (price) => {
    return `Rs ${price.toLocaleString()}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card", children: /* @__PURE__ */ jsx("div", { className: "container max-w-4xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium", children: "1" }),
        /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Select Package" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-4 text-muted-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }),
        /* @__PURE__ */ jsx("div", { className: "w-16 h-px bg-border" }),
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm", children: "2" }),
        /* @__PURE__ */ jsx("span", { children: "Payment Method" }),
        /* @__PURE__ */ jsx("div", { className: "w-16 h-px bg-border" }),
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm", children: "3" }),
        /* @__PURE__ */ jsx("span", { children: "Verify" }),
        /* @__PURE__ */ jsx("div", { className: "w-16 h-px bg-border" }),
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm", children: "4" }),
        /* @__PURE__ */ jsx("span", { children: "Confirm" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-6xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-4", children: "Choose Your Plan" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Unlock unlimited access to premium content and features" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex bg-muted rounded-lg p-1", children: [
        /* @__PURE__ */ jsx("button", { className: "px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium", children: "Packages" }),
        /* @__PURE__ */ jsx("button", { className: "px-6 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors", children: "Promotional Packages" }),
        /* @__PURE__ */ jsx("button", { className: "px-6 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors", children: "Promo Code" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: plans.map((plan) => /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => setSelectedPlan(plan),
          className: `relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${selectedPlan.id === plan.id ? "border-primary bg-primary/5 shadow-lg" : "border-input hover:border-primary/50"}`,
          children: [
            plan.popular && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full z-10", children: "Most Popular" }),
            plan.discount && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 right-4 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full", children: plan.discount }),
            /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-2", children: plan.name }),
              /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
                plan.originalPrice && /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground line-through mr-2", children: formatPrice(plan.originalPrice) }),
                /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-primary", children: formatPrice(plan.price) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: plan.description })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-3 mb-6", children: plan.features.map((feature, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: feature })
            ] }, index)) }),
            selectedPlan.id === plan.id && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-xl border-2 border-primary pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary-foreground" }) }) })
          ]
        },
        plan.id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleContinue,
            disabled: loading,
            className: "w-full max-w-md mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2",
            children: loading ? /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Continue",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-4", children: "You can cancel anytime. No hidden fees." })
      ] })
    ] })
  ] });
}
export {
  SubscriptionPage
};
