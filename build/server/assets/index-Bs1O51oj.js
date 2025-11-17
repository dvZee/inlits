import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { u as useAuth } from "./server-build-CzlBCFpg.js";
import { AlertCircle, Plus, Clock } from "lucide-react";
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
function AppointmentsPage() {
  useAuth();
  useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Coming Soon!" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "We're working on scheduling and appointment features to help you connect with your audience. Stay tuned for updates!" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Total Sessions" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: "128" }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-blue-500", children: "+12 this month" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Upcoming Sessions" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: "8" }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-blue-500", children: "Next: Today 3 PM" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Total Hours" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: "256" }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-gray-400", children: "hours taught" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-400", children: "Earnings" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: "$2,450" }),
          /* @__PURE__ */ jsx("p", { className: "ml-2 text-sm text-blue-500", children: "this month" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Upcoming Sessions" }),
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors", children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { children: "Add Session" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-[#2a2f38] hover:border-blue-500/50 transition-colors", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: `https://source.unsplash.com/random/100x100?face&sig=${i}`,
              alt: "Student",
              className: "w-12 h-12 rounded-full"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Writing Workshop" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-400", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Today at ",
                3 + i,
                ":00 PM"
              ] }),
              /* @__PURE__ */ jsx("span", { children: "•" }),
              /* @__PURE__ */ jsx("span", { children: "60 minutes" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: "$75" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-500", children: "Join Meeting" })
        ] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1d24] rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-6", children: "Session Types" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        { title: "1-on-1 Mentoring", duration: "30 min", price: "$45" },
        { title: "Writing Review", duration: "60 min", price: "$75" },
        { title: "Group Workshop", duration: "90 min", price: "$120" },
        { title: "Quick Consultation", duration: "15 min", price: "$25" }
      ].map((session, i) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border border-[#2a2f38] hover:border-blue-500/50 transition-colors", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium", children: session.title }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-gray-400", children: [
          /* @__PURE__ */ jsx("span", { children: session.duration }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsx("span", { children: session.price })
        ] })
      ] }, i)) })
    ] })
  ] });
}
export {
  AppointmentsPage
};
