import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { Suspense } from "react";
import styles from "./index.css?url";
import { ThemeProvider } from "@/components/theme-provider";
import { ConnectionProvider } from "@/lib/connection-context";
import { AudioProvider } from "@/lib/audio-context";
import { ErrorBoundary as NetworkErrorBoundary } from "@/components/error-boundary";
import { AudioPlayer } from "@/components/audio/audio-player";
import { GlobalAudioPlayer } from "@/components/audio/global-audio-player";
import { useAudio } from "@/lib/audio-context";
import { Loader2, AlertCircle } from "lucide-react";

export const meta: MetaFunction = () => [
  { charSet: "utf-8" },
  { title: "Inlits" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/svg+xml", href: "/book-open.svg", sizes: "any" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/Black & Blue Minimalist Modern Initial Font Logo.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/Black & Blue Minimalist Modern Initial Font Logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/Black & Blue Minimalist Modern Initial Font Logo.png",
  },
  {
    rel: "shortcut icon",
    href: "/book-open.svg",
  },
  { rel: "preconnect", href: "https://placehold.co" },
  { rel: "dns-prefetch", href: "https://placehold.co" },
];

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
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
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <ConnectionProvider>
      <ThemeProvider defaultTheme="system" storageKey="inlits-theme">
        <AudioProvider currentPathname={location.pathname}>
          <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
        </AudioProvider>
      </ThemeProvider>
    </ConnectionProvider>
  );
}

function AppContent() {
  const { currentAudio, isPlayerVisible } = useAudio();

  return (
    <>
      <div className="transition-opacity duration-300">
        <Outlet />
      </div>
      <GlobalAudioPlayer />
      {currentAudio && isPlayerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
          <AudioPlayer
            title={currentAudio.title}
            author={currentAudio.author}
            thumbnail={currentAudio.thumbnail}
            type={currentAudio.type}
            authorId={currentAudio.authorId}
            authorUsername={currentAudio.authorUsername}
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Document>
      <AppProviders>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          }
        >
          <AppContent />
        </Suspense>
      </AppProviders>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const isNetworkError =
    error instanceof Error &&
    (error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("fetch") ||
      error.message?.toLowerCase().includes("connection"));

  return (
    <Document title="Application Error">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-semibold">
          {isNetworkError ? "Connection Issue" : "Something Went Wrong"}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {isNetworkError
            ? "We're having trouble connecting to the server. Please check your internet connection and try again."
            : "We encountered an unexpected error while loading this page. Please try refreshing, or come back later if the issue persists."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
        {process.env.NODE_ENV !== "production" && error instanceof Error && (
          <code className="max-w-md overflow-x-auto rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
            {error.message}
          </code>
        )}
      </div>
    </Document>
  );
}
