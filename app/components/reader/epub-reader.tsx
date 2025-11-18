import React, { useState, useRef, useCallback } from "react";
import { ReactReader } from "react-reader";
import {
  BookOpen,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Sun,
  Moon,
  Type,
  AlignLeft,
  Menu,
  X,
  Download,
  Share2,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EpubReaderProps {
  fileUrl: string;
  title: string;
}

export function EpubReader({ fileUrl, title }: EpubReaderProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState<string | number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("light");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [toc, setToc] = useState<any[]>([]);
  const renditionRef = useRef<any>(null);
  const tocRef = useRef<any>(null);

  const locationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi);
  }, []);

  const getRendition = useCallback(
    (rendition: any) => {
      renditionRef.current = rendition;

      // Apply theme
      const themes = rendition.themes;
      themes.register("light", {
        body: {
          background: "#ffffff",
          color: "#000000",
        },
      });
      themes.register("sepia", {
        body: {
          background: "#f4ecd8",
          color: "#5f4b32",
        },
      });
      themes.register("dark", {
        body: {
          background: "#1a1a1a",
          color: "#e1e1e1",
        },
      });
      themes.select(theme);

      // Apply font size
      themes.fontSize(`${fontSize}%`);
    },
    [theme, fontSize]
  );

  const getToc = useCallback((toc: any) => {
    tocRef.current = toc;
    setToc(toc);
  }, []);

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(80, Math.min(150, fontSize + delta));
    setFontSize(newSize);
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${newSize}%`);
    }
  };

  const changeTheme = (newTheme: "light" | "sepia" | "dark") => {
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

  const goToLocation = (loc: string) => {
    setLocation(loc);
    setShowToc(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out this book: ${title}`,
          url: window.location.href,
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
          card: "bg-gray-900",
        };
      case "sepia":
        return {
          bg: "bg-[#f4ecd8]",
          text: "text-gray-900",
          border: "border-amber-200",
          card: "bg-[#f4ecd8]",
        };
      default:
        return {
          bg: "bg-white",
          text: "text-gray-900",
          border: "border-gray-200",
          card: "bg-white",
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      className={`min-h-screen ${styles.bg} ${styles.text} transition-colors duration-300`}
    >
      {/* Top Bar */}
      <div
        className={`fixed top-0 left-0 right-0 h-14 border-b ${styles.border} ${styles.card} backdrop-blur-sm bg-opacity-95 z-50 flex items-center justify-between px-4`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium truncate max-w-[200px] md:max-w-md">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToc(!showToc)}
            className={`p-2 hover:bg-accent rounded-lg transition-colors ${
              showToc ? "bg-accent" : ""
            }`}
            title="Table of Contents"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={addBookmark}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Add Bookmark"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 hover:bg-accent rounded-lg transition-colors ${
              showSettings ? "bg-accent" : ""
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className={`fixed top-14 right-0 w-80 h-[calc(100vh-3.5rem)] border-l ${styles.border} ${styles.card} backdrop-blur-sm bg-opacity-95 p-4 space-y-6 z-40 overflow-y-auto`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Reading Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeFontSize(-10)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[60px] text-center">
                {fontSize}%
              </span>
              <button
                onClick={() => changeFontSize(10)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => changeTheme("light")}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                  theme === "light"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-xs">Light</span>
              </button>
              <button
                onClick={() => changeTheme("sepia")}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                  theme === "sepia"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">Sepia</span>
              </button>
              <button
                onClick={() => changeTheme("dark")}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-xs">Dark</span>
              </button>
            </div>
          </div>

          {/* Bookmarks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bookmarks</label>
            {bookmarks.length > 0 ? (
              <div className="space-y-2">
                {bookmarks.map((bookmark, index) => (
                  <button
                    key={index}
                    onClick={() => goToLocation(bookmark)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    Bookmark {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share Book</span>
            </button>
            <a
              href={fileUrl}
              download
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download Book</span>
            </a>
          </div>
        </div>
      )}

      {/* Table of Contents */}
      {showToc && (
        <div
          className={`fixed top-14 left-0 w-80 h-[calc(100vh-3.5rem)] border-r ${styles.border} ${styles.card} backdrop-blur-sm bg-opacity-95 p-4 space-y-4 z-40 overflow-y-auto`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Table of Contents</h3>
            <button
              onClick={() => setShowToc(false)}
              className="p-1 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {toc.map((item: any, index: number) => (
              <button
                key={index}
                onClick={() => goToLocation(item.href)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reader */}
      <div className="pt-14" style={{ height: "100vh" }}>
        <ReactReader
          url={fileUrl}
          location={location}
          locationChanged={locationChanged}
          getRendition={getRendition}
          tocChanged={getToc}
          epubOptions={{
            flow: "paginated",
            manager: "continuous",
          }}
          readerStyles={{
            ...ReactReaderStyle,
            readerArea: {
              ...ReactReaderStyle.readerArea,
              backgroundColor:
                theme === "dark"
                  ? "#1a1a1a"
                  : theme === "sepia"
                  ? "#f4ecd8"
                  : "#ffffff",
              transition: "background-color 0.3s",
            },
          }}
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => renditionRef.current?.prev()}
        className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${styles.card} ${styles.border} border shadow-lg hover:bg-accent transition-all opacity-0 hover:opacity-100 z-30`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => renditionRef.current?.next()}
        className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${styles.card} ${styles.border} border shadow-lg hover:bg-accent transition-all opacity-0 hover:opacity-100 z-30`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

const ReactReaderStyle = {
  container: {
    overflow: "hidden",
    position: "relative" as const,
    height: "100%",
  },
  readerArea: {
    position: "relative" as const,
    zIndex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
  },
  containerExpanded: {
    transform: "translateX(0)",
  },
  titleArea: {
    position: "absolute" as const,
    top: 20,
    left: 50,
    right: 50,
    textAlign: "center" as const,
    color: "#999",
  },
  reader: {
    position: "absolute" as const,
    top: 50,
    left: 50,
    bottom: 20,
    right: 50,
  },
  swipeWrapper: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 200,
  },
  prev: {
    left: 1,
  },
  next: {
    right: 1,
  },
  arrow: {
    outline: "none",
    border: "none",
    background: "none",
    position: "absolute" as const,
    top: "50%",
    marginTop: -32,
    fontSize: 64,
    padding: "0 10px",
    color: "#E2E2E2",
    fontFamily: "arial, sans-serif",
    cursor: "pointer",
    userSelect: "none" as const,
    appearance: "none" as const,
    fontWeight: "normal",
  },
  arrowHover: {
    color: "#777",
  },
  tocBackground: {
    position: "absolute" as const,
    left: 256,
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  tocArea: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
    width: 256,
    overflowY: "auto" as const,
    WebkitOverflowScrolling: "touch" as const,
    background: "#f2f2f2",
    padding: "10px 0",
  },
  tocAreaButton: {
    userSelect: "none" as const,
    appearance: "none" as const,
    background: "none",
    border: "none",
    display: "block",
    fontFamily: "sans-serif",
    width: "100%",
    fontSize: ".9em",
    textAlign: "left" as const,
    padding: ".9em 1em",
    borderBottom: "1px solid #ddd",
    color: "#aaa",
    boxSizing: "border-box" as const,
    outline: "none",
    cursor: "pointer",
  },
  tocButton: {
    background: "none",
    border: "none",
    width: 32,
    height: 32,
    position: "absolute" as const,
    top: 10,
    left: 10,
    borderRadius: 2,
    outline: "none",
    cursor: "pointer",
  },
  tocButtonExpanded: {
    background: "#f2f2f2",
  },
  tocButtonBar: {
    position: "absolute" as const,
    width: "60%",
    background: "#ccc",
    height: 2,
    left: "50%",
    margin: "-1px -30%",
    top: "50%",
    transition: "all .5s ease",
  },
  tocButtonBarTop: {
    top: "35%",
  },
  tocButtonBottom: {
    top: "66%",
  },
  loadingView: {
    position: "absolute" as const,
    top: "50%",
    left: "10%",
    right: "10%",
    color: "#ccc",
    textAlign: "center" as const,
    marginTop: "-.5em",
  },
};
