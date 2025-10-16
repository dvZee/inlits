import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Library, Download, BookOpen, Headphones } from "lucide-react";
import { u as useAuth, s as supabase } from "./server-build-yCr6HHQW.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "clsx";
import "tailwind-merge";
function PaymentSuccessPage() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const orderId = searchParams.get("order");
  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId || !user) {
        setError("Invalid payment verification");
        setLoading(false);
        return;
      }
      try {
        const { data, error: error2 } = await supabase.from("payment_transactions").select(`
            *,
            item:books(title, cover_url, file_url),
            audiobook:audiobooks(title, cover_url)
          `).eq("order_id", orderId).eq("user_id", user.id).single();
        if (error2) throw error2;
        setTransaction(data);
        if (data.status === "completed") {
          await supabase.from("reading_status").upsert({
            user_id: user.id,
            content_id: data.item_id,
            content_type: data.item_type,
            status: "want_to_consume"
          });
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError(err instanceof Error ? err.message : "Payment verification failed");
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [orderId, user]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Verifying your payment..." })
    ] }) });
  }
  if (error || !transaction) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4 max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 text-destructive" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Payment Verification Failed" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error || "We could not verify your payment. Please contact support if you were charged." }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: "Return Home"
        }
      )
    ] }) });
  }
  const getContentIcon = (type) => {
    switch (type) {
      case "audiobook":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-6 h-6" });
      default:
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-6 h-6" });
    }
  };
  const getAccessUrl = () => {
    switch (transaction.item_type) {
      case "book":
        return `/reader/book-${transaction.item_id}`;
      case "audiobook":
        return `/player/audiobook-${transaction.item_id}`;
      default:
        return "/library";
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsx("div", { className: "container max-w-2xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-8", children: [
    /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-12 h-12 text-green-600 dark:text-green-400" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Payment Successful!" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Thank you for your purchase. Your content is now available in your library." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6 text-left", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Order Details" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Order ID:" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: transaction.order_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Amount:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
            "$",
            transaction.amount
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Payment Method:" }),
          /* @__PURE__ */ jsx("span", { children: "PayFast" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Status:" }),
          /* @__PURE__ */ jsx("span", { className: "text-green-600 dark:text-green-400 font-medium", children: transaction.status === "completed" ? "Completed" : "Processing" })
        ] })
      ] })
    ] }),
    (transaction.item || transaction.audiobook) && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Your Purchase" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-20 rounded-lg overflow-hidden bg-muted", children: ((_a = transaction.item) == null ? void 0 : _a.cover_url) || ((_b = transaction.audiobook) == null ? void 0 : _b.cover_url) ? /* @__PURE__ */ jsx(
          "img",
          {
            src: ((_c = transaction.item) == null ? void 0 : _c.cover_url) || ((_d = transaction.audiobook) == null ? void 0 : _d.cover_url),
            alt: ((_e = transaction.item) == null ? void 0 : _e.title) || ((_f = transaction.audiobook) == null ? void 0 : _f.title),
            className: "w-full h-full object-cover"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: getContentIcon(transaction.item_type) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: ((_g = transaction.item) == null ? void 0 : _g.title) || ((_h = transaction.audiobook) == null ? void 0 : _h.title) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground capitalize", children: transaction.item_type })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: getAccessUrl(),
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: [
            getContentIcon(transaction.item_type),
            transaction.item_type === "audiobook" ? "Listen Now" : "Read Now"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/library",
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg border hover:bg-accent transition-colors",
          children: [
            /* @__PURE__ */ jsx(Library, { className: "w-5 h-5" }),
            "Go to Library"
          ]
        }
      )
    ] }),
    ((_i = transaction.item) == null ? void 0 : _i.file_url) && /* @__PURE__ */ jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: transaction.item.file_url,
        download: true,
        className: "inline-flex items-center gap-2 text-sm text-primary hover:underline",
        children: [
          /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
          "Download File"
        ]
      }
    ) })
  ] }) }) });
}
export {
  PaymentSuccessPage
};
