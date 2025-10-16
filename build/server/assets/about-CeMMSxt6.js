import { jsxs, jsx } from "react/jsx-runtime";
import React__default, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Users, BookMarked, Headphones, Zap, ArrowRight, Shield, Globe, Star, CheckCircle } from "lucide-react";
function AboutPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1
    };
    const handleIntersect = (entries, observer2) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer2.unobserve(entry.target);
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    [heroRef, featuresRef, statsRef, testimonialsRef, pricingRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    document.querySelectorAll(".fade-in-element").forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  const bookCovers = [
    "https://ia800703.us.archive.org/0/items/atomic_202504/atomic.jpg",
    "https://dailytimes.com.pk/assets/uploads/2021/07/06/the-alchemist-a-graphic-novel.jpg",
    "https://ia600505.us.archive.org/27/items/125585369/dass.jpg",
    "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1709986452i/204927599.jpg",
    "https://dn720708.ca.archive.org/0/items/9781785040207-grit/0.1869333853005194.jpg",
    "https://yvjrakgbqqazedjltflw.supabase.co/storage/v1/object/public/audiobook-covers/dad3a501-07f9-4830-8868-8fd89c11583a/0.9782089675019395.jpg"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "section",
      {
        ref: heroRef,
        className: "relative py-20 md:py-32 opacity-0 transition-all duration-1000 translate-y-8 ",
        style: { animationDelay: "0.2s" },
        children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-0 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium", children: "Discover a new way to learn" }),
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-6xl font-bold mb-6 leading-tight", children: [
            "Stories, Ideas, and ",
            /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Communities" }),
            " Unite"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto mb-10", children: "Inlits is a platform designed to connect readers, writers, and thinkers in a shared space of stories and ideas. Discover, create, and discuss content that matters to you." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/signup",
                className: "px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium",
                children: "Get Started Free"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/library",
                className: "px-8 py-3 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all font-medium",
                children: "Explore Library"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative mt-16 max-w-6xl mx-auto overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-4 animate-carousel", children: [...bookCovers, ...bookCovers].map((cover, i) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-40 h-56 flex-shrink-0 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300",
                style: {
                  transform: `rotate(${Math.sin(i * 0.5) * 5}deg)`,
                  animationDelay: `${i * 0.1}s`
                },
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: cover,
                    alt: "Book Cover",
                    className: "w-full h-full object-cover"
                  }
                )
              },
              i
            )) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "py-8 md:py-12 bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground mb-8", children: "Trusted by readers and creators worldwide" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center items-center gap-8 md:gap-16", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-muted-foreground/70 fade-in-element opacity-0 transition-all duration-700", children: "10,000+ Active Readers" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-muted-foreground/70 fade-in-element opacity-0 transition-all duration-700", style: { animationDelay: "0.1s" }, children: "50+ Content Creators" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-muted-foreground/70 fade-in-element opacity-0 transition-all duration-700", style: { animationDelay: "0.2s" }, children: "5+ Countries" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-muted-foreground/70 fade-in-element opacity-0 transition-all duration-700", style: { animationDelay: "0.3s" }, children: "50,000+ Books Read" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      "section",
      {
        ref: featuresRef,
        className: "py-20 md:py-32 opacity-0 transition-all duration-1000 translate-y-8 bg-gradient-to-br from-primary/5 to-transparent",
        children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Everything You Need to Learn and Grow" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto", children: "Discover a comprehensive platform designed to enhance your learning journey with powerful features and tools." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: [
            {
              icon: /* @__PURE__ */ jsx(BookOpen, { className: "w-10 h-10 text-primary" }),
              title: "Content Discovery",
              description: "Explore a wide range of articles, e-books, audiobooks, and podcasts across various categories.",
              delay: 0.1
            },
            {
              icon: /* @__PURE__ */ jsx(FileText, { className: "w-10 h-10 text-primary" }),
              title: "Creator Tools",
              description: "Empower writers and creators with tools to publish and manage their content.",
              delay: 0.2
            },
            {
              icon: /* @__PURE__ */ jsx(Users, { className: "w-10 h-10 text-primary" }),
              title: "Community Engagement",
              description: "Connect with like-minded individuals through book clubs, discussions, and learning challenges.",
              delay: 0.3
            },
            {
              icon: /* @__PURE__ */ jsx(BookMarked, { className: "w-10 h-10 text-primary" }),
              title: "Personalized Experience",
              description: "Customize your reading preferences, track your learning goals, and build your personal library.",
              delay: 0.4
            },
            {
              icon: /* @__PURE__ */ jsx(Headphones, { className: "w-10 h-10 text-primary" }),
              title: "Audio Content",
              description: "Listen to audiobooks and podcasts with our advanced audio player with customizable playback options.",
              delay: 0.5
            },
            {
              icon: /* @__PURE__ */ jsx(Zap, { className: "w-10 h-10 text-primary" }),
              title: "Offline Access",
              description: "Access cached content even without an internet connection, thanks to Service Worker implementation.",
              delay: 0.6
            }
          ].map((feature, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-card border rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 fade-in-element opacity-0",
              style: { animationDelay: `${feature.delay}s` },
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-6", children: feature.icon }),
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-3", children: feature.title }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: feature.description })
              ]
            },
            index
          )) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "How Inlits Works" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto", children: "A simple, intuitive process designed to enhance your learning experience" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto", children: [
        {
          number: "01",
          title: "Discover Content",
          description: "Browse through our extensive library of books, articles, podcasts, and audiobooks tailored to your interests.",
          delay: 0.1
        },
        {
          number: "02",
          title: "Engage & Learn",
          description: "Read, listen, and engage with content. Take notes, highlight important passages, and track your progress.",
          delay: 0.3
        },
        {
          number: "03",
          title: "Connect & Grow",
          description: "Join communities, participate in discussions, and connect with like-minded learners and creators.",
          delay: 0.5
        }
      ].map((step, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "text-center fade-in-element opacity-0 transition-all duration-1000",
          style: { animationDelay: `${step.delay}s` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center mx-auto mb-6", children: step.number }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-3", children: step.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: step.description })
          ]
        },
        index
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "relative mt-20 max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl transform rotate-1" }),
        /* @__PURE__ */ jsx("div", { className: "relative bg-card border rounded-2xl p-8 md:p-12 shadow-lg -rotate-1 hover:rotate-0 transition-transform duration-500", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 items-center", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-4", children: "Ready to start your learning journey?" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Join thousands of learners who are discovering new ideas, expanding their knowledge, and connecting with a community of curious minds." }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/signup",
                className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium",
                children: [
                  "Get Started Now",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg",
                alt: "Learning Journey",
                className: "rounded-lg shadow-lg"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium", children: "Join 50,000+ learners" })
          ] })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-32 bg-gradient-to-br from-primary/5 to-transparent", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Explore Our Content Categories" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto", children: "Discover content across a wide range of topics and formats to suit your learning style" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", children: [
        { icon: /* @__PURE__ */ jsx(BookOpen, {}), name: "Business" },
        { icon: /* @__PURE__ */ jsx(Shield, {}), name: "Technology" },
        { icon: /* @__PURE__ */ jsx(Globe, {}), name: "Science" },
        { icon: /* @__PURE__ */ jsx(FileText, {}), name: "Arts" },
        { icon: /* @__PURE__ */ jsx(BookMarked, {}), name: "History" },
        { icon: /* @__PURE__ */ jsx(Headphones, {}), name: "Philosophy" },
        { icon: /* @__PURE__ */ jsx(Users, {}), name: "Psychology" },
        { icon: /* @__PURE__ */ jsx(Zap, {}), name: "Self-Development" },
        { icon: /* @__PURE__ */ jsx(Star, {}), name: "Mathematics" },
        { icon: /* @__PURE__ */ jsx(CheckCircle, {}), name: "Languages" },
        { icon: /* @__PURE__ */ jsx(BookOpen, {}), name: "Literature" },
        { icon: /* @__PURE__ */ jsx(Globe, {}), name: "Politics" }
      ].map((category, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-card border rounded-xl p-6 text-center hover:shadow-md hover:border-primary/30 transition-all hover:-translate-y-1 fade-in-element opacity-0",
          style: { animationDelay: `${0.05 * index}s` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4", children: React__default.cloneElement(category.icon, { className: "w-6 h-6 text-primary" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: category.name })
          ]
        },
        index
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(
      "section",
      {
        ref: testimonialsRef,
        className: "py-20 md:py-32 opacity-0 transition-all duration-1000 translate-y-8 bg-background",
        children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "What Our Users Say" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto", children: "Hear from our community of learners and creators" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
            {
              quote: "Finally, a platform where Urdu and regional language content feels alive and beautifully delivered. Inlits is truly setting a new standard!",
              author: "Faizan Ahmad",
              role: "Software Engineer",
              avatar: "https://c1.wallpaperflare.com/preview/656/461/252/outdoors-man-lifestyle-young-portrait-architecture.jpg",
              delay: 0.1
            },
            {
              quote: "The storytelling and sound design on Inlits make learning feel like an experience, not just an activity. Absolutely love it!",
              author: "Esha Malik",
              role: "student",
              avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4ffZXH9tdCu5cRr-0vdp_MVZI_FM6jzKbpQ&s",
              delay: 0.3
            },
            {
              quote: "The book clubs and discussion features have connected me with like-minded people from around the world. It's more than just a reading platform.",
              author: "Bilal Siddique",
              role: "Book Enthusiast",
              avatar: "https://images.unsplash.com/photo-1722354980566-ec247cb4f1a8?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGFraXN0YW5pJTIwYm95c3xlbnwwfHwwfHx8MA%3D%3D",
              delay: 0.5
            }
          ].map((testimonial, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-all fade-in-element opacity-0",
              style: { animationDelay: `${testimonial.delay}s` },
              children: [
                /* @__PURE__ */ jsx("div", { className: "absolute -top-5 -left-2 text-6xl text-primary/10 font-serif", children: '"' }),
                /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 mb-4", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(Star, { className: "w-5 h-5 fill-yellow-500 text-yellow-500" }, star)) }),
                  /* @__PURE__ */ jsxs("p", { className: "text-lg mb-6 relative", children: [
                    '"',
                    testimonial.quote,
                    '"'
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: testimonial.avatar,
                        alt: testimonial.author,
                        className: "w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: testimonial.author }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: testimonial.role })
                    ] })
                  ] })
                ] })
              ]
            },
            index
          )) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-32 bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Frequently Asked Questions" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground max-w-3xl mx-auto", children: "Find answers to common questions about Inlits" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto space-y-6", children: [
        {
          question: "What is Inlits?",
          answer: "Inlits is a platform designed to connect readers, writers, and thinkers in a shared space of stories and ideas. We offer a wide range of content including articles, e-books, audiobooks, and podcasts across various categories."
        },
        {
          question: "How do I get started?",
          answer: "Getting started is easy! Simply sign up for a free account, set your reading preferences, and start exploring content. You can save items to your library, join communities, and track your learning progress."
        },
        {
          question: "Can I access content offline?",
          answer: "Yes, with our Pro plan, you can download content for offline access. This feature allows you to continue learning even when you don't have an internet connection."
        },
        {
          question: "How do I become a creator?",
          answer: "To become a creator, sign up for a Creator account. You'll get access to our publishing tools, analytics dashboard, and monetization options. You can create articles, books, audiobooks, and podcasts."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our payment providers."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
        }
      ].map((faq, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-card border rounded-xl p-6 hover:border-primary/30 transition-all fade-in-element opacity-0",
          style: { animationDelay: `${0.1 * index}s` },
          children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-3", children: faq.question }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: faq.answer })
          ]
        },
        index
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-32 bg-gradient-to-br from-primary/10 to-primary/5", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-6", children: "Ready to Start Your Learning Journey?" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground mb-10 max-w-2xl mx-auto", children: "Join thousands of learners who are discovering new ideas, expanding their knowledge, and connecting with a community of curious minds." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/signup",
            className: "px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium text-lg",
            children: "Get Started Free"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/contact",
            className: "px-8 py-4 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all font-medium text-lg",
            children: "Contact Sales"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-32 bg-background", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "fade-in-element opacity-0 transition-all duration-1000", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium", children: "For Creators" }),
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-6", children: "Share Your Knowledge" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-8", children: "Inlits provides powerful tools for creators to publish, distribute, and monetize their content. Reach an engaged audience hungry for quality educational material." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [
          "Intuitive publishing tools for articles, books, and audio content",
          "Detailed analytics to understand your audience",
          "Multiple monetization options including subscriptions and one-time purchases",
          "Built-in community features to engage directly with your readers"
        ].map((feature, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-3 h-3 text-primary" }) }),
          /* @__PURE__ */ jsx("p", { children: feature })
        ] }, index)) }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/signup",
            className: "inline-flex items-center gap-2 px-6 py-3 mt-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium",
            children: [
              "Become a Creator",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative fade-in-element opacity-0 transition-all duration-1000", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-2xl transform -rotate-3" }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
            alt: "Content Creator",
            className: "relative rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform duration-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute -top-6 -left-6 bg-card border shadow-lg rounded-lg p-4 max-w-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Creator Earnings" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-primary", children: "$12,450" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Last month's earnings" })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-32 bg-gradient-to-br from-primary/20 to-primary/5", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight", children: "Start Your Learning Journey Today" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground mb-10 max-w-2xl mx-auto", children: "Join our community of learners and creators. Discover, learn, and grow with Inlits." }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/signup",
          className: "inline-flex items-center gap-2 px-10 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium text-lg",
          children: [
            "Get Started Free",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-muted-foreground", children: "No credit card required" })
    ] }) }),
    /* @__PURE__ */ jsx("style", { children: `
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        @keyframes carousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-carousel {
          animation: carousel 30s linear infinite;
        }
      ` })
  ] });
}
export {
  AboutPage,
  AboutPage as default
};
