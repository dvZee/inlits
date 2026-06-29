import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link, useParams, Navigate } from "react-router-dom";
import { c as useTheme, d as detectUrduText, g as getTextLanguageClass, u as useAuth, e as formatDate, s as supabase } from "./server-build-BGC-wbDo.js";
import { FileText, RefreshCw, Minimize2, Maximize2, ExternalLink, Download, Loader2, AlertCircle, ChevronLeft, ChevronRight, ZoomOut, ZoomIn, RotateCw, List, Bookmark, Settings, X, Minus, Plus, Sun, BookOpen, Moon, Share2, ArrowLeft, Menu, AlignLeft, Type, Highlighter, StickyNote, Share, Heart, MessageSquare, Twitter, Facebook, Linkedin, Check, Copy, Send, ThumbsUp, Reply, ChevronUp } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { ReactReader } from "react-reader";
import "node:stream";
import "isbot";
import "@remix-run/react";
import "react-dom/server";
import "@supabase/supabase-js";
import "zustand";
import "@remix-run/node";
import "clsx";
import "tailwind-merge";
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https:https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}
function PDFViewer({ fileUrl, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF with PDF.js:", err);
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
            cMapPacked: true
          });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
        } catch (fetchErr) {
          console.error("Error fetching PDF:", fetchErr);
          setError(
            fetchErr instanceof Error ? fetchErr.message : "Failed to load PDF document"
          );
          setLoading(false);
        }
      }
    };
    loadPDF();
  }, [fileUrl]);
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        const viewport = page.getViewport({ scale, rotation });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport
        };
        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Failed to render page");
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, scale, rotation]);
  const toggleFullscreen = () => {
    var _a, _b, _c;
    if (!isFullscreen) {
      (_b = (_a = containerRef.current) == null ? void 0 : _a.requestFullscreen) == null ? void 0 : _b.call(_a);
      setIsFullscreen(true);
    } else {
      (_c = document.exitFullscreen) == null ? void 0 : _c.call(document);
      setIsFullscreen(false);
    }
  };
  const handleRetry = () => {
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setError(null);
    setLoading(true);
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load PDF document"
        );
        setLoading(false);
      }
    };
    loadPDF();
  };
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: `pdf-viewer bg-background border rounded-lg overflow-hidden ${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-card border-b", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "PDF Document" }),
            totalPages > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Page ",
              currentPage,
              " of ",
              totalPages
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            error && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleRetry,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors",
                title: "Retry loading",
                children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: toggleFullscreen,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors",
                title: "Fullscreen",
                children: isFullscreen ? /* @__PURE__ */ jsx(Minimize2, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Maximize2, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: fileUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors",
                title: "Open in new tab",
                children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: fileUrl,
                download: true,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors",
                title: "Download PDF",
                children: /* @__PURE__ */ jsx(Download, { className: "w-5 h-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative overflow-auto bg-muted/20",
            style: { height: isFullscreen ? "calc(100vh - 140px)" : "600px" },
            children: [
              loading && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-muted/20 z-10", children: [
                /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary mb-4" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading PDF..." })
              ] }),
              error ? /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-8", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mb-4" }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Cannot Load PDF" }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 text-center max-w-md", children: error }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-3 w-full max-w-md", children: [
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: fileUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }),
                        "Open PDF in New Tab"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: fileUrl,
                      download: true,
                      className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border hover:bg-accent transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                        "Download PDF"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: handleRetry,
                    className: "mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm",
                    children: [
                      /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
                      "Try Again"
                    ]
                  }
                )
              ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-4", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "shadow-lg" }) })
            ]
          }
        ),
        !loading && !error && totalPages > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-card border-t", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => goToPage(currentPage - 1),
                disabled: currentPage <= 1,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                title: "Previous page",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  max: totalPages,
                  value: currentPage,
                  onChange: (e) => goToPage(parseInt(e.target.value) || 1),
                  className: "w-16 px-2 py-1 text-center border rounded-lg bg-background"
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                "/ ",
                totalPages
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => goToPage(currentPage + 1),
                disabled: currentPage >= totalPages,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                title: "Next page",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: zoomOut,
                disabled: scale <= 0.5,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50",
                title: "Zoom out",
                children: /* @__PURE__ */ jsx(ZoomOut, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground min-w-[60px] text-center", children: [
              Math.round(scale * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: zoomIn,
                disabled: scale >= 3,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50",
                title: "Zoom in",
                children: /* @__PURE__ */ jsx(ZoomIn, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: rotate,
                className: "p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors",
                title: "Rotate",
                children: /* @__PURE__ */ jsx(RotateCw, { className: "w-5 h-5" })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function EpubReader({ fileUrl, title }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState("light");
  const [bookmarks, setBookmarks] = useState([]);
  const [toc, setToc] = useState([]);
  const renditionRef = useRef(null);
  const tocRef = useRef(null);
  const locationChanged = useCallback((epubcfi) => {
    setLocation(epubcfi);
  }, []);
  const getRendition = useCallback(
    (rendition) => {
      renditionRef.current = rendition;
      const themes = rendition.themes;
      themes.register("light", {
        body: {
          background: "#ffffff",
          color: "#000000"
        }
      });
      themes.register("sepia", {
        body: {
          background: "#f4ecd8",
          color: "#5f4b32"
        }
      });
      themes.register("dark", {
        body: {
          background: "#1a1a1a",
          color: "#e1e1e1"
        }
      });
      themes.select(theme);
      themes.fontSize(`${fontSize}%`);
    },
    [theme, fontSize]
  );
  const getToc = useCallback((toc2) => {
    tocRef.current = toc2;
    setToc(toc2);
  }, []);
  const changeFontSize = (delta) => {
    const newSize = Math.max(80, Math.min(150, fontSize + delta));
    setFontSize(newSize);
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${newSize}%`);
    }
  };
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (renditionRef.current) {
      renditionRef.current.themes.select(newTheme);
    }
  };
  const addBookmark = () => {
    if (location && typeof location === "string") {
      setBookmarks((prev) => [...prev, location]);
    }
  };
  const goToLocation = (loc) => {
    setLocation(loc);
    setShowToc(false);
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Check out this book: ${title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const getThemeStyles = () => {
    switch (theme) {
      case "dark":
        return {
          bg: "bg-[#1a1a1a]",
          text: "text-gray-100",
          border: "border-gray-800",
          card: "bg-gray-900"
        };
      case "sepia":
        return {
          bg: "bg-[#f4ecd8]",
          text: "text-gray-900",
          border: "border-amber-200",
          card: "bg-[#f4ecd8]"
        };
      default:
        return {
          bg: "bg-white",
          text: "text-gray-900",
          border: "border-gray-200",
          card: "bg-white"
        };
    }
  };
  const styles = getThemeStyles();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `min-h-screen ${styles.bg} ${styles.text} transition-colors duration-300`,
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed top-0 left-0 right-0 h-14 border-b ${styles.border} ${styles.card} backdrop-blur-sm bg-opacity-95 z-50 flex items-center justify-between px-4`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => navigate(-1),
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx("h1", { className: "text-sm font-medium truncate max-w-[200px] md:max-w-md", children: title })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowToc(!showToc),
                    className: `p-2 hover:bg-accent rounded-lg transition-colors ${showToc ? "bg-accent" : ""}`,
                    title: "Table of Contents",
                    children: /* @__PURE__ */ jsx(List, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: addBookmark,
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    title: "Add Bookmark",
                    children: /* @__PURE__ */ jsx(Bookmark, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSettings(!showSettings),
                    className: `p-2 hover:bg-accent rounded-lg transition-colors ${showSettings ? "bg-accent" : ""}`,
                    title: "Settings",
                    children: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5" })
                  }
                )
              ] })
            ]
          }
        ),
        showSettings && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed top-14 right-0 w-80 h-[calc(100vh-3.5rem)] border-l ${styles.border} ${styles.card} backdrop-blur-sm bg-opacity-95 p-4 space-y-6 z-40 overflow-y-auto`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Reading Settings" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSettings(false),
                    className: "p-1 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Font Size" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => changeFontSize(-10),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm min-w-[60px] text-center", children: [
                    fontSize,
                    "%"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => changeFontSize(10),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Theme" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => changeTheme("light"),
                      className: `p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: [
                        /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Light" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => changeTheme("sepia"),
                      className: `p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${theme === "sepia" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: [
                        /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Sepia" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => changeTheme("dark"),
                      className: `p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: [
                        /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Dark" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Bookmarks" }),
                bookmarks.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: bookmarks.map((bookmark, index) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => goToLocation(bookmark),
                    className: "w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm",
                    children: [
                      "Bookmark ",
                      index + 1
                    ]
                  },
                  index
                )) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No bookmarks yet" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-4 border-t", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: handleShare,
                    className: "w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Share Book" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: fileUrl,
                    download: true,
                    className: "w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Download Book" })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        showToc && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed top-14 left-0 w-80 h-[calc(100vh-3.5rem)] border-r ${styles.border} ${styles.card} backdrop-blur-sm bg-opacity-95 p-4 space-y-4 z-40 overflow-y-auto`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Table of Contents" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowToc(false),
                    className: "p-1 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-1", children: toc.map((item, index) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => goToLocation(item.href),
                  className: "w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm",
                  children: item.label
                },
                index
              )) })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "pt-14", style: { height: "100vh" }, children: /* @__PURE__ */ jsx(
          ReactReader,
          {
            url: fileUrl,
            location,
            locationChanged,
            getRendition,
            tocChanged: getToc,
            epubOptions: {
              flow: "paginated",
              manager: "continuous"
            },
            readerStyles: {
              ...ReactReaderStyle,
              readerArea: {
                ...ReactReaderStyle.readerArea,
                backgroundColor: theme === "dark" ? "#1a1a1a" : theme === "sepia" ? "#f4ecd8" : "#ffffff",
                transition: "background-color 0.3s"
              }
            }
          }
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              var _a;
              return (_a = renditionRef.current) == null ? void 0 : _a.prev();
            },
            className: `fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${styles.card} ${styles.border} border shadow-lg hover:bg-accent transition-all opacity-0 hover:opacity-100 z-30`,
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              var _a;
              return (_a = renditionRef.current) == null ? void 0 : _a.next();
            },
            className: `fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${styles.card} ${styles.border} border shadow-lg hover:bg-accent transition-all opacity-0 hover:opacity-100 z-30`,
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6" })
          }
        )
      ]
    }
  );
}
const ReactReaderStyle = {
  container: {
    overflow: "hidden",
    position: "relative",
    height: "100%"
  },
  readerArea: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    transition: "all 0.3s ease"
  },
  containerExpanded: {
    transform: "translateX(0)"
  },
  titleArea: {
    position: "absolute",
    top: 20,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#999"
  },
  reader: {
    position: "absolute",
    top: 50,
    left: 50,
    bottom: 20,
    right: 50
  },
  swipeWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 200
  },
  prev: {
    left: 1
  },
  next: {
    right: 1
  },
  arrow: {
    outline: "none",
    border: "none",
    background: "none",
    position: "absolute",
    top: "50%",
    marginTop: -32,
    fontSize: 64,
    padding: "0 10px",
    color: "#E2E2E2",
    fontFamily: "arial, sans-serif",
    cursor: "pointer",
    userSelect: "none",
    appearance: "none",
    fontWeight: "normal"
  },
  arrowHover: {
    color: "#777"
  },
  tocBackground: {
    position: "absolute",
    left: 256,
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 1
  },
  tocArea: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
    width: 256,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    background: "#f2f2f2",
    padding: "10px 0"
  },
  tocAreaButton: {
    userSelect: "none",
    appearance: "none",
    background: "none",
    border: "none",
    display: "block",
    fontFamily: "sans-serif",
    width: "100%",
    fontSize: ".9em",
    textAlign: "left",
    padding: ".9em 1em",
    borderBottom: "1px solid #ddd",
    color: "#aaa",
    boxSizing: "border-box",
    outline: "none",
    cursor: "pointer"
  },
  tocButton: {
    background: "none",
    border: "none",
    width: 32,
    height: 32,
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 2,
    outline: "none",
    cursor: "pointer"
  },
  tocButtonExpanded: {
    background: "#f2f2f2"
  },
  tocButtonBar: {
    position: "absolute",
    width: "60%",
    background: "#ccc",
    height: 2,
    left: "50%",
    margin: "-1px -30%",
    top: "50%",
    transition: "all .5s ease"
  },
  tocButtonBarTop: {
    top: "35%"
  },
  tocButtonBottom: {
    top: "66%"
  },
  loadingView: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    color: "#ccc",
    textAlign: "center",
    marginTop: "-.5em"
  }
};
function EReader({ book }) {
  var _a, _b, _c, _d;
  const navigate = useNavigate();
  const { theme: systemTheme } = useTheme();
  const [settings, setSettings] = useState({
    fontSize: 18,
    lineHeight: 1.6,
    theme: systemTheme === "dark" ? "dark" : "light",
    fontFamily: "Georgia",
    textAlign: "left"
  });
  const [showSettings, setShowSettings] = useState(false);
  useState(false);
  useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [highlights, setHighlights] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({
    x: 0,
    y: 0
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const contentRef = useRef(null);
  const chaptersRef = useRef(null);
  const iframeRef = useRef(null);
  const isPdf = book.file_url && book.file_type === "application/pdf";
  const isEpub = book.file_url && (book.file_type === "application/epub+zip" || book.file_url.endsWith(".epub"));
  const isHtml = book.file_url && (book.file_type === "text/html" || book.file_url.endsWith(".html") || book.file_url.endsWith(".htm"));
  if (isEpub) {
    return /* @__PURE__ */ jsx(EpubReader, { fileUrl: book.file_url, title: book.title });
  }
  const chapters = book.chapters && book.chapters.length > 0 ? book.chapters : book.content && book.content.trim() !== "" ? [
    {
      id: "main",
      title: "Full Content",
      content: book.content
    }
  ] : [];
  const hasReadableContent = chapters.length > 0 && chapters.some((ch) => ch.content && ch.content.trim() !== "");
  const hasFile = book.file_url && book.file_url.trim() !== "";
  useEffect(() => {
    var _a2;
    if (chapters.length > 0 && !isPdf && !isHtml) {
      const currentChapterContent = ((_a2 = chapters[currentChapter]) == null ? void 0 : _a2.content) || "";
      const estimatedPages = Math.max(
        1,
        Math.ceil(currentChapterContent.length / 2e3)
      );
      setTotalPages(estimatedPages);
    }
  }, [chapters, currentChapter, isPdf, isHtml]);
  useEffect(() => {
    if (isHtml && book.file_url) {
      const loadHtml = async () => {
        try {
          const response = await fetch(book.file_url);
          if (!response.ok) {
            throw new Error(`Failed to load HTML content: ${response.status}`);
          }
          const html = await response.text();
          setHtmlContent(html);
        } catch (error) {
          console.error("Error loading HTML content:", error);
        }
      };
      loadHtml();
    }
  }, [isHtml, book.file_url]);
  useEffect(() => {
    if (isHtml && iframeRef.current && iframeRef.current.contentDocument && iframeLoaded) {
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        const existingStyle = iframeDoc.getElementById("reader-styles");
        if (existingStyle) {
          existingStyle.remove();
        }
        const style = iframeDoc.createElement("style");
        style.id = "reader-styles";
        style.textContent = `
          body {
            font-family: ${settings.fontFamily}, serif !important;
            font-size: ${settings.fontSize}px !important;
            line-height: ${settings.lineHeight} !important;
            text-align: ${settings.textAlign} !important;
            color: ${settings.theme === "dark" ? "#e1e1e1" : settings.theme === "sepia" ? "#5f4b32" : "#333"} !important;
            background-color: ${settings.theme === "dark" ? "#171C26" : settings.theme === "sepia" ? "#f4ecd8" : "#fff"} !important;
            padding: 2rem !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          a {
            color: ${settings.theme === "dark" ? "#90caf9" : settings.theme === "sepia" ? "#5f4b32" : "#1f4ead"} !important;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          * {
            max-width: 100% !important;
          }
        `;
        iframeDoc.head.appendChild(style);
      } catch (error) {
        console.error("Error applying styles to iframe:", error);
      }
    }
  }, [settings, isHtml, iframeLoaded]);
  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(selection.toString());
        setHighlightMenuPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 40
        });
        setShowHighlightMenu(true);
      } else {
        setShowHighlightMenu(false);
      }
    };
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);
  useEffect(() => {
    var _a2;
    if (contentRef.current) {
      const isUrduContent = detectUrduText(
        ((_a2 = chapters[currentChapter]) == null ? void 0 : _a2.content) || ""
      );
      const fontFamily = isUrduContent ? "'Noto Nastaliq Urdu', serif" : settings.fontFamily;
      const textDirection = isUrduContent ? "rtl" : "ltr";
      const textAlign = isUrduContent ? "right" : settings.textAlign;
      contentRef.current.style.fontSize = `${settings.fontSize}px`;
      contentRef.current.style.lineHeight = settings.lineHeight.toString();
      contentRef.current.style.fontFamily = fontFamily;
      contentRef.current.style.textAlign = textAlign;
      contentRef.current.style.direction = textDirection;
    }
  }, [settings, currentChapter, chapters]);
  useEffect(() => {
    if (systemTheme === "dark" && settings.theme === "light") {
      setSettings((prev) => ({ ...prev, theme: "dark" }));
    } else if (systemTheme === "light" && settings.theme === "dark") {
      setSettings((prev) => ({ ...prev, theme: "light" }));
    }
  }, [systemTheme]);
  const addHighlight = (color) => {
    var _a2;
    if (selectedText) {
      const newHighlight = {
        id: Date.now().toString(),
        text: selectedText,
        color,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setHighlights((prev) => [...prev, newHighlight]);
      setShowHighlightMenu(false);
      (_a2 = window.getSelection()) == null ? void 0 : _a2.removeAllRanges();
    }
  };
  const addBookmark = () => {
    var _a2;
    const newBookmark = {
      id: Date.now().toString(),
      position: currentPage,
      text: `Page ${currentPage} in ${((_a2 = chapters[currentChapter]) == null ? void 0 : _a2.title) || "Chapter " + (currentChapter + 1)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setBookmarks((prev) => [...prev, newBookmark]);
  };
  const removeBookmark = (id) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  };
  const handlePageChange = (newPage) => {
    var _a2;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      (_a2 = contentRef.current) == null ? void 0 : _a2.scrollTo(0, 0);
    }
  };
  const handleChapterChange = (index) => {
    var _a2;
    if (index >= 0 && index < chapters.length) {
      setCurrentChapter(index);
      setCurrentPage(1);
      setShowChapters(false);
      (_a2 = contentRef.current) == null ? void 0 : _a2.scrollTo(0, 0);
    }
  };
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `Check out this book: ${book.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const handleDownload = () => {
    if (book.file_url) {
      window.open(book.file_url, "_blank");
    } else {
      alert("No downloadable file available for this book.");
    }
  };
  const getThemeClass = () => {
    switch (settings.theme) {
      case "dark":
        return "bg-gray-900 text-gray-100";
      case "sepia":
        return "bg-[#f4ecd8] text-gray-900";
      default:
        return "bg-white text-gray-900";
    }
  };
  const createHtmlContent = () => {
    if (!htmlContent) return void 0;
    const isUrduContent = detectUrduText(htmlContent);
    const fontFamily = isUrduContent ? "'Noto Nastaliq Urdu', serif" : `${settings.fontFamily}, serif`;
    const textDirection = isUrduContent ? "rtl" : "ltr";
    const textAlign = isUrduContent ? "right" : settings.textAlign;
    const baseStyles = `
      <style id="reader-styles">
        body {
          font-family: ${fontFamily};
          font-size: ${settings.fontSize}px;
          line-height: ${settings.lineHeight};
          text-align: ${textAlign};
          direction: ${textDirection};
          color: ${settings.theme === "dark" ? "#e1e1e1" : settings.theme === "sepia" ? "#5f4b32" : "#333"};
          background-color: ${settings.theme === "dark" ? "#171C26" : settings.theme === "sepia" ? "#f4ecd8" : "#fff"};
          padding: 2rem;
          margin: 0;
          max-width: 100%;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: ${fontFamily};
          text-align: ${textAlign};
          direction: ${textDirection};
        }
        p, div, span {
          text-align: ${textAlign};
          direction: ${textDirection};
        }
        blockquote {
          ${isUrduContent ? "border-right: 4px solid #1f4ead; border-left: none; padding-right: 1.5em; padding-left: 0;" : ""}
          text-align: ${textAlign};
          direction: ${textDirection};
        }
        a { color: ${settings.theme === "dark" ? "#90caf9" : settings.theme === "sepia" ? "#5f4b32" : "#1f4ead"}; }
        img { max-width: 100%; height: auto; }
        * { max-width: 100%; }
      </style>
    `;
    let processedHtml = htmlContent;
    if (processedHtml.includes("<head>")) {
      processedHtml = processedHtml.replace("<head>", `<head>${baseStyles}`);
    } else if (processedHtml.includes("<html>")) {
      processedHtml = processedHtml.replace(
        "<html>",
        `<html><head>${baseStyles}</head>`
      );
    } else {
      processedHtml = `<html><head>${baseStyles}</head><body>${processedHtml}</body></html>`;
    }
    return processedHtml;
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `min-h-screen ${getThemeClass()} transition-colors duration-300`,
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed top-0 left-0 right-0 h-14 border-b ${settings.theme === "dark" ? "bg-gray-900/95 backdrop-blur border-gray-800" : settings.theme === "sepia" ? "bg-[#f4ecd8]/95 backdrop-blur border-amber-200" : "bg-white/95 backdrop-blur border-gray-200"} z-50 flex items-center justify-between px-4`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => navigate(-1),
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    "aria-label": "Go back",
                    children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "hidden md:block text-sm font-medium truncate max-w-[200px]", children: ((_a = chapters[currentChapter]) == null ? void 0 : _a.title) || `Chapter ${currentChapter + 1}` }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "md:hidden p-2 hover:bg-accent rounded-lg transition-colors",
                    onClick: () => setShowMobileMenu(!showMobileMenu),
                    "aria-label": "Menu",
                    children: /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSettings(!showSettings),
                    className: `p-2 hover:bg-accent rounded-lg transition-colors ${showSettings ? "bg-accent" : ""}`,
                    "aria-label": "Settings",
                    children: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: addBookmark,
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    "aria-label": "Add bookmark",
                    children: /* @__PURE__ */ jsx(Bookmark, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowChapters(!showChapters),
                    className: `p-2 hover:bg-accent rounded-lg transition-colors ${showChapters ? "bg-accent" : ""}`,
                    "aria-label": "Chapters",
                    children: /* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5" })
                  }
                )
              ] })
            ]
          }
        ),
        showMobileMenu && /* @__PURE__ */ jsx(
          "div",
          {
            className: `fixed inset-0 z-50 ${settings.theme === "dark" ? "bg-gray-900" : settings.theme === "sepia" ? "bg-[#f4ecd8]" : "bg-white"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
                /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: book.title }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowMobileMenu(false),
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium mb-2", children: "Chapters" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2", children: chapters.map((chapter, index) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        handleChapterChange(index);
                        setShowMobileMenu(false);
                      },
                      className: `w-full text-left px-3 py-2 rounded-lg transition-colors ${currentChapter === index ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: chapter.title || `Chapter ${index + 1}`
                    },
                    chapter.id
                  )) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium mb-2", children: "Bookmarks" }),
                  bookmarks.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: bookmarks.map((bookmark) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between p-2 rounded-lg border",
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "text-sm", children: bookmark.text }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => removeBookmark(bookmark.id),
                            className: "p-1 hover:bg-accent rounded-lg transition-colors",
                            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                          }
                        )
                      ]
                    },
                    bookmark.id
                  )) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No bookmarks yet" })
                ] }),
                book.file_url && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium mb-2", children: "Download" }),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: book.file_url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Download Original File" }),
                        /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 ml-auto" })
                      ]
                    }
                  )
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "p-4 border-t", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setShowMobileMenu(false);
                    navigate(-1);
                  },
                  className: "w-full px-4 py-2 rounded-lg border hover:bg-accent transition-colors",
                  children: "Close Reader"
                }
              ) })
            ] })
          }
        ),
        showSettings && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed top-14 right-0 w-80 h-[calc(100vh-3.5rem)] border-l ${settings.theme === "dark" ? "bg-gray-900/95 backdrop-blur border-gray-800" : settings.theme === "sepia" ? "bg-[#f4ecd8]/95 backdrop-blur border-amber-200" : "bg-white/95 backdrop-blur border-gray-200"} p-4 space-y-6 z-40 overflow-y-auto`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Reading Settings" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSettings(false),
                    className: "p-1 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Font Size" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({
                        ...prev,
                        fontSize: Math.max(12, prev.fontSize - 2)
                      })),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
                    settings.fontSize,
                    "px"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({
                        ...prev,
                        fontSize: Math.min(24, prev.fontSize + 2)
                      })),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Line Height" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({
                        ...prev,
                        lineHeight: Math.max(1.2, prev.lineHeight - 0.2)
                      })),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-sm", children: settings.lineHeight.toFixed(1) }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({
                        ...prev,
                        lineHeight: Math.min(2.4, prev.lineHeight + 0.2)
                      })),
                      className: "p-2 hover:bg-accent rounded-lg transition-colors",
                      children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Theme" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({ ...prev, theme: "light" })),
                      className: `p-2 rounded-lg flex items-center justify-center ${settings.theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({ ...prev, theme: "sepia" })),
                      className: `p-2 rounded-lg flex items-center justify-center ${settings.theme === "sepia" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({ ...prev, theme: "dark" })),
                      className: `p-2 rounded-lg flex items-center justify-center ${settings.theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Font" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: settings.fontFamily,
                    onChange: (e) => setSettings((prev) => ({ ...prev, fontFamily: e.target.value })),
                    className: `w-full h-10 rounded-md border px-3 text-sm ${settings.theme === "dark" ? "bg-gray-800 border-gray-700" : settings.theme === "sepia" ? "bg-[#f4ecd8] border-amber-200" : "bg-white border-gray-200"}`,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Georgia", children: "Georgia" }),
                      /* @__PURE__ */ jsx("option", { value: "Times New Roman", children: "Times New Roman" }),
                      /* @__PURE__ */ jsx("option", { value: "Arial", children: "Arial" }),
                      /* @__PURE__ */ jsx("option", { value: "Verdana", children: "Verdana" }),
                      /* @__PURE__ */ jsx("option", { value: "system-ui", children: "System Font" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Text Alignment" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({ ...prev, textAlign: "left" })),
                      className: `flex-1 p-2 rounded-lg flex items-center justify-center ${settings.textAlign === "left" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: /* @__PURE__ */ jsx(AlignLeft, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSettings((prev) => ({ ...prev, textAlign: "justify" })),
                      className: `flex-1 p-2 rounded-lg flex items-center justify-center ${settings.textAlign === "justify" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                      children: /* @__PURE__ */ jsx(Type, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              book.file_url && /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium mb-2", children: "Original Document" }),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: book.file_url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Download File" }),
                      /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 ml-auto" })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        showChapters && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed top-14 left-0 w-80 h-[calc(100vh-3.5rem)] border-r ${settings.theme === "dark" ? "bg-gray-900/95 backdrop-blur border-gray-800" : settings.theme === "sepia" ? "bg-[#f4ecd8]/95 backdrop-blur border-amber-200" : "bg-white/95 backdrop-blur border-gray-200"} p-4 space-y-4 z-40 overflow-y-auto`,
            ref: chaptersRef,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Chapters" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowChapters(false),
                    className: "p-1 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: chapters.map((chapter, index) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleChapterChange(index),
                  className: `w-full text-left px-3 py-2 rounded-lg transition-colors ${currentChapter === index ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                  children: chapter.title || `Chapter ${index + 1}`
                },
                chapter.id
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Bookmarks" }),
                bookmarks.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: bookmarks.map((bookmark) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center justify-between p-2 rounded-lg border",
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "text-sm", children: bookmark.text }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => removeBookmark(bookmark.id),
                          className: "p-1 hover:bg-accent rounded-lg transition-colors",
                          children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                        }
                      )
                    ]
                  },
                  bookmark.id
                )) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No bookmarks yet" })
              ] }),
              book.file_url && /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium mb-2", children: "Original Document" }),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: book.file_url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Download File" }),
                      /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 ml-auto" })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: contentRef,
            className: `pt-20 pb-20 px-4 md:px-8 max-w-3xl mx-auto min-h-screen ${settings.theme === "dark" ? "prose-invert" : ""} prose prose-lg`,
            style: {
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily: settings.fontFamily,
              textAlign: settings.textAlign
            },
            children: [
              isPdf ? /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(PDFViewer, { fileUrl: book.file_url || "" }) }) : isHtml ? /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxs("div", { className: "w-full h-[calc(100vh-200px)]", children: [
                book.file_url && /* @__PURE__ */ jsx(
                  "iframe",
                  {
                    ref: iframeRef,
                    src: book.file_url,
                    className: "w-full h-full border-0",
                    title: book.title,
                    sandbox: "allow-same-origin allow-popups",
                    onLoad: handleIframeLoad
                  }
                ),
                htmlContent && !book.file_url && /* @__PURE__ */ jsx(
                  "iframe",
                  {
                    ref: iframeRef,
                    srcDoc: createHtmlContent(),
                    className: "w-full h-full border-0",
                    title: book.title,
                    sandbox: "allow-same-origin",
                    onLoad: handleIframeLoad
                  }
                )
              ] }) }) : (
                /* Render chapter content with proper HTML */
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-6", children: ((_b = chapters[currentChapter]) == null ? void 0 : _b.title) || `Chapter ${currentChapter + 1}` }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: getTextLanguageClass(
                        ((_c = chapters[currentChapter]) == null ? void 0 : _c.content) || ""
                      ),
                      dangerouslySetInnerHTML: {
                        __html: ((_d = chapters[currentChapter]) == null ? void 0 : _d.content) || ""
                      }
                    }
                  )
                ] })
              ),
              !hasReadableContent && !isPdf && !isHtml && /* @__PURE__ */ jsx("div", { className: "my-8 p-6 border rounded-lg text-center", children: hasFile ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-4", children: "Document Available" }),
                /* @__PURE__ */ jsx("p", { className: "mb-4", children: "This book is available as a downloadable file. You can view it by opening or downloading the file." }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: book.file_url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsx("span", { children: "Open File" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: book.file_url,
                      download: true,
                      className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsx("span", { children: "Download" })
                      ]
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-4", children: "No Content Available" }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "This book doesn't have any readable content yet. Please check back later or contact the author." })
              ] }) })
            ]
          }
        ),
        showHighlightMenu && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed z-50 p-1 flex items-center gap-1 rounded-lg shadow-lg ${settings.theme === "dark" ? "bg-gray-800 border-gray-700" : settings.theme === "sepia" ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"} border`,
            style: {
              left: `${highlightMenuPosition.x}px`,
              top: `${highlightMenuPosition.y}px`,
              transform: "translateX(-50%)"
            },
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => addHighlight("#ffd700"),
                  className: "p-1.5 hover:bg-accent rounded",
                  title: "Yellow",
                  children: /* @__PURE__ */ jsx(Highlighter, { className: "w-4 h-4 text-yellow-500" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => addHighlight("#90EE90"),
                  className: "p-1.5 hover:bg-accent rounded",
                  title: "Green",
                  children: /* @__PURE__ */ jsx(Highlighter, { className: "w-4 h-4 text-green-500" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => addHighlight("#FFB6C1"),
                  className: "p-1.5 hover:bg-accent rounded",
                  title: "Pink",
                  children: /* @__PURE__ */ jsx(Highlighter, { className: "w-4 h-4 text-pink-500" })
                }
              ),
              /* @__PURE__ */ jsx("button", { className: "p-1.5 hover:bg-accent rounded", title: "Add Note", children: /* @__PURE__ */ jsx(StickyNote, { className: "w-4 h-4" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `fixed bottom-0 left-0 right-0 h-14 border-t ${settings.theme === "dark" ? "bg-gray-900/95 backdrop-blur border-gray-800" : settings.theme === "sepia" ? "bg-[#f4ecd8]/95 backdrop-blur border-amber-200" : "bg-white/95 backdrop-blur border-gray-200"} z-50 flex items-center justify-between px-4`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm", children: isPdf ? /* @__PURE__ */ jsx("span", { children: "PDF Document" }) : isHtml ? /* @__PURE__ */ jsx("span", { children: "HTML Document" }) : /* @__PURE__ */ jsxs("span", { children: [
                "Page ",
                currentPage,
                " of ",
                totalPages
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: !isPdf && !isHtml && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handlePageChange(currentPage - 1),
                    disabled: currentPage <= 1,
                    className: "p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50",
                    children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "range",
                    min: "1",
                    max: totalPages,
                    value: currentPage,
                    onChange: (e) => handlePageChange(parseInt(e.target.value)),
                    className: "w-32"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handlePageChange(currentPage + 1),
                    disabled: currentPage >= totalPages,
                    className: "p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50",
                    children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleShare,
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(Share, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleDownload,
                    className: "p-2 hover:bg-accent rounded-lg transition-colors",
                    disabled: !book.file_url,
                    title: book.file_url ? "Download File" : "No downloadable file available",
                    children: /* @__PURE__ */ jsx(Download, { className: "w-5 h-5" })
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
function ArticleReader({ article }) {
  var _a, _b;
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.claps);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [shareStatus, setShareStatus] = useState("idle");
  const [commentError, setCommentError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [userCommentLikes, setUserCommentLikes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [totalCommentCount, setTotalCommentCount] = useState(((_a = article.comments) == null ? void 0 : _a.length) || 0);
  const contentRef = useRef(null);
  const shareRef = useRef(null);
  const commentsRef = useRef(null);
  const isBrowser = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBrowser]);
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      try {
        const { data: likesData } = await supabase.from("ratings").select("rating").eq("content_id", article.id).eq("content_type", "article").eq("rating", 5);
        const currentLikeCount = (likesData == null ? void 0 : likesData.length) || 0;
        setLikeCount(currentLikeCount);
        const { data: likeData } = await supabase.from("ratings").select("*").eq("user_id", user.id).eq("content_id", article.id).eq("content_type", "article").maybeSingle();
        setIsLiked(!!likeData);
        const { data: bookmarkData } = await supabase.from("bookmarks").select("*").eq("user_id", user.id).eq("content_id", article.id).eq("content_type", "article").maybeSingle();
        setIsBookmarked(!!bookmarkData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    loadInitialData();
  }, [user, article.id]);
  useEffect(() => {
    const loadComments = async () => {
      try {
        const { data: likesData } = await supabase.from("ratings").select("rating").eq("content_id", article.id).eq("content_type", "article").eq("rating", 5);
        const currentLikeCount = (likesData == null ? void 0 : likesData.length) || 0;
        setLikeCount(currentLikeCount);
        const { data: commentsData, error } = await supabase.from("comments").select(`
            id,
            content,
            created_at,
            user_id,
            parent_id
          `).eq("content_id", article.id).eq("content_type", "article").order("created_at", { ascending: false });
        if (error) {
          console.error("Error loading comments:", error);
          return;
        }
        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map((comment) => comment.user_id))];
          const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, name, username, avatar_url").in("id", userIds);
          if (profilesError) {
            console.error("Error loading profiles:", profilesError);
            return;
          }
          const profilesMap = /* @__PURE__ */ new Map();
          profilesData == null ? void 0 : profilesData.forEach((profile2) => {
            profilesMap.set(profile2.id, profile2);
          });
          let commentLikesData = {};
          let userCommentLikesData = {};
          if (user) {
            try {
              const savedLikes = localStorage.getItem(`comment_likes_${user.id}_${article.id}`);
              const savedCounts = localStorage.getItem(`comment_like_counts_${article.id}`);
              if (savedLikes) {
                userCommentLikesData = JSON.parse(savedLikes);
              }
              if (savedCounts) {
                commentLikesData = JSON.parse(savedCounts);
              }
            } catch (error2) {
              console.error("Error loading comment likes from localStorage:", error2);
            }
          }
          setUserCommentLikes(userCommentLikesData);
          setCommentLikes(commentLikesData);
          const formattedComments = commentsData.map((comment) => {
            const profile2 = profilesMap.get(comment.user_id);
            return {
              id: comment.id,
              content: comment.content,
              createdAt: comment.created_at,
              parent_id: comment.parent_id,
              author: {
                id: (profile2 == null ? void 0 : profile2.id) || comment.user_id,
                name: (profile2 == null ? void 0 : profile2.name) || (profile2 == null ? void 0 : profile2.username) || "Anonymous",
                avatar: (profile2 == null ? void 0 : profile2.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${comment.user_id}`,
                username: profile2 == null ? void 0 : profile2.username
              },
              likes: commentLikesData[comment.id] || 0
            };
          });
          const topLevelComments = formattedComments.filter((c) => !c.parent_id);
          const replies = formattedComments.filter((c) => c.parent_id);
          const commentsWithReplies = topLevelComments.map((comment) => ({
            ...comment,
            replies: replies.filter((reply) => reply.parent_id === comment.id)
          }));
          setComments(commentsWithReplies);
          const totalCount = formattedComments.length;
          setTotalCommentCount(totalCount);
        } else {
          setComments([]);
          setTotalCommentCount(0);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };
    loadComments();
  }, [article.id, user]);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollToTop(scrollTop > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLike = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      if (isLiked) {
        const { error } = await supabase.from("ratings").delete().eq("user_id", user.id).eq("content_id", article.id).eq("content_type", "article");
        if (error) throw error;
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase.from("ratings").insert({
          user_id: user.id,
          content_id: article.id,
          content_type: "article",
          rating: 5
        });
        if (error) throw error;
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };
  const handleBookmark = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      if (isBookmarked) {
        const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("content_id", article.id).eq("content_type", "article");
        if (error) throw error;
        setIsBookmarked(false);
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          content_id: article.id,
          content_type: "article"
        });
        if (error) throw error;
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };
  const handleShare = async (platform) => {
    try {
      const url = window.location.href;
      const title = article.title;
      const text = `Check out "${title}" by ${article.author.name}`;
      if (platform === "twitter") {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
      } else if (platform === "facebook") {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
      } else if (platform === "linkedin") {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
      } else if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2e3);
      } else if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareStatus("shared");
        setTimeout(() => setShareStatus("idle"), 2e3);
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2e3);
      }
      setShowShareMenu(false);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };
  const handleComment = async (e) => {
    var _a2, _b2, _c, _d;
    e.preventDefault();
    if (!user) {
      navigate("/signin");
      return;
    }
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      setCommentError(null);
      setCommentSuccess(false);
      const { data: newCommentData, error: commentInsertError } = await supabase.from("comments").insert({
        content: newComment.trim(),
        user_id: user.id,
        content_id: article.id,
        content_type: "article",
        parent_id: null
      }).select("id, content, created_at, user_id").single();
      if (commentInsertError) throw commentInsertError;
      const { data: userProfile, error: profileError } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", user.id).single();
      if (profileError) {
        console.error("Error loading user profile:", profileError);
      }
      const profile2 = userProfile || {
        id: user.id,
        name: ((_a2 = user.user_metadata) == null ? void 0 : _a2.full_name) || ((_b2 = user.email) == null ? void 0 : _b2.split("@")[0]) || "Anonymous",
        username: (_c = user.user_metadata) == null ? void 0 : _c.username,
        avatar_url: (_d = user.user_metadata) == null ? void 0 : _d.avatar_url
      };
      const newCommentObj = {
        id: newCommentData.id,
        content: newCommentData.content,
        createdAt: newCommentData.created_at,
        parent_id: null,
        author: {
          id: profile2.id,
          name: profile2.name || profile2.username || "Anonymous",
          avatar: profile2.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${profile2.id}`,
          username: profile2.username
        },
        likes: 0,
        replies: []
      };
      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");
      setCommentSuccess(true);
      setTotalCommentCount((prev) => prev + 1);
      setTimeout(() => setCommentSuccess(false), 3e3);
    } catch (error) {
      console.error("Error posting comment:", error);
      setCommentError("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };
  const handleCommentLike = async (commentId) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      const isCurrentlyLiked = userCommentLikes[commentId] || false;
      const currentLikes = commentLikes[commentId] || 0;
      const newLikedState = !isCurrentlyLiked;
      const newLikeCount = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);
      const updatedUserLikes = {
        ...userCommentLikes,
        [commentId]: newLikedState
      };
      const updatedCommentLikes = {
        ...commentLikes,
        [commentId]: newLikeCount
      };
      setUserCommentLikes(updatedUserLikes);
      setCommentLikes(updatedCommentLikes);
      try {
        localStorage.setItem(`comment_likes_${user.id}_${article.id}`, JSON.stringify(updatedUserLikes));
        localStorage.setItem(`comment_like_counts_${article.id}`, JSON.stringify(updatedCommentLikes));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      console.log(`${newLikedState ? "Liked" : "Unliked"} comment:`, commentId);
    } catch (error) {
      console.error("Error liking comment:", error);
      setUserCommentLikes(userCommentLikes);
      setCommentLikes(commentLikes);
    }
  };
  const scrollToComments = () => {
    var _a2;
    (_a2 = commentsRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent("");
    setReplyError(null);
  };
  const handleReplySubmit = async (e, commentId) => {
    var _a2, _b2, _c, _d;
    e.preventDefault();
    if (!user || !replyContent.trim()) {
      setReplyError("Reply content is required");
      return;
    }
    try {
      setSubmittingReply(true);
      setReplyError(null);
      const { data: replyData, error: replyError2 } = await supabase.from("comments").insert({
        content: replyContent.trim(),
        user_id: user.id,
        content_id: article.id,
        content_type: "article",
        parent_id: commentId
      }).select("id, content, created_at, user_id").single();
      if (replyError2) throw replyError2;
      const { data: userProfile } = await supabase.from("profiles").select("id, name, username, avatar_url").eq("id", user.id).single();
      const profile2 = userProfile || {
        id: user.id,
        name: ((_a2 = user.user_metadata) == null ? void 0 : _a2.full_name) || ((_b2 = user.email) == null ? void 0 : _b2.split("@")[0]) || "Anonymous",
        username: (_c = user.user_metadata) == null ? void 0 : _c.username,
        avatar_url: (_d = user.user_metadata) == null ? void 0 : _d.avatar_url
      };
      const newReply = {
        id: replyData.id,
        content: replyData.content,
        createdAt: replyData.created_at,
        parent_id: commentId,
        author: {
          id: profile2.id,
          name: profile2.name || profile2.username || "Anonymous",
          avatar: profile2.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${profile2.id}`,
          username: profile2.username
        },
        likes: 0
      };
      setComments((prev) => prev.map(
        (comment) => comment.id === commentId ? { ...comment, replies: [...comment.replies || [], newReply] } : comment
      ));
      setTotalCommentCount((prev) => prev + 1);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
      setReplyError("Failed to post reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };
  detectUrduText(article.content);
  const titleLanguageClass = getTextLanguageClass(article.title);
  const contentLanguageClass = getTextLanguageClass(article.content);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "fixed top-0 left-0 right-0 h-1 bg-muted z-50", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full bg-primary transition-all duration-150",
        style: { width: `${readingProgress}%` }
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-3xl mx-auto px-4 py-8 overflow-x-hidden", children: [
      article.category && /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-primary font-medium uppercase tracking-wide", children: article.category }) }),
      /* @__PURE__ */ jsx("h1", { className: `text-3xl md:text-5xl font-bold mb-8 leading-tight text-foreground reader-title break-words overflow-hidden ${titleLanguageClass}`, children: article.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8 gap-4 overflow-hidden", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/user/${article.author.username || article.author.id}`,
            className: "flex items-center gap-3 group hover:text-primary transition-colors min-w-0 flex-1",
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: article.author.avatar,
                  alt: article.author.name,
                  className: "w-12 h-12 rounded-full object-cover border-2 border-muted bg-muted flex-shrink-0",
                  onError: (e) => {
                    const img = e.target;
                    img.src = `https://source.unsplash.com/random/100x100?face&sig=${article.author.id}`;
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium group-hover:text-primary transition-colors truncate", children: article.author.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground overflow-hidden", children: [
                  /* @__PURE__ */ jsx("span", { children: formatDate(article.publishedAt) }),
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { children: article.readTime })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBookmark,
            className: `flex-shrink-0 p-2 rounded-lg transition-colors ${isBookmarked ? "text-white bg-primary" : "hover:bg-primary hover:text-white"}`,
            title: isBookmarked ? "Remove bookmark" : "Bookmark article",
            children: /* @__PURE__ */ jsx(Bookmark, { className: `w-5 h-5 ${isBookmarked ? "fill-current" : ""}` })
          }
        )
      ] }),
      article.cover_url && /* @__PURE__ */ jsx("div", { className: "mb-12 rounded-lg overflow-hidden max-w-full", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: article.cover_url,
          alt: article.title,
          className: "w-full h-auto object-cover max-w-full"
        }
      ) }),
      /* @__PURE__ */ jsx(
        "article",
        {
          ref: contentRef,
          className: `prose prose-xl max-w-none mb-16 reader-content break-words overflow-x-hidden ${contentLanguageClass}`,
          style: {
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            wordBreak: "break-word",
            overflowX: "hidden"
          },
          dangerouslySetInnerHTML: { __html: article.content }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 md:gap-8 py-8 border-t border-b mb-12 overflow-hidden", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLike,
            disabled: !user,
            className: `flex items-center gap-2 px-4 md:px-6 py-3 rounded-full transition-all ${isLiked ? "text-white bg-primary" : user ? "hover:bg-primary hover:text-white" : "opacity-50 cursor-not-allowed"}`,
            children: [
              /* @__PURE__ */ jsx(Heart, { className: `w-5 h-5 ${isLiked ? "fill-current" : ""}` }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-sm md:text-base", children: likeCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: scrollToComments,
            className: "flex items-center gap-2 px-4 md:px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors",
            children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-sm md:text-base", children: totalCommentCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", ref: shareRef, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowShareMenu(!showShareMenu),
              className: "flex items-center gap-2 px-4 md:px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors",
              children: [
                /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium text-sm md:text-base hidden sm:inline", children: "Share" })
              ]
            }
          ),
          showShareMenu && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-popover border rounded-lg shadow-lg p-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("twitter"),
                className: "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Twitter, { className: "w-4 h-4" }),
                  "Twitter"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("facebook"),
                className: "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Facebook, { className: "w-4 h-4" }),
                  "Facebook"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("linkedin"),
                className: "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Linkedin, { className: "w-4 h-4" }),
                  "LinkedIn"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("copy"),
                className: "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary hover:text-white rounded-md transition-colors",
                children: [
                  shareStatus === "copied" ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" }),
                  shareStatus === "copied" ? "Copied!" : "Copy link"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { ref: commentsRef, className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold", children: [
          "Responses (",
          totalCommentCount,
          ")"
        ] }),
        commentSuccess && /* @__PURE__ */ jsx("div", { className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg", children: "Comment posted successfully!" }),
        user ? /* @__PURE__ */ jsx("form", { onSubmit: handleComment, className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: ((_b = user.user_metadata) == null ? void 0 : _b.avatar_url) || (profile == null ? void 0 : profile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${user.id}`,
              alt: "Your avatar",
              className: "w-10 h-10 rounded-full object-cover bg-muted border",
              onError: (e) => {
                const img = e.target;
                img.src = `https://source.unsplash.com/random/100x100?face&sig=${user.id}`;
              }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: newComment,
                onChange: (e) => setNewComment(e.target.value),
                placeholder: "What are your thoughts?",
                className: "w-full px-4 py-3 rounded-lg border bg-background resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary",
                required: true
              }
            ),
            commentError && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-destructive", children: commentError }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-3", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: !newComment.trim() || submittingComment,
                className: "flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50",
                children: submittingComment ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                  "Publishing..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                  "Respond"
                ] })
              }
            ) })
          ] })
        ] }) }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-8 text-center bg-muted/30", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-4 text-lg", children: "Join the conversation" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/signin",
              className: "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors",
              children: "Sign in to respond"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          comments.map((comment) => {
            var _a2;
            return /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: comment.author.avatar,
                  alt: comment.author.name,
                  className: "w-10 h-10 rounded-full object-cover bg-muted border",
                  onError: (e) => {
                    const img = e.target;
                    img.src = `https://source.unsplash.com/random/100x100?face&sig=${comment.author.id}`;
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-medium", children: comment.author.name }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: formatDate(comment.createdAt) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm mb-3 leading-relaxed break-words", children: comment.content }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => handleCommentLike(comment.id),
                      disabled: !user,
                      className: `flex items-center gap-1 text-sm transition-colors ${userCommentLikes[comment.id] ? "text-primary" : user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                      children: [
                        /* @__PURE__ */ jsx(ThumbsUp, { className: `w-4 h-4 ${userCommentLikes[comment.id] ? "fill-current" : ""}` }),
                        /* @__PURE__ */ jsx("span", { children: commentLikes[comment.id] || comment.likes })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => handleReply(comment.id),
                      disabled: !user,
                      className: `flex items-center gap-1 text-sm transition-colors ${user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                      children: [
                        /* @__PURE__ */ jsx(Reply, { className: "w-4 h-4" }),
                        "Reply"
                      ]
                    }
                  )
                ] }),
                replyingTo === comment.id && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: ((_a2 = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a2.avatar_url) || (profile == null ? void 0 : profile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${user == null ? void 0 : user.id}`,
                      alt: "Your avatar",
                      className: "w-8 h-8 rounded-full object-cover bg-muted border",
                      onError: (e) => {
                        const img = e.target;
                        img.src = `https://source.unsplash.com/random/100x100?face&sig=${user == null ? void 0 : user.id}`;
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => handleReplySubmit(e, comment.id), children: [
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        value: replyContent,
                        onChange: (e) => setReplyContent(e.target.value),
                        placeholder: "Write a reply...",
                        className: "w-full px-3 py-2 text-sm rounded-lg border bg-background resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary",
                        required: true
                      }
                    ),
                    replyError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: replyError }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setReplyingTo(null);
                            setReplyContent("");
                            setReplyError(null);
                          },
                          className: "px-3 py-1 text-sm rounded-lg border hover:bg-accent transition-colors",
                          children: "Cancel"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "submit",
                          disabled: !replyContent.trim() || submittingReply,
                          className: "px-3 py-1 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1",
                          children: submittingReply ? /* @__PURE__ */ jsxs(Fragment, { children: [
                            /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }),
                            "Posting..."
                          ] }) : "Reply"
                        }
                      )
                    ] })
                  ] }) })
                ] }),
                comment.replies && comment.replies.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4", children: comment.replies.map((reply) => {
                  var _a3;
                  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3 ml-8 pl-4 border-l-2 border-muted", children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: reply.author.avatar,
                        alt: reply.author.name,
                        className: "w-8 h-8 rounded-full object-cover bg-muted border",
                        onError: (e) => {
                          const img = e.target;
                          img.src = `https://source.unsplash.com/random/100x100?face&sig=${reply.author.id}`;
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                        /* @__PURE__ */ jsx("h5", { className: "font-medium text-sm", children: reply.author.name }),
                        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(reply.createdAt) })
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm mb-2 leading-relaxed break-words", children: reply.content }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                        /* @__PURE__ */ jsxs(
                          "button",
                          {
                            onClick: () => handleCommentLike(reply.id),
                            disabled: !user,
                            className: `flex items-center gap-1 text-xs transition-colors ${userCommentLikes[reply.id] ? "text-primary" : user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                            children: [
                              /* @__PURE__ */ jsx(ThumbsUp, { className: `w-3 h-3 ${userCommentLikes[reply.id] ? "fill-current" : ""}` }),
                              /* @__PURE__ */ jsx("span", { children: commentLikes[reply.id] || reply.likes })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          "button",
                          {
                            onClick: () => handleReply(reply.id),
                            disabled: !user,
                            className: `flex items-center gap-1 text-xs transition-colors ${user ? "text-muted-foreground hover:text-primary" : "text-muted-foreground opacity-50 cursor-not-allowed"}`,
                            children: [
                              /* @__PURE__ */ jsx(Reply, { className: "w-3 h-3" }),
                              "Reply"
                            ]
                          }
                        )
                      ] }),
                      replyingTo === reply.id && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-2", children: [
                        /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: ((_a3 = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a3.avatar_url) || (profile == null ? void 0 : profile.avatar_url) || `https://source.unsplash.com/random/100x100?face&sig=${user == null ? void 0 : user.id}`,
                            alt: "Your avatar",
                            className: "w-6 h-6 rounded-full object-cover bg-muted border",
                            onError: (e) => {
                              const img = e.target;
                              img.src = `https://source.unsplash.com/random/100x100?face&sig=${user == null ? void 0 : user.id}`;
                            }
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => handleReplySubmit(e, comment.id), children: [
                          /* @__PURE__ */ jsx(
                            "textarea",
                            {
                              value: replyContent,
                              onChange: (e) => setReplyContent(e.target.value),
                              placeholder: "Write a reply...",
                              className: "w-full px-3 py-2 text-sm rounded-lg border bg-background resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary",
                              required: true
                            }
                          ),
                          replyError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: replyError }),
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  setReplyingTo(null);
                                  setReplyContent("");
                                  setReplyError(null);
                                },
                                className: "px-2 py-1 text-xs rounded-lg border hover:bg-accent transition-colors",
                                children: "Cancel"
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "submit",
                                disabled: !replyContent.trim() || submittingReply,
                                className: "px-2 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1",
                                children: submittingReply ? /* @__PURE__ */ jsxs(Fragment, { children: [
                                  /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }),
                                  "Posting..."
                                ] }) : "Reply"
                              }
                            )
                          ] })
                        ] }) })
                      ] })
                    ] })
                  ] }, reply.id);
                }) })
              ] })
            ] }, comment.id);
          }),
          comments.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg", children: "No responses yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Be the first to share your thoughts" })
          ] })
        ] })
      ] })
    ] }),
    !isMobile && /* @__PURE__ */ jsx("div", { className: "fixed top-1/2 -translate-y-1/2 right-8 z-30", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 p-3 rounded-full border shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleLike,
          disabled: !user,
          className: `p-3 rounded-full transition-all relative group ${isLiked ? "text-white bg-primary" : user ? "hover:bg-primary hover:text-white" : "opacity-50 cursor-not-allowed"}`,
          children: [
            /* @__PURE__ */ jsx(Heart, { className: `w-5 h-5 ${isLiked ? "fill-current" : ""}` }),
            /* @__PURE__ */ jsxs("div", { className: "absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: [
              likeCount,
              " likes"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: scrollToComments,
          className: "p-3 rounded-full hover:bg-primary hover:text-white transition-colors relative group",
          children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsxs("div", { className: "absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: [
              totalCommentCount,
              " responses"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowShareMenu(!showShareMenu),
          className: "p-3 rounded-full hover:bg-primary hover:text-white transition-colors relative group",
          children: [
            /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("div", { className: "absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: "Share article" })
          ]
        }
      )
    ] }) }),
    isMobile && /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 border-t p-4 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-around max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleLike,
          disabled: !user,
          className: `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isLiked ? "text-white bg-primary" : user ? "hover:bg-primary hover:text-white" : "opacity-50"}`,
          children: [
            /* @__PURE__ */ jsx(Heart, { className: `w-5 h-5 ${isLiked ? "fill-current" : ""}` }),
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: likeCount })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: scrollToComments,
          className: "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: totalCommentCount })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowShareMenu(!showShareMenu),
          className: "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Share" })
          ]
        }
      )
    ] }) }),
    showScrollToTop && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: scrollToTop,
        className: `fixed w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-40 bg-background border hover:bg-primary hover:text-white ${isMobile ? "bottom-24 right-6" : "bottom-6 right-6"}`,
        children: /* @__PURE__ */ jsx(ChevronUp, { className: "w-5 h-5" })
      }
    ),
    shareStatus === "copied" && /* @__PURE__ */ jsxs("div", { className: `fixed left-1/2 -translate-x-1/2 px-4 py-2 bg-background border rounded-lg shadow-lg text-sm flex items-center gap-2 z-50 ${isMobile ? "bottom-24" : "bottom-6"}`, children: [
      /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-500" }),
      /* @__PURE__ */ jsx("span", { children: "Link copied to clipboard" })
    ] })
  ] });
}
function ReaderPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, contentId] = (id == null ? void 0 : id.includes("-")) ? [id.split("-")[0], id.substring(id.indexOf("-") + 1)] : [null, null];
  const recordView = async () => {
    if (!contentType || !contentId || !user) return;
    try {
      await supabase.from("content_views").insert({
        content_id: contentId,
        content_type: contentType,
        viewer_id: user.id,
        viewed_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error2) {
      console.error("Error recording view:", error2);
    }
  };
  useEffect(() => {
    const loadContent = async () => {
      if (!contentType || !contentId) return;
      try {
        setLoading(true);
        setError(null);
        if (contentType === "article") {
          const { data: article, error: articleError } = await supabase.from("articles").select(`
              *,
              author:profiles!articles_author_id_fkey (
                id,
                name,
                username,
                avatar_url
              )
            `).eq("id", contentId).eq("status", "published").single();
          if (articleError) throw articleError;
          if (!article) throw new Error("Article not found");
          const [viewsResponse, ratingsResponse, commentsResponse] = await Promise.all([
            supabase.from("content_views").select("*", { count: "exact", head: true }).eq("content_id", article.id).eq("content_type", "article"),
            supabase.from("ratings").select("rating").eq("content_id", article.id).eq("content_type", "article"),
            supabase.from("comments").select(`
                *,
                author:profiles!comments_user_id_fkey (
                  id,
                  name,
                  username,
                  avatar_url
                )
              `).eq("content_id", article.id).eq("content_type", "article").order("created_at", { ascending: false })
          ]);
          const wordCount = article.content.trim().split(/\s+/).length;
          const readTime = Math.max(1, Math.ceil(wordCount / 200));
          setContent({
            id: article.id,
            title: article.title,
            content: article.content,
            author: {
              id: article.author.id,
              name: article.author.name || article.author.username,
              avatar: article.author.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${article.author.id}`,
              username: article.author.username
            },
            publishedAt: article.created_at,
            readTime: `${readTime} min read`,
            claps: article.view_count || 0,
            comments: (commentsResponse.data || []).map((comment) => ({
              id: comment.id,
              author: {
                id: comment.author.id,
                name: comment.author.name || comment.author.username,
                avatar: comment.author.avatar_url || `https://source.unsplash.com/random/100x100?face&sig=${comment.author.id}`,
                username: comment.author.username
              },
              content: comment.content,
              createdAt: comment.created_at,
              likes: 0,
              // TODO: Implement comment likes
              parent_id: comment.parent_id,
              replies: []
            })),
            category: article.category,
            cover_url: article.cover_url
          });
        } else if (contentType === "book") {
          const { data: book, error: bookError } = await supabase.from("books").select(`
              *,
              book_chapters (
                id,
                title,
                content,
                "order"
              )
            `).eq("id", contentId).eq("status", "published").single();
          if (bookError) throw bookError;
          if (!book) throw new Error("Book not found");
          if (book.price > 0 && !user) {
            throw new Error("Please sign in to access this book");
          }
          const sortedChapters = book.book_chapters.sort((a, b) => a.order - b.order).map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            content: chapter.content,
            order: chapter.order
          }));
          console.log("Book data:", {
            id: book.id,
            title: book.title,
            file_url: book.file_url,
            file_type: book.file_type,
            chapters: sortedChapters.length
          });
          setContent({
            id: book.id,
            title: book.title,
            content: "",
            // We'll use chapters instead
            chapters: sortedChapters,
            author_id: book.author_id,
            price: book.price,
            status: book.status,
            file_url: book.file_url,
            file_type: book.file_type
          });
          await recordView();
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [contentType, contentId, user == null ? void 0 : user.id]);
  if (!contentType || !contentId) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading content..." })
    ] }) });
  }
  if (error || !content) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Content not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error || "The content you're looking for doesn't exist or has been removed." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.history.back(),
          className: "text-primary hover:underline",
          children: "Go back"
        }
      )
    ] }) });
  }
  switch (contentType) {
    case "book":
      return /* @__PURE__ */ jsx(EReader, { book: content });
    case "article":
      return /* @__PURE__ */ jsx(ArticleReader, { article: content });
    default:
      return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  }
}
export {
  ReaderPage
};
