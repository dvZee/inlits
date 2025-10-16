var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { isbot } from "isbot";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, LiveReload, useLocation } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import React__default, { createContext, useContext, useState, useEffect, Suspense, useRef, memo, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, RefreshCw, Loader2, Search, X, User, TrendingUp, History, Bell, Settings, BookOpen, Sun, Moon, ChevronDown, Target, CreditCard, Rocket, BookMarked, MessageSquare, Users2, Trophy, MoreHorizontal, Home as Home$1, Library, ChevronRight, ChevronLeft, Newspaper, Headphones, Mic, Sparkles, Mail, FileText, Play, Star, Bookmark, Info, SkipBack, RotateCcw, Pause, RotateCw, SkipForward, List, Car, Timer, Dumbbell, Lock, Zap } from "lucide-react";
import { useNavigate, Link, useLocation as useLocation$1, useSearchParams, Navigate, Routes, Route } from "react-router-dom";
import { create } from "zustand";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return isbot(request.headers.get("user-agent") ?? "") ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(body, {
              status: responseStatusCode,
              headers: responseHeaders
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(body, {
              status: responseStatusCode,
              headers: responseHeaders
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const styles = "/assets/index-kL0F4z8T.css";
const isBrowser$4 = typeof window !== "undefined";
const safeStorage$1 = isBrowser$4 && typeof window.localStorage !== "undefined" ? window.localStorage : {
  get length() {
    return 0;
  },
  key: () => null,
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  },
  clear: () => {
  }
};
const initialState = {
  theme: "system",
  setTheme: () => null
};
const ThemeProviderContext = createContext(initialState);
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => safeStorage$1.getItem(storageKey) || defaultTheme
  );
  useEffect(() => {
    if (!isBrowser$4) {
      return;
    }
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);
  const value = {
    theme,
    setTheme: (theme2) => {
      safeStorage$1.setItem(storageKey, theme2);
      setTheme(theme2);
    }
  };
  return /* @__PURE__ */ jsx(ThemeProviderContext.Provider, { ...props, value, children });
}
const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === void 0)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
const supabaseUrl = "https://yvjrakgbqqazedjltflw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce"
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      "x-client-info": "inlits",
      "Cache-Control": "max-age=300"
      // 5 minutes cache for static content
    }
  },
  db: {
    schema: "public"
  }
});
const isBrowser$3 = typeof window !== "undefined";
const hasDocument = typeof document !== "undefined";
let isConnected = true;
let connectionAttempts = 0;
let lastReconnectAttempt = 0;
let connectionCheckInterval = null;
const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY = 1e3;
const MAX_RETRY_DELAY = 3e4;
const RECONNECT_BACKOFF_FACTOR = 1.5;
const isRetryableError = (error) => {
  var _a, _b, _c;
  return error.code === "PGRST116" || // Timeout
  error.code === "503" || // Service unavailable
  error.code === "504" || // Gateway timeout
  error.code === "429" || // Too many requests
  error.code === "ECONNRESET" || // Connection reset
  ((_a = error.message) == null ? void 0 : _a.includes("network")) || // Network errors
  ((_b = error.message) == null ? void 0 : _b.includes("timeout")) || // Timeout errors
  ((_c = error.message) == null ? void 0 : _c.includes("connection"));
};
const withRetry = async (operation, maxRetries = MAX_RETRIES, initialDelay = INITIAL_RETRY_DELAY, timeout = 1e4) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timed out")), timeout);
      });
      const result = await Promise.race([operation(), timeoutPromise]);
      isConnected = true;
      connectionAttempts = 0;
      return result;
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) {
        throw error;
      }
      if (i < maxRetries - 1) {
        const backoffDelay = Math.min(
          initialDelay * Math.pow(RECONNECT_BACKOFF_FACTOR, i),
          MAX_RETRY_DELAY
        );
        const jitter = Math.random() * 1e3;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay + jitter));
      }
    }
  }
  throw lastError;
};
const reconnect = async () => {
  const now = Date.now();
  if (now - lastReconnectAttempt < INITIAL_RETRY_DELAY) {
    return false;
  }
  if (connectionAttempts >= MAX_RETRIES) {
    console.error("Max reconnection attempts reached, waiting for manual refresh");
    if (isBrowser$3) {
      window.dispatchEvent(new CustomEvent("supabase:connection-failed"));
    }
    return false;
  }
  try {
    lastReconnectAttempt = now;
    connectionAttempts++;
    const backoffDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(RECONNECT_BACKOFF_FACTOR, connectionAttempts - 1),
      MAX_RETRY_DELAY
    );
    const jitter = Math.random() * 1e3;
    await new Promise((resolve) => setTimeout(resolve, backoffDelay + jitter));
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) {
      console.error("Connection test failed:", error);
      return false;
    }
    isConnected = true;
    connectionAttempts = 0;
    return true;
  } catch (error) {
    console.error("Reconnection failed:", error);
    return false;
  }
};
const forceReconnect = async () => {
  connectionAttempts = 0;
  lastReconnectAttempt = 0;
  return reconnect();
};
const checkConnection = () => isConnected;
const startConnectionCheck = (interval = 1e4) => {
  if (!isBrowser$3) {
    return () => {
    };
  }
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  connectionCheckInterval = setInterval(() => {
    if (!isConnected) {
      reconnect();
    } else {
      supabase.from("profiles").select("id").limit(1).then(({ error }) => {
        if (error) {
          console.warn("Connection check failed:", error);
          isConnected = false;
          reconnect();
        }
      });
    }
  }, interval);
  return () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      connectionCheckInterval = null;
    }
  };
};
if (isBrowser$3) {
  window.addEventListener("online", () => {
    console.log("Network online, attempting reconnect");
    if (!isConnected) {
      connectionAttempts = 0;
      reconnect();
    }
  });
  window.addEventListener("offline", () => {
    console.log("Network offline, marking as disconnected");
    isConnected = false;
  });
}
if (hasDocument) {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("Document visible, checking connection");
      supabase.from("profiles").select("id").limit(1).then(({ error }) => {
        if (error) {
          console.warn("Connection test on visibility change failed:", error);
          isConnected = false;
          reconnect();
        }
      });
    }
  });
}
if (isBrowser$3) {
  startConnectionCheck();
}
const ConnectionContext = createContext({
  isConnected: true,
  retryConnection: async () => {
  },
  connectionError: null
});
function ConnectionProvider({ children }) {
  const [isConnected2, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionError, setConnectionError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryConnection = async () => {
    if (isRetrying) return;
    try {
      setIsRetrying(true);
      setConnectionError(null);
      console.log("Manually retrying connection...");
      const success = await reconnect();
      if (success) {
        console.log("Manual reconnection successful");
        setIsConnected(true);
        setShowBanner(false);
        setRetryCount(0);
      } else {
        console.log("Manual reconnection failed");
        setRetryCount((prev) => prev + 1);
        setConnectionError("Could not connect to the server. Please try again later.");
      }
    } catch (error) {
      console.error("Error during manual reconnection:", error);
      setConnectionError("An error occurred while trying to reconnect.");
    } finally {
      setIsRetrying(false);
    }
  };
  useEffect(() => {
    const cleanup = startConnectionCheck(5e3);
    const initialCheck = async () => {
      try {
        await supabase.auth.getSession();
        console.log("Initial connection check successful");
        setIsConnected(true);
        setShowBanner(false);
      } catch (error) {
        console.warn("Initial connection check failed");
        setIsConnected(false);
        setShowBanner(true);
      }
    };
    initialCheck();
    return () => {
      cleanup();
    };
  }, []);
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const connected = checkConnection();
      if (connected !== isConnected2) {
        console.log(`Connection status changed: ${connected ? "connected" : "disconnected"}`);
        setIsConnected(connected);
      }
      if (!connected) {
        setShowBanner(true);
      }
    }, 2e3);
    return () => clearInterval(checkInterval);
  }, [isConnected2]);
  useEffect(() => {
    if (!isConnected2 && !isRetrying) {
      const backoffTime = Math.min(1e3 * Math.pow(2, retryCount), 3e4);
      console.log(`Scheduling auto-retry in ${backoffTime}ms (attempt ${retryCount + 1})`);
      const retryTimer = setTimeout(() => {
        reconnect().then((success) => {
          if (success) {
            console.log("Auto-reconnection successful");
            setIsConnected(true);
            setShowBanner(false);
            setRetryCount(0);
          } else {
            console.log("Auto-reconnection failed");
            setRetryCount((prev) => prev + 1);
          }
        });
      }, backoffTime);
      return () => clearTimeout(retryTimer);
    }
  }, [isConnected2, retryCount, isRetrying]);
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network online event detected");
      retryConnection();
    };
    const handleOffline = () => {
      console.log("Network offline event detected");
      setIsConnected(false);
      setShowBanner(true);
      setConnectionError("Your device appears to be offline. Please check your internet connection.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const handleConnectionFailed = () => {
      console.log("Connection failed event received");
      setIsConnected(false);
      setShowBanner(true);
      setConnectionError("Connection to the server failed after multiple attempts.");
    };
    window.addEventListener("supabase:connection-failed", handleConnectionFailed);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("supabase:connection-failed", handleConnectionFailed);
    };
  }, []);
  useEffect(() => {
    if (isConnected2 && showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
        setConnectionError(null);
      }, 2e3);
      return () => clearTimeout(timer);
    }
  }, [isConnected2, showBanner]);
  return /* @__PURE__ */ jsxs(ConnectionContext.Provider, { value: { isConnected: isConnected2, retryConnection, connectionError }, children: [
    showBanner && /* @__PURE__ */ jsxs("div", { className: "fixed top-0 left-0 right-0 z-50 bg-destructive/10 text-destructive px-4 py-3 flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: connectionError || (isConnected2 ? "Connection restored!" : "Connection lost. Attempting to reconnect...") }),
      !isConnected2 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: retryConnection,
          disabled: isRetrying,
          className: "text-sm underline hover:no-underline ml-2 flex items-center gap-1",
          children: isRetrying ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "w-3 h-3 animate-spin" }),
            "Retrying..."
          ] }) : /* @__PURE__ */ jsx(Fragment, { children: "Retry now" })
        }
      )
    ] }),
    children
  ] });
}
const AudioContext = createContext(null);
function AudioProvider({
  children,
  currentPathname
}) {
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const pathname = currentPathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const isMainPlayerPage = pathname.startsWith("/player/");
  const updateCurrentTime = (time) => {
    if (currentAudio) {
      setCurrentAudio({
        ...currentAudio,
        currentTime: time
      });
    }
  };
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("audioState");
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentAudio(state.currentAudio);
        setPlayerVisible(state.isPlayerVisible);
        setCurrentChapter(state.currentChapter || 0);
      }
    } catch (error) {
      console.error("Error restoring audio state:", error);
      localStorage.removeItem("audioState");
    }
  }, []);
  useEffect(() => {
    if (currentAudio || isPlayerVisible) {
      try {
        localStorage.setItem("audioState", JSON.stringify({
          currentAudio,
          isPlayerVisible,
          currentChapter
        }));
      } catch (error) {
        console.error("Error saving audio state:", error);
      }
    }
  }, [currentAudio, isPlayerVisible, currentChapter]);
  return /* @__PURE__ */ jsx(AudioContext.Provider, { value: {
    isPlayerVisible,
    setPlayerVisible,
    currentAudio,
    setCurrentAudio,
    isMainPlayerPage,
    currentChapter,
    setCurrentChapter,
    updateCurrentTime
  }, children });
}
function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
let ErrorBoundary$1 = class ErrorBoundary extends React__default.Component {
  constructor(props) {
    super(props);
    __publicField(this, "handleConnectionFailed", () => {
      this.setState({ connectionFailed: true });
    });
    __publicField(this, "handleGlobalError", (event) => {
      if (event.message.includes("network") || event.message.includes("connection") || event.message.includes("fetch") || event.message.includes("xhr")) {
        this.setState({
          hasError: true,
          error: new Error(`Network error: ${event.message}`)
        });
        event.preventDefault();
      }
    });
    __publicField(this, "handlePromiseRejection", (event) => {
      var _a;
      const message = ((_a = event.reason) == null ? void 0 : _a.message) || String(event.reason);
      if (message.includes("network") || message.includes("connection") || message.includes("fetch") || message.includes("xhr")) {
        this.setState({
          hasError: true,
          error: new Error(`Network error: ${message}`)
        });
        event.preventDefault();
      }
    });
    __publicField(this, "handleRetry", async () => {
      this.setState({ isRetrying: true });
      try {
        if (this.state.connectionFailed) {
          console.log("Attempting to force reconnect...");
          const success = await forceReconnect();
          if (success) {
            console.log("Reconnection successful");
            this.setState({
              connectionFailed: false,
              hasError: false,
              error: null,
              errorInfo: null
            });
          } else {
            console.log("Reconnection failed");
            window.location.reload();
          }
        } else {
          this.setState({
            hasError: false,
            error: null,
            errorInfo: null
          });
        }
      } catch (error) {
        console.error("Error during retry:", error);
      } finally {
        this.setState({ isRetrying: false });
      }
    });
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      connectionFailed: false,
      isRetrying: false
    };
  }
  componentDidMount() {
    window.addEventListener("supabase:connection-failed", this.handleConnectionFailed);
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
  }
  componentWillUnmount() {
    window.removeEventListener("supabase:connection-failed", this.handleConnectionFailed);
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handlePromiseRejection);
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo: {
        componentStack: this.sanitizeComponentStack(errorInfo.componentStack)
      }
    });
    console.error("Error caught by ErrorBoundary:", error);
    if (process.env.NODE_ENV === "production") ;
  }
  // Sanitize component stack to remove file paths and line numbers
  sanitizeComponentStack(stack) {
    if (!stack) {
      return "";
    }
    return stack.split("\n").map((line) => {
      const match = line.match(/\s+at\s+([A-Za-z0-9_]+)/);
      return match ? `    at ${match[1]}` : line;
    }).join("\n");
  }
  render() {
    var _a;
    if (this.state.hasError || this.state.connectionFailed) {
      return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4 max-w-md", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: this.state.connectionFailed ? "Connection lost" : "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: this.state.connectionFailed ? "Unable to connect to the server. Please check your internet connection and try again." : "An unexpected error occurred. Please try again." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: this.handleRetry,
            disabled: this.state.isRetrying,
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70",
            children: this.state.isRetrying ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
              /* @__PURE__ */ jsx("span", { children: "Retrying..." })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Try again" })
            ] })
          }
        ),
        process.env.NODE_ENV !== "production" && this.state.errorInfo && /* @__PURE__ */ jsxs("details", { className: "mt-4 text-left", children: [
          /* @__PURE__ */ jsx("summary", { className: "text-sm text-primary cursor-pointer", children: "View technical details" }),
          /* @__PURE__ */ jsx("pre", { className: "mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-[200px]", children: (_a = this.state.error) == null ? void 0 : _a.toString() })
        ] })
      ] }) });
    }
    return this.props.children;
  }
};
const meta = () => [
  { charSet: "utf-8" },
  { title: "Inlits" },
  { name: "viewport", content: "width=device-width,initial-scale=1" }
];
const links = () => [
  { rel: "stylesheet", href: styles }
];
function Document({
  children,
  title
}) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "h-full", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      title ? /* @__PURE__ */ jsx("title", { children: title }) : null,
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "min-h-full bg-background text-foreground", children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {}),
      /* @__PURE__ */ jsx(LiveReload, {})
    ] })
  ] });
}
function AppProviders({ children }) {
  const location = useLocation();
  return /* @__PURE__ */ jsx(ConnectionProvider, { children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: "system", storageKey: "inlits-theme", children: /* @__PURE__ */ jsx(AudioProvider, { currentPathname: location.pathname, children: /* @__PURE__ */ jsx(ErrorBoundary$1, { children }) }) }) });
}
function App$1() {
  return /* @__PURE__ */ jsx(Document, { children: /* @__PURE__ */ jsx(AppProviders, { children: /* @__PURE__ */ jsx(
    Suspense,
    {
      fallback: /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 animate-spin text-primary" }) }),
      children: /* @__PURE__ */ jsx(Outlet, {})
    }
  ) }) });
}
function ErrorBoundary2({ error }) {
  console.error(error);
  return /* @__PURE__ */ jsx(Document, { title: "Application error", children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "max-w-md text-muted-foreground", children: "We encountered an unexpected error while loading this page. Please try refreshing, or come back later if the issue persists." }),
    /* @__PURE__ */ jsx("code", { className: "max-w-md overflow-x-auto rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground", children: error instanceof Error ? error.message : String(error) })
  ] }) });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: ErrorBoundary2,
  default: App$1,
  links,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const isBrowser$2 = typeof window !== "undefined";
