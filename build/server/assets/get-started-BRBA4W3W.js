import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { BookOpen, Target, Users, Zap, Sparkles, ArrowRight } from "lucide-react";
function GetStartedPage() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-4xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-6", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "w-10 h-10 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold", children: "Inlits" })
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl font-bold mb-4 leading-tight", children: [
        "Stories, Ideas, and ",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Communities" }),
        " Unite"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto", children: "Discover, learn, and grow with personalized content recommendations tailored just for you" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-lg border bg-card", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Target, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Personalized Learning" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Get content recommendations based on your interests and goals" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-lg border bg-card", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Join Communities" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connect with like-minded learners and participate in discussions" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center p-6 rounded-lg border bg-card", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Track Progress" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Monitor your learning journey and achieve your goals" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/onboarding",
            className: "inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium text-lg",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5" }),
              "Start Learning Journey",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Takes 2 minutes • Completely free • No credit card required" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Already have an account?" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/signin",
            className: "text-primary hover:underline font-medium",
            children: "Login"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-8 border-t", children: /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Want to share your knowledge?" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Join as a creator and start publishing your content to reach thousands of learners" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/become-creator",
            className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors",
            children: [
              "Become a Creator",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] }) })
    ] })
  ] }) });
}
export {
  GetStartedPage
};
