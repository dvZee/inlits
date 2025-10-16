import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useAuth, s as supabase } from "./server-build-yCr6HHQW.js";
import { Eye, FileText, Mic, Headphones, BookOpen } from "lucide-react";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "react-router-dom";
import "zustand";
import "clsx";
import "tailwind-merge";
function AnalyticsPage() {
  var _a, _b;
  const { profile } = useAuth();
  const [period, setPeriod] = useState("month");
  const [performance, setPerformance] = useState([]);
  const [engagement, setEngagement] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [audience, setAudience] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!profile) return;
      try {
        const { data: performanceData, error: performanceError } = await supabase.rpc(
          "get_content_performance",
          { creator_id: profile.id, period }
        );
        if (performanceError) throw performanceError;
        setPerformance(performanceData || []);
        const { data: engagementData, error: engagementError } = await supabase.rpc(
          "get_engagement_metrics",
          { creator_id: profile.id, period }
        );
        if (engagementError) throw engagementError;
        setEngagement(engagementData || []);
        const { data: topContentData, error: topContentError } = await supabase.rpc(
          "get_top_content",
          { creator_id: profile.id, period }
        );
        if (topContentError) throw topContentError;
        setTopContent(topContentData || []);
        const { data: audienceData, error: audienceError } = await supabase.rpc(
          "get_audience_insights",
          { creator_id: profile.id, period }
        );
        if (audienceError) throw audienceError;
        if (audienceData) {
          setAudience(audienceData[0]);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [profile, period]);
  const formatNumber = (num) => {
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + "M";
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + "K";
    }
    return num.toString();
  };
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const getContentIcon = (type) => {
    switch (type) {
      case "article":
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
      case "book":
        return /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" });
      case "audiobook":
        return /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" });
      case "podcast":
        return /* @__PURE__ */ jsx(Mic, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6 h-32" }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6 h-96" }),
        /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6 h-96" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Analytics" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: period,
          onChange: (e) => setPeriod(e.target.value),
          className: "px-3 py-1.5 rounded-lg bg-[#1a1d24] border border-[#2a2f38] text-sm",
          children: [
            /* @__PURE__ */ jsx("option", { value: "day", children: "Last 24 Hours" }),
            /* @__PURE__ */ jsx("option", { value: "week", children: "Last 7 Days" }),
            /* @__PURE__ */ jsx("option", { value: "month", children: "Last 30 Days" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Total Views" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatNumber((audience == null ? void 0 : audience.total_viewers) || 0) }),
          /* @__PURE__ */ jsxs("p", { className: "ml-2 text-sm text-blue-500", children: [
            "+",
            formatNumber(((_a = engagement[0]) == null ? void 0 : _a.views) || 0),
            " today"
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Engagement Rate" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-semibold", children: [
            (((audience == null ? void 0 : audience.returning_viewers) || 0) / ((audience == null ? void 0 : audience.total_viewers) || 1) * 100).toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "ml-2 text-sm text-blue-500", children: [
            formatNumber((audience == null ? void 0 : audience.returning_viewers) || 0),
            " returning"
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Avg. Time" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-semibold", children: [
            ((_b = audience == null ? void 0 : audience.avg_view_duration) == null ? void 0 : _b.split(":")[1]) || 0,
            "m"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-blue-500", children: "per session" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "New Followers" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: formatNumber((audience == null ? void 0 : audience.new_followers) || 0) }),
          /* @__PURE__ */ jsxs("p", { className: "ml-2 text-sm text-blue-500", children: [
            "this ",
            period
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-6", children: "Top Content" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: topContent.map((content) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-[#2a2f38]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#2a2f38] flex items-center justify-center", children: getContentIcon(content.type) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium line-clamp-1", children: content.title }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-400", children: [
                /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  formatNumber(content.views),
                  " views"
                ] }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  content.engagement_rate.toFixed(1),
                  "% engagement"
                ] })
              ] })
            ] })
          ] }),
          content.earnings > 0 && /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatMoney(content.earnings) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-500", children: "earned" })
          ] })
        ] }, content.content_id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-6", children: "Content Performance" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: Object.entries((audience == null ? void 0 : audience.top_content_types) || {}).map(([type, count]) => {
          const total = Object.values((audience == null ? void 0 : audience.top_content_types) || {}).reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? count / total * 100 : 0;
          return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                getContentIcon(type),
                /* @__PURE__ */ jsx("span", { className: "capitalize", children: type })
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                formatNumber(count),
                " views"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 bg-[#2a2f38] rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-blue-500 transition-all",
                style: { width: `${percentage}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-400", children: [
              percentage.toFixed(1),
              "% of total views"
            ] })
          ] }, type);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Engagement Over Time" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500" }),
            /* @__PURE__ */ jsx("span", { children: "Views" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }),
            /* @__PURE__ */ jsx("span", { children: "Followers" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-purple-500" }),
            /* @__PURE__ */ jsx("span", { children: "Earnings" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-gray-400", children: "Engagement chart will be implemented here" })
    ] })
  ] });
}
export {
  AnalyticsPage
};
