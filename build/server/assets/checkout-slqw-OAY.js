import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { u as useAuth, s as supabase } from "./server-build-yCr6HHQW.js";
import { Loader2, AlertCircle, Lock, ArrowLeft, CreditCard } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "clsx";
import "tailwind-merge";
function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentItem, setPaymentItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const itemId = searchParams.get("item");
  const itemType = searchParams.get("type");
  useEffect(() => {
    const loadPaymentItem = async () => {
      if (!itemId || !itemType) {
        setError("Invalid payment request");
        setLoadingItem(false);
        return;
      }
      try {
        let data, error2;
        if (itemType === "book") {
          ({ data, error: error2 } = await supabase.from("books").select("id, title, price, cover_url, description").eq("id", itemId).single());
        } else if (itemType === "audiobook") {
          ({ data, error: error2 } = await supabase.from("audiobooks").select("id, title, price, cover_url, description").eq("id", itemId).single());
        } else if (itemType === "subscription") {
          data = {
            id: "pro-monthly",
            title: "Inlits Pro - Monthly",
            price: 9.99,
            description: "Access to all premium content and features"
          };
        }
        if (error2) throw error2;
        if (!data) throw new Error("Item not found");
        setPaymentItem({
          ...data,
          type: itemType
        });
      } catch (err) {
        console.error("Error loading payment item:", err);
        setError(err instanceof Error ? err.message : "Failed to load item");
      } finally {
        setLoadingItem(false);
      }
    };
    loadPaymentItem();
  }, [itemId, itemType]);
  const handlePayment = async () => {
    if (!user || !paymentItem) return;
    setLoading(true);
    setError(null);
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const paymentData = {
        amount: paymentItem.price,
        itemName: paymentItem.title,
        orderId,
        customerEmail: user.email,
        returnUrl: `${window.location.origin}/payment/success?order=${orderId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?order=${orderId}`,
        notifyUrl: `${"https://yvjrakgbqqazedjltflw.supabase.co"}/functions/v1/payfast-webhook`
      };
      const response = await fetch(
        `${"https://yvjrakgbqqazedjltflw.supabase.co"}/functions/v1/initiate-payfast-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU"}`
          },
          body: JSON.stringify(paymentData)
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Payment initiation failed");
      }
      await supabase.from("payment_transactions").insert({
        order_id: orderId,
        user_id: user.id,
        item_id: paymentItem.id,
        item_type: paymentItem.type,
        amount: paymentItem.price,
        status: "pending",
        payment_method: "payfast"
      });
      if (result.formData && result.paymentUrl) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.paymentUrl;
        Object.entries(result.formData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("Invalid payment response");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };
  if (loadingItem) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) });
  }
  if (error && !paymentItem) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Payment Error" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "text-primary hover:underline",
          children: "Go back"
        }
      )
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx(Lock, { className: "w-12 h-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Sign in required" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Please sign in to complete your purchase" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/signin"),
          className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: "Sign in"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-2xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "p-2 hover:bg-accent rounded-lg transition-colors",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Checkout" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Complete your purchase" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Order Summary" }),
          paymentItem && /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            paymentItem.cover_url && /* @__PURE__ */ jsx("div", { className: "w-20 h-28 rounded-lg overflow-hidden bg-muted", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: paymentItem.cover_url,
                alt: paymentItem.title,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium", children: paymentItem.title }),
              paymentItem.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: paymentItem.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Price:" }),
                /* @__PURE__ */ jsxs("span", { className: "text-lg font-semibold", children: [
                  "$",
                  paymentItem.price
                ] })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-lg font-semibold", children: [
          /* @__PURE__ */ jsx("span", { children: "Total:" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "$",
            paymentItem == null ? void 0 : paymentItem.price
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Payment Method" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(CreditCard, { className: "w-5 h-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "PayFast" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Secure payment processing" })
              ] })
            ] }),
            error && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: error })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handlePayment,
                disabled: loading || !paymentItem,
                className: "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50",
                children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
                  "Processing..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5" }),
                  "Pay $",
                  paymentItem == null ? void 0 : paymentItem.price,
                  " with PayFast"
                ] })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsx("span", { children: "Secured by PayFast" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-muted/30 border rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5 text-primary mt-0.5" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Secure Payment" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your payment information is encrypted and processed securely by PayFast. We never store your card details." })
          ] })
        ] }) })
      ] })
    ] })
  ] }) });
}
export {
  CheckoutPage
};