const safeStorage = isBrowser$2 && typeof window.localStorage !== "undefined" ? window.localStorage : {
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  }
};
const useAuth = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  refreshSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session == null ? void 0 : session.user) {
        set({ user: session.user });
        const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileError) throw profileError;
        if (profile) {
          set({ profile });
        }
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      set({ user: null, profile: null });
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password, username, role) => {
    try {
      console.log("Creating user account with role:", role);
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      if (!data.user) throw new Error("No user returned from signup");
      console.log("User created successfully, now creating profile...");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        role,
        // Use the role parameter directly
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (profileError) {
        if (profileError.code === "23505") {
          console.log("Profile already exists, updating role...");
          const { error: updateError } = await supabase.from("profiles").update({
            role,
            username,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", data.user.id);
          if (updateError) {
            console.error("Error updating profile role:", updateError);
            throw new Error("Failed to set user role. Please try again.");
          }
        } else {
          console.error("Profile creation error:", profileError);
          throw new Error("Failed to create user profile. Please try again.");
        }
      }
      const { data: verifyProfile, error: verifyError } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (verifyError) {
        console.error("Error verifying profile:", verifyError);
        throw new Error("Account created but profile verification failed. Please try signing in.");
      }
      if (verifyProfile) {
        console.log("Profile created successfully with role:", verifyProfile.role);
      } else {
        console.warn("Profile not found after creation, but user was created successfully");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },
  signIn: async (email, password) => {
    var _a;
    try {
      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) throw signInError;
      if (!user) throw new Error("No user returned from sign in");
      set({ user, loading: true });
      const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (profileError) {
        console.error("Profile error:", profileError);
        if (profileError.code === "PGRST116" || !profile) {
          try {
            const { error: insertError } = await supabase.from("profiles").insert({
              id: user.id,
              username: email.split("@")[0],
              role: "consumer",
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            if (insertError) {
              console.error("Error creating profile on sign in:", insertError);
              throw insertError;
            }
            const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (newProfile) {
              set({ profile: newProfile, loading: false });
              safeStorage.setItem("userProfile", JSON.stringify(newProfile));
              return;
            }
          } catch (insertError) {
            console.error("Error creating profile on sign in:", insertError);
            if (insertError.code === "23505" || ((_a = insertError.message) == null ? void 0 : _a.includes("duplicate key"))) {
              console.log("Profile already exists during sign in, fetching existing profile");
              const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
              if (existingProfile) {
                console.log("Successfully fetched existing profile during sign in");
                set({ profile: existingProfile, loading: false });
                safeStorage.setItem("userProfile", JSON.stringify(existingProfile));
                return;
              }
            }
            throw new Error("Failed to create user profile. Please try again.");
          }
        }
        throw new Error("Failed to load user profile. Please try again.");
      }
      if (!profile) throw new Error("No profile found");
      try {
        await supabase.functions.invoke("send-welcome-email", {
          body: {
            to: email,
            name: profile.name || profile.username,
            role: profile.role
          }
        });
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }
      safeStorage.setItem("sb-session", JSON.stringify(session));
      safeStorage.setItem("userProfile", JSON.stringify(profile));
      set({ profile, loading: false });
    } catch (error) {
      set({ user: null, profile: null, loading: false });
      safeStorage.removeItem("sb-session");
      safeStorage.removeItem("userProfile");
      throw error;
    }
  },
  signInWithProvider: async (provider) => {
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : void 0;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo
        }
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("OAuth sign in error:", error);
      throw error;
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      safeStorage.removeItem("sb-session");
      safeStorage.removeItem("userProfile");
      set({ user: null, profile: null, loading: false });
      if (isBrowser$2) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      safeStorage.removeItem("sb-session");
      safeStorage.removeItem("userProfile");
      set({ user: null, profile: null, loading: false });
      if (isBrowser$2) {
        window.location.href = "/";
      }
    }
  },
  setUser: async (user) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    if (!user) {
      set({ user: null, profile: null, loading: false });
      safeStorage.removeItem("userProfile");
      return;
    }
    console.log("Setting user:", user.email, "Provider:", (_a = user.app_metadata) == null ? void 0 : _a.provider);
    set({ user, loading: true });
    try {
      const cachedProfile = safeStorage.getItem("userProfile");
      if (cachedProfile) {
        const profile2 = JSON.parse(cachedProfile);
        if (profile2.id === user.id) {
          console.log("Using cached profile");
          set({ profile: profile2, loading: false });
          return;
        }
      }
      console.log("Fetching profile from database");
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) {
        console.error("Error fetching profile:", error);
        if (error.code === "PGRST116" || !profile) {
          console.log("Profile not found, creating new profile for OAuth user");
          const displayName = ((_b = user.user_metadata) == null ? void 0 : _b.full_name) || ((_c = user.user_metadata) == null ? void 0 : _c.name) || ((_d = user.email) == null ? void 0 : _d.split("@")[0]) || "User";
          let username = ((_e = user.user_metadata) == null ? void 0 : _e.user_name) || ((_f = user.user_metadata) == null ? void 0 : _f.preferred_username) || ((_h = (_g = user.email) == null ? void 0 : _g.split("@")[0]) == null ? void 0 : _h.replace(/[^a-zA-Z0-9_]/g, ""));
          if (!username || username.length < 3) {
            username = `user_${Date.now()}`;
          }
          const { data: existingUser } = await supabase.from("profiles").select("username").eq("username", username).maybeSingle();
          if (existingUser) {
            username = `${username}_${Date.now()}`;
          }
          console.log("Creating profile with username:", username);
          try {
            const { error: insertError } = await supabase.from("profiles").insert({
              id: user.id,
              username,
              name: displayName,
              role: "consumer",
              avatar_url: ((_i = user.user_metadata) == null ? void 0 : _i.avatar_url) || ((_j = user.user_metadata) == null ? void 0 : _j.picture),
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            if (insertError) {
              console.error("Error creating profile on setUser:", insertError);
              throw insertError;
            }
            const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (newProfile) {
              console.log("Successfully created and fetched new profile");
              safeStorage.setItem("userProfile", JSON.stringify(newProfile));
              set({ profile: newProfile, loading: false });
              try {
                await supabase.functions.invoke("send-welcome-email", {
                  body: {
                    to: user.email,
                    name: displayName,
                    role: "consumer"
                  }
                });
                console.log("Welcome email sent successfully");
              } catch (emailError) {
                console.error("Error sending welcome email:", emailError);
              }
              return;
            }
          } catch (insertError) {
            console.error("Error creating profile on setUser:", insertError);
            if (insertError.code === "23505" || ((_k = insertError.message) == null ? void 0 : _k.includes("duplicate key"))) {
              console.log("Profile already exists, fetching existing profile");
              const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
              if (existingProfile) {
                console.log("Successfully fetched existing profile after duplicate key error");
                safeStorage.setItem("userProfile", JSON.stringify(existingProfile));
                set({ profile: existingProfile, loading: false });
                return;
              }
            }
          }
        }
        set({ loading: false });
        return;
      }
      if (profile) {
        console.log("Profile found, setting in state");
        safeStorage.setItem("userProfile", JSON.stringify(profile));
        set({ profile, loading: false });
      } else {
        console.log("No profile found");
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      set({ loading: false });
    }
  },
  setProfile: (profile) => {
    if (profile) {
      safeStorage.setItem("userProfile", JSON.stringify(profile));
    }
    set({ profile, loading: false });
  },
  resendVerificationEmail: async () => {
    const { user } = get();
    if (!(user == null ? void 0 : user.email)) throw new Error("No email address found");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: isBrowser$2 ? `${window.location.origin}/verify-email` : void 0
      }
    });
    if (error) throw error;
  },
  isAuthenticated: () => {
    const { user, profile } = get();
    return !!user && !!profile;
  },
  hasRole: (roles) => {
    const { profile } = get();
    return !!profile && roles.includes(profile.role);
  }
}));
const initAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting initial session:", error);
      useAuth.getState().setUser(null);
      return;
    }
    if (session == null ? void 0 : session.user) {
      await useAuth.getState().setUser(session.user);
    } else {
      useAuth.getState().setUser(null);
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
    useAuth.getState().setUser(null);
  }
};
if (isBrowser$2) {
  initAuth();
  supabase.auth.onAuthStateChange(async (event, session) => {
    var _a;
    console.log("Auth state change:", event, (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.email);
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      if (session == null ? void 0 : session.user) {
        console.log("User signed in, setting user state");
        await useAuth.getState().setUser(session.user);
      }
    } else if (event === "SIGNED_OUT") {
      console.log("User signed out");
      useAuth.getState().setUser(null);
    }
  });
}
const RECENT_SEARCHES_KEY = "inlits_recent_searches";
const MAX_RECENT_SEARCHES = 5;
function getRecentSearches() {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
function addRecentSearch(query) {
  try {
    const recent = getRecentSearches();
    const newRecent = [
      query,
      ...recent.filter((q) => q !== query)
    ].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  } catch {
  }
}
function removeRecentSearch(query) {
  try {
    const recent = getRecentSearches();
    const newRecent = recent.filter((q) => q !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
    return newRecent;
  } catch {
    return [];
  }
}
async function searchContent({
  query,
  type,
  category,
  language,
  limit = 10,
  offset = 0
}) {
  try {
    if (!(query == null ? void 0 : query.trim())) {
      return { items: [], total: 0 };
    }
    const { data, error } = await supabase.rpc(
      "search_content",
      {
        search_text: query.trim(),
        content_filter: type || null,
        category_filter: category || null,
        language_filter: language || null,
        // Always include language_filter
        items_limit: limit,
        items_offset: offset
      }
    );
    if (error) {
      console.error("Search RPC error:", error);
      throw new Error(error.message);
    }
    if (!Array.isArray(data)) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from server");
    }
    const items = data.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      thumbnail: item.thumbnail || `https://source.unsplash.com/random/800x600?${item.type}&sig=${item.id}`,
      duration: item.duration,
      views: item.views,
      createdAt: item.created_at,
      creator: {
        id: item.creator.id,
        name: item.creator.name,
        avatar: item.creator.avatar || `https://source.unsplash.com/random/100x100?face&sig=${item.creator.id}`,
        followers: item.creator.followers || 0
      },
      category: item.category,
      featured: item.featured
    }));
    if (query == null ? void 0 : query.trim()) {
      addRecentSearch(query.trim());
    }
    return {
      items,
      total: data.length
      // Use the actual length of results
    };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
