import { jsxs, jsx } from "react/jsx-runtime";
import { Users, Search, AlertCircle } from "lucide-react";
import { I as Input } from "./input-BNFtwTqC.js";
import "react";
import "./server-build-yCr6HHQW.js";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "react-router-dom";
import "zustand";
import "clsx";
import "tailwind-merge";
function SearchProfilesPage() {
  return /* @__PURE__ */ jsxs("div", { className: "relative h-[calc(100vh-8rem)] overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 blur-sm pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Find People" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Discover and connect with other learners" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "search",
            placeholder: "Search by username or name...",
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "block bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full overflow-hidden bg-muted", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: `https://source.unsplash.com/random/100x100?face&sig=${i}`,
                alt: "Profile",
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h3", { className: "font-medium", children: [
                "User Name ",
                i
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "@username",
                i
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
                "Bio description for user ",
                i,
                "..."
              ] })
            ] })
          ] })
        },
        i
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Coming Soon!" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "We're working on exciting features to help you connect with fellow learners and creators. Stay tuned for updates!" })
    ] }) })
  ] });
}
export {
  SearchProfilesPage
};
