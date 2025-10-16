import { jsx, jsxs } from "react/jsx-runtime";
import { useSearchParams, Link } from "react-router-dom";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsx("div", { className: "container max-w-2xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-8", children: [
    /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(XCircle, { className: "w-12 h-12 text-orange-600 dark:text-orange-400" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Payment Cancelled" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Your payment was cancelled. No charges were made to your account." })
    ] }),
    orderId && /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Order ID:" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: orderId })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => window.history.back(),
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" }),
            "Try Again"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg border hover:bg-accent transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }),
            "Return Home"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Need help? Contact our support team at",
      " ",
      /* @__PURE__ */ jsx("a", { href: "mailto:support@inlits.com", className: "text-primary hover:underline", children: "support@inlits.com" })
    ] }) })
  ] }) }) });
}
export {
  PaymentCancelPage
};
