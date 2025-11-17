import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useAuth, s as supabase } from "./server-build-CzlBCFpg.js";
import { DollarSign, Clock, Users, Headphones, BookOpen } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "react-router-dom";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
function EarningsPage() {
  const { profile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [sources, setSources] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadEarningsData = async () => {
      if (!profile) return;
      try {
        const { data: overviewData, error: overviewError } = await supabase.rpc(
          "get_earnings_overview",
          { creator_id: profile.id }
        );
        if (overviewError) throw overviewError;
        if (overviewData) {
          setOverview(overviewData[0]);
        }
        const { data: sourcesData, error: sourcesError } = await supabase.rpc(
          "get_earnings_by_source",
          { creator_id: profile.id }
        );
        if (sourcesError) throw sourcesError;
        setSources(sourcesData || []);
        const { data: historyData, error: historyError } = await supabase.rpc(
          "get_earnings_history",
          { creator_id: profile.id, page_size: 10, page_number: 1 }
        );
        if (historyError) throw historyError;
        setTransactions(historyData || []);
      } catch (error) {
        console.error("Error loading earnings data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEarningsData();
  }, [profile]);
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const formatGrowth = (value) => {
    if (!value) return "+0%";
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };
  const getSourceIcon = (type) => {
    switch (type) {
      case "book_sale":
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" });
      case "audiobook_sale":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" });
      case "subscription":
        return /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" });
      case "session":
        return /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" });
    }
  };
  const formatSourceType = (type) => {
    return type.split("_").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6 h-32" }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6 h-64" }),
        /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6 h-64" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Total Earnings" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatMoney((overview == null ? void 0 : overview.total_earnings) || 0) }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-blue-500", children: formatGrowth((overview == null ? void 0 : overview.earnings_growth) || 0) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Monthly Revenue" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatMoney((overview == null ? void 0 : overview.monthly_revenue) || 0) }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-blue-500", children: formatGrowth((overview == null ? void 0 : overview.monthly_growth) || 0) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Pending Payouts" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatMoney((overview == null ? void 0 : overview.pending_payouts) || 0) }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-gray-400", children: "Processing" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Available Balance" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatMoney((overview == null ? void 0 : overview.available_balance) || 0) }),
          /* @__PURE__ */ jsx("button", { className: "ml-2 text-sm text-blue-500 hover:underline", children: "Withdraw" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-6", children: "Revenue Breakdown" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: sources.map((source) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              getSourceIcon(source.source_type),
              /* @__PURE__ */ jsx("span", { children: formatSourceType(source.source_type) })
            ] }),
            /* @__PURE__ */ jsx("span", { children: formatMoney(source.amount) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 bg-[#2a2f38] rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-blue-500 transition-all",
              style: { width: `${source.percentage}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-400", children: [
            source.percentage.toFixed(1),
            "% of total revenue"
          ] })
        ] }, source.source_type)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-6", children: "Transaction History" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: transactions.map((transaction) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3 border-b border-[#2a2f38]", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              getSourceIcon(transaction.source_type),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: transaction.source_details.title || formatSourceType(transaction.source_type) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: new Date(transaction.earned_at).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatMoney(transaction.amount) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-500", children: "Completed" })
          ] })
        ] }, transaction.id)) })
      ] })
    ] })
  ] });
}
export {
  EarningsPage
};
