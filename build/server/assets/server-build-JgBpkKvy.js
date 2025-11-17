var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __publicField = (obj, key2, value) => __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { isbot } from "isbot";
import { RemixServer, Meta, Links, ScrollRestoration, Scripts, LiveReload, useLocation, Outlet, useLoaderData } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import React__default, { createContext, useContext, useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, RefreshCw, RotateCcw, Loader2, Pause, Play, RotateCw, VolumeX, Volume2, Settings, List, X, SkipBack, SkipForward, Headphones, Car, Timer, Moon, Dumbbell, Lock, Zap, Search, User, TrendingUp, History, Bell, BookOpen, Crown, Sun, ChevronDown, MoreHorizontal, Home as Home$1, Target, Library, CreditCard, BookMarked, MessageSquare, Users2, Trophy, ChevronRight, ChevronLeft, Newspaper, Mic, Sparkles, Mail, Star, Bookmark, FileText, Info } from "lucide-react";
import { Link, useNavigate, useLocation as useLocation$1, useSearchParams, Navigate, Routes, Route } from "react-router-dom";
import { create } from "zustand";
import { json } from "@remix-run/node";
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
const styles = "/assets/index-iAZAIu3V.css";
const isBrowser$4 = typeof window !== "undefined";
const safeStorage$2 = isBrowser$4 && typeof window.localStorage !== "undefined" ? window.localStorage : {
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
    () => safeStorage$2.getItem(storageKey) || defaultTheme
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
      safeStorage$2.setItem(storageKey, theme2);
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
const isBrowser$3 = typeof window !== "undefined";
const supabaseUrl = "https://yvjrakgbqqazedjltflw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU";
const url = supabaseUrl;
const key = supabaseAnonKey;
const supabase = createClient(url, key, {
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
let isConnected = true;
let connectionAttempts = 0;
let lastReconnectAttempt = 0;
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
const ConnectionContext = createContext({
  isConnected: true,
  retryConnection: async () => {
  },
  connectionError: null
});
function ConnectionProvider({
  children
}) {
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
      const success = await reconnect();
      if (success) {
        setIsConnected(true);
        setShowBanner(false);
        setRetryCount(0);
      } else {
        setRetryCount((prev) => prev + 1);
        setConnectionError(
          "Could not connect to the server. Please try again later."
        );
      }
    } catch (error) {
      setConnectionError("An error occurred while trying to reconnect.");
    } finally {
      setIsRetrying(false);
    }
  };
  useEffect(() => {
    const handleOnline = () => {
      retryConnection();
    };
    const handleOffline = () => {
      setIsConnected(false);
      setShowBanner(true);
      setConnectionError(
        "Your device appears to be offline. Please check your internet connection."
      );
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const handleConnectionFailed = () => {
      setIsConnected(false);
      setShowBanner(true);
      setConnectionError(
        "Connection to the server failed after multiple attempts."
      );
    };
    window.addEventListener(
      "supabase:connection-failed",
      handleConnectionFailed
    );
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "supabase:connection-failed",
        handleConnectionFailed
      );
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
  return /* @__PURE__ */ jsxs(
    ConnectionContext.Provider,
    {
      value: { isConnected: isConnected2, retryConnection, connectionError },
      children: [
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
      ]
    }
  );
}
const AudioContext = createContext(null);
function AudioProvider({
  children,
  currentPathname
}) {
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);
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
  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      setCurrentTrackIndex(nextIndex);
      playAudio(nextTrack);
    }
  };
  const playPrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[prevIndex];
    if (prevTrack) {
      setCurrentTrackIndex(prevIndex);
      playAudio(prevTrack);
    }
  };
  const playAudio = (audio, immediate = false) => {
    if (typeof window === "undefined") return;
    if (immediate) {
      setPlayerVisible(true);
      setIsPlaying(true);
      setTimeout(() => {
        window.location.href = `/player/${audio.type}-${audio.id}`;
      }, 100);
    } else {
      window.location.href = `/player/${audio.type}-${audio.id}`;
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
        setIsPlaying(state.isPlaying || false);
        setPlaylist(state.playlist || []);
        setCurrentTrackIndex(state.currentTrackIndex || 0);
      }
    } catch (error) {
      console.error("Error restoring audio state:", error);
      localStorage.removeItem("audioState");
    }
  }, []);
  useEffect(() => {
    if (currentAudio || isPlayerVisible) {
      try {
        localStorage.setItem(
          "audioState",
          JSON.stringify({
            currentAudio,
            isPlayerVisible,
            currentChapter,
            isPlaying,
            playlist,
            currentTrackIndex
          })
        );
      } catch (error) {
        console.error("Error saving audio state:", error);
      }
    }
  }, [
    currentAudio,
    isPlayerVisible,
    currentChapter,
    isPlaying,
    playlist,
    currentTrackIndex
  ]);
  return /* @__PURE__ */ jsx(
    AudioContext.Provider,
    {
      value: {
        isPlayerVisible,
        setPlayerVisible,
        currentAudio,
        setCurrentAudio,
        isMainPlayerPage,
        currentChapter,
        setCurrentChapter,
        updateCurrentTime,
        audioRef,
        isPlaying,
        setIsPlaying,
        playlist,
        setPlaylist,
        currentTrackIndex,
        setCurrentTrackIndex,
        playNext,
        playPrevious,
        playAudio
      },
      children
    }
  );
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
    __publicField(this, "handleRetry", async () => {
      this.setState({ isRetrying: true });
      try {
        if (this.state.connectionFailed) {
          const success = await forceReconnect();
          if (success) {
            this.setState({
              connectionFailed: false,
              hasError: false,
              error: null,
              errorInfo: null
            });
          } else {
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
  // Removed aggressive global error handlers - let components handle their own errors
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
    var _a, _b, _c, _d, _e;
    if (this.state.hasError || this.state.connectionFailed) {
      const isNetworkError = ((_b = (_a = this.state.error) == null ? void 0 : _a.message) == null ? void 0 : _b.toLowerCase().includes("network")) || ((_d = (_c = this.state.error) == null ? void 0 : _c.message) == null ? void 0 : _d.toLowerCase().includes("fetch")) || this.state.connectionFailed;
      return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4 max-w-md", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: isNetworkError ? "Connection Issue" : "Something Went Wrong" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: isNetworkError ? "We're having trouble connecting to the server. Please check your internet connection and try again." : "An unexpected error occurred while loading this page. Don't worry, your data is safe. Please try refreshing the page." }),
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
          /* @__PURE__ */ jsx("pre", { className: "mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-[200px]", children: (_e = this.state.error) == null ? void 0 : _e.toString() })
        ] })
      ] }) });
    }
    return this.props.children;
  }
};
function ImageLoader({
  src,
  alt,
  className,
  fallback,
  lowQualityUrl,
  loadingStrategy = "eager",
  ...props
}) {
  const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=Inlits";
  const [hasError, setHasError] = useState(false);
  const handleError = (e) => {
    const target = e.currentTarget;
    if (target.src !== PLACEHOLDER_IMAGE) {
      setHasError(true);
      target.src = PLACEHOLDER_IMAGE;
    }
  };
  if (hasError && fallback) {
    return /* @__PURE__ */ jsx(Fragment, { children: fallback });
  }
  const imageSrc = src || PLACEHOLDER_IMAGE;
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: imageSrc,
      alt: alt || "",
      className,
      loading: loadingStrategy,
      decoding: "async",
      onError: handleError,
      ...props
    }
  );
}
const isBrowser$2 = typeof window !== "undefined";
const safeStorage$1 = isBrowser$2 && typeof window.localStorage !== "undefined" ? window.localStorage : {
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  }
};
const cachedProfile = (() => {
  if (!isBrowser$2) return null;
  try {
    const raw = safeStorage$1.getItem("userProfile");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to restore cached profile:", error);
    return null;
  }
})();
const useAuth = create((set, get) => ({
  user: null,
  profile: cachedProfile,
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
          safeStorage$1.setItem("userProfile", JSON.stringify(profile));
        }
      } else {
        set({ user: null, profile: null });
        safeStorage$1.removeItem("userProfile");
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      set({ user: null, profile: null });
      safeStorage$1.removeItem("userProfile");
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
      set({ loading: true });
      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) throw signInError;
      if (!user) throw new Error("No user returned from sign in");
      set({ user });
      const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (profileError) {
        console.error("Profile error:", profileError);
        if (profileError.code === "PGRST116" || !profile) {
          try {
            const { error: insertError } = await supabase.from("profiles").insert({
              id: user.id,
              username: email.split("@")[0],
              role: "user",
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
              safeStorage$1.setItem("userProfile", JSON.stringify(newProfile));
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
                safeStorage$1.setItem("userProfile", JSON.stringify(existingProfile));
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
      safeStorage$1.setItem("sb-session", JSON.stringify(session));
      set({ profile, loading: false });
      safeStorage$1.setItem("userProfile", JSON.stringify(profile));
    } catch (error) {
      set({ user: null, profile: null, loading: false });
      safeStorage$1.removeItem("sb-session");
      safeStorage$1.removeItem("userProfile");
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
      safeStorage$1.removeItem("sb-session");
      safeStorage$1.removeItem("userProfile");
      set({ user: null, profile: null, loading: false });
      if (isBrowser$2) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      safeStorage$1.removeItem("sb-session");
      safeStorage$1.removeItem("userProfile");
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
      safeStorage$1.removeItem("userProfile");
      return;
    }
    console.log("Setting user:", user.email, "Provider:", (_a = user.app_metadata) == null ? void 0 : _a.provider);
    set({ user, loading: true });
    try {
      const cachedProfile2 = safeStorage$1.getItem("userProfile");
      if (cachedProfile2) {
        const profile2 = JSON.parse(cachedProfile2);
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
              role: "user",
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
              safeStorage$1.setItem("userProfile", JSON.stringify(newProfile));
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
                safeStorage$1.setItem("userProfile", JSON.stringify(existingProfile));
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
        safeStorage$1.setItem("userProfile", JSON.stringify(profile));
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
      safeStorage$1.setItem("userProfile", JSON.stringify(profile));
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
    useAuth.setState({ loading: true });
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting initial session:", error);
      useAuth.setState({ user: null, profile: null, loading: false });
      return;
    }
    if (session == null ? void 0 : session.user) {
      await useAuth.getState().setUser(session.user);
    } else {
      useAuth.setState({ user: null, profile: null, loading: false });
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
    useAuth.setState({ user: null, profile: null, loading: false });
  }
};
if (isBrowser$2) {
  initAuth();
  supabase.auth.onAuthStateChange((event, session) => {
    var _a;
    console.log("Auth state change:", event, (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.email);
    (async () => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session == null ? void 0 : session.user) {
          console.log("User signed in, setting user state");
          await useAuth.getState().setUser(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        useAuth.setState({ user: null, profile: null, loading: false });
      }
    })();
  });
}
function AudioPlayer({
  title,
  author,
  thumbnail,
  type,
  isMobile = false,
  authorId,
  authorUsername
}) {
  const { user } = useAuth();
  const {
    setPlayerVisible,
    isMainPlayerPage,
    currentAudio,
    currentChapter,
    setCurrentChapter,
    playlist,
    currentTrackIndex,
    playNext,
    playPrevious,
    audioRef,
    isPlaying: contextIsPlaying,
    setIsPlaying: setContextIsPlaying
  } = useAudio();
  const [isMobileDetected, setIsMobileDetected] = React__default.useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return isMobile;
  });
  React__default.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobileDetected(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobileView = isMobileDetected || isMobile;
  const progressRef = React__default.useRef(null);
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
  React__default.useRef(false);
  React__default.useEffect(() => {
    if (!currentAudio) return;
    const isChapterLocked = !user && currentChapter > 0 && currentAudio.chapters && currentAudio.chapters.length > 0;
    if (isChapterLocked) {
      setError("Please sign in to access this chapter");
      setContextIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }
  }, [currentAudio, currentChapter, user, audioRef, setContextIsPlaying]);
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
      if (currentAudio) {
        try {
          const savedState = JSON.parse(
            localStorage.getItem("audioState") || "{}"
          );
          if (savedState.currentAudio) {
            savedState.currentAudio.currentTime = audio.currentTime;
            localStorage.setItem("audioState", JSON.stringify(savedState));
          }
        } catch (e) {
          console.error("Error saving playback position:", e);
        }
      }
    };
    const handleEnded = () => {
      if ((currentAudio == null ? void 0 : currentAudio.chapters) && currentChapter < currentAudio.chapters.length - 1) {
        const nextChapterIndex = currentChapter + 1;
        const isNextChapterLocked = !user && nextChapterIndex > 0;
        if (isNextChapterLocked) {
          setContextIsPlaying(false);
          return;
        }
        if (settings.autoplay || settings.repeat === "all") {
          setCurrentChapter(nextChapterIndex);
          setContextIsPlaying(true);
        } else {
          setContextIsPlaying(false);
        }
      } else if (playlist.length > 0 && (settings.autoplay || settings.repeat === "all")) {
        const isLastTrack = currentTrackIndex === playlist.length - 1;
        if (isLastTrack && settings.repeat === "all") {
          playNext();
        } else if (!isLastTrack) {
          playNext();
        } else {
          setContextIsPlaying(false);
        }
      } else if (settings.repeat === "one") {
        if (currentAudio == null ? void 0 : currentAudio.chapters) {
          setCurrentChapter(0);
        }
        setContextIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      } else {
        setContextIsPlaying(false);
      }
    };
    const handleError = (e) => {
      const audioError = e.target.error;
      setError((audioError == null ? void 0 : audioError.message) || "Error playing audio");
      setIsLoading(false);
      setContextIsPlaying(false);
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
    if (settings.sleepTimer > 0 && contextIsPlaying) {
      setSleepTimerRemaining(settings.sleepTimer * 60);
      const interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
              setContextIsPlaying(false);
            }
            setSettings((prev2) => ({ ...prev2, sleepTimer: 0 }));
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(interval);
    }
  }, [settings.sleepTimer, contextIsPlaying, audioRef, setContextIsPlaying]);
  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;
    try {
      if (contextIsPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (error2) {
      console.error("Error toggling play:", error2);
      setError("Failed to play audio");
    }
  };
  const handleProgressMouseDown = (e) => {
    if (!progressRef.current || !audioRef.current || isLoading) return;
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    const handleGlobalMouseMove = (e2) => {
      if (!progressRef.current || !audioRef.current) return;
      const rect2 = progressRef.current.getBoundingClientRect();
      const percent2 = Math.max(
        0,
        Math.min(1, (e2.clientX - rect2.left) / rect2.width)
      );
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
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const time = percent * duration;
    setHoverTime(time);
  };
  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
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
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(currentTime + seconds, duration)
      );
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
  const handleClosePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setContextIsPlaying(false);
    setPlayerVisible(false);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `fixed left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-40 ${isMobileView ? "bottom-20" : "bottom-0 h-20"}`,
      children: [
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
                  style: {
                    left: `${currentTime / duration * 100}%`,
                    transform: "translateX(-50%) translateY(-50%)"
                  }
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
        isMobileView ? /* @__PURE__ */ jsx("div", { className: "px-2 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: (currentAudio == null ? void 0 : currentAudio.contentUrl) || "/",
              className: "flex items-center gap-2 hover:text-primary transition-colors min-w-0 flex-shrink",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: thumbnail,
                    alt: title,
                    className: "w-full h-full object-cover",
                    onError: (e) => {
                      const target = e.currentTarget;
                      target.src = "https://placehold.co/100x100?text=Audio";
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium text-xs line-clamp-1", children: title }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: author })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => skipTime(-15),
                className: "p-1.5 hover:bg-accent rounded-lg transition-all active:scale-95",
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
                className: "w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50",
                children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : contextIsPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 ml-0.5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => skipTime(30),
                className: "p-1.5 hover:bg-accent rounded-lg transition-all active:scale-95",
                disabled: isLoading,
                title: "Skip forward 30s",
                children: /* @__PURE__ */ jsx(RotateCw, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  closeAllExcept("volume");
                  setShowVolumeSlider(!showVolumeSlider);
                },
                className: "p-1.5 hover:bg-accent rounded-lg transition-all",
                title: "Volume",
                children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  closeAllExcept("mode");
                  setShowModeSelector(!showModeSelector);
                },
                className: `p-1.5 rounded-lg transition-all ${listeningMode !== "normal" ? "bg-primary/10 text-primary" : "hover:bg-accent"}`,
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
                className: `p-1.5 rounded-lg transition-all ${showSettings ? "bg-primary/10 text-primary" : "hover:bg-accent"}`,
                disabled: isLoading,
                title: "Player Settings",
                children: /* @__PURE__ */ jsx(Settings, { className: "w-4 h-4" })
              }
            ),
            (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  closeAllExcept("playlist");
                  setShowPlaylist(!showPlaylist);
                },
                className: `p-1.5 rounded-lg transition-all ${showPlaylist ? "bg-primary/10 text-primary" : "hover:bg-accent"}`,
                disabled: isLoading,
                title: "Chapters",
                children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
              }
            ),
            !isMainPlayerPage && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleClosePlayer,
                className: "p-1.5 hover:bg-accent rounded-lg transition-all",
                title: "Close Player",
                children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }) }) : /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-4 h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center h-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0 w-80 flex-shrink-0", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: (currentAudio == null ? void 0 : currentAudio.contentUrl) || "/",
                className: "flex items-center gap-3 hover:text-primary transition-colors flex-shrink-0",
                children: /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-lg overflow-hidden bg-muted shadow-md", children: /* @__PURE__ */ jsx(
                  ImageLoader,
                  {
                    src: thumbnail,
                    alt: title,
                    className: "w-full h-full object-cover",
                    lowQualityUrl: `${thumbnail}?w=50`,
                    fallback: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-primary" }) })
                  }
                ) })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: (currentAudio == null ? void 0 : currentAudio.contentUrl) || "/",
                  className: "block hover:text-primary transition-colors",
                  children: /* @__PURE__ */ jsx("h3", { className: "font-semibold line-clamp-1 text-sm", children: title })
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: authorUsername ? `/user/${authorUsername}` : "#",
                  className: "text-xs text-muted-foreground line-clamp-1 hover:text-primary transition-colors block",
                  onClick: (e) => !authorUsername && e.preventDefault(),
                  children: author
                }
              ),
              (currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 1 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-primary", children: [
                "Chapter ",
                currentChapter + 1,
                " of",
                " ",
                currentAudio.chapters.length
              ] }),
              playlist.length > 1 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Track ",
                currentTrackIndex + 1,
                " of ",
                playlist.length
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 flex-1", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => skipTime(-15),
                className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
                disabled: isLoading,
                title: "Skip back 15s",
                children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-6 h-6" })
              }
            ),
            playlist.length > 1 && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: playPrevious,
                className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
                disabled: isLoading,
                title: "Previous track",
                children: /* @__PURE__ */ jsx(SkipBack, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: togglePlay,
                disabled: isLoading || !(currentAudio == null ? void 0 : currentAudio.audioUrl) && !((currentAudio == null ? void 0 : currentAudio.chapters) && currentAudio.chapters.length > 0),
                className: "w-14 h-14 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100",
                children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin" }) : contextIsPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 ml-0.5" })
              }
            ),
            playlist.length > 1 && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: playNext,
                className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
                disabled: isLoading,
                title: "Next track",
                children: /* @__PURE__ */ jsx(SkipForward, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => skipTime(30),
                className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
                disabled: isLoading,
                title: "Skip forward 30s",
                children: /* @__PURE__ */ jsx(RotateCw, { className: "w-6 h-6" })
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
                      closeAllExcept("volume");
                      setShowVolumeSlider(!showVolumeSlider);
                    },
                    className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
                    title: "Volume",
                    children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-5 h-5" })
                  }
                ),
                showVolumeSlider && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-popover border rounded-lg shadow-xl", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "range",
                    min: "0",
                    max: "1",
                    step: "0.01",
                    value: volume,
                    onChange: handleVolumeChange,
                    className: "h-24 w-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-runnable-track]:rounded-lg",
                    style: {
                      writingMode: "bt-lr",
                      WebkitAppearance: "slider-vertical"
                    }
                  }
                ) })
              ] }),
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
                    {
                      mode: "normal",
                      label: "Normal",
                      icon: Headphones,
                      desc: "Standard listening"
                    },
                    {
                      mode: "driving",
                      label: "Driving",
                      icon: Car,
                      desc: "Skip silence, clear audio"
                    },
                    {
                      mode: "walking",
                      label: "Walking",
                      icon: Timer,
                      desc: "Slightly faster pace"
                    },
                    {
                      mode: "sleep",
                      label: "Sleep",
                      icon: Moon,
                      desc: "Slower, with sleep timer"
                    },
                    {
                      mode: "workout",
                      label: "Workout",
                      icon: Dumbbell,
                      desc: "Faster pace, auto-continue"
                    }
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
                            onChange: (e) => setSettings((prev) => ({
                              ...prev,
                              autoplay: e.target.checked
                            })),
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
                            onChange: (e) => setSettings((prev) => ({
                              ...prev,
                              skipSilence: e.target.checked
                            })),
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
                        onClick: () => setSettings((prev) => ({
                          ...prev,
                          repeat: option.value
                        })),
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
                            onChange: (e) => setSettings((prev) => ({
                              ...prev,
                              shuffle: e.target.checked
                            })),
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
                        onClick: () => setSettings((prev) => ({
                          ...prev,
                          sleepTimer: minutes
                        })),
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
                showPlaylist && (currentAudio == null ? void 0 : currentAudio.chapters) && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full right-0 mb-2 w-80 bg-popover border rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col", children: [
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
                  currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx("div", { className: "overflow-y-auto flex-1", children: /* @__PURE__ */ jsxs("div", { className: "p-2 space-y-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-xs font-medium text-muted-foreground px-2 py-1", children: [
                      "Chapters (",
                      currentAudio.chapters.length,
                      ")"
                    ] }),
                    currentAudio.chapters.map((chapter, index) => {
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
                          className: `w-full flex items-center justify-between p-2 rounded text-sm transition-all ${isLocked ? "bg-muted/30 cursor-not-allowed opacity-60" : isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                          disabled: isLoading || isLocked,
                          children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: isLocked ? /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }) : isLoading && isCurrent ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : isCurrent && contextIsPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Play, { className: "w-3 h-3" }) }),
                              /* @__PURE__ */ jsx("div", { className: "font-medium line-clamp-1 text-left", children: chapter.title })
                            ] }),
                            /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80 ml-2 flex-shrink-0", children: chapter.duration })
                          ]
                        },
                        chapter.id
                      );
                    })
                  ] }) })
                ] })
              ] }),
              !isMainPlayerPage && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleClosePlayer,
                  className: "p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all",
                  title: "Close Player",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] })
          ] })
        ] }) }),
        isMobileView && showModeSelector && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
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
        isMobileView && showSettings && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl max-h-80 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-4", children: [
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
                    onChange: (e) => setSettings((prev) => ({
                      ...prev,
                      autoplay: e.target.checked
                    })),
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
                    onChange: (e) => setSettings((prev) => ({
                      ...prev,
                      skipSilence: e.target.checked
                    })),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" })
              ] })
            ] }) })
          ] })
        ] }) }),
        isMobileView && showPlaylist && (currentAudio == null ? void 0 : currentAudio.chapters) && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 right-0 mb-2 mx-3 bg-popover border rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col", children: [
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
          currentAudio.chapters.length > 1 && /* @__PURE__ */ jsx("div", { className: "overflow-y-auto flex-1", children: /* @__PURE__ */ jsxs("div", { className: "p-2 space-y-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs font-medium text-muted-foreground px-2 py-1", children: [
              "Chapters (",
              currentAudio.chapters.length,
              ")"
            ] }),
            currentAudio.chapters.map((chapter, index) => {
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
                  className: `w-full flex items-center justify-between p-2 rounded text-sm transition-all ${isLocked ? "bg-muted/30 cursor-not-allowed opacity-60" : isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                  disabled: isLoading || isLocked,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: isLocked ? /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }) : isLoading && isCurrent ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : isCurrent && contextIsPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Play, { className: "w-3 h-3" }) }),
                      /* @__PURE__ */ jsx("div", { className: "font-medium line-clamp-1 text-left", children: chapter.title })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80 ml-2 flex-shrink-0", children: chapter.duration })
                  ]
                },
                chapter.id
              );
            })
          ] }) })
        ] }),
        error && /* @__PURE__ */ jsxs("div", { className: "mt-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded text-xs flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Zap, { className: "w-3 h-3" }),
          error
        ] })
      ]
    }
  );
}
function GlobalAudioPlayer() {
  const {
    audioRef,
    currentAudio,
    currentChapter,
    isPlaying,
    setIsPlaying,
    updateCurrentTime
  } = useAudio();
  useEffect(() => {
    var _a;
    if (!currentAudio || !audioRef.current) return;
    const audio = audioRef.current;
    const currentChapterData = (_a = currentAudio.chapters) == null ? void 0 : _a[currentChapter];
    const source = (currentChapterData == null ? void 0 : currentChapterData.audio_url) || currentAudio.audioUrl;
    if (!source) return;
    const normalizeUrl = (url2) => {
      try {
        return new URL(url2).href;
      } catch {
        return url2;
      }
    };
    const currentSrc = audio.src ? normalizeUrl(audio.src) : "";
    const newSrc = normalizeUrl(source);
    const isSameSource = currentSrc === newSrc;
    if (isSameSource) {
      if (currentAudio.currentTime && currentAudio.currentTime > 0 && Math.abs(audio.currentTime - currentAudio.currentTime) > 2) {
        audio.currentTime = currentAudio.currentTime;
      }
      if (isPlaying && audio.paused) {
        audio.play().catch(console.error);
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
      return;
    }
    audio.src = source;
    audio.load();
    const handleCanPlay = () => {
      if (currentAudio.currentTime && currentAudio.currentTime > 0) {
        audio.currentTime = currentAudio.currentTime;
      }
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== void 0) {
          playPromise.catch((error) => {
            console.error("Autoplay failed:", error);
            setIsPlaying(false);
          });
        }
      }
    };
    audio.addEventListener("canplay", handleCanPlay, { once: true });
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentAudio, currentChapter, audioRef, isPlaying, setIsPlaying]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let isUpdating = false;
    const handlePlay = () => {
      if (!isUpdating) {
        isUpdating = true;
        setIsPlaying(true);
        setTimeout(() => {
          isUpdating = false;
        }, 100);
      }
    };
    const handlePause = () => {
      if (!isUpdating) {
        isUpdating = true;
        setIsPlaying(false);
        setTimeout(() => {
          isUpdating = false;
        }, 100);
      }
    };
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioRef, setIsPlaying]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime);
      try {
        const savedState = JSON.parse(
          localStorage.getItem("audioState") || "{}"
        );
        if (savedState.currentAudio) {
          savedState.currentAudio.currentTime = audio.currentTime;
          localStorage.setItem("audioState", JSON.stringify(savedState));
        }
      } catch (e) {
        console.error("Error saving playback position:", e);
      }
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef, updateCurrentTime]);
  return /* @__PURE__ */ jsx("audio", { ref: audioRef, className: "hidden", preload: "auto" });
}
const meta = () => [
  { charSet: "utf-8" },
  { title: "Inlits" },
  { name: "viewport", content: "width=device-width,initial-scale=1" }
];
const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/svg+xml", href: "/book-open.svg", sizes: "any" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/Black & Blue Minimalist Modern Initial Font Logo.png"
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/Black & Blue Minimalist Modern Initial Font Logo.png"
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/Black & Blue Minimalist Modern Initial Font Logo.png"
  },
  {
    rel: "shortcut icon",
    href: "/book-open.svg"
  },
  { rel: "preconnect", href: "https://placehold.co" },
  { rel: "dns-prefetch", href: "https://placehold.co" }
];
function Document({
  children,
  title
}) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "h-full", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      title ? /* @__PURE__ */ jsx("title", { children: title }) : null,
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {}),
      /* @__PURE__ */ jsx(
        "link",
        {
          href: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap",
          rel: "stylesheet"
        }
      ),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              try {
                const theme = localStorage.getItem('inlits-theme');
                if (theme) {
                  document.documentElement.classList.add(theme);
                } else {
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.add(isDark ? 'dark' : 'light');
                }
              } catch (e) {}
            `
          }
        }
      )
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
function AppContent() {
  const { currentAudio, isPlayerVisible } = useAudio();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "transition-opacity duration-300", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx(GlobalAudioPlayer, {}),
    currentAudio && isPlayerVisible && /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg", children: /* @__PURE__ */ jsx(
      AudioPlayer,
      {
        title: currentAudio.title,
        author: currentAudio.author,
        thumbnail: currentAudio.thumbnail,
        type: currentAudio.type,
        authorId: currentAudio.authorId,
        authorUsername: currentAudio.authorUsername
      }
    ) })
  ] });
}
function App$1() {
  return /* @__PURE__ */ jsx(Document, { children: /* @__PURE__ */ jsx(AppProviders, { children: /* @__PURE__ */ jsx(
    Suspense,
    {
      fallback: /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 animate-spin text-primary" }) }),
      children: /* @__PURE__ */ jsx(AppContent, {})
    }
  ) }) });
}
function ErrorBoundary2({ error }) {
  var _a, _b, _c;
  const isNetworkError = error instanceof Error && (((_a = error.message) == null ? void 0 : _a.toLowerCase().includes("network")) || ((_b = error.message) == null ? void 0 : _b.toLowerCase().includes("fetch")) || ((_c = error.message) == null ? void 0 : _c.toLowerCase().includes("connection")));
  return /* @__PURE__ */ jsx(Document, { title: "Application Error", children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center", children: [
    /* @__PURE__ */ jsx(AlertCircle, { className: "w-16 h-16 text-destructive" }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: isNetworkError ? "Connection Issue" : "Something Went Wrong" }),
    /* @__PURE__ */ jsx("p", { className: "max-w-md text-muted-foreground", children: isNetworkError ? "We're having trouble connecting to the server. Please check your internet connection and try again." : "We encountered an unexpected error while loading this page. Please try refreshing, or come back later if the issue persists." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => window.location.reload(),
        className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
        children: "Refresh Page"
      }
    ),
    process.env.NODE_ENV !== "production" && error instanceof Error && /* @__PURE__ */ jsx("code", { className: "max-w-md overflow-x-auto rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground", children: error.message })
  ] }) });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: ErrorBoundary2,
  default: App$1,
  links,
  meta
}, Symbol.toStringTag, { value: "Module" }));
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
      const matchingCategories = categories$1.filter(
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
const categories$1 = [
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
            navigate(`/user/${suggestion.username}`);
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
  var _a, _b, _c, _d;
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const isBrowser2 = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    () => isBrowser2 ? window.innerWidth < 768 : false
  );
  const resolvedUsername = (profile == null ? void 0 : profile.username) || ((_a = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a.username) || ((user == null ? void 0 : user.email) ? user.email.split("@")[0] : void 0);
  const profileLink = user ? resolvedUsername ? `/user/${resolvedUsername}` : "/profile" : "/signin";
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
  const handleSettingsClick = () => {
    setShowUserDropdown(false);
    if (resolvedUsername) {
      navigate(`/dashboard/${resolvedUsername}/settings`);
    } else {
      navigate("/profile");
    }
  };
  return /* @__PURE__ */ jsx("header", { className: "fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "container flex h-16 items-center justify-between px-4 md:px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center space-x-2 group", children: [
      /* @__PURE__ */ jsx(BookOpen, { className: "h-7 w-7 text-primary transition-transform group-hover:scale-110" }),
      /* @__PURE__ */ jsx("span", { className: "hidden text-2xl font-bold md:inline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", children: "Inlits" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 max-w-xl mx-4", children: /* @__PURE__ */ jsx(SearchBox, {}) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      user && /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/subscription",
          className: "hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm",
          children: [
            /* @__PURE__ */ jsx(Crown, { className: "w-4 h-4" }),
            "Upgrade"
          ]
        }
      ),
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
              ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 h-8 font-medium rounded-full bg-primary/10 text-primary", children: ((_c = (_b = profile == null ? void 0 : profile.username) == null ? void 0 : _b[0]) == null ? void 0 : _c.toUpperCase()) || (resolvedUsername ? (_d = resolvedUsername[0]) == null ? void 0 : _d.toUpperCase() : "?") }),
              !isMobile && /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" })
            ]
          }
        ),
        showUserDropdown && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 w-56 p-2 mt-2 bg-popover border rounded-lg shadow-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "pb-2 mb-2 border-b", children: /* @__PURE__ */ jsx("p", { className: "px-2 text-sm font-medium", children: resolvedUsername }) }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: profileLink,
              onClick: () => setShowUserDropdown(false),
              className: "block px-2 py-1.5 text-sm rounded-md hover:bg-primary/5",
              children: "Your Profile"
            }
          ),
          resolvedUsername && /* @__PURE__ */ jsx(
            Link,
            {
              to: `/dashboard/${resolvedUsername}`,
              onClick: () => setShowUserDropdown(false),
              className: "block px-2 py-1.5 text-sm rounded-md hover:bg-primary/5",
              children: "Dashboard"
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/subscription",
              onClick: () => setShowUserDropdown(false),
              className: "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600",
              children: [
                /* @__PURE__ */ jsx(Crown, { className: "w-4 h-4" }),
                "Upgrade to Premium"
              ]
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
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: isMobile ? /* @__PURE__ */ jsx(Link, { to: "/signin", className: "p-2", children: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
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
  var _a;
  const location = useLocation$1();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const resolvedUsername = (profile == null ? void 0 : profile.username) || ((_a = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a.username) || ((user == null ? void 0 : user.email) ? user.email.split("@")[0] : void 0);
  const profilePath = user ? resolvedUsername ? `/user/${resolvedUsername}` : "/profile" : "/signin";
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
  const isProfileActive = (username) => {
    if (!username) return location.pathname === "/profile";
    const normalized = username.startsWith("@") ? username.slice(1) : username;
    return location.pathname === `/user/${normalized}` || location.pathname === `/@${normalized}`;
  };
  const mainNavItems = [
    { id: "home", label: "Home", icon: Home$1, path: "/" },
    { id: "library", label: "Library", icon: Library, path: user ? "/library" : "/signin" },
    { id: "community", label: "Community", icon: Users2, path: user ? "/community" : "/signin" },
    { id: "profile", label: "Profile", icon: User, path: profilePath },
    { id: "more", label: "More", icon: MoreHorizontal, path: "#", isMore: true }
  ];
  const moreNavItems = [
    { id: "profile", label: "Profile", icon: User, path: profilePath },
    { id: "goals", label: "Learning Goals", icon: Target, path: user ? "/library?tab=goals" : "/signin" },
    { id: "history", label: "History", icon: History, path: user ? "/history" : "/signin" },
    ...user && resolvedUsername ? [
      { id: "dashboard", label: "Dashboard", icon: CreditCard, path: `/dashboard/${resolvedUsername}` }
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
        const isItemActive = item.id === "profile" ? isProfileActive(resolvedUsername) : item.id === "community" ? location.pathname.startsWith("/community") : isActive(item.path);
        return /* @__PURE__ */ jsx(
          SidebarItem,
          {
            icon: item.icon,
            label: item.label,
            to: item.path,
            active: isItemActive,
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
        className: `${collapsed ? "w-16" : "w-64"} fixed left-0 top-[4rem] h-[calc(100vh-4rem)] border-r bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 flex flex-col transition-all duration-300 z-40 shadow-sm`,
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
                  to: profilePath,
                  active: isProfileActive(resolvedUsername),
                  collapsed
                }
              ),
              user && resolvedUsername && /* @__PURE__ */ jsx(
                SidebarItem,
                {
                  icon: CreditCard,
                  label: "Dashboard",
                  to: `/dashboard/${resolvedUsername}`,
                  active: location.pathname.startsWith("/dashboard"),
                  collapsed
                }
              ),
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
      className: "fixed top-16 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-40 transition-all duration-300",
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
                  console.log(
                    "Selected category:",
                    category.slug,
                    "Name:",
                    category.name
                  );
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
  function getFullKey(key2) {
    return `${prefix}${key2}`;
  }
  return {
    async get(key2) {
      try {
        const fullKey = getFullKey(key2);
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
    async set(key2, value, ttl = defaultTTL) {
      try {
        const item = {
          value,
          expiresAt: Date.now() + ttl
        };
        storage2.setItem(getFullKey(key2), JSON.stringify(item));
      } catch (error) {
        console.error("Cache set error:", error);
      }
    },
    async remove(key2) {
      try {
        storage2.removeItem(getFullKey(key2));
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
    getItem: (key2) => memoryStore.get(key2) || null,
    setItem: (key2, value) => memoryStore.set(key2, value),
    removeItem: (key2) => memoryStore.delete(key2),
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
  async invalidate(key2) {
    await Promise.all([
      memoryCache.remove(key2),
      browserCache.remove(key2)
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
const getLowQualityUrl = (url2, size = 50) => {
  if (!url2 || url2.includes("placehold.co")) return void 0;
  return url2.includes("?") ? `${url2}&w=${size}` : `${url2}?w=${size}`;
};
function ContentCard({
  item,
  activeShelf,
  onAddToShelf
}) {
  var _a, _b;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPlaylist } = useAudio();
  const [isBookmarked, setIsBookmarked] = React__default.useState(
    item.bookmarked || false
  );
  getLowQualityUrl(item.thumbnail);
  getLowQualityUrl((_a = item.creator) == null ? void 0 : _a.avatar, 20);
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
  const [isNavigating, setIsNavigating] = React__default.useState(false);
  const handleClick = () => {
    if (isNavigating) {
      return;
    }
    setIsNavigating(true);
    if (item.type === "audiobook" || item.type === "podcast") {
      setPlaylist([]);
    }
    let targetUrl = "";
    switch (item.type) {
      case "article":
        targetUrl = `/reader/article-${item.id}`;
        break;
      case "ebook":
        targetUrl = `/reader/book-${item.id}`;
        break;
      case "audiobook":
      case "podcast":
        targetUrl = `/player/${item.type}-${item.id}`;
        break;
    }
    navigate(targetUrl);
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
  const getContentLabel = () => {
    switch (item.type) {
      case "audiobook":
        if (item.is_full_book === false) {
          return { icon: Headphones, label: "Summary" };
        }
        return { icon: Headphones, label: "Full Audiobook" };
      case "ebook":
        if (item.is_full_book === false) {
          return { icon: BookOpen, label: "Summary" };
        }
        return { icon: BookOpen, label: "Full Book" };
      case "podcast":
        return { icon: Headphones, label: "Podcast" };
      case "article":
        return { icon: FileText, label: "Article" };
      case "summary":
        return { icon: BookOpen, label: "Summary" };
      default:
        return { icon: BookOpen, label: item.type };
    }
  };
  const contentLabel = getContentLabel();
  const ContentIcon = contentLabel.icon;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: handleClick,
      className: "group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 hover:z-10 flex flex-col h-full",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative w-full bg-muted",
            style: { paddingBottom: "150%" },
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.thumbnail,
                  alt: item.title,
                  className: "absolute inset-0 w-full h-full object-cover",
                  loading: "lazy",
                  onError: (e) => {
                    const target = e.currentTarget;
                    target.src = "https://placehold.co/600x900/1f4ead/ffffff?text=" + encodeURIComponent(item.title.substring(0, 20));
                  }
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:to-black/20 transition-all duration-300" }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 px-2.5 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/10 z-10", children: [
                /* @__PURE__ */ jsx(ContentIcon, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: contentLabel.label })
              ] }),
              (item.type === "audiobook" || item.type === "podcast") && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center z-10", children: /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg", children: /* @__PURE__ */ jsx(Play, { className: "w-7 h-7 text-black ml-1 fill-current" }) }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1.5 flex-1 flex flex-col", children: [
          /* @__PURE__ */ jsx(
            "h3",
            {
              className: `font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors content-card-title min-h-[2.5rem] ${getTextLanguageClass(
                item.title
              )}`,
              children: item.title
            }
          ),
          item.creator && /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/user/${item.creator.username || item.creator.id}`,
              className: "flex items-center gap-2 hover:text-primary transition-colors",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: item.creator.avatar,
                    alt: getCreatorName(),
                    className: "w-full h-full object-cover",
                    loading: "eager",
                    onError: (e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-primary text-xs font-medium">${getCreatorInitial()}</span>`;
                      }
                    }
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
              /* @__PURE__ */ jsx("span", { children: ((_b = item.rating) == null ? void 0 : _b.toFixed(1)) || "4.5" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBookmarkClick,
            className: "absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110 z-10",
            children: /* @__PURE__ */ jsx(
              Bookmark,
              {
                className: `w-4 h-4 ${isBookmarked || activeShelf && item.bookmarked ? "fill-current" : ""}`
              }
            )
          }
        )
      ]
    }
  );
}
function ContentCarousel({
  title,
  items,
  activeShelf,
  onAddToShelf
}) {
  const rowRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const updateButtonVisibility = useCallback(() => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);
  const scroll = (direction) => {
    if (!rowRef.current || isScrolling) return;
    setIsScrolling(true);
    const container = rowRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const scrollPosition = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth"
    });
    setTimeout(() => {
      setIsScrolling(false);
      updateButtonVisibility();
    }, 500);
  };
  React__default.useEffect(() => {
    const container = rowRef.current;
    if (!container) return;
    updateButtonVisibility();
    container.addEventListener("scroll", updateButtonVisibility);
    window.addEventListener("resize", updateButtonVisibility);
    return () => {
      container.removeEventListener("scroll", updateButtonVisibility);
      window.removeEventListener("resize", updateButtonVisibility);
    };
  }, [updateButtonVisibility]);
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "group/carousel relative mb-10", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold", children: title }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative -mx-4 md:mx-0", children: [
      showLeftButton && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => scroll("left"),
          className: "hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300",
          disabled: isScrolling,
          children: /* @__PURE__ */ jsx("div", { className: "p-2 bg-background/90 hover:bg-primary hover:text-primary-foreground rounded-full border shadow-lg transition-all", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: rowRef,
          className: "flex overflow-x-auto gap-3 md:gap-4 pb-4 px-4 md:px-0 scrollbar-hide scroll-smooth",
          style: { scrollbarWidth: "none", msOverflowStyle: "none" },
          children: items.map((item) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex-shrink-0 w-[150px] sm:w-[160px] md:w-[180px] lg:w-[200px]",
              children: /* @__PURE__ */ jsx(
                ContentCard,
                {
                  item,
                  activeShelf,
                  onAddToShelf
                }
              )
            },
            item.id
          ))
        }
      ),
      showRightButton && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => scroll("right"),
          className: "hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300",
          disabled: isScrolling,
          children: /* @__PURE__ */ jsx("div", { className: "p-2 bg-background/90 hover:bg-primary hover:text-primary-foreground rounded-full border shadow-lg transition-all", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6" }) })
        }
      )
    ] })
  ] });
}
function ContinueContent() {
  const { user } = useAuth();
  const [continueItems, setContinueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchContinueContent = async () => {
      try {
        const { data: historyData, error } = await supabase.from("content_history").select(
          `
            content_id,
            content_type,
            progress,
            last_accessed,
            audiobooks:audiobooks!content_history_content_id_fkey (
              id,
              title,
              cover_url,
              category,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            ),
            books:books!content_history_content_id_fkey (
              id,
              title,
              cover_url,
              category,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            ),
            podcasts:podcast_episodes!content_history_content_id_fkey (
              id,
              title,
              cover_url,
              duration,
              category,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            )
          `
        ).eq("user_id", user.id).gt("progress", 0).lt("progress", 95).order("last_accessed", { ascending: false }).limit(10);
        if (error) throw error;
        const items = [];
        historyData == null ? void 0 : historyData.forEach((item) => {
          let content = null;
          let type = "audiobook";
          if (item.content_type === "audiobook" && item.audiobooks) {
            content = Array.isArray(item.audiobooks) ? item.audiobooks[0] : item.audiobooks;
            type = "audiobook";
          } else if (item.content_type === "book" && item.books) {
            content = Array.isArray(item.books) ? item.books[0] : item.books;
            type = "ebook";
          } else if (item.content_type === "podcast" && item.podcasts) {
            content = Array.isArray(item.podcasts) ? item.podcasts[0] : item.podcasts;
            type = "podcast";
          }
          if (content) {
            const author = Array.isArray(content.author) ? content.author[0] : content.author;
            items.push({
              id: content.id,
              type,
              title: content.title,
              thumbnail: content.cover_url || "https://placehold.co/600x800?text=Content",
              duration: type === "podcast" ? content.duration : "2 hours",
              views: 0,
              createdAt: item.last_accessed || (/* @__PURE__ */ new Date()).toISOString(),
              creator: author ? {
                id: author.id,
                name: author.name || "Unknown",
                avatar: author.avatar_url || "https://placehold.co/80x80?text=U",
                username: author.username || "user",
                followers: 0
              } : void 0,
              category: content.category || "",
              categories: [],
              featured: false,
              rating: 4.5,
              progress: item.progress
            });
          }
        });
        setContinueItems(items);
      } catch (error) {
        console.error("Error fetching continue content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContinueContent();
  }, [user]);
  if (loading || !user || continueItems.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(ContentCarousel, { title: "▶️ Continue Listening", items: continueItems });
}
function SmartRecommendations({
  currentContent
}) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSmartRecommendations = async () => {
      try {
        let categoryFilter = [];
        let userPreferredCategories = [];
        if ((currentContent == null ? void 0 : currentContent.categories) && currentContent.categories.length > 0) {
          categoryFilter = currentContent.categories;
        } else if (currentContent == null ? void 0 : currentContent.category) {
          categoryFilter = [currentContent.category];
        }
        if (user) {
          const { data: historyData } = await supabase.from("content_history").select(
            `
              content_id,
              content_type,
              audiobooks:audiobooks!content_history_content_id_fkey(categories, category),
              books:books!content_history_content_id_fkey(category),
              podcasts:podcast_episodes!content_history_content_id_fkey(categories, category)
            `
          ).eq("user_id", user.id).limit(20);
          if (historyData) {
            const categoryCounts = {};
            historyData.forEach((item) => {
              let itemCategories = [];
              if (item.content_type === "audiobook" && item.audiobooks) {
                const ab = Array.isArray(item.audiobooks) ? item.audiobooks[0] : item.audiobooks;
                itemCategories = (ab == null ? void 0 : ab.categories) || ((ab == null ? void 0 : ab.category) ? [ab.category] : []);
              } else if (item.content_type === "book" && item.books) {
                const book = Array.isArray(item.books) ? item.books[0] : item.books;
                if (book == null ? void 0 : book.category) itemCategories = [book.category];
              } else if (item.content_type === "podcast" && item.podcasts) {
                const pod = Array.isArray(item.podcasts) ? item.podcasts[0] : item.podcasts;
                itemCategories = (pod == null ? void 0 : pod.categories) || ((pod == null ? void 0 : pod.category) ? [pod.category] : []);
              }
              itemCategories.forEach((cat) => {
                if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
              });
            });
            userPreferredCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat]) => cat);
            if (categoryFilter.length === 0 && userPreferredCategories.length > 0) {
              categoryFilter = userPreferredCategories;
            }
          }
        }
        const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
          supabase.from("audiobooks").select(
            `
              id,
              title,
              cover_url,
              category,
              categories,
              is_full_book,
              created_at,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `
          ).eq("status", "published").order("created_at", { ascending: false }).limit(20),
          supabase.from("books").select(
            `
              id,
              title,
              cover_url,
              category,
              is_full_book,
              created_at,
              author:profiles!books_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `
          ).eq("status", "published").order("created_at", { ascending: false }).limit(20),
          supabase.from("podcast_episodes").select(
            `
              id,
              title,
              cover_url,
              duration,
              category,
              categories,
              created_at,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                avatar_url,
                username
              )
            `
          ).eq("status", "published").order("created_at", { ascending: false }).limit(20)
        ]);
        const items = [];
        const processContent = (data, type) => {
          data == null ? void 0 : data.forEach((item) => {
            const author = Array.isArray(item.author) ? item.author[0] : item.author;
            if (currentContent && item.id === currentContent.id) {
              return;
            }
            const itemCategories = item.categories || (item.category ? [item.category] : []);
            const categoryMatchScore = categoryFilter.reduce(
              (score, cat) => itemCategories.includes(cat) ? score + 1 : score,
              0
            );
            const matchesCategory = categoryFilter.length === 0 || categoryMatchScore > 0;
            if (matchesCategory) {
              items.push({
                id: item.id,
                type,
                title: item.title,
                thumbnail: item.cover_url || "https://placehold.co/600x800?text=Content",
                duration: type === "podcast" ? item.duration : "2 hours",
                views: 0,
                createdAt: item.created_at,
                creator: author ? {
                  id: author.id,
                  name: author.name || "Unknown",
                  avatar: author.avatar_url || "https://placehold.co/80x80?text=U",
                  username: author.username || "user",
                  followers: 0
                } : void 0,
                category: item.category || "",
                categories: itemCategories,
                featured: false,
                rating: 4.5,
                is_full_book: item.is_full_book ?? true,
                categoryMatchScore
              });
            }
          });
        };
        processContent(audiobooksResult.data || [], "audiobook");
        processContent(booksResult.data || [], "ebook");
        processContent(podcastsResult.data || [], "podcast");
        const sorted = items.sort((a, b) => {
          if (a.categoryMatchScore !== b.categoryMatchScore) {
            return b.categoryMatchScore - a.categoryMatchScore;
          }
          return Math.random() - 0.5;
        });
        setRecommendations(sorted.slice(0, 15));
      } catch (error) {
        console.error("Error fetching smart recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSmartRecommendations();
  }, [user, currentContent]);
  if (loading || recommendations.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    ContentCarousel,
    {
      title: user ? "Recommended for You" : "You May Also Like",
      items: recommendations
    }
  );
}
function CinematicCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setPlaylist, setCurrentTrackIndex, playAudio } = useAudio();
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const categories2 = [
          { name: "Business", description: "Master the art of success" },
          { name: "Psychology", description: "Understand the human mind" },
          { name: "Self-Help", description: "Transform your life" },
          { name: "Technology", description: "Embrace the future" },
          { name: "Philosophy", description: "Question everything" },
          { name: "Science", description: "Explore the universe" },
          { name: "History", description: "Learn from the past" },
          { name: "Entrepreneurship", description: "Build your empire" }
        ];
        const collectionsData = await Promise.all(
          categories2.map(async (category) => {
            var _a, _b, _c, _d;
            const [audiobooksResult, booksResult, podcastsResult] = await Promise.all([
              supabase.from("audiobooks").select("id, cover_url, title").eq("status", "published").contains("categories", [category.name]).order("created_at", { ascending: false }).limit(10),
              supabase.from("books").select("id, cover_url, title").eq("status", "published").eq("category", category.name).order("created_at", { ascending: false }).limit(10),
              supabase.from("podcast_episodes").select("id, cover_url, title").eq("status", "published").contains("categories", [category.name]).order("created_at", { ascending: false }).limit(10)
            ]);
            const allItems = [
              ...audiobooksResult.data || [],
              ...booksResult.data || [],
              ...podcastsResult.data || []
            ].filter((item) => item.cover_url);
            const seenIds = /* @__PURE__ */ new Set();
            const seenCovers = /* @__PURE__ */ new Set();
            const uniqueCovers = allItems.filter((item) => {
              if (seenIds.has(item.id) || seenCovers.has(item.cover_url)) {
                return false;
              }
              seenIds.add(item.id);
              seenCovers.add(item.cover_url);
              return true;
            }).slice(0, 4);
            const totalCount = (((_a = audiobooksResult.data) == null ? void 0 : _a.length) || 0) + (((_b = booksResult.data) == null ? void 0 : _b.length) || 0) + (((_c = podcastsResult.data) == null ? void 0 : _c.length) || 0);
            return {
              id: category.name.toLowerCase(),
              name: category.name,
              slug: category.name.toLowerCase().replace(/\s+/g, "-"),
              count: totalCount,
              mainCover: ((_d = uniqueCovers[0]) == null ? void 0 : _d.cover_url) || "",
              layeredCovers: uniqueCovers.slice(1, 4).map((item) => item.cover_url),
              description: category.description
            };
          })
        );
        setCollections(
          collectionsData.filter((c) => c.count > 0 && c.mainCover)
        );
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);
  if (loading || collections.length === 0) {
    return null;
  }
  const handleCollectionClick = async (collection) => {
    try {
      const categoryName = collection.name;
      const [audiobooksResult, podcastsResult] = await Promise.all([
        supabase.from("audiobooks").select(
          `
            id,
            title,
            cover_url,
            author:profiles!audiobooks_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `
        ).eq("status", "published").contains("categories", [categoryName]).order("created_at", { ascending: false }),
        supabase.from("podcast_episodes").select(
          `
            id,
            title,
            cover_url,
            author:profiles!podcast_episodes_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `
        ).eq("status", "published").contains("categories", [categoryName]).order("created_at", { ascending: false })
      ]);
      const normalizeAuthor = (author) => {
        const data = Array.isArray(author) ? author[0] : author;
        return {
          id: (data == null ? void 0 : data.id) || "",
          name: (data == null ? void 0 : data.name) || (data == null ? void 0 : data.username) || "Unknown Creator",
          avatar: (data == null ? void 0 : data.avatar_url) || "",
          username: (data == null ? void 0 : data.username) || "creator"
        };
      };
      const audiobooks = (audiobooksResult.data || []).map((item) => {
        const author = normalizeAuthor(item.author);
        return {
          id: item.id,
          title: item.title,
          author: author.name,
          authorId: author.id,
          authorUsername: author.username,
          thumbnail: item.cover_url || "",
          type: "audiobook",
          contentUrl: `/player/audiobook-${item.id}`
        };
      });
      const podcasts = (podcastsResult.data || []).map((item) => {
        const author = normalizeAuthor(item.author);
        return {
          id: item.id,
          title: item.title,
          author: author.name,
          authorId: author.id,
          authorUsername: author.username,
          thumbnail: item.cover_url || "",
          type: "podcast",
          contentUrl: `/player/podcast-${item.id}`
        };
      });
      const playlistItems = [...audiobooks, ...podcasts];
      if (playlistItems.length > 0) {
        setPlaylist(playlistItems);
        setCurrentTrackIndex(0);
        playAudio(playlistItems[0], true);
      }
    } catch (error) {
      console.error("Error loading collection playlist:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mb-12 -mx-4 md:mx-0 px-4 md:px-0", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-bold", children: "Popular Collections" }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6", children: collections.map((collection) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => handleCollectionClick(collection),
        className: "group relative bg-gradient-to-br from-background to-muted/30 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105",
        children: [
          /* @__PURE__ */ jsx("div", { className: "relative aspect-[3/4] p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full perspective-1000", children: [
            collection.layeredCovers.map((cover, idx) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "absolute inset-0 rounded-lg overflow-hidden shadow-xl transition-all duration-500 group-hover:scale-95",
                style: {
                  transform: `translateX(${(idx + 1) * 8}px) translateY(${(idx + 1) * 8}px) scale(${1 - (idx + 1) * 0.05})`,
                  zIndex: 3 - idx,
                  opacity: 0.6 - idx * 0.15
                },
                children: [
                  /* @__PURE__ */ jsx(
                    ImageLoader,
                    {
                      src: cover,
                      alt: `${collection.name} ${idx + 1}`,
                      className: "w-full h-full object-cover"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/20" })
                ]
              },
              idx
            )),
            /* @__PURE__ */ jsxs("div", { className: "relative rounded-lg overflow-hidden shadow-2xl z-10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl", children: [
              /* @__PURE__ */ jsx(
                ImageLoader,
                {
                  src: collection.mainCover,
                  alt: collection.name,
                  className: "w-full h-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300", children: /* @__PURE__ */ jsx(Play, { className: "w-6 h-6 text-black ml-1 fill-current" }) }) }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg group-hover:text-primary transition-colors line-clamp-1", children: collection.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-1", children: collection.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                collection.count,
                " items"
              ] }),
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity", children: "Collection" })
        ]
      },
      collection.id
    )) })
  ] });
}
function ContentCardSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-[180px] animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-lg overflow-hidden border shadow-sm", children: [
    /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] bg-muted" }),
    /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 bg-muted rounded w-3/4" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-full bg-muted" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-20" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-12" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-muted rounded w-12" })
      ] })
    ] })
  ] }) });
}
function ContentRowSkeleton() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-8", children: [
    /* @__PURE__ */ jsx("div", { className: "h-6 bg-muted rounded w-48 mb-4 animate-pulse" }),
    /* @__PURE__ */ jsx("div", { className: "flex overflow-x-auto gap-4 pb-2 scrollbar-hide", children: Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ jsx(ContentCardSkeleton, {}, i)) })
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
const isBrowser = typeof window !== "undefined";
const safeStorage = isBrowser && typeof window.localStorage !== "undefined" ? window.localStorage : {
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  }
};
const LOCAL_STORAGE_KEY = "inlits:home-content";
const getPlaceholderAvatar = (initial) => `https://placehold.co/80x80?text=${encodeURIComponent(initial || "U")}`;
function Home({ selectedCategory = "all", initialData }) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [allContent, setAllContent] = useState(() => {
    return {
      audiobooks: [],
      ebooks: [],
      articles: [],
      podcasts: []
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const shelfParam = searchParams.get("shelf");
  const [activeShelf, setActiveShelf] = useState(shelfParam);
  const [shelfName, setShelfName] = useState("");
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const cached = safeStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isFresh = Date.now() - parsed.timestamp < CACHE_DURATION;
        setAllContent({
          audiobooks: [...parsed.data.audiobooks],
          ebooks: [...parsed.data.ebooks],
          articles: [...parsed.data.articles],
          podcasts: [...parsed.data.podcasts]
        });
        setLoading(false);
        setInitialLoadComplete(true);
        contentCache.set("all-content", {
          data: parsed.data,
          timestamp: parsed.timestamp
        });
        if (!isFresh) {
          setInitialLoadComplete(false);
        }
      }
    } catch (error2) {
    }
  }, []);
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
          setShelfName("Custom Shelf");
        }
      };
      fetchShelfName();
    }
  }, [shelfParam]);
  useEffect(() => {
    let isMounted = true;
    const loadAllContent = async () => {
      try {
        setLoading(true);
        setError(null);
        let audiobooksData, booksData, podcastsData, viewsDataRaw, likesDataRaw;
        if (initialData && initialData.audiobooks && initialData.audiobooks.length > 0) {
          audiobooksData = initialData.audiobooks;
          booksData = initialData.books;
          podcastsData = initialData.podcasts;
          viewsDataRaw = initialData.views || [];
          likesDataRaw = initialData.likes || [];
        } else {
          const [
            audiobooksResult,
            booksResult,
            podcastsResult,
            viewsData,
            likesData
          ] = await Promise.all([
            supabase.from("audiobooks").select(
              `
                id,
                title,
                description,
                cover_url,
                created_at,
                featured,
                category,
                categories,
                is_full_book,
                author:profiles!audiobooks_author_id_fkey (
                  id,
                  name,
                  avatar_url,
                  username
                )
              `
            ).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
            supabase.from("books").select(
              `
                id,
                title,
                description,
                cover_url,
                created_at,
                featured,
                category,
                is_full_book,
                author:profiles!books_author_id_fkey (
                  id,
                  name,
                  avatar_url,
                  username
                )
              `
            ).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
            supabase.from("podcast_episodes").select(
              `
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
              `
            ).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
            supabase.from("content_views").select("content_id, content_type"),
            supabase.from("ratings").select("content_id, content_type, rating").eq("rating", 5)
          ]);
          if (audiobooksResult.error && booksResult.error && podcastsResult.error) {
            throw new Error(
              "Unable to load content. Please check your connection and try again."
            );
          }
          audiobooksData = audiobooksResult.data || [];
          booksData = booksResult.data || [];
          podcastsData = podcastsResult.data || [];
          viewsDataRaw = viewsData.data || [];
          likesDataRaw = likesData.data || [];
        }
        let userBookmarks = [];
        const bookmarksPromise = user ? supabase.from("bookmarks").select("content_id, content_type").eq("user_id", user.id) : Promise.resolve({ data: [] });
        const viewsMap = /* @__PURE__ */ new Map();
        viewsDataRaw.forEach((view) => {
          const key2 = `${view.content_type}:${view.content_id}`;
          viewsMap.set(key2, (viewsMap.get(key2) || 0) + 1);
        });
        const likesMap = /* @__PURE__ */ new Map();
        likesDataRaw.forEach((like) => {
          const key2 = `${like.content_type}:${like.content_id}`;
          likesMap.set(key2, (likesMap.get(key2) || 0) + 1);
        });
        const getViewCount = (contentId, contentType) => {
          return viewsMap.get(`${contentType}:${contentId}`) || 0;
        };
        const getLikeCount = (contentId, contentType) => {
          return likesMap.get(`${contentType}:${contentId}`) || 0;
        };
        const isBookmarked = (id, type) => {
          return false;
        };
        const normalizeAuthor = (author, fallbackId) => {
          var _a;
          const data = Array.isArray(author) ? author[0] : author;
          const name = typeof (data == null ? void 0 : data.name) === "string" ? data.name : typeof (data == null ? void 0 : data.username) === "string" ? data.username : "Unknown Creator";
          const initial = ((_a = name[0]) == null ? void 0 : _a.toUpperCase()) || "U";
          return {
            id: typeof (data == null ? void 0 : data.id) === "string" ? data.id : fallbackId,
            name,
            avatar: typeof (data == null ? void 0 : data.avatar_url) === "string" && data.avatar_url.trim().length > 0 ? data.avatar_url : getPlaceholderAvatar(initial),
            username: typeof (data == null ? void 0 : data.username) === "string" && data.username.length > 0 ? data.username : "creator"
          };
        };
        const resolveCategories = (item) => {
          if (item && typeof item === "object" && "categories" in item) {
            const candidate = item.categories;
            if (Array.isArray(candidate)) {
              return candidate.filter(
                (value) => typeof value === "string"
              );
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
        const audiobooks = audiobooksData.map((item) => ({
          id: item.id,
          type: "audiobook",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x600?audiobook&sig=${item.id}`,
          duration: "2 hours",
          views: getViewCount(item.id, "audiobook"),
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
          likes_count: getLikeCount(item.id, "audiobook"),
          is_full_book: item.is_full_book ?? true
        }));
        const books = booksData.map((item) => ({
          id: item.id,
          type: "ebook",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x600?book&sig=${item.id}`,
          duration: "4 hours",
          views: getViewCount(item.id, "book"),
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
          likes_count: getLikeCount(item.id, "book"),
          is_full_book: item.is_full_book ?? true
        }));
        const podcasts = podcastsData.map((item) => ({
          id: item.id,
          type: "podcast",
          title: item.title,
          thumbnail: item.cover_url || `https://source.unsplash.com/random/800x600?podcast&sig=${item.id}`,
          duration: item.duration,
          views: getViewCount(item.id, "podcast"),
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
          likes_count: getLikeCount(item.id, "podcast")
        }));
        const contentData = {
          audiobooks,
          ebooks: books,
          articles: [],
          podcasts
        };
        contentCache.set("all-content", {
          data: contentData,
          timestamp: Date.now()
        });
        if (!isMounted) {
          return;
        }
        setAllContent(contentData);
        setLoading(false);
        setInitialLoadComplete(true);
        bookmarksPromise.then(({ data: bookmarksData }) => {
          if (!isMounted || !bookmarksData || bookmarksData.length === 0)
            return;
          userBookmarks = bookmarksData;
          const updateBookmarks = (items) => items.map((item) => ({
            ...item,
            bookmarked: userBookmarks.some(
              (b) => b.content_id === item.id && b.content_type === item.type
            )
          }));
          setAllContent({
            audiobooks: updateBookmarks(contentData.audiobooks),
            ebooks: updateBookmarks(contentData.ebooks),
            articles: updateBookmarks(contentData.articles),
            podcasts: updateBookmarks(contentData.podcasts)
          });
        });
        setTimeout(() => {
          try {
            safeStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({ data: contentData, timestamp: Date.now() })
            );
          } catch (storageError) {
          }
        }, 0);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load content"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };
    const cached = contentCache.get("all-content");
    const hasFreshCache = cached && Date.now() - cached.timestamp < CACHE_DURATION;
    if (hasFreshCache && !initialData) {
      setAllContent(cached.data);
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }
    loadAllContent();
    return () => {
      isMounted = false;
    };
  }, [user, initialData]);
  const filteredContent = useMemo(() => {
    if (selectedCategory === "all") {
      return allContent;
    }
    const getCategoryNameFromSlug = (slug) => {
      const categoryMap = {
        business: "Business",
        "finance-investing": "Finance & Investing",
        psychology: "Psychology",
        philosophy: "Philosophy",
        "career-growth": "Career Growth",
        entrepreneurship: "Entrepreneurship",
        history: "History",
        politics: "Politics",
        "science-fiction": "Science Fiction",
        productivity: "Productivity",
        "self-help": "Self-Help",
        technology: "Technology",
        biographies: "Biographies",
        religion: "Religion",
        spirituality: "Spirituality",
        travel: "Travel",
        mathematics: "Mathematics",
        science: "Science",
        health: "Health"
      };
      return categoryMap[slug] || slug;
    };
    const targetCategoryName = getCategoryNameFromSlug(selectedCategory);
    const filterByCategory = (items) => {
      return items.filter((item) => {
        if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
          const hasExactMatch = item.categories.some((cat) => {
            if (!cat) return false;
            if (cat.toLowerCase() === targetCategoryName.toLowerCase()) {
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
            return true;
          }
        }
        if (item.category) {
          if (item.category.toLowerCase() === targetCategoryName.toLowerCase()) {
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
        return false;
      });
    };
    return {
      audiobooks: filterByCategory(allContent.audiobooks),
      ebooks: filterByCategory(allContent.ebooks),
      articles: [],
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
    }
  };
  if (loading && !initialLoadComplete) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsx(ContentRowSkeleton, {}),
      /* @__PURE__ */ jsx(ContentRowSkeleton, {}),
      /* @__PURE__ */ jsx(ContentRowSkeleton, {}),
      /* @__PURE__ */ jsx(ContentRowSkeleton, {})
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center text-center", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-md mx-auto px-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-destructive mx-auto" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Unable to Load Content" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "We're having trouble connecting to the server. Please check your internet connection and try again." })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            contentCache.clear();
            setInitialLoadComplete(false);
            setError(null);
            window.location.reload();
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
  const allContentItems = [
    ...filteredContent.audiobooks,
    ...filteredContent.ebooks,
    ...filteredContent.podcasts
  ];
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const trendingItems = allContentItems.sort((a, b) => b.views - a.views).slice(0, 15);
  const thisMonthDate = /* @__PURE__ */ new Date();
  thisMonthDate.setMonth(thisMonthDate.getMonth() - 1);
  const trendingIds = new Set(trendingItems.map((item) => item.id));
  const popularThisMonth = allContentItems.filter(
    (item) => new Date(item.createdAt) >= thisMonthDate && !trendingIds.has(item.id)
  ).sort((a, b) => b.views - a.views).slice(0, 15);
  const usedIds = /* @__PURE__ */ new Set([
    ...trendingItems.map((item) => item.id),
    ...popularThisMonth.map((item) => item.id)
  ]);
  const newReleases = allContentItems.filter((item) => !usedIds.has(item.id)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 15);
  if (selectedCategory !== "all") {
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
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 px-4 md:px-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: selectedCategory.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
            allContentItems.length,
            " ",
            allContentItems.length === 1 ? "item" : "items"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4", children: allContentItems.map((item) => /* @__PURE__ */ jsx(
          ContentCard,
          {
            item,
            activeShelf,
            onAddToShelf: handleAddToShelf
          },
          `${item.type}-${item.id}`
        )) })
      ] })
    ] });
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
    /* @__PURE__ */ jsxs("div", { className: "space-y-10 animate-fadeInUp", children: [
      /* @__PURE__ */ jsx(ContinueContent, {}),
      /* @__PURE__ */ jsx(
        ContentCarousel,
        {
          title: "🔥 Trending Now",
          items: trendingItems,
          activeShelf,
          onAddToShelf: handleAddToShelf
        }
      ),
      /* @__PURE__ */ jsx(CinematicCollections, {}),
      /* @__PURE__ */ jsx(
        ContentCarousel,
        {
          title: "⭐ Popular This Month",
          items: popularThisMonth,
          activeShelf,
          onAddToShelf: handleAddToShelf
        }
      ),
      /* @__PURE__ */ jsx(
        ContentCarousel,
        {
          title: "✨ New Releases",
          items: newReleases,
          activeShelf,
          onAddToShelf: handleAddToShelf
        }
      ),
      /* @__PURE__ */ jsx(
        ContentCarousel,
        {
          title: "🎙️ Top Podcasts",
          items: shuffleArray(filteredContent.podcasts).slice(0, 15),
          activeShelf,
          onAddToShelf: handleAddToShelf
        }
      ),
      /* @__PURE__ */ jsx(
        ContentCarousel,
        {
          title: "📚 Must-Read Books",
          items: shuffleArray(filteredContent.ebooks).slice(0, 15),
          activeShelf,
          onAddToShelf: handleAddToShelf
        }
      ),
      filteredContent.articles.length > 0 && /* @__PURE__ */ jsx(
        ContentCarousel,
        {
          title: "📝 Latest Articles",
          items: filteredContent.articles.slice(0, 15),
          activeShelf,
          onAddToShelf: handleAddToShelf
        }
      ),
      /* @__PURE__ */ jsx(SmartRecommendations, {})
    ] })
  ] });
}
async function loader$1({ request }) {
  const supabaseUrl2 = "https://yvjrakgbqqazedjltflw.supabase.co";
  const supabaseAnonKey2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU";
  const supabase2 = createClient(supabaseUrl2, supabaseAnonKey2, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  try {
    const [
      audiobooksResult,
      booksResult,
      podcastsResult,
      viewsData,
      likesData
    ] = await Promise.all([
      supabase2.from("audiobooks").select(
        `
          id,
          title,
          description,
          cover_url,
          created_at,
          featured,
          category,
          categories,
          is_full_book,
          author:profiles!audiobooks_author_id_fkey (
            id,
            name,
            avatar_url,
            username
          )
        `
      ).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
      supabase2.from("books").select(
        `
          id,
          title,
          description,
          cover_url,
          created_at,
          featured,
          category,
          is_full_book,
          author:profiles!books_author_id_fkey (
            id,
            name,
            avatar_url,
            username
          )
        `
      ).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
      supabase2.from("podcast_episodes").select(
        `
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
        `
      ).eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
      supabase2.from("content_views").select("content_id, content_type"),
      supabase2.from("ratings").select("content_id, content_type, rating").eq("rating", 5)
    ]);
    return json({
      audiobooks: audiobooksResult.data || [],
      books: booksResult.data || [],
      podcasts: podcastsResult.data || [],
      articles: [],
      views: viewsData.data || [],
      likes: likesData.data || []
    });
  } catch (error) {
    return json({
      audiobooks: [],
      books: [],
      podcasts: [],
      articles: [],
      views: [],
      likes: []
    });
  }
}
const categories = [
  { id: "1", name: "All", slug: "all" },
  { id: "2", name: "Business", slug: "business" },
  { id: "3", name: "Finance & Investing", slug: "finance-investing" },
  { id: "4", name: "Self-Help", slug: "self-help" },
  { id: "5", name: "Psychology", slug: "psychology" },
  { id: "6", name: "Career Growth", slug: "career-growth" },
  { id: "7", name: "Entrepreneurship", slug: "entrepreneurship" },
  { id: "8", name: "Productivity", slug: "productivity" },
  { id: "9", name: "Philosophy", slug: "philosophy" },
  { id: "10", name: "History", slug: "history" },
  { id: "11", name: "Politics", slug: "politics" },
  { id: "13", name: "Technology", slug: "technology" },
  { id: "14", name: "Biographies", slug: "biographies" },
  { id: "15", name: "Religion", slug: "religion" },
  { id: "16", name: "Spirituality", slug: "spirituality" },
  { id: "17", name: "Travel", slug: "travel" },
  { id: "19", name: "Science", slug: "science" },
  { id: "20", name: "Health", slug: "health" },
  { id: "12", name: "Science Fiction", slug: "science-fiction" }
];
function IndexRoute() {
  const initialData = useLoaderData();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(EmailVerificationBanner, {}),
    /* @__PURE__ */ jsx(Sidebar, { onCollapse: setSidebarCollapsed, defaultCollapsed: false }),
    /* @__PURE__ */ jsx(
      CategoriesScroll,
      {
        categories,
        selectedCategory,
        onSelectCategory: setSelectedCategory,
        collapsed: sidebarCollapsed
      }
    ),
    /* @__PURE__ */ jsx(
      "main",
      {
        className: `transition-all duration-300 pt-[7.5rem] ${sidebarCollapsed ? "ml-16" : "ml-64"}`,
        children: /* @__PURE__ */ jsx("div", { className: "container px-4 mx-auto pt-6", children: /* @__PURE__ */ jsx(Home, { initialData, selectedCategory }) })
      }
    )
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: IndexRoute,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function ProtectedRoute({
  children,
  roles,
  requireEmailVerification = true
}) {
  const { user, profile, loading } = useAuth();
  const location = useLocation$1();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-[400px] items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
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
const OnboardingQuiz = React__default.lazy(
  () => import("./onboarding-quiz-CYdnPZpL.js").then((module) => ({
    default: module.OnboardingQuiz
  }))
);
const BecomeCreatorPage = React__default.lazy(
  () => import("./become-creator-B5p143yW.js").then((module) => ({
    default: module.BecomeCreatorPage
  }))
);
const SignInPage = React__default.lazy(
  () => import("./sign-in-Dg4yoBhE.js").then((module) => ({
    default: module.SignInPage
  }))
);
const SignUpPage = React__default.lazy(
  () => import("./sign-up-BR47EJ04.js").then((module) => ({
    default: module.SignUpPage
  }))
);
const ForgotPasswordPage = React__default.lazy(
  () => import("./forgot-password-PYNHKU7y.js").then((module) => ({
    default: module.ForgotPasswordPage
  }))
);
const ResetPasswordPage = React__default.lazy(
  () => import("./reset-password-BFLh3NxT.js").then((module) => ({
    default: module.ResetPasswordPage
  }))
);
const VerifyEmailPage = React__default.lazy(
  () => import("./verify-email-Bz7Q2fnh.js").then((module) => ({
    default: module.VerifyEmailPage
  }))
);
const AuthCallbackPage = React__default.lazy(
  () => import("./callback-BX0EKDc1.js").then((module) => ({
    default: module.AuthCallbackPage
  }))
);
const QuickBitesPage = React__default.lazy(
  () => import("./quick-bites-8FJ0u54I.js").then((module) => ({
    default: module.QuickBitesPage
  }))
);
const FollowedPage = React__default.lazy(
  () => import("./followed-BZXPgtVH.js").then((module) => ({
    default: module.FollowedPage
  }))
);
const LibraryPage = React__default.lazy(
  () => import("./library-k5AZ4fSJ.js").then((module) => ({ default: module.LibraryPage }))
);
const CommunityPage = React__default.lazy(
  () => import("./community-C-r9Vhuh.js").then((module) => ({
    default: module.CommunityPage
  }))
);
const HistoryPage = React__default.lazy(
  () => import("./history-DMfla4Iz.js").then((module) => ({ default: module.HistoryPage }))
);
const CreatorProfilePage = React__default.lazy(
  () => import("./CreatorProfilePage-BQnFnlug.js").then((module) => ({
    default: module.CreatorProfilePage
  }))
);
const DashboardLayout = React__default.lazy(
  () => import("./index-DFTBU7NH.js").then((module) => ({
    default: module.DashboardLayout
  }))
);
const DashboardOverviewPage = React__default.lazy(
  () => import("./overview-jZnJEIve.js").then((module) => ({
    default: module.DashboardOverviewPage
  }))
);
const ContentPage = React__default.lazy(
  () => import("./index-BDVg6xJq.js").then((module) => ({
    default: module.ContentPage
  }))
);
const NewArticlePage = React__default.lazy(
  () => import("./article-KEw8jWU_.js").then((module) => ({
    default: module.NewArticlePage
  }))
);
const NewBookPage = React__default.lazy(
  () => import("./book-BSQUYvv2.js").then((module) => ({
    default: module.NewBookPage
  }))
);
const NewAudiobookPage = React__default.lazy(
  () => import("./audiobook-IUPB4kI4.js").then((module) => ({
    default: module.NewAudiobookPage
  }))
);
const NewPodcastPage = React__default.lazy(
  () => import("./podcast-fyWD0SBV.js").then((module) => ({
    default: module.NewPodcastPage
  }))
);
const EarningsPage = React__default.lazy(
  () => import("./index-Z7I1qMXD.js").then((module) => ({
    default: module.EarningsPage
  }))
);
const AppointmentsPage = React__default.lazy(
  () => import("./index-CtOT_RKg.js").then((module) => ({
    default: module.AppointmentsPage
  }))
);
const AnalyticsPage = React__default.lazy(
  () => import("./index-CAHPIbms.js").then((module) => ({
    default: module.AnalyticsPage
  }))
);
const SettingsPage = React__default.lazy(
  () => import("./index-FGTagi7l.js").then((module) => ({
    default: module.SettingsPage
  }))
);
const ReaderPage = React__default.lazy(
  () => import("./ReaderPage-CkM7LCrG.js").then((module) => ({
    default: module.ReaderPage
  }))
);
const PlayerPage = React__default.lazy(
  () => import("./PlayerPage-CIDvxAgR.js").then((module) => ({
    default: module.PlayerPage
  }))
);
const SearchPage = React__default.lazy(
  () => import("./search-GTjJwDg3.js").then((module) => ({ default: module.default }))
);
const ContactPage = React__default.lazy(
  () => import("./contact-D_EcOkD7.js").then((module) => ({ default: module.default }))
);
const PrivacyPage = React__default.lazy(
  () => import("./privacy-C0qK7-f2.js").then((module) => ({ default: module.PrivacyPage }))
);
const TermsPage = React__default.lazy(
  () => import("./terms-DtEPoQZF.js").then((module) => ({ default: module.TermsPage }))
);
const RefundPolicyPage = React__default.lazy(
  () => import("./refund-policy-BquxwcYo.js").then((module) => ({
    default: module.RefundPolicyPage
  }))
);
const CopyrightPage = React__default.lazy(
  () => import("./copyright-CHwWfBvt.js").then((module) => ({ default: module.default }))
);
const AboutPage = React__default.lazy(
  () => import("./about-I3zznZ8g.js").then((module) => ({ default: module.AboutPage }))
);
const SubscriptionPage = React__default.lazy(
  () => import("./index-DKPx8bQd.js").then((module) => ({
    default: module.SubscriptionPage
  }))
);
const SubscriptionPaymentPage = React__default.lazy(
  () => import("./payment-DhRJqm_Y.js").then((module) => ({
    default: module.SubscriptionPaymentPage
  }))
);
const SubscriptionVerifyPage = React__default.lazy(
  () => import("./verify-Ptrm2kMn.js").then((module) => ({
    default: module.SubscriptionVerifyPage
  }))
);
const SubscriptionConfirmPage = React__default.lazy(
  () => import("./confirm-BkU2thq7.js").then((module) => ({
    default: module.SubscriptionConfirmPage
  }))
);
const CollectionPlayerPage = React__default.lazy(
  () => import("./CollectionPlayerPage-C2B25Opf.js").then((module) => ({
    default: module.CollectionPlayerPage
  }))
);
function LoadingFallback() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-[400px] flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) });
}
function MainLayout({ children }) {
  const location = useLocation$1();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const urlParams = new URLSearchParams(location.search);
  const categoryFromUrl = urlParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
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
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "all";
    setSelectedCategory(category);
  }, [location.search]);
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
    { id: "4", name: "Self-Help", slug: "self-help" },
    { id: "5", name: "Psychology", slug: "psychology" },
    { id: "6", name: "Career Growth", slug: "career-growth" },
    { id: "7", name: "Entrepreneurship", slug: "entrepreneurship" },
    { id: "8", name: "Productivity", slug: "productivity" },
    { id: "9", name: "Philosophy", slug: "philosophy" },
    { id: "10", name: "History", slug: "history" },
    { id: "11", name: "Politics", slug: "politics" },
    { id: "13", name: "Technology", slug: "technology" },
    { id: "14", name: "Biographies", slug: "biographies" },
    { id: "15", name: "Religion", slug: "religion" },
    { id: "16", name: "Spirituality", slug: "spirituality" },
    { id: "17", name: "Travel", slug: "travel" },
    { id: "19", name: "Science", slug: "science" },
    { id: "20", name: "Health", slug: "health" },
    { id: "12", name: "Science Fiction", slug: "science-fiction" }
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
    isMobile && /* @__PURE__ */ jsx(Sidebar, { onCollapse: setSidebarCollapsed, defaultCollapsed: true }),
    isHomePage && /* @__PURE__ */ jsx(
      CategoriesScroll,
      {
        categories: categories2,
        selectedCategory,
        onSelectCategory: (category) => {
          setSelectedCategory(category);
          const params = new URLSearchParams(window.location.search);
          if (category === "all") {
            params.delete("category");
          } else {
            params.set("category", category);
          }
          const newUrl = params.toString() ? `/?${params.toString()}` : "/";
          window.history.pushState({}, "", newUrl);
        },
        collapsed: isMobile ? true : sidebarCollapsed
      }
    ),
    /* @__PURE__ */ jsx(
      "main",
      {
        className: `transition-all duration-300 will-change-transform ${isHomePage ? "pt-28" : "pt-16"} ${isMobile ? "pb-24" : "pb-8"} ${isMobile ? "ml-0 w-full" : sidebarCollapsed ? "ml-16" : "ml-64"}`,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `${isMobile ? "px-0 w-full" : "container px-4 mx-auto"}`,
            children: React__default.isValidElement(children) && React__default.cloneElement(children, {
              selectedCategory
            })
          }
        )
      }
    ),
    shouldShowFooter && /* @__PURE__ */ jsx(Footer, {})
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
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/get-started",
        element: /* @__PURE__ */ jsx(Navigate, { to: "/signup", replace: true })
      }
    ),
    /* @__PURE__ */ jsx(Route, { path: "/onboarding", element: /* @__PURE__ */ jsx(OnboardingQuiz, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/become-creator", element: /* @__PURE__ */ jsx(BecomeCreatorPage, {}) }),
    /* @__PURE__ */ jsxs(
      Route,
      {
        path: "/dashboard/:username/*",
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(DashboardLayout, {}) }),
        children: [
          /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(DashboardOverviewPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content", element: /* @__PURE__ */ jsx(ContentPage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content/new/article", element: /* @__PURE__ */ jsx(NewArticlePage, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "content/new/book", element: /* @__PURE__ */ jsx(NewBookPage, {}) }),
          /* @__PURE__ */ jsx(
            Route,
            {
              path: "content/new/audiobook",
              element: /* @__PURE__ */ jsx(NewAudiobookPage, {})
            }
          ),
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
        path: "/collection/:category",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(CollectionPlayerPage, {}) })
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
    /* @__PURE__ */ jsx(Route, { path: "/subscription", element: /* @__PURE__ */ jsx(SubscriptionPage, {}) }),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/subscription/payment",
        element: /* @__PURE__ */ jsx(SubscriptionPaymentPage, {})
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/subscription/verify",
        element: /* @__PURE__ */ jsx(SubscriptionVerifyPage, {})
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/subscription/confirm",
        element: /* @__PURE__ */ jsx(SubscriptionConfirmPage, {})
      }
    ),
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
        path: "/@:username",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(CreatorProfilePage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/user/:username",
        element: /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx(CreatorProfilePage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true }) })
  ] }) }) });
}
function loader({ params }) {
  params["*"];
  return null;
}
function CatchAllRoute() {
  return /* @__PURE__ */ jsx(App, {});
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CatchAllRoute,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CfBJ5VaK.js", "imports": ["/assets/supabase-Ybu9b-xV.js", "/assets/query-cache-C18JZZse.js", "/assets/components-CmcuS0ao.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-B4sRIMHz.js", "imports": ["/assets/supabase-Ybu9b-xV.js", "/assets/query-cache-C18JZZse.js", "/assets/components-CmcuS0ao.js", "/assets/auth-Ino_gIEi.js", "/assets/refresh-cw-Hp9NPpNZ.js", "/assets/pause-CPN_AXIA.js", "/assets/list-Dq_rf8zp.js", "/assets/lock-BZxqlrac.js", "/assets/zap-DMF34cmS.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-DfhQ435n.js", "imports": ["/assets/supabase-Ybu9b-xV.js", "/assets/home-Byd3MImq.js", "/assets/components-CmcuS0ao.js", "/assets/auth-Ino_gIEi.js", "/assets/query-cache-C18JZZse.js"], "css": [] }, "routes/$": { "id": "routes/$", "parentId": "root", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_-CXyhRJ1t.js", "imports": ["/assets/supabase-Ybu9b-xV.js", "/assets/home-Byd3MImq.js", "/assets/auth-Ino_gIEi.js", "/assets/query-cache-C18JZZse.js"], "css": [] } }, "url": "/assets/manifest-cbfb0a08.js", "version": "cbfb0a08" };
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
const build = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  assets: serverManifest,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
}, Symbol.toStringTag, { value: "Module" }));
export {
  ContentCard as C,
  ImageLoader as I,
  useOptimisticMutation as a,
  build as b,
  useTheme as c,
  detectUrduText as d,
  formatDate as e,
  formatTimeAgo as f,
  getTextLanguageClass as g,
  useAudio as h,
  searchContent as i,
  cn as j,
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