async function searchSuggestions(query) {
  try {
    const suggestions = [];
    if (!query.trim()) {
      const recent = getRecentSearches();
      suggestions.push(
        ...recent.map((text) => ({
          text,
          type: "recent"
        }))
      );
      const { data: trending, error: trendingError } = await supabase.rpc(
        "get_trending_searches",
        {
          max_suggestions: 5
        }
      );
      if (trendingError) {
        console.error("Trending suggestions error:", trendingError);
        return suggestions;
      }
      if (Array.isArray(trending)) {
        suggestions.push(
          ...trending.map((item) => ({
            text: item.suggestion,
            type: "trending",
            count: item.count || Math.floor(Math.random() * 1e3)
          }))
        );
      }
      const { data: creators, error: creatorsError } = await supabase.from("profiles").select("username, name").eq("role", "creator").limit(3);
      if (!creatorsError && creators) {
        suggestions.push(
          ...creators.map((creator) => ({
            text: creator.name || creator.username,
            type: "creator",
            username: creator.username
          }))
        );
      }
    } else {
      const { data, error } = await supabase.rpc(
        "get_search_suggestions",
        {
          search_query: query,
          max_suggestions: 5
        }
      );
      if (error) {
        console.error("Search suggestions error:", error);
        return suggestions;
      }
      if (Array.isArray(data)) {
        suggestions.push(
          ...data.map((item) => ({
            text: item.suggestion,
            type: "suggestion"
          }))
        );
      }
      const { data: creators, error: creatorsError } = await supabase.from("profiles").select("username, name").eq("role", "creator").ilike("name", `%${query}%`).limit(3);
      if (!creatorsError && creators) {
        suggestions.push(
          ...creators.map((creator) => ({
            text: creator.name || creator.username,
            type: "creator",
            username: creator.username
          }))
        );
      }
      const matchingCategories = categories.filter(
        (c) => c.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);
      suggestions.push(
        ...matchingCategories.map((text) => ({
          text,
          type: "suggestion",
          category: "category"
        }))
      );
    }
    return suggestions;
  } catch (error) {
    console.error("Search suggestions error:", error);
    return [];
  }
}
const categories = [
  "Business & Finance",
  "Self Development",
  "Science & Technology",
  "History & Politics",
  "Philosophy",
  "Psychology",
  "Fiction",
  "Biography",
  "Health & Wellness",
  "Arts & Culture",
  "Religion & Spirituality",
  "Education"
];
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}
function SearchBox() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const getSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        try {
          const suggestions2 = await searchSuggestions("");
          setSuggestions(suggestions2);
        } catch (error) {
          console.error("Error getting suggestions:", error);
          setSuggestions([]);
        }
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const suggestions2 = await searchSuggestions(debouncedQuery);
        setSuggestions(suggestions2);
      } catch (error) {
        console.error("Error getting suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    getSuggestions();
  }, [debouncedQuery]);
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowResults(false);
  };
  const handleRemoveFromHistory = async (text, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newRecentSearches = removeRecentSearch(text);
      setSuggestions((prev) => prev.filter((s) => s.type !== "recent" || s.text !== text));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };
  const getSuggestionIcon = (type) => {
    switch (type) {
      case "recent":
        return /* @__PURE__ */ jsx(History, { className: "w-4 h-4" });
      case "trending":
        return /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" });
      case "creator":
        return /* @__PURE__ */ jsx(User, { className: "w-4 h-4" });
      case "suggestion":
        return /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs("div", { ref: searchRef, className: "relative flex-1 max-w-2xl", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: query,
          onChange: (e) => {
            setQuery(e.target.value);
            setShowResults(true);
          },
          onFocus: () => setShowResults(true),
          placeholder: "Search content...",
          className: "w-full h-10 pl-9 pr-10 border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        }
      ),
      loading ? /* @__PURE__ */ jsx(Loader2, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" }) : query && /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            setQuery("");
            setSuggestions([]);
          },
          className: "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Clear search" }),
            /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
          ]
        }
      )
    ] }),
    showResults && /* @__PURE__ */ jsx("div", { className: "absolute top-full mt-2 w-full md:w-full bg-popover border rounded-lg shadow-lg overflow-hidden z-50 left-0 right-0 mx-auto max-w-full", children: suggestions.length > 0 ? /* @__PURE__ */ jsx("div", { className: "p-2", children: suggestions.map((suggestion, i) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          if (suggestion.type === "creator") {
            navigate(`/creator/${suggestion.username}`);
          } else {
            setQuery(suggestion.text);
            navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
          }
          setShowResults(false);
        },
        className: "w-full px-3 py-2 text-sm text-left rounded hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2 group min-w-0",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground group-hover:text-primary-foreground transition-colors", children: getSuggestionIcon(suggestion.type) }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 min-w-0", children: suggestion.type === "creator" ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium truncate", children: suggestion.text }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground group-hover:text-primary-foreground/80 truncate", children: [
              "@",
              suggestion.username
            ] })
          ] }) : /* @__PURE__ */ jsx("span", { className: "truncate block", children: suggestion.text }) }),
          suggestion.category && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground transition-colors flex-shrink-0", children: suggestion.category }),
          suggestion.count && /* @__PURE__ */ jsxs("span", { className: "hidden md:inline text-xs text-muted-foreground group-hover:text-primary-foreground/80 transition-colors flex-shrink-0", children: [
            suggestion.count.toLocaleString(),
            " searches"
          ] }),
          suggestion.type === "recent" && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => handleRemoveFromHistory(suggestion.text, e),
              className: "p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-primary-foreground/20 transition-all flex-shrink-0",
              children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3 text-primary-foreground" })
            }
          )
        ]
      },
      i
    )) }) : query ? /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-muted-foreground text-sm", children: "No suggestions found" }) : /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-muted-foreground text-sm", children: "Start typing to search" }) })
  ] });
}
const useNotifications = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false, error: "User not authenticated" });
        return;
      }
      const { data, error } = await withRetry(
        async () => {
          const result = await supabase.rpc("get_user_notifications", {
            p_user_id: user.id,
            p_limit: 50,
            p_offset: 0
          });
          return {
            data: result.data ?? null,
            error: result.error
          };
        }
      );
      if (error) throw error;
      const notifications = data ?? [];
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({
        notifications,
        unreadCount,
        loading: false
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({
        error: "Failed to load notifications",
        loading: false
      });
    }
  },
  markAsRead: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { error } = await withRetry(async () => {
        const result = await supabase.rpc("mark_notifications_read", {
          p_user_id: user.id,
          p_notification_ids: [id]
        });
        return { error: result.error };
      });
      if (error) throw error;
      set((state) => ({
        notifications: state.notifications.map(
          (n) => n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },
  markAllAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { error } = await withRetry(async () => {
        const result = await supabase.rpc("mark_notifications_read", {
          p_user_id: user.id,
          p_notification_ids: null
        });
        return { error: result.error };
      });
      if (error) throw error;
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
  subscribeToNotifications: (userId) => {
    const channel = supabase.channel(`notifications:${userId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const { fetchNotifications } = get();
        await fetchNotifications();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
  unsubscribeFromNotifications: () => {
    supabase.removeAllChannels();
  }
}));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function detectUrduText(text) {
  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200F\u061C]/;
  return urduRegex.test(text);
}
function getTextLanguageClass(text) {
  return detectUrduText(text) ? "urdu-content" : "english-content";
}
function formatTimeAgo(date) {
  const now = /* @__PURE__ */ new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1e3);
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} years ago`;
}
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    // This gives 3-letter month abbreviation
    day: "numeric"
  });
}
function NotificationsDropdown() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications
  } = useNotifications();
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest("[data-notifications-dropdown]")) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const cleanup = subscribeToNotifications(user.id);
      return cleanup;
    }
  }, [user, fetchNotifications, subscribeToNotifications]);
  const handleNotificationClick = async (id, link) => {
    try {
      await markAsRead(id);
    } catch (error2) {
      console.error("Error marking notification as read:", error2);
    }
    if (link) {
      navigate(link);
    }
    setShowDropdown(false);
  };
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error2) {
      console.error("Error marking all notifications as read:", error2);
    }
  };
  const getNotificationIcon = (type) => {
    switch (type) {
      case "content":
        return "📚";
      case "follow":
        return "👥";
      case "mention":
        return "💬";
      case "achievement":
        return "🏆";
      default:
        return "🔔";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", "data-notifications-dropdown": true, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setShowDropdown(!showDropdown),
        className: "relative p-2 transition-colors rounded-lg hover:bg-primary/5",
        children: [
          /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }),
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs font-medium text-white bg-primary rounded-full flex items-center justify-center px-1", children: unreadCount > 99 ? "99+" : unreadCount })
        ]
      }
    ),
    showDropdown && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 w-80 max-w-[90vw] mt-2 bg-popover border rounded-lg shadow-lg z-50 max-h-[80vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Notifications" }),
          unreadCount > 0 && /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full", children: [
            unreadCount,
            " new"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          unreadCount > 0 && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleMarkAllRead,
              className: "text-xs text-primary hover:underline",
              children: "Mark all as read"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowDropdown(false),
              className: "p-1 hover:bg-accent rounded-lg transition-colors",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : error ? /* @__PURE__ */ jsxs("div", { className: "p-4 text-center text-destructive", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-6 h-6 mx-auto mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: error }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => fetchNotifications(),
            className: "block mx-auto mt-2 text-sm text-primary hover:underline",
            children: "Try again"
          }
        )
      ] }) : notifications.length > 0 ? notifications.map((notification) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleNotificationClick(notification.id, notification.link),
          className: `w-full p-4 text-left hover:bg-accent transition-colors flex items-start gap-3 ${notification.read ? "opacity-70" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-lg mt-0.5 shrink-0", children: getNotificationIcon(notification.type) }),
            !notification.read && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 mt-2 rounded-full bg-primary shrink-0 absolute left-1" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: `font-medium text-sm ${!notification.read ? "text-foreground" : "text-muted-foreground"}`, children: notification.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: notification.message }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { children: formatTimeAgo(notification.created_at) }),
                notification.link && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Click to view" })
                ] })
              ] })
            ] })
          ]
        },
        notification.id
      )) : /* @__PURE__ */ jsxs("div", { className: "p-4 text-center text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Bell, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No notifications yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", children: "You'll see updates here when you have new activity" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "p-3 border-t bg-muted/30", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/settings/notifications",
          className: "w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors",
          onClick: () => setShowDropdown(false),
          children: [
            /* @__PURE__ */ jsx(Settings, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Notification Settings" })
          ]
        }
      ) })
    ] })
  ] });
}
function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const isBrowser2 = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser2 ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    if (!isBrowser2) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBrowser2]);
  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const handleProfileClick = () => {
    setShowUserDropdown(false);
    if ((profile == null ? void 0 : profile.role) === "creator") {
      navigate(`/creator/${profile.username}`);
    } else {
      navigate(`/consumer/${profile == null ? void 0 : profile.username}`);
    }
  };
  const handleSettingsClick = () => {
    setShowUserDropdown(false);
    if ((profile == null ? void 0 : profile.role) === "creator") {
      navigate(`/dashboard/${profile.username}/settings`);
    } else {
      navigate("/settings");
    }
  };
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxs("div", { className: "container flex h-14 items-center justify-between px-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(BookOpen, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "hidden text-xl font-bold md:inline", children: "Inlits" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 max-w-xl mx-4", children: /* @__PURE__ */ jsx(SearchBox, {}) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
          className: "p-2 transition-colors rounded-lg hover:bg-primary/5",
          children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5" })
        }
      ),
      user && /* @__PURE__ */ jsx(NotificationsDropdown, {}),
      user ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowUserDropdown(!showUserDropdown),
            className: "flex items-center gap-2 p-1 transition-colors rounded-lg hover:bg-primary/5",
            children: [
              (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: profile.avatar_url,
                  alt: profile.username,
                  className: "w-8 h-8 rounded-full"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 h-8 font-medium rounded-full bg-primary/10 text-primary", children: profile == null ? void 0 : profile.username[0].toUpperCase() }),
              !isMobile && /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" })
            ]
          }
        ),
        showUserDropdown && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 w-56 p-2 mt-2 bg-popover border rounded-lg shadow-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "pb-2 mb-2 border-b", children: [
            /* @__PURE__ */ jsx("p", { className: "px-2 text-sm font-medium", children: profile == null ? void 0 : profile.username }),
            /* @__PURE__ */ jsx("p", { className: "px-2 text-xs capitalize text-muted-foreground", children: profile == null ? void 0 : profile.role })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleProfileClick,
              className: "w-full px-2 py-1.5 text-left text-sm rounded-md hover:bg-primary/5",
              children: "Your Profile"
            }
          ),
          (profile == null ? void 0 : profile.role) === "creator" ? /* @__PURE__ */ jsx(
            Link,
            {
              to: `/dashboard/${profile.username}`,
              onClick: () => setShowUserDropdown(false),
              className: "block px-2 py-1.5 text-sm rounded-md hover:bg-primary/5",
              children: "Creator Dashboard"
            }
          ) : /* @__PURE__ */ jsx(
            Link,
            {
              to: "/become-creator",
              onClick: () => setShowUserDropdown(false),
              className: "block px-2 py-1.5 text-sm rounded-md hover:bg-primary/5 text-primary",
              children: "Become a Creator"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSettingsClick,
              className: "w-full px-2 py-1.5 text-left text-sm rounded-md hover:bg-primary/5",
              children: "Settings"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSignOut,
              className: "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-primary/5 text-destructive",
              children: "Sign Out"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: isMobile ? /* @__PURE__ */ jsx(
        Link,
        {
          to: "/signin",
          className: "p-2",
          children: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" })
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/signin",
            className: "px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-primary/5",
            children: "Login"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/get-started",
            className: "px-4 py-2 text-sm font-medium transition-colors rounded-md shadow h-9 bg-primary text-primary-foreground hover:bg-primary/90",
            children: "Get Started"
          }
        )
      ] }) })
    ] })
  ] }) });
}
function SidebarItem({
  icon: Icon,
  label,
  to,
  active,
  collapsed,
  onClick,
  requiresAuth,
  isFooterLink,
  highlight,
  isMobile = false
}) {
  const { user } = useAuth();
  const showAuthMessage = requiresAuth && !user;
  if (isFooterLink) {
    return /* @__PURE__ */ jsx(
      Link,
      {
        to,
        className: "text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors",
        children: label
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsxs(
      Link,
      {
        to: showAuthMessage ? "/signin" : to,
        className: `flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${active ? "text-primary" : highlight ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
        onClick,
        children: [
          Icon && /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium leading-none", children: label })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: showAuthMessage ? "/signin" : to,
      className: `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group ${active ? "bg-primary/10 text-primary" : highlight ? "text-primary hover:bg-primary/5" : "hover:bg-primary/5 text-foreground"}`,
      onClick,
      children: [
        Icon && /* @__PURE__ */ jsx("div", { className: collapsed ? "mx-auto" : "", children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }) }),
        !collapsed && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-none", children: label }),
        collapsed && Icon && /* @__PURE__ */ jsx("div", { className: "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-md border", children: label })
      ]
    }
  );
}
function Sidebar({ onCollapse, defaultCollapsed = false }) {
  const location = useLocation$1();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const isBrowser2 = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser2 ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    if (!isBrowser2) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBrowser2]);
  useEffect(() => {
    setCollapsed(defaultCollapsed || isMobile);
    onCollapse(defaultCollapsed || isMobile);
  }, [defaultCollapsed, onCollapse, isMobile]);
  const handleCollapse = (value) => {
    setCollapsed(value);
    onCollapse(value);
  };
  const isActive = (path) => location.pathname === path;
  const mainNavItems = [
    { id: "home", label: "Home", icon: Home$1, path: "/" },
    { id: "library", label: "Library", icon: Library, path: user ? "/library" : "/signin" },
    { id: "community", label: "Community", icon: Users2, path: user ? "/community" : "/signin" },
    { id: "more", label: "More", icon: MoreHorizontal, path: "#", isMore: true }
  ];
  const moreNavItems = [
    { id: "profile", label: "Profile", icon: User, path: user ? "/profile" : "/signin" },
    { id: "goals", label: "Learning Goals", icon: Target, path: user ? "/library?tab=goals" : "/signin" },
    { id: "history", label: "History", icon: History, path: user ? "/history" : "/signin" },
    ...user && (profile == null ? void 0 : profile.role) === "creator" ? [
      { id: "dashboard", label: "Creator Dashboard", icon: CreditCard, path: `/dashboard/${profile.username}` }
    ] : user ? [] : [],
    ...user && (profile == null ? void 0 : profile.role) !== "creator" ? [
      { id: "become-creator", label: "Become a Creator", icon: Rocket, path: "/become-creator" }
    ] : [],
    { id: "bookmarks", label: "Book Clubs", icon: BookMarked, path: user ? "/community?tab=book-clubs" : "/signin" },
    { id: "discussions", label: "Discussions", icon: MessageSquare, path: user ? "/community?tab=discussions" : "/signin" },
    { id: "study-groups", label: "Study Groups", icon: Users2, path: user ? "/community?tab=study-groups" : "/signin" },
    { id: "challenges", label: "Learning Challenges", icon: Trophy, path: user ? "/community?tab=challenges" : "/signin" }
  ];
  if (isMobile) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 h-20", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-around px-2 py-2", children: mainNavItems.map((item) => {
        if (item.isMore) {
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowMobileMore(true),
              className: "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground",
              children: [
                /* @__PURE__ */ jsx(MoreHorizontal, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium leading-none", children: "More" })
              ]
            },
            item.id
          );
        }
        return /* @__PURE__ */ jsx(
          SidebarItem,
          {
            icon: item.icon,
            label: item.label,
            to: item.path,
            active: isActive(item.path),
            isMobile: true
          },
          item.id
        );
      }) }) }),
      showMobileMore && /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end",
          onClick: () => setShowMobileMore(false),
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "w-full bg-background rounded-t-xl border-t shadow-xl max-h-[70vh] overflow-y-auto",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "More Options" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setShowMobileMore(false),
                      className: "p-2 hover:bg-accent rounded-full transition-colors",
                      children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "p-4 space-y-2", children: moreNavItems.map((item) => /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: item.path,
                    className: "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent",
                    onClick: () => setShowMobileMore(false),
                    children: [
                      /* @__PURE__ */ jsx(item.icon, { className: "w-5 h-5 text-muted-foreground" }),
                      /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.label })
                    ]
                  },
                  item.id
                )) })
              ]
            }
          )
        }
      )
    ] });
  }
  const exploreItems = [
    { id: "articles", label: "Articles", icon: Newspaper, path: "/explore/articles" },
    { id: "ebooks", label: "E-Books", icon: BookOpen, path: "/explore/ebooks" },
    { id: "audiobooks", label: "Audiobooks", icon: Headphones, path: "/explore/audiobooks" },
    { id: "podcasts", label: "Podcasts", icon: Mic, path: "/explore/podcasts" },
    { id: "summaries", label: "Book Summaries", icon: BookMarked, path: "/explore/summaries" },
    { id: "trending", label: "Trending", icon: Sparkles, path: "/explore/trending" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `${collapsed ? "w-16" : "w-64"} fixed left-0 top-[3.5rem] h-[calc(100vh-3.5rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col transition-all duration-300 z-40`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar", children: /* @__PURE__ */ jsxs("nav", { className: "p-3 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: Home$1,
                  label: "Home",
                  to: "/",
                  active: isActive("/"),
                  collapsed
                }
              ),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: Target,
                  label: "Learning Goals",
                  to: user ? "/library?openLearningGoals=true" : "/signin",
                  active: false,
                  collapsed
                }
              ),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: Library,
                  label: "My Library",
                  to: user ? "/library" : "/signin",
                  active: isActive("/library"),
                  collapsed
                }
              ),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: User,
                  label: "Profile",
                  to: user ? "/profile" : "/signin",
                  active: isActive("/profile"),
                  collapsed
                }
              ),
              user && ((profile == null ? void 0 : profile.role) === "creator" ? /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: CreditCard,
                  label: "Creator Dashboard",
                  to: `/dashboard/${profile.username}`,
                  active: location.pathname.startsWith("/dashboard"),
                  collapsed
                }
              ) : /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: Rocket,
                  label: "Become a Creator",
                  to: "/become-creator",
                  collapsed,
                  highlight: true
                }
              )),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: History,
                  label: "History",
                  to: user ? "/history" : "/signin",
                  active: isActive("/history"),
                  collapsed
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              !collapsed && /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3", children: "Community" }),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: BookMarked,
                  label: "Book Clubs",
                  to: user ? "/community?tab=book-clubs" : "/signin",
                  active: isActive("/community") && searchParams.get("tab") === "book-clubs",
                  collapsed
                }
              ),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: MessageSquare,
                  label: "Discussions",
                  to: user ? "/community?tab=discussions" : "/signin",
                  active: isActive("/community") && (searchParams.get("tab") === "discussions" || !searchParams.get("tab")),
                  collapsed
                }
              ),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: Users2,
                  label: "Study Groups",
                  to: user ? "/community?tab=study-groups" : "/signin",
                  active: isActive("/community") && searchParams.get("tab") === "study-groups",
                  collapsed
                }
              ),
              /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: Trophy,
                  label: "Learning Challenges",
                  to: user ? "/community?tab=challenges" : "/signin",
                  active: isActive("/community") && searchParams.get("tab") === "challenges",
                  collapsed
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              !collapsed && /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3", children: "Explore" }),
              exploreItems.map((item) => /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: item.icon,
                  label: item.label,
                  to: item.path,
                  active: isActive(item.path),
                  collapsed
                },
                item.id
              ))
            ] })
          ] }) }),
          !collapsed && /* @__PURE__ */ jsxs("div", { className: "p-4 text-xs space-x-2", children: [
            /* @__PURE__ */ jsx(SidebarItem, { label: "About", to: "/about", isFooterLink: true }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/50", children: "•" }),
            /* @__PURE__ */ jsx(SidebarItem, { label: "Contact", to: "/contact", isFooterLink: true }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/50", children: "•" }),
            /* @__PURE__ */ jsx(SidebarItem, { label: "Terms", to: "/terms", isFooterLink: true }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/50", children: "•" }),
            /* @__PURE__ */ jsx(SidebarItem, { label: "Privacy", to: "/privacy", isFooterLink: true })
          ] })
        ]
      }
    ),
    !isMobile && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handleCollapse(!collapsed),
        className: "fixed z-50 h-12 flex items-center justify-center bg-background hover:bg-primary/5 border rounded-r-full transition-all duration-300",
        style: {
          left: collapsed ? "64px" : "256px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "24px"
        },
        children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
      }
    )
  ] });
}
function EmailVerificationBanner() {
  const { user, resendVerificationEmail } = useAuth();
  const [loading, setLoading] = React__default.useState(false);
  const [error, setError] = React__default.useState(null);
  const [success, setSuccess] = React__default.useState(false);
  if (!user || user.email_confirmed_at) return null;
  const handleResend = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      await resendVerificationEmail();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "bg-primary/10 border-l-4 border-primary p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
    /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-primary mt-0.5" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-primary", children: "Please verify your email address" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Check your inbox for a verification link.",
        !success && !loading && /* @__PURE__ */ jsxs(Fragment, { children: [
          " ",
          "Didn't receive the email?",
          " ",
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleResend,
              className: "text-primary hover:underline",
              disabled: loading,
              children: "Resend verification email"
            }
          )
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }),
      success && /* @__PURE__ */ jsx("p", { className: "text-sm text-primary", children: "Verification email sent! Please check your inbox." })
    ] })
  ] }) });
}
function ProtectedRoute({
  children,
  roles,
  requireEmailVerification = true
}) {
  const { user, profile, loading } = useAuth();
  const location = useLocation$1();
  if (loading) {
    return null;
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/signin", state: { from: location }, replace: true });
  }
  if (requireEmailVerification && !user.email_confirmed_at) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/verify-email", state: { from: location }, replace: true });
  }
  if (roles && (!profile || !roles.includes(profile.role))) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function CategoriesScroll({
  categories: categories2,
  selectedCategory,
  onSelectCategory,
  collapsed
}) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const isBrowser2 = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser2 ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    if (!isBrowser2) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBrowser2]);
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    const newScrollLeft = direction === "left" ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount;
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth"
    });
  };
  const handleScroll = () => {
    if (!scrollRef.current) return;
    setShowLeftArrow(scrollRef.current.scrollLeft > 0);
    setShowRightArrow(
      scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth
    );
  };
  useEffect(() => {
    handleScroll();
  }, [categories2, isMobile]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed top-14 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-40 transition-all duration-300",
      style: {
        left: isMobile ? "0" : collapsed ? "64px" : "256px"
      },
      children: /* @__PURE__ */ jsxs("div", { className: "relative flex items-center h-full", children: [
        showLeftArrow && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => scroll("left"),
            className: "absolute left-0 z-10 h-full px-2 flex items-center justify-center bg-gradient-to-r from-background via-background to-transparent",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: scrollRef,
            onScroll: handleScroll,
            className: "flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 w-full",
            children: categories2.map((category) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  console.log("Selected category:", category.slug, "Name:", category.name);
                  onSelectCategory(category.slug);
                },
                className: `whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.slug ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`,
                children: category.name
              },
              category.id
            ))
          }
        ),
        showRightArrow && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => scroll("right"),
            className: "absolute right-0 z-10 h-full px-2 flex items-center justify-center bg-gradient-to-l from-background via-background to-transparent",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
          }
        )
      ] })
    }
  );
}
function createCache({ storage: storage2, prefix, defaultTTL }) {
  function getFullKey(key) {
    return `${prefix}${key}`;
  }
  return {
    async get(key) {
      try {
        const fullKey = getFullKey(key);
        const item = storage2.getItem(fullKey);
        if (!item) return null;
        const { value, expiresAt } = JSON.parse(item);
        if (Date.now() > expiresAt) {
          storage2.removeItem(fullKey);
          return null;
        }
        return value;
      } catch (error) {
        console.error("Cache get error:", error);
        return null;
      }
    },
    async set(key, value, ttl = defaultTTL) {
      try {
        const item = {
          value,
          expiresAt: Date.now() + ttl
        };
        storage2.setItem(getFullKey(key), JSON.stringify(item));
      } catch (error) {
        console.error("Cache set error:", error);
      }
    },
    async remove(key) {
      try {
        storage2.removeItem(getFullKey(key));
      } catch (error) {
        console.error("Cache remove error:", error);
      }
    },
    async clear() {
      try {
        storage2.clear();
      } catch (error) {
        console.error("Cache clear error:", error);
      }
    }
  };
}
const memoryStore = /* @__PURE__ */ new Map();
const memoryCache = createCache({
  storage: {
    getItem: (key) => memoryStore.get(key) || null,
    setItem: (key, value) => memoryStore.set(key, value),
    removeItem: (key) => memoryStore.delete(key),
    clear: () => memoryStore.clear()
  },
  prefix: "inlits_memory_",
  defaultTTL: 5 * 60 * 1e3
  // 5 minutes
});
const isBrowser$1 = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const storage = isBrowser$1 ? window.localStorage : {
  get length() {
    return 0;
  },
  key: () => null,
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  },
  clear: () => {
  }
};
const browserCache = createCache({
  storage,
  prefix: "inlits_browser_",
  defaultTTL: 24 * 60 * 60 * 1e3
  // 24 hours
});
const queryCache = {
  async get(options) {
    const cache = options.storage === "browser" ? browserCache : memoryCache;
    return cache.get(options.key);
  },
  async set(options, data) {
    const cache = options.storage === "browser" ? browserCache : memoryCache;
    return cache.set(options.key, data, options.ttl);
  },
  async invalidate(key) {
    await Promise.all([
      memoryCache.remove(key),
      browserCache.remove(key)
    ]);
  },
  async clear() {
    await Promise.all([
      memoryCache.clear(),
      browserCache.clear()
    ]);
  }
};
function useOptimisticMutation({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
  optimisticUpdate,
  rollbackUpdate,
  invalidateQueries = []
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mutate = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (optimisticUpdate) {
        optimisticUpdate();
      }
      const result = await mutationFn(data);
      onSuccess == null ? void 0 : onSuccess(result);
      await Promise.all(
        invalidateQueries.map((queryKey) => queryCache.invalidate(queryKey))
      );
      return result;
    } catch (err) {
      if (rollbackUpdate) {
        rollbackUpdate();
      }
      const error2 = err instanceof Error ? err : new Error("An error occurred");
      setError(error2);
      onError == null ? void 0 : onError(error2);
      throw error2;
    } finally {
      setLoading(false);
      onSettled == null ? void 0 : onSettled();
    }
  };
  return {
    mutate,
    loading,
    error
  };
}
function ContentTypeIcon({ type, className }) {
  switch (type) {
    case "article":
      return /* @__PURE__ */ jsx(FileText, { className });
    case "ebook":
    case "book":
      return /* @__PURE__ */ jsx(BookOpen, { className });
    case "audiobook":
    case "podcast":
      return /* @__PURE__ */ jsx(Headphones, { className });
    case "summary":
      return /* @__PURE__ */ jsx(BookMarked, { className });
    default:
      return null;
  }
}
const isBrowser = typeof window !== "undefined";
const hasImageConstructor = isBrowser && typeof window.Image !== "undefined";
isBrowser && typeof window.requestIdleCallback === "function" ? window.requestIdleCallback.bind(window) : (cb) => {
  const start = Date.now();
  return setTimeout(() => {
    const deadline = {
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    };
    cb(deadline);
  }, 1);
};
function useLazyImage(src, lowQualityUrl) {
  const [currentSrc, setCurrentSrc] = useState(lowQualityUrl || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    if (!isBrowser || !hasImageConstructor || !src) return;
    const img = new Image();
    img.src = src;
    const handleLoad = () => {
      if (isMounted.current) {
        setCurrentSrc(src);
        setIsLoaded(true);
        setError(false);
      }
    };
    const handleError = () => {
      if (isMounted.current) {
        setError(true);
        setIsLoaded(true);
      }
    };
    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
    return () => {
      isMounted.current = false;
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src]);
  return { currentSrc, isLoaded, error };
}
function ImageLoader({
  src,
  alt,
  className,
  fallback,
  lowQualityUrl,
  loadingStrategy = "lazy",
  ...props
}) {
  const { currentSrc, isLoaded, error } = useLazyImage(src || "", lowQualityUrl);
  const [shouldLoad, setShouldLoad] = useState(loadingStrategy === "eager");
  const elementId = React__default.useId();
  useEffect(() => {
    if (loadingStrategy === "lazy") {
      const observer = new IntersectionObserver(
        ([entry2]) => {
          if (entry2.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      const element = document.getElementById(elementId);
      if (element) {
        observer.observe(element);
      }
      return () => observer.disconnect();
    }
  }, [loadingStrategy, elementId]);
  if (error && fallback) {
    return /* @__PURE__ */ jsx(Fragment, { children: fallback });
  }
  return /* @__PURE__ */ jsxs("div", { id: elementId, className: "relative", children: [
    shouldLoad && /* @__PURE__ */ jsx(
      "img",
      {
        src: currentSrc,
        alt,
        className: `${className} ${!isLoaded ? "blur-sm" : "blur-0"} transition-all duration-300`,
        loading: loadingStrategy,
        onError: (e) => {
          const img = e.target;
          if (!img.src.includes("source.unsplash.com")) {
            img.src = `https://source.unsplash.com/random/800x600?fallback&sig=${Date.now()}`;
          }
        },
        ...props
      }
    ),
    !isLoaded && shouldLoad && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/50", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-primary" }) })
  ] });
}
const ContentCard = memo(function ContentCard2({ item, activeShelf, onAddToShelf }) {
  var _a;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = React__default.useState(item.bookmarked || false);
  const { mutate: toggleBookmark } = useOptimisticMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/signin");
        return isBookmarked;
      }
      try {
        if (isBookmarked) {
          const { error } = await supabase.from("bookmarks").delete().eq("content_id", item.id).eq("content_type", item.type).eq("user_id", user.id);
          if (error) throw error;
          return false;
        } else {
          const { error } = await supabase.from("bookmarks").insert({
            content_id: item.id,
            content_type: item.type,
            user_id: user.id
          });
          if (error) throw error;
          return true;
        }
      } catch (error) {
        console.error("Bookmark operation failed:", error);
        throw error;
      }
    },
    optimisticUpdate: () => {
      setIsBookmarked(!isBookmarked);
    },
    rollbackUpdate: () => {
      setIsBookmarked(!isBookmarked);
    },
    invalidateQueries: ["bookmarks"]
  });
  const handleClick = () => {
    switch (item.type) {
      case "article":
        navigate(`/reader/article-${item.id}`);
        break;
      case "ebook":
        navigate(`/reader/book-${item.id}`);
        break;
      case "audiobook":
      case "podcast":
        navigate(`/player/${item.type}-${item.id}`);
        break;
    }
  };
  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeShelf && onAddToShelf) {
      onAddToShelf(item.id, item.type);
      return;
    }
    try {
      await toggleBookmark();
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };
  const getAspectRatio = () => {
    switch (item.type) {
      case "ebook":
        return "aspect-[2/3]";
      case "article":
      case "podcast":
      case "audiobook":
        return "aspect-video";
      default:
        return "aspect-video";
    }
  };
  const getCreatorName = () => {
    var _a2;
    return ((_a2 = item.creator) == null ? void 0 : _a2.name) || "Unknown Creator";
  };
  const getCreatorInitial = () => {
    var _a2;
    const name = getCreatorName();
    return ((_a2 = name[0]) == null ? void 0 : _a2.toUpperCase()) || "U";
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: handleClick,
      className: "group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer",
      children: [
        /* @__PURE__ */ jsxs("div", { className: `relative ${getAspectRatio()}`, children: [
          /* @__PURE__ */ jsx(
            ImageLoader,
            {
              src: item.thumbnail,
              alt: item.title,
              className: "w-full h-full object-cover",
              lowQualityUrl: `${item.thumbnail}&w=50`,
              fallback: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsx(ContentTypeIcon, { type: item.type, className: "w-8 h-8 text-muted-foreground" }) })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 px-2 py-1 rounded-full bg-background/90 text-xs font-medium flex items-center gap-1 shadow-sm", children: [
            /* @__PURE__ */ jsx(ContentTypeIcon, { type: item.type, className: "w-3 h-3" }),
            /* @__PURE__ */ jsx("span", { className: "capitalize", children: item.type })
          ] }),
          (item.type === "audiobook" || item.type === "podcast") && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-primary-foreground ml-1" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1.5", children: [
          /* @__PURE__ */ jsx("h3", { className: `font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors content-card-title ${getTextLanguageClass(item.title)}`, children: item.title }),
          item.creator && /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/creator/${item.creator.username || item.creator.id}`,
              className: "flex items-center gap-2 hover:text-primary transition-colors",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-full overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsx(
                  ImageLoader,
                  {
                    src: item.creator.avatar,
                    alt: getCreatorName(),
                    className: "w-full h-full object-cover",
                    lowQualityUrl: `${item.creator.avatar}&w=20`,
                    fallback: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-primary text-xs font-medium", children: getCreatorInitial() }) })
                  }
                ) }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground hover:text-primary transition-colors", children: getCreatorName() })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: item.duration }),
            /* @__PURE__ */ jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-yellow-500 text-yellow-500" }),
              /* @__PURE__ */ jsx("span", { children: ((_a = item.rating) == null ? void 0 : _a.toFixed(1)) || "4.5" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBookmarkClick,
            className: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground",
            children: /* @__PURE__ */ jsx(Bookmark, { className: `w-4 h-4 ${isBookmarked || activeShelf && item.bookmarked ? "fill-current" : ""}` })
          }
        )
      ]
    }
  );
});
function ContentLayout({
  audiobooks,
  ebooks,
  articles,
  podcasts,
  activeShelf,
  onAddToShelf
}) {
  const featuredBooks = [...audiobooks, ...ebooks].filter((item) => item.featured).sort((a, b) => {
    if (a.views !== b.views) return b.views - a.views;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const remainingBooks = [...audiobooks, ...ebooks].filter((item) => !item.featured).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const combinedBooks = [...featuredBooks, ...remainingBooks];
  const [visibleSections, setVisibleSections] = useState(2);
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry2] = entries;
      if (entry2.isIntersecting) {
        setVisibleSections((prev) => prev + 1);
      }
    }, {
      rootMargin: "100px"
      // Reduced margin for more controlled loading
    });
    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleSections]);
  const BookSection = useCallback(({
    books,
    title,
    startIndex
  }) => {
    const rowRef = useRef(null);
    const scroll = (direction) => {
      if (!rowRef.current) return;
      const scrollAmount = 300;
      const container = rowRef.current;
      const scrollPosition = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth"
      });
    };
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: title }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scroll("left"),
              className: "p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scroll("right"),
              className: "p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: rowRef,
          className: "flex overflow-x-auto gap-4 pb-2 scrollbar-hide",
          children: books.slice(startIndex, startIndex + 7).map((item) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-[180px]", children: /* @__PURE__ */ jsx(
            ContentCard,
            {
              item,
              activeShelf,
              onAddToShelf
            }
          ) }, item.id))
        }
      )
    ] });
  }, [activeShelf, onAddToShelf]);
  const ArticlesSection = useCallback(() => {
    const rowRef = useRef(null);
    const scroll = (direction) => {
      if (!rowRef.current) return;
      const scrollAmount = 300;
      const container = rowRef.current;
      const scrollPosition = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth"
      });
    };
    const featuredArticles = articles.filter((item) => item.featured).sort((a, b) => b.views - a.views);
    const remainingArticles = articles.filter((item) => !item.featured).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const combinedArticles = [...featuredArticles, ...remainingArticles];
    if (combinedArticles.length === 0) return null;
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Latest Articles" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scroll("left"),
              className: "p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scroll("right"),
              className: "p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: rowRef,
          className: "flex overflow-x-auto gap-4 pb-2 scrollbar-hide",
          children: combinedArticles.slice(0, 10).map((item) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-[280px]", children: /* @__PURE__ */ jsx(
            ContentCard,
            {
              item,
              activeShelf,
              onAddToShelf
            }
          ) }, item.id))
        }
      )
    ] });
  }, [articles, activeShelf, onAddToShelf]);
  const PodcastsSection = useCallback(() => {
    const rowRef = useRef(null);
    const scroll = (direction) => {
      if (!rowRef.current) return;
      const scrollAmount = 300;
      const container = rowRef.current;
      const scrollPosition = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth"
      });
    };
    const featuredPodcasts = podcasts.filter((item) => item.featured).sort((a, b) => b.views - a.views);
    const remainingPodcasts = podcasts.filter((item) => !item.featured).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const combinedPodcasts = [...featuredPodcasts, ...remainingPodcasts];
    if (combinedPodcasts.length === 0) return null;
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Featured Podcasts" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scroll("left"),
              className: "p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scroll("right"),
              className: "p-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: rowRef,
          className: "flex overflow-x-auto gap-4 pb-2 scrollbar-hide",
          children: combinedPodcasts.slice(0, 10).map((item) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-[280px]", children: /* @__PURE__ */ jsx(
            ContentCard,
            {
              item,
              activeShelf,
              onAddToShelf
            }
          ) }, item.id))
        }
      )
    ] });
  }, [podcasts, activeShelf, onAddToShelf]);
  const booksPerSection = 7;
  const totalSections = Math.ceil(combinedBooks.length / booksPerSection);
  console.log(`Total books: ${combinedBooks.length}, Total sections: ${totalSections}`);
  const minSections = Math.min(totalSections, 3);
  const actualVisibleSections = Math.max(visibleSections, minSections);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    featuredBooks.length > 0 && /* @__PURE__ */ jsx(
      BookSection,
      {
        books: featuredBooks,
        title: "Featured Books",
        startIndex: 0
      }
    ),
    /* @__PURE__ */ jsx(ArticlesSection, {}),
    /* @__PURE__ */ jsx(PodcastsSection, {}),
    remainingBooks.length > 0 && /* @__PURE__ */ jsx(
      BookSection,
      {
        books: remainingBooks,
        title: "More Books to Explore",
        startIndex: 0
      }
    ),
    Array.from({ length: Math.min(actualVisibleSections - 1, totalSections - 1) }).map((_, i) => {
      const startIndex = (i + 1) * booksPerSection;
      if (startIndex < remainingBooks.length) {
        return /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex overflow-x-auto gap-4 pb-2 scrollbar-hide",
            children: remainingBooks.slice(startIndex, startIndex + booksPerSection).map((item) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-[180px]", children: /* @__PURE__ */ jsx(
              ContentCard,
              {
                item,
                activeShelf,
                onAddToShelf
              }
            ) }, item.id))
          }
        ) }, `section-${i + 1}`);
      }
      return null;
    }),
    actualVisibleSections < totalSections && /* @__PURE__ */ jsx(
      "div",
      {
        ref: loadMoreTriggerRef,
        className: "h-20 flex items-center justify-center",
        children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary/50" }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary/50" }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary/50" })
        ] })
      }
    )
  ] });
}
function AddToShelfBanner({ shelfName, onClose }) {
  return /* @__PURE__ */ jsx("div", { className: "bg-primary/10 border-l-4 border-primary p-4 mb-6 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-primary mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-primary", children: [
          'Adding content to "',
          shelfName,
          '"'
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Click the bookmark icon on any content card to add it to this shelf" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "p-1 hover:bg-primary/10 rounded-full transition-colors",
        children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-primary" })
      }
    )
  ] }) });
}
const contentCache = /* @__PURE__ */ new Map();
const CACHE_DURATION = 10 * 60 * 1e3;
function Home({ selectedCategory = "all" }) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [allContent, setAllContent] = useState({
    audiobooks: [],
    ebooks: [],
    articles: [],
    podcasts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const shelfParam = searchParams.get("shelf");
  const [activeShelf, setActiveShelf] = useState(shelfParam);
  const [shelfName, setShelfName] = useState("");
  useEffect(() => {
    if (!shelfParam) {
      setActiveShelf(null);
      return;
    }
    setActiveShelf(shelfParam);
    if (shelfParam === "savedForLater") {
      setShelfName("Saved for Later");
    } else if (shelfParam === "learningGoals") {
      setShelfName("2025 Learning Goals");
    } else {
      const fetchShelfName = async () => {
        try {
          const { data, error: error2 } = await supabase.from("custom_shelves").select("name").eq("id", shelfParam).single();
          if (error2) throw error2;
          if (data) {
            setShelfName(data.name);
          }
        } catch (err) {
          console.error("Error fetching shelf name:", err);
          setShelfName("Custom Shelf");
        }
      };
      fetchShelfName();
    }
  }, [shelfParam]);
  useEffect(() => {
    const loadAllContent = async () => {
      var _a, _b, _c, _d;
      const cacheKey = "all-content";
      const cached = contentCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("Using cached content");
        setAllContent(cached.data);
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("Loading fresh content from database...");
        const [audiobooksResult, booksResult, articlesResult, podcastsResult] = await Promise.all([
          supabase.from("audiobooks").select(`
              id,
              title,
              description,
              cover_url,
              created_at,
              featured,
              category,
              categories,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
          supabase.from("books").select(`
              id,
              title,
              description,
              cover_url,
              created_at,
              featured,
              category,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
          supabase.from("articles").select(`
              id,
              title,
              excerpt,
              content,
              cover_url,
              created_at,
              featured,
              category,
              author:profiles!articles_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
          supabase.from("podcast_episodes").select(`
              id,
              title,
              description,
              cover_url,
              duration,
              created_at,
              featured,
              category,
              categories,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false })
        ]);
        if (audiobooksResult.error) {
          console.error("Audiobooks error:", audiobooksResult.error);
          throw new Error(`Failed to load audiobooks: ${audiobooksResult.error.message}`);
        }
        if (booksResult.error) {
          console.error("Books error:", booksResult.error);
          throw new Error(`Failed to load books: ${booksResult.error.message}`);
        }
        if (articlesResult.error) {
          console.error("Articles error:", articlesResult.error);
          throw new Error(`Failed to load articles: ${articlesResult.error.message}`);
        }
        if (podcastsResult.error) {
          console.error("Podcasts error:", podcastsResult.error);
          throw new Error(`Failed to load podcasts: ${podcastsResult.error.message}`);
        }
        console.log("Raw data loaded:", {
          audiobooks: ((_a = audiobooksResult.data) == null ? void 0 : _a.length) || 0,
          books: ((_b = booksResult.data) == null ? void 0 : _b.length) || 0,
          articles: ((_c = articlesResult.data) == null ? void 0 : _c.length) || 0,
          podcasts: ((_d = podcastsResult.data) == null ? void 0 : _d.length) || 0
        });
        const calculateReadTime = (content) => {
          const wordsPerMinute = 200;
          const words = content.trim().split(/\s+/).length;
          const minutes = Math.ceil(words / wordsPerMinute);
          return `${minutes} min read`;
        };
        let userBookmarks = [];
        if (user) {
          const { data: bookmarksData } = await supabase.from("bookmarks").select("content_id, content_type").eq("user_id", user.id);
          userBookmarks = bookmarksData || [];
        }
        const getViewCount = async (contentId, contentType) => {
          const { count } = await supabase.from("content_views").select("*", { count: "exact", head: true }).eq("content_id", contentId).eq("content_type", contentType);
          return count || 0;
        };
        const getLikeCount = async (contentId, contentType) => {
          const { data } = await supabase.from("ratings").select("rating").eq("content_id", contentId).eq("content_type", contentType).eq("rating", 5);
          return (data == null ? void 0 : data.length) || 0;
        };
        const isBookmarked = (id, type) => {
          return userBookmarks.some((b) => b.content_id === id && b.content_type === type);
        };
        const normalizeAuthor = (author, fallbackId) => {
          const data = Array.isArray(author) ? author[0] : author;
          return {
            id: typeof (data == null ? void 0 : data.id) === "string" ? data.id : fallbackId,
            name: typeof (data == null ? void 0 : data.name) === "string" ? data.name : (data == null ? void 0 : data.username) ?? "Unknown Creator",
            avatar: typeof (data == null ? void 0 : data.avatar_url) === "string" ? data.avatar_url : `https://source.unsplash.com/random/100x100?face&sig=${fallbackId}`,
            username: typeof (data == null ? void 0 : data.username) === "string" ? data.username : "creator"
          };
        };
        const resolveCategories = (item) => {
          if (item && typeof item === "object" && "categories" in item) {
            const candidate = item.categories;
            if (Array.isArray(candidate)) {
              return candidate.filter((value) => typeof value === "string");
            }
          }
          if (item && typeof item === "object" && "category" in item) {
            const value = item.category;
            if (typeof value === "string" && value.length > 0) {
              return [value];
            }
          }
          return [];
        };
        const audiobooks = await Promise.all((audiobooksResult.data || []).map(async (item) => ({
          id: item.id,
          type: "audiobook",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x1200?audiobook&sig=${item.id}`,
          duration: "2 hours",
          views: await getViewCount(item.id, "audiobook"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || "Audiobook",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "audiobook"),
          likes_count: await getLikeCount(item.id, "audiobook")
        })));
        const books = await Promise.all((booksResult.data || []).map(async (item) => ({
          id: item.id,
          type: "ebook",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x1200?book&sig=${item.id}`,
          duration: "4 hours",
          views: await getViewCount(item.id, "book"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || "Book",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "book"),
          likes_count: await getLikeCount(item.id, "book")
        })));
        const articles = await Promise.all((articlesResult.data || []).map(async (item) => ({
          id: item.id,
          type: "article",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x600?article&sig=${item.id}`,
          duration: calculateReadTime(item.content),
          views: await getViewCount(item.id, "article"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || "Article",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "article"),
          likes_count: await getLikeCount(item.id, "article")
        })));
        const podcasts = await Promise.all((podcastsResult.data || []).map(async (item) => ({
          id: item.id,
          type: "podcast",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x600?podcast&sig=${item.id}`,
          duration: item.duration,
          views: await getViewCount(item.id, "podcast"),
          createdAt: item.created_at,
          creator: {
            ...normalizeAuthor(item.author, item.id),
            followers: 0
          },
          category: item.category || "Podcast",
          categories: resolveCategories(item),
          featured: item.featured,
          rating: 4.5,
          bookmarked: isBookmarked(item.id, "podcast"),
          likes_count: await getLikeCount(item.id, "podcast")
        })));
        const contentData = {
          audiobooks,
          ebooks: books,
          articles,
          podcasts
        };
        contentCache.set(cacheKey, {
          data: contentData,
          timestamp: Date.now()
        });
        setAllContent(contentData);
        console.log("Content loaded and cached:", {
          audiobooks: audiobooks.length,
          books: books.length,
          articles: articles.length,
          podcasts: podcasts.length
        });
      } catch (err) {
        console.error("Error loading content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };
    if (!initialLoadComplete) {
      loadAllContent();
    }
  }, [user, initialLoadComplete]);
  const filteredContent = useMemo(() => {
    if (selectedCategory === "all") {
      return allContent;
    }
    const getCategoryNameFromSlug = (slug) => {
      const categoryMap = {
        "business": "Business",
        "finance-investing": "Finance & Investing",
        "philosophy": "Philosophy",
        "religion": "Religion",
        "history": "History",
        "politics": "Politics",
        "literature": "Literature",
        "fiction": "Fiction",
        "romance": "Romance",
        "thriller": "Thriller",
        "mystery": "Mystery",
        "science-fiction": "Science Fiction",
        "fantasy": "Fantasy",
        "spirituality": "Spirituality",
        "self-help": "Self-Help",
        "entrepreneurship": "Entrepreneurship",
        "leadership": "Leadership",
        "biographies": "Biographies",
        "arts": "Arts",
        "music": "Music",
        "cinema-media": "Cinema & Media",
        "productivity": "Productivity",
        "career-growth": "Career Growth",
        "travel": "Travel",
        "mathematics": "Mathematics",
        "science": "Science",
        "technology": "Technology",
        "health": "Health",
        "psychology": "Psychology"
      };
      return categoryMap[slug] || slug;
    };
    const targetCategoryName = getCategoryNameFromSlug(selectedCategory);
    console.log("Filtering for category:", selectedCategory, "-> target name:", targetCategoryName);
    const filterByCategory = (items) => {
      return items.filter((item) => {
        console.log(`Checking item "${item.title}":`, {
          category: item.category,
          categories: item.categories,
          targetCategory: targetCategoryName
        });
        if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
          const hasExactMatch = item.categories.some((cat) => {
            if (!cat) return false;
            if (cat.toLowerCase() === targetCategoryName.toLowerCase()) {
              console.log(`✓ Exact match found in categories array: "${cat}" matches "${targetCategoryName}"`);
              return true;
            }
            if (targetCategoryName === "Science Fiction") {
              return cat === "Science Fiction";
            }
            if (targetCategoryName === "Fiction") {
              return cat === "Fiction";
            }
            if (targetCategoryName === "Science") {
              return cat === "Science";
            }
            return false;
          });
          if (hasExactMatch) {
            console.log(`✓ Item "${item.title}" matches category "${targetCategoryName}"`);
            return true;
          }
        }
        if (item.category) {
          if (item.category.toLowerCase() === targetCategoryName.toLowerCase()) {
            console.log(`✓ Exact match found in category field: "${item.category}" matches "${targetCategoryName}"`);
            return true;
          }
          if (targetCategoryName === "Science Fiction") {
            return item.category === "Science Fiction";
          }
          if (targetCategoryName === "Fiction") {
            return item.category === "Fiction";
          }
          if (targetCategoryName === "Science") {
            return item.category === "Science";
          }
        }
        console.log(`✗ Item "${item.title}" does not match category "${targetCategoryName}"`);
        return false;
      });
    };
    return {
      audiobooks: filterByCategory(allContent.audiobooks),
      ebooks: filterByCategory(allContent.ebooks),
      articles: filterByCategory(allContent.articles),
      podcasts: filterByCategory(allContent.podcasts)
    };
  }, [allContent, selectedCategory]);
  const hasContent = useMemo(() => {
    const { audiobooks, ebooks, articles, podcasts } = filteredContent;
    return audiobooks.length > 0 || ebooks.length > 0 || articles.length > 0 || podcasts.length > 0;
  }, [filteredContent]);
  const handleAddToShelf = async (contentId, contentType) => {
    if (!user || !activeShelf) return;
    try {
      if (activeShelf === "savedForLater" || activeShelf === "learningGoals") {
        const { error: error2 } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType
        });
        if (error2) throw error2;
      } else {
        const { error: error2 } = await supabase.from("shelf_items").insert({
          shelf_id: activeShelf,
          content_id: contentId,
          content_type: contentType
        });
        if (error2) throw error2;
      }
      setAllContent((prev) => ({
        audiobooks: prev.audiobooks.map(
          (item) => item.id === contentId && item.type === contentType ? { ...item, bookmarked: true } : item
        ),
        ebooks: prev.ebooks.map(
          (item) => item.id === contentId && item.type === contentType ? { ...item, bookmarked: true } : item
        ),
        articles: prev.articles.map(
          (item) => item.id === contentId && item.type === contentType ? { ...item, bookmarked: true } : item
        ),
        podcasts: prev.podcasts.map(
          (item) => item.id === contentId && item.type === contentType ? { ...item, bookmarked: true } : item
        )
      }));
    } catch (error2) {
      console.error("Error adding to shelf:", error2);
    }
  };
  if (loading && !initialLoadComplete) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading content..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center text-center", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: error })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            contentCache.clear();
            setInitialLoadComplete(false);
            setError(null);
          },
          className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: "Try again"
        }
      )
    ] }) });
  }
  if (initialLoadComplete && !hasContent && selectedCategory !== "all") {
    return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center text-center", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-semibold", children: [
          "No content in ",
          selectedCategory
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "We don't have any content in this category yet, but we're working on it! Check back soon for new additions." })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            window.history.pushState({}, "", "/");
            window.location.reload();
          },
          className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          children: "Browse All Content"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    activeShelf && /* @__PURE__ */ jsx(
      AddToShelfBanner,
      {
        shelfName,
        onClose: () => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete("shelf");
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${newSearchParams.toString()}`
          );
          setActiveShelf(null);
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
      ContentLayout,
      {
        audiobooks: filteredContent.audiobooks,
        ebooks: filteredContent.ebooks,
        articles: filteredContent.articles,
        podcasts: filteredContent.podcasts,
        activeShelf,
        onAddToShelf: handleAddToShelf
      }
    ) })
  ] });
}
function AudioPlayer({
  title,
  author,
  thumbnail,
  type,
  isMobile = false
}) {
  var _a;
  const { user } = useAuth();
  const {
    setPlayerVisible,
    isMainPlayerPage,
    currentAudio,
    currentChapter,
    setCurrentChapter
  } = useAudio();
  const audioRef = React__default.useRef(null);
  const progressRef = React__default.useRef(null);
  const [isPlaying, setIsPlaying] = React__default.useState(false);
  const [isLoading, setIsLoading] = React__default.useState(false);
  const [currentTime, setCurrentTime] = React__default.useState(0);
  const [duration, setDuration] = React__default.useState(0);
  const [volume, setVolume] = React__default.useState(1);
  const [isMuted, setIsMuted] = React__default.useState(false);
  const [playbackRate, setPlaybackRate] = React__default.useState(1);
  const [showPlaylist, setShowPlaylist] = React__default.useState(false);
  const [showSettings, setShowSettings] = React__default.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React__default.useState(false);
  const [error, setError] = React__default.useState(null);
  const [settings, setSettings] = React__default.useState({
    playbackSpeed: 1,
    autoplay: true,
    skipSilence: false,
    sleepTimer: 0,
    repeat: "all",
    shuffle: false
  });
  const [listeningMode, setListeningMode] = React__default.useState("normal");
  const [showModeSelector, setShowModeSelector] = React__default.useState(false);
  React__default.useState(false);
  React__default.useState(false);
  const [showTimeRemaining, setShowTimeRemaining] = React__default.useState(false);
  const [isDragging, setIsDragging] = React__default.useState(false);
  const [hoverTime, setHoverTime] = React__default.useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = React__default.useState(0);
  React__default.useEffect(() => {
    if (!currentAudio) return;
    try {
      const source = currentAudio.chapters && currentAudio.chapters.length > 0 && currentAudio.chapters[currentChapter] ? currentAudio.chapters[currentChapter].audio_url : currentAudio.audioUrl;
      if (audioRef.current && source) {
        audioRef.current.src = source;
        audioRef.current.load();
        const handleCanPlayThrough = () => {
          if (audioRef.current) {
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              setError(null);
            }).catch((err) => {
              console.error("Error auto-playing:", err);
              setIsPlaying(false);
            });
          }
        };
        audioRef.current.addEventListener("canplaythrough", handleCanPlayThrough, { once: true });
        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener("canplaythrough", handleCanPlayThrough);
          }
        };
      }
    } catch (err) {
      console.error("Error setting audio source:", err);
      setError("Failed to load audio source");
    }
  }, [currentAudio, currentChapter]);
  React__default.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = settings.playbackSpeed;
    audio.volume = isMuted ? 0 : volume;
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      if ((currentAudio == null ? void 0 : currentAudio.chapters) && currentChapter < currentAudio.chapters.length - 1) {
        if (settings.autoplay || settings.repeat === "all") {
          setCurrentChapter(currentChapter + 1);
        } else {
          setIsPlaying(false);
        }
      } else if (settings.repeat === "all" && (currentAudio == null ? void 0 : currentAudio.chapters)) {
        setCurrentChapter(0);
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = (e) => {
      const audioError = e.target.error;
      setError((audioError == null ? void 0 : audioError.message) || "Error playing audio");
      setIsLoading(false);
      setIsPlaying(false);
    };
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentAudio, currentChapter, settings, setCurrentChapter]);
  React__default.useEffect(() => {
    if (settings.sleepTimer > 0 && isPlaying) {
      setSleepTimerRemaining(settings.sleepTimer * 60);
      const interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            setSettings((prev2) => ({ ...prev2, sleepTimer: 0 }));
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(interval);
    }
  }, [settings.sleepTimer, isPlaying]);
  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error2) {
      console.error("Error toggling play:", error2);
      setError("Failed to play audio");
      setIsPlaying(false);
    }
  };
  const handleProgressMouseDown = (e) => {
    if (!progressRef.current || !audioRef.current || isLoading) return;
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    const handleGlobalMouseMove = (e2) => {
      if (!progressRef.current || !audioRef.current) return;
      const rect2 = progressRef.current.getBoundingClientRect();
      const percent2 = Math.max(0, Math.min(1, (e2.clientX - rect2.left) / rect2.width));
      const newTime2 = percent2 * duration;
      audioRef.current.currentTime = newTime2;
      setCurrentTime(newTime2);
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };
  const handleProgressMouseMove = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    setHoverTime(time);
  };
  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };
  const handlePlaybackRateChange = (rate) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setSettings((prev) => ({ ...prev, playbackSpeed: rate }));
    }
  };
  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(currentTime + seconds, duration));
    }
  };
  const nextChapter = () => {
    if ((currentAudio == null ? void 0 : currentAudio.chapters) && currentChapter < currentAudio.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };
  const previousChapter = () => {
    if ((currentAudio == null ? void 0 : currentAudio.chapters) && currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time % 3600 / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  const formatSleepTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const handleModeChange = (mode2) => {
    setListeningMode(mode2);
    closeAllExcept(null);
    switch (mode2) {
      case "driving":
        setSettings((prev) => ({
          ...prev,
          skipSilence: true,
          playbackSpeed: 1,
          autoplay: true
        }));
        break;
      case "walking":
        setSettings((prev) => ({
          ...prev,
          skipSilence: false,
          playbackSpeed: 1.2,
          autoplay: true
        }));
        break;
      case "sleep":
        setSettings((prev) => ({
          ...prev,
          autoplay: false,
          playbackSpeed: 0.9,
          sleepTimer: 30
        }));
        break;
      case "workout":
        setSettings((prev) => ({
          ...prev,
          autoplay: true,
          playbackSpeed: 1.5,
          skipSilence: true
        }));
        break;
      default:
        setSettings((prev) => ({
          ...prev,
          autoplay: true,
          playbackSpeed: 1,
          skipSilence: false,
          sleepTimer: 0
        }));
    }
  };
  const getModeIcon = (mode2) => {
    switch (mode2) {
      case "driving":
        return /* @__PURE__ */ jsx(Car, { className: "w-4 h-4" });
      case "walking":
        return /* @__PURE__ */ jsx(Timer, { className: "w-4 h-4" });
      case "sleep":
        return /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4" });
      case "workout":
        return /* @__PURE__ */ jsx(Dumbbell, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" });
    }
  };
  const closeAllExcept = (keep) => {
    if (keep !== "settings") setShowSettings(false);
    if (keep !== "playlist") setShowPlaylist(false);
    if (keep !== "mode") setShowModeSelector(false);
    if (keep !== "volume") setShowVolumeSlider(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: `fixed left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-40 ${isMobile ? "bottom-20" : "bottom-0 h-20"}`, children: [
    /* @__PURE__ */ jsx(
      "audio",
      {
        ref: audioRef,
        preload: "auto",
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: progressRef,
        onMouseDown: handleProgressMouseDown,
        onMouseMove: handleProgressMouseMove,
        onMouseLeave: handleProgressMouseLeave,
        className: "relative h-2 bg-muted cursor-pointer group hover:h-3 transition-all duration-200",
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-muted rounded-full" }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-75 shadow-sm",
              style: { width: `${currentTime / duration * 100}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-200 ${isDragging || hoverTime !== null ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"}`,
              style: { left: `${currentTime / duration * 100}%`, transform: "translateX(-50%) translateY(-50%)" }
            }
          ),
          hoverTime !== null && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap transform -translate-x-1/2",
              style: { left: `${hoverTime / duration * 100}%` },
              children: formatTime(hoverTime)
            }
          )
        ]
      }
    ),
    isMobile ? /* @__PURE__ */ jsxs("div", { className: "px-2 py-1 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: (currentAudio == null ? void 0 : currentAudio.contentUrl) || "/",
          className: "flex items-center gap-1 hover:text-primary transition-colors",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded overflow-hidden bg-muted flex-shrink-0", children: /* @__PURE__ */ jsx(
              ImageLoader,
              {
                src: thumbnail,
                alt: title,
                className: "w-full h-full object-cover",
                lowQualityUrl: `${thumbnail}?w=50`,
                fallback: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Play, { className: "w-2 h-2 text-primary" }) })
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("h3", { className: "font-medium text-xs line-clamp-1", children: [
                title.slice(0, 5),
                "..."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: author })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: previousChapter,
            disabled: currentChapter === 0 || isLoading,
            className: "p-1 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all disabled:opacity-50",
            title: "Previous Chapter",
            children: /* @__PURE__ */ jsx(SkipBack, { className: "w-3 h-3" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => skipTime(-15),
            className: "p-1 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
            disabled: isLoading,
            title: "Skip back 15s",
            children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-3 h-3" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: togglePlay,
            disabled: isLoading || !(currentAudio == null ? void 0 : currentAudio.audioUrl) && !((currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 0),
            className: "w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50",
            children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Play, { className: "w-3 h-3 ml-0.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => skipTime(30),
            className: "p-1 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
            disabled: isLoading,
            title: "Skip forward 30s",
            children: /* @__PURE__ */ jsx(RotateCw, { className: "w-3 h-3" })
          }
        ),
        (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextChapter,
            disabled: currentChapter === currentAudio.chapters.length - 1 || isLoading,
            className: "p-1 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all disabled:opacity-50",
            title: "Next Chapter",
            children: /* @__PURE__ */ jsx(SkipForward, { className: "w-3 h-3" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              closeAllExcept("mode");
              setShowModeSelector(!showModeSelector);
            },
            className: `p-1 rounded-lg transition-all ${listeningMode !== "normal" ? "bg-primary/10 text-primary" : "hover:bg-primary hover:text-primary-foreground"}`,
            title: `${listeningMode.charAt(0).toUpperCase() + listeningMode.slice(1)} Mode`,
            children: getModeIcon(listeningMode)
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              closeAllExcept("settings");
              setShowSettings(!showSettings);
            },
            className: `p-1 rounded-lg transition-all ${showSettings ? "bg-primary/10 text-primary" : "hover:bg-primary hover:text-primary-foreground"}`,
            disabled: isLoading,
            title: "Player Settings",
            children: /* @__PURE__ */ jsx(Settings, { className: "w-3 h-3" })
          }
        ),
        (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              closeAllExcept("playlist");
              setShowPlaylist(!showPlaylist);
            },
            className: `p-1 rounded-lg transition-all ${showPlaylist ? "bg-primary/10 text-primary" : "hover:bg-primary hover:text-primary-foreground"}`,
            disabled: isLoading,
            title: "Chapters",
            children: /* @__PURE__ */ jsx(List, { className: "w-3 h-3" })
          }
        ),
        !isMainPlayerPage && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPlayerVisible(false),
            className: "p-1 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
            title: "Close Player",
            children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-4 h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center h-full", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 min-w-0 w-80 flex-shrink-0", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: (currentAudio == null ? void 0 : currentAudio.contentUrl) || "/",
          className: "flex items-center gap-3 hover:text-primary transition-colors min-w-0",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 shadow-md", children: /* @__PURE__ */ jsx(
              ImageLoader,
              {
                src: thumbnail,
                alt: title,
                className: "w-full h-full object-cover",
                lowQualityUrl: `${thumbnail}?w=50`,
                fallback: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-primary" }) })
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold line-clamp-1 text-sm", children: title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: author }),
              (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-primary", children: [
                "Chapter ",
                currentChapter + 1,
                " of ",
                currentAudio.chapters.length
              ] })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 flex-1", children: [
        (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: previousChapter,
            disabled: currentChapter === 0 || isLoading,
            className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current",
            title: "Previous Chapter",
            children: /* @__PURE__ */ jsx(SkipBack, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => skipTime(-15),
            className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
            disabled: isLoading,
            title: "Skip back 15s",
            children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: togglePlay,
            disabled: isLoading || !(currentAudio == null ? void 0 : currentAudio.audioUrl) && !((currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 0),
            className: "w-14 h-14 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100",
            children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 ml-0.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => skipTime(30),
            className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
            disabled: isLoading,
            title: "Skip forward 30s",
            children: /* @__PURE__ */ jsx(RotateCw, { className: "w-5 h-5" })
          }
        ),
        (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextChapter,
            disabled: currentChapter === currentAudio.chapters.length - 1 || isLoading,
            className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current",
            title: "Next Chapter",
            children: /* @__PURE__ */ jsx(SkipForward, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-shrink-0 justify-end w-80", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground font-mono", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowTimeRemaining(!showTimeRemaining),
              className: "hover:text-foreground transition-colors",
              title: "Toggle time remaining",
              children: formatTime(currentTime)
            }
          ),
          /* @__PURE__ */ jsx("span", { children: "/" }),
          /* @__PURE__ */ jsx("span", { children: showTimeRemaining ? `-${formatTime(duration - currentTime)}` : formatTime(duration) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  closeAllExcept("mode");
                  setShowModeSelector(!showModeSelector);
                },
                className: `p-2 rounded-lg transition-all ${listeningMode !== "normal" ? "bg-primary/10 text-primary" : "hover:bg-primary hover:text-primary-foreground"}`,
                title: `${listeningMode.charAt(0).toUpperCase() + listeningMode.slice(1)} Mode`,
                children: getModeIcon(listeningMode)
              }
            ),
            showModeSelector && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full right-0 mb-2 w-48 bg-popover border rounded-lg shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-3", children: "Listening Mode" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-1", children: [
                { mode: "normal", label: "Normal", icon: Headphones, desc: "Standard listening" },
                { mode: "driving", label: "Driving", icon: Car, desc: "Skip silence, clear audio" },
                { mode: "walking", label: "Walking", icon: Timer, desc: "Slightly faster pace" },
                { mode: "sleep", label: "Sleep", icon: Moon, desc: "Slower, with sleep timer" },
                { mode: "workout", label: "Workout", icon: Dumbbell, desc: "Faster pace, auto-continue" }
              ].map(({ mode: mode2, label, icon: Icon, desc }) => /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleModeChange(mode2),
                  className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${listeningMode === mode2 ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
                  children: [
                    /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                      /* @__PURE__ */ jsx("div", { className: "font-medium", children: label }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80", children: desc })
                    ] })
                  ]
                },
                mode2
              )) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  closeAllExcept("settings");
                  setShowSettings(!showSettings);
                },
                className: `p-2 rounded-lg transition-all ${showSettings ? "bg-primary/10 text-primary" : "hover:bg-primary hover:text-primary-foreground"}`,
                disabled: isLoading,
                title: "Player Settings",
                children: /* @__PURE__ */ jsx(Settings, { className: "w-4 h-4" })
              }
            ),
            showSettings && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full right-0 mb-2 w-80 bg-popover border rounded-lg shadow-xl max-h-96 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium", children: "Settings" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowSettings(false),
                    className: "p-1 hover:bg-accent rounded transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Speed" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-1", children: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handlePlaybackRateChange(speed),
                    className: `px-2 py-1 rounded text-xs font-medium transition-all ${settings.playbackSpeed === speed ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground bg-muted"}`,
                    children: [
                      speed,
                      "x"
                    ]
                  },
                  speed
                )) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Auto-play" }),
                  /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: settings.autoplay,
                        onChange: (e) => setSettings((prev) => ({ ...prev, autoplay: e.target.checked })),
                        className: "sr-only peer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically play next chapter" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Skip Silence" }),
                  /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: settings.skipSilence,
                        onChange: (e) => setSettings((prev) => ({ ...prev, skipSilence: e.target.checked })),
                        className: "sr-only peer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically skip silent parts" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Repeat" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1", children: [
                  { value: "off", label: "Off" },
                  { value: "one", label: "One" },
                  { value: "all", label: "All" }
                ].map((option) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setSettings((prev) => ({ ...prev, repeat: option.value })),
                    className: `px-2 py-1 rounded text-xs font-medium transition-all ${settings.repeat === option.value ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground bg-muted"}`,
                    children: option.label
                  },
                  option.value
                )) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Shuffle" }),
                  /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: settings.shuffle,
                        onChange: (e) => setSettings((prev) => ({ ...prev, shuffle: e.target.checked })),
                        className: "sr-only peer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Randomize chapter order" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Sleep Timer" }),
                  sleepTimerRemaining > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-mono", children: formatSleepTimer(sleepTimerRemaining) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1", children: [0, 15, 30, 60].map((minutes) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setSettings((prev) => ({ ...prev, sleepTimer: minutes })),
                    className: `px-2 py-1 rounded text-xs font-medium transition-all ${settings.sleepTimer === minutes ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground bg-muted"}`,
                    children: minutes === 0 ? "Off" : minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`
                  },
                  minutes
                )) })
              ] })
            ] }) })
          ] }),
          (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  closeAllExcept("playlist");
                  setShowPlaylist(!showPlaylist);
                },
                className: `p-2 rounded-lg transition-all ${showPlaylist ? "bg-primary/10 text-primary" : "hover:bg-primary hover:text-primary-foreground"}`,
                disabled: isLoading,
                title: "Chapters",
                children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
              }
            ),
            showPlaylist && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full right-0 mb-2 w-72 bg-popover border rounded-lg shadow-xl max-h-80 overflow-hidden", children: [
              /* @__PURE__ */ jsx("div", { className: "p-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: "Chapters" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowPlaylist(false),
                    className: "p-1 hover:bg-accent rounded transition-colors",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "overflow-y-auto max-h-64", children: /* @__PURE__ */ jsx("div", { className: "p-2 space-y-1", children: currentAudio.chapters.map((chapter, index) => {
                const isLocked = !user && index > 0;
                const isCurrent = currentChapter === index;
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      if (!isLocked) {
                        setCurrentChapter(index);
                        setShowPlaylist(false);
                      }
                    },
                    className: `w-full flex items-center justify-between p-2 rounded text-sm transition-all ${isLocked ? "bg-muted/30 cursor-not-allowed opacity-60" : isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
                    disabled: isLoading || isLocked,
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: isLocked ? /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }) : isLoading && isCurrent ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : isCurrent && isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Play, { className: "w-3 h-3" }) }),
                        /* @__PURE__ */ jsx("div", { className: "font-medium line-clamp-1 text-left", children: chapter.title })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80 ml-2 flex-shrink-0", children: chapter.duration })
                    ]
                  },
                  chapter.id
                );
              }) }) })
            ] })
          ] }),
          !isMainPlayerPage && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPlayerVisible(false),
              className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
              title: "Close Player",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] }) }),
    isMobile && showModeSelector && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-3", children: "Listening Mode" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: [
        { mode: "normal", label: "Normal", icon: Headphones },
        { mode: "driving", label: "Driving", icon: Car },
        { mode: "walking", label: "Walking", icon: Timer },
        { mode: "sleep", label: "Sleep", icon: Moon },
        { mode: "workout", label: "Workout", icon: Dumbbell }
      ].map(({ mode: mode2, label, icon: Icon }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleModeChange(mode2),
          className: `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${listeningMode === mode2 ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: label })
          ]
        },
        mode2
      )) })
    ] }) }),
    isMobile && showSettings && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl max-h-80 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-medium", children: "Settings" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowSettings(false),
            className: "p-1 hover:bg-accent rounded transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Speed" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1", children: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePlaybackRateChange(speed),
            className: `px-2 py-1 rounded text-xs font-medium transition-all ${settings.playbackSpeed === speed ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground bg-muted"}`,
            children: [
              speed,
              "x"
            ]
          },
          speed
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Sleep Timer" }),
          sleepTimerRemaining > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-mono", children: formatSleepTimer(sleepTimerRemaining) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1", children: [0, 15, 30, 60].map((minutes) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSettings((prev) => ({ ...prev, sleepTimer: minutes })),
            className: `px-2 py-1 rounded text-xs font-medium transition-all ${settings.sleepTimer === minutes ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground bg-muted"}`,
            children: minutes === 0 ? "Off" : minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`
          },
          minutes
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Auto-play" }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: settings.autoplay,
                onChange: (e) => setSettings((prev) => ({ ...prev, autoplay: e.target.checked })),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h5", { className: "text-sm font-medium", children: "Skip Silence" }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: settings.skipSilence,
                onChange: (e) => setSettings((prev) => ({ ...prev, skipSilence: e.target.checked })),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" })
          ] })
        ] }) })
      ] })
    ] }) }),
    isMobile && showPlaylist && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl max-h-80 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "p-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: "Chapters" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowPlaylist(false),
            className: "p-1 hover:bg-accent rounded transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-y-auto max-h-64", children: /* @__PURE__ */ jsx("div", { className: "p-2 space-y-1", children: (_a = currentAudio == null ? void 0 : currentAudio.chapters) == null ? void 0 : _a.map((chapter, index) => {
        const isLocked = !user && index > 0;
        const isCurrent = currentChapter === index;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              if (!isLocked) {
                setCurrentChapter(index);
                setShowPlaylist(false);
              }
            },
            className: `w-full flex items-center justify-between p-2 rounded text-sm transition-all ${isLocked ? "bg-muted/30 cursor-not-allowed opacity-60" : isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"}`,
            disabled: isLoading || isLocked,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: isLocked ? /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }) : isLoading && isCurrent ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : isCurrent && isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Play, { className: "w-3 h-3" }) }),
                /* @__PURE__ */ jsx("div", { className: "font-medium line-clamp-1 text-left", children: chapter.title })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80 ml-2 flex-shrink-0", children: chapter.duration })
            ]
          },
          chapter.id
        );
      }) }) })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mt-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded text-xs flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Zap, { className: "w-3 h-3" }),
      error
    ] }),
    sleepTimerRemaining > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded text-xs flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Moon, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Sleep: ",
          formatSleepTimer(sleepTimerRemaining)
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSettings((prev) => ({ ...prev, sleepTimer: 0 })),
          className: "text-xs hover:underline",
          children: "Cancel"
        }
      )
    ] })
  ] });
}
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxs("div", { className: "container py-8 md:py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 md:col-span-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-6 w-6 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-xl", children: "inlits" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Your platform for focused learning. Discover books, articles, podcasts, and videos in a distraction-free environment." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Company" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/about", className: "text-sm text-muted-foreground hover:text-primary", children: "About Us" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/careers", className: "text-sm text-muted-foreground hover:text-primary", children: "Careers" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/contact", className: "text-sm text-muted-foreground hover:text-primary", children: "Contact" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Support" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/help", className: "text-sm text-muted-foreground hover:text-primary", children: "Help Center" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/copyright", className: "text-sm text-muted-foreground hover:text-primary", children: "Copyright Claims" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/community", className: "text-sm text-muted-foreground hover:text-primary", children: "Community" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Legal" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/terms", className: "text-sm text-muted-foreground hover:text-primary", children: "Terms of Service" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/privacy", className: "text-sm text-muted-foreground hover:text-primary", children: "Privacy Policy" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/refund-policy", className: "text-sm text-muted-foreground hover:text-primary", children: "Refund Policy" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 pt-8 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Inlits. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("a", { href: "mailto:support@inlits.com", className: "text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "support@inlits.com" }) }),
        /* @__PURE__ */ jsx("a", { href: "mailto:advertising@inlits.com", className: "text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "advertising@inlits.com" }) })
      ] })
    ] }) })
  ] }) });
}
const GetStartedPage = React__default.lazy(() => import("./get-started-BRBA4W3W.js").then((module) => ({ default: module.GetStartedPage })));
const OnboardingQuiz = React__default.lazy(() => import("./onboarding-quiz-CYdnPZpL.js").then((module) => ({ default: module.OnboardingQuiz })));
const BecomeCreatorPage = React__default.lazy(() => import("./become-creator-D0yqA3Hx.js").then((module) => ({ default: module.BecomeCreatorPage })));
const SignInPage = React__default.lazy(() => import("./sign-in-DtVK1SLH.js").then((module) => ({ default: module.SignInPage })));
const SignUpPage = React__default.lazy(() => import("./sign-up-BJkgl-68.js").then((module) => ({ default: module.SignUpPage })));
const ForgotPasswordPage = React__default.lazy(() => import("./forgot-password-CGk4BhGj.js").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = React__default.lazy(() => import("./reset-password-BqClnT6_.js").then((module) => ({ default: module.ResetPasswordPage })));
const VerifyEmailPage = React__default.lazy(() => import("./verify-email-d3-Gu9rG.js").then((module) => ({ default: module.VerifyEmailPage })));
const AuthCallbackPage = React__default.lazy(() => import("./callback-onTOa1ey.js").then((module) => ({ default: module.AuthCallbackPage })));
const QuickBitesPage = React__default.lazy(() => import("./quick-bites-Cvm43a1W.js").then((module) => ({ default: module.QuickBitesPage })));
const FollowedPage = React__default.lazy(() => import("./followed-BZXPgtVH.js").then((module) => ({ default: module.FollowedPage })));
const LibraryPage = React__default.lazy(() => import("./library-_LHJp9cL.js").then((module) => ({ default: module.LibraryPage })));
const CommunityPage = React__default.lazy(() => import("./community-Lw6SLrOl.js").then((module) => ({ default: module.CommunityPage })));
const HistoryPage = React__default.lazy(() => import("./history-CxtR_FiG.js").then((module) => ({ default: module.HistoryPage })));
const ProfilePage = React__default.lazy(() => import("./index-C4zh8_JR.js"));
const UserProfilePage = React__default.lazy(() => import("./UserProfilePage-nV5T10Om.js").then((module) => ({ default: module.UserProfilePage })));
const SearchProfilesPage = React__default.lazy(() => import("./search-DD9m6V2P.js").then((module) => ({ default: module.SearchProfilesPage })));
const CreatorProfilePage = React__default.lazy(() => import("./CreatorProfilePage-97iZwWen.js").then((module) => ({ default: module.CreatorProfilePage })));
const DashboardLayout = React__default.lazy(() => import("./index-cYNaCFXC.js").then((module) => ({ default: module.DashboardLayout })));
const DashboardOverviewPage = React__default.lazy(() => import("./overview-DlGimdG4.js").then((module) => ({ default: module.DashboardOverviewPage })));
const ContentPage = React__default.lazy(() => import("./index-BG_WzbqR.js").then((module) => ({ default: module.ContentPage })));
const NewArticlePage = React__default.lazy(() => import("./article-BwDXK7Dw.js").then((module) => ({ default: module.NewArticlePage })));
const NewBookPage = React__default.lazy(() => import("./book-D9HSDCRC.js").then((module) => ({ default: module.NewBookPage })));
const NewAudiobookPage = React__default.lazy(() => import("./audiobook-DaVbrADh.js").then((module) => ({ default: module.NewAudiobookPage })));
const NewPodcastPage = React__default.lazy(() => import("./podcast-Cm55Ztjj.js").then((module) => ({ default: module.NewPodcastPage })));
const EarningsPage = React__default.lazy(() => import("./index-DNGodBQb.js").then((module) => ({ default: module.EarningsPage })));
const AppointmentsPage = React__default.lazy(() => import("./index-IHH1-bNw.js").then((module) => ({ default: module.AppointmentsPage })));
const AnalyticsPage = React__default.lazy(() => import("./index-kx-V69q4.js").then((module) => ({ default: module.AnalyticsPage })));
const SettingsPage = React__default.lazy(() => import("./index-BoNlywX3.js").then((module) => ({ default: module.SettingsPage })));
const ReaderPage = React__default.lazy(() => import("./ReaderPage-BTeUAo8r.js").then((module) => ({ default: module.ReaderPage })));
const PlayerPage = React__default.lazy(() => import("./_id_-DWsZHWu9.js").then((module) => ({ default: module.PlayerPage })));
const SearchPage = React__default.lazy(() => import("./search-BHfSNx77.js").then((module) => ({ default: module.default })));
const ContactPage = React__default.lazy(() => import("./contact-D_EcOkD7.js").then((module) => ({ default: module.default })));
const PrivacyPage = React__default.lazy(() => import("./privacy-C0qK7-f2.js").then((module) => ({ default: module.PrivacyPage })));
const TermsPage = React__default.lazy(() => import("./terms-DtEPoQZF.js").then((module) => ({ default: module.TermsPage })));
const RefundPolicyPage = React__default.lazy(() => import("./refund-policy-BquxwcYo.js").then((module) => ({ default: module.RefundPolicyPage })));
const CopyrightPage = React__default.lazy(() => import("./copyright-CHwWfBvt.js").then((module) => ({ default: module.default })));
const AboutPage = React__default.lazy(() => import("./about-CeMMSxt6.js").then((module) => ({ default: module.AboutPage })));
const CheckoutPage = React__default.lazy(() => import("./checkout-slqw-OAY.js").then((module) => ({ default: module.CheckoutPage })));
const PaymentSuccessPage = React__default.lazy(() => import("./success-BvEqhfHg.js").then((module) => ({ default: module.PaymentSuccessPage })));
const PaymentCancelPage = React__default.lazy(() => import("./cancel-Da5iHQYN.js").then((module) => ({ default: module.PaymentCancelPage })));
const SubscriptionPage = React__default.lazy(() => import("./index-jNi2RjqS.js").then((module) => ({ default: module.SubscriptionPage })));
const SubscriptionPaymentPage = React__default.lazy(() => import("./payment-Yc1-44sc.js").then((module) => ({ default: module.SubscriptionPaymentPage })));
const SubscriptionVerifyPage = React__default.lazy(() => import("./verify-CzVckYtS.js").then((module) => ({ default: module.SubscriptionVerifyPage })));
const SubscriptionConfirmPage = React__default.lazy(() => import("./confirm-Cw3JXO2F.js").then((module) => ({ default: module.SubscriptionConfirmPage })));
function LoadingFallback() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) });
}
function MainLayout({ children }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation$1();
  const { currentAudio, isPlayerVisible } = useAudio();
  const isBrowser2 = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser2 ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    if (!isBrowser2) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBrowser2]);
  const isHomePage = location.pathname === "/";
  useEffect(() => {
    if (isMobile || !isHomePage) {
      setSidebarCollapsed(true);
    }
  }, [isHomePage, isMobile]);
  const categories2 = [
    { id: "1", name: "All", slug: "all" },
    { id: "2", name: "Business", slug: "business" },
    { id: "3", name: "Finance & Investing", slug: "finance-investing" },
    { id: "4", name: "Philosophy", slug: "philosophy" },
    { id: "5", name: "Religion", slug: "religion" },
    { id: "6", name: "History", slug: "history" },
    { id: "7", name: "Politics", slug: "politics" },
    { id: "8", name: "Literature", slug: "literature" },
    { id: "9", name: "Fiction", slug: "fiction" },
    { id: "10", name: "Romance", slug: "romance" },
    { id: "11", name: "Thriller", slug: "thriller" },
    { id: "12", name: "Mystery", slug: "mystery" },
    { id: "13", name: "Science Fiction", slug: "science-fiction" },
    { id: "14", name: "Fantasy", slug: "fantasy" },
    { id: "15", name: "Spirituality", slug: "spirituality" },
    { id: "16", name: "Self-Help", slug: "self-help" },
    { id: "17", name: "Entrepreneurship", slug: "entrepreneurship" },
    { id: "18", name: "Leadership", slug: "leadership" },
    { id: "19", name: "Biographies", slug: "biographies" },
    { id: "20", name: "Arts", slug: "arts" },
    { id: "21", name: "Music", slug: "music" },
    { id: "22", name: "Cinema & Media", slug: "cinema-media" },
    { id: "23", name: "Productivity", slug: "productivity" },
    { id: "24", name: "Career Growth", slug: "career-growth" },
    { id: "25", name: "Travel", slug: "travel" },
    { id: "26", name: "Mathematics", slug: "mathematics" },
    { id: "27", name: "Science", slug: "science" },
    { id: "28", name: "Technology", slug: "technology" },
    { id: "29", name: "Health", slug: "health" },
    { id: "30", name: "Psychology", slug: "psychology" }
  ];
  const shouldShowFooter = [
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/copyright"
  ].includes(location.pathname);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(EmailVerificationBanner, {}),
    !isMobile && /* @__PURE__ */ jsx(
      Sidebar,
      {
        onCollapse: setSidebarCollapsed,
        defaultCollapsed: !isHomePage || isMobile
      }
    ),
    isMobile && /* @__PURE__ */ jsx(
      Sidebar,
      {
        onCollapse: setSidebarCollapsed,
        defaultCollapsed: true
      }
    ),
    isHomePage && /* @__PURE__ */ jsx(
      CategoriesScroll,
      {
        categories: categories2,
        selectedCategory,
        onSelectCategory: setSelectedCategory,
        collapsed: isMobile ? true : sidebarCollapsed
      }
    ),
    /* @__PURE__ */ jsx(
      "main",
      {
        className: `transition-all duration-300 ${isHomePage ? "pt-16" : "pt-14"} ${isPlayerVisible && isMobile ? "pb-40" : isPlayerVisible ? "pb-20" : isMobile ? "pb-20" : ""} ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"}`,
        children: /* @__PURE__ */ jsx("div", { className: `container px-4 mx-auto ${isMobile ? "max-w-full" : ""}`, children: React__default.isValidElement(children) && React__default.cloneElement(children, { selectedCategory }) })
      }
    ),
    shouldShowFooter && /* @__PURE__ */ jsx(Footer, {}),
    isPlayerVisible && currentAudio && /* @__PURE__ */ jsx(
      AudioPlayer,
      {
        title: currentAudio.title,
        author: currentAudio.author,
        thumbnail: currentAudio.thumbnail,
        type: currentAudio.type,
        isMobile
      }
    )
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(LoadingFallback, {}), children: /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/signin", element: /* @__PURE__ */ jsx(SignInPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/signup", element: /* @__PURE__ */ jsx(SignUpPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/forgot-password", element: /* @__PURE__ */ jsx(ForgotPasswordPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/reset-password", element: /* @__PURE__ */ jsx(ResetPasswordPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/verify-email", element: /* @__PURE__ */ jsx(VerifyEmailPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/auth/callback", element: /* @__PURE__ */ jsx(AuthCallbackPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/get-started", element: /* @__PURE__ */ jsx(GetStartedPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/onboarding", element: /* @__PURE__ */ jsx(OnboardingQuiz, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/become-creator", element: /* @__PURE__ */ jsx(BecomeCreatorPage, {}) }),
    /* @__PURE__ */ jsxs(
      Route,
      {
        path: "/dashboard/:username/*",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { roles: ["creator"], children: /* @__PURE__ */ jsx(DashboardLayout, {}) }),
        children: [
          /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(DashboardOverviewPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content", element: /* @__PURE__ */ jsx(ContentPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content/new/article", element: /* @__PURE__ */ jsx(NewArticlePage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content/new/book", element: /* @__PURE__ */ jsx(NewBookPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content/new/audiobook", element: /* @__PURE__ */ jsx(NewAudiobookPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content/new/podcast", element: /* @__PURE__ */ jsx(NewPodcastPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "earnings", element: /* @__PURE__ */ jsx(EarningsPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "appointments", element: /* @__PURE__ */ jsx(AppointmentsPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "analytics", element: /* @__PURE__ */ jsx(AnalyticsPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "settings", element: /* @__PURE__ */ jsx(SettingsPage, {}) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/player/:id",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(PlayerPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/reader/:id",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ReaderPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/search",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(SearchPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/about",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(AboutPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/contact",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ContactPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/privacy",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(PrivacyPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/terms",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(TermsPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/refund-policy",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(RefundPolicyPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/copyright",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(CopyrightPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(Route, { path: "/payment/checkout", element: /* @__PURE__ */ jsx(CheckoutPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/payment/success", element: /* @__PURE__ */ jsx(PaymentSuccessPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/payment/cancel", element: /* @__PURE__ */ jsx(PaymentCancelPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/subscription", element: /* @__PURE__ */ jsx(SubscriptionPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/subscription/payment", element: /* @__PURE__ */ jsx(SubscriptionPaymentPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/subscription/verify", element: /* @__PURE__ */ jsx(SubscriptionVerifyPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/subscription/confirm", element: /* @__PURE__ */ jsx(SubscriptionConfirmPage, {}) }),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(Home, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/library",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(LibraryPage, {}) }) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/quick-bites",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(QuickBitesPage, {}) }) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/followed",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(FollowedPage, {}) }) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/community",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(CommunityPage, {}) }) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/history",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(HistoryPage, {}) }) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/profile",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ProfilePage, {}) }) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/profile/search",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(SearchProfilesPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/@:username",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(UserProfilePage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/consumer/:username",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(UserProfilePage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/creator/:username",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(CreatorProfilePage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true }) })
  ] }) }) });
}
function ClientOnlyApp() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return null;
  }
  return /* @__PURE__ */ jsx(App, {});
}
function IndexRoute() {
  return /* @__PURE__ */ jsx(ClientOnlyApp, {});
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: IndexRoute
}, Symbol.toStringTag, { value: "Module" }));
function loader({ params }) {
  params["*"];
  return null;
}
function CatchAllRoute() {
  return /* @__PURE__ */ jsx(ClientOnlyApp, {});
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CatchAllRoute,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DVQfdbDV.js", "imports": ["/assets/supabase-CK9k-UJW.js", "/assets/query-cache-C18JZZse.js", "/assets/components-BU9QCr34.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-B5euhiYj.js", "imports": ["/assets/supabase-CK9k-UJW.js", "/assets/query-cache-C18JZZse.js", "/assets/components-BU9QCr34.js", "/assets/audio-context-B3V87ldH.js", "/assets/refresh-cw-Bu3iCO7D.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-HPE9n_9E.js", "imports": ["/assets/supabase-CK9k-UJW.js", "/assets/client-only-app-DvO93iNq.js", "/assets/audio-context-B3V87ldH.js", "/assets/query-cache-C18JZZse.js"], "css": [] }, "routes/$": { "id": "routes/$", "parentId": "root", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_-DH9YUVUt.js", "imports": ["/assets/supabase-CK9k-UJW.js", "/assets/client-only-app-DvO93iNq.js", "/assets/audio-context-B3V87ldH.js", "/assets/query-cache-C18JZZse.js"], "css": [] } }, "url": "/assets/manifest-5bafdd5c.js", "version": "5bafdd5c" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/$": {
    id: "routes/$",
    parentId: "root",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  ContentTypeIcon as C,
  ImageLoader as I,
  useOptimisticMutation as a,
  useTheme as b,
  formatDate as c,
  detectUrduText as d,
  useAudio as e,
  formatTimeAgo as f,
  getTextLanguageClass as g,
  cn as h,
  ContentCard as i,
  searchContent as j,
  assetsBuildDirectory as k,
  basename as l,
  mode as m,
  future as n,
  isSpaMode as o,
  publicPath as p,
  entry as q,
  routes as r,
  supabase as s,
  serverManifest as t,
  useAuth as u,
  withRetry as w
};
