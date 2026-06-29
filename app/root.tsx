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
import { Suspense, useEffect } from "react";
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
  { title: "Inlits: Urdu Audiobooks, Book Summaries & Self Growth" },
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
  const location = useLocation();
  const canonicalUrl = `https://inlits.com${location.pathname}${location.search ? location.search : ""}`;

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
        <link rel="canonical" href={canonicalUrl} />
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

function useClientSEO() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    let title = "Inlits: Urdu Audiobooks, Book Summaries & Self Growth";
    let description = "Read and listen to thousands of premium book summaries, audiobooks, and e-books in Urdu. Expand your mind and invest in your personal growth with Inlits.";

    if (pathname === "/") {
      title = "Inlits: Urdu Audiobooks, Book Summaries & Self Growth";
      description = "Read and listen to thousands of premium book summaries, audiobooks, and e-books in Urdu. Expand your mind and invest in your personal growth with Inlits.";
    } else if (pathname === "/search") {
      const query = searchParams.get("q");
      if (query) {
        const decodedQuery = decodeURIComponent(query);
        title = `Urdu Summary of "${decodedQuery}" | Listen & Read on Inlits`;
        description = `Access the complete Urdu audiobook summary and key takeaways of "${decodedQuery}" on Inlits. Start listening and investing in your growth today.`;
      } else {
        title = "Search Book Summaries & Audiobooks in Urdu - Inlits";
        description = "Search and discover Urdu summaries, audiobooks, and e-books on business, self-help, psychology, and productivity on Inlits.";
      }
    } else if (pathname.startsWith("/player/")) {
      const parts = pathname.split("/");
      const idParam = parts[parts.length - 1];
      const isPodcast = idParam ? idParam.startsWith("podcast") : false;
      
      let contentName = "";
      if (idParam) {
        const slugParts = idParam.split("-");
        const cleanedParts = slugParts.filter(p => p !== "audiobook" && p !== "podcast" && isNaN(Number(p)));
        contentName = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }

      if (contentName) {
        title = `Urdu Summary of "${contentName}" | Listen on Inlits`;
        description = `Listen to the comprehensive Urdu audiobook summary of "${contentName}" on Inlits. Access key insights and learn on the go.`;
      } else {
        title = isPodcast ? "Listen to Premium Urdu Podcasts - Inlits" : "Listen to Premium Urdu Audiobook Summaries - Inlits";
        description = isPodcast 
          ? "Explore premium Urdu podcasts on business, productivity, and mindset on Inlits."
          : "Listen to high-quality Urdu audiobook summaries of bestselling books on Inlits.";
      }
    } else if (pathname.startsWith("/reader/")) {
      const parts = pathname.split("/");
      const idParam = parts[parts.length - 1];
      let contentName = "";
      if (idParam) {
        const slugParts = idParam.split("-");
        const cleanedParts = slugParts.filter(p => p !== "ebook" && p !== "book" && isNaN(Number(p)));
        contentName = cleanedParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }

      if (contentName) {
        title = `Read "${contentName}" Urdu Summary & E-Book | Inlits`;
        description = `Read key takeaways, notes, and structured summaries of "${contentName}" in Urdu on Inlits. Expand your knowledge anywhere.`;
      } else {
        title = "Read Premium Urdu Summaries & E-Books - Inlits";
        description = "Read high-quality structured Urdu summaries and e-books on business, self-help, and productivity on Inlits.";
      }
    } else if (pathname === "/library") {
      title = "My Library | Personal Growth & Learning Goals - Inlits";
      description = "Track your learning goals, saved summaries, premium audiobooks, and history in your personal Inlits library.";
    } else if (pathname === "/community") {
      title = "Inlits Community | Book Clubs, Discussions & Study Groups";
      description = "Join Urdu book clubs, start discussions, form study groups, and take learning challenges with the Inlits community.";
    } else if (pathname === "/request-book") {
      title = "Request a Book Summary - Inlits Premium";
      description = "Request any book summary you want, and the Inlits team will research, write, and record it in Urdu in under 72 hours.";
    } else if (pathname === "/subscription") {
      title = "Inlits Premium Plans | Invest in Your Personal Growth";
      description = "Unlock unlimited Urdu audiobook summaries, e-books, high-quality ad-free audio, and custom book requests with Inlits Premium.";
    } else if (pathname === "/about") {
      title = "About Inlits | Urdu Audiobooks & Summaries Platform";
      description = "Discover the mission of Inlits. We make world-class books and summaries accessible in Urdu to empower learners across the globe.";
    } else if (pathname === "/contact") {
      title = "Contact Inlits Support | We are Here to Help";
      description = "Have questions or feedback? Get in touch with the Inlits support team for help with your account, billing, or suggestions.";
    } else if (pathname === "/privacy") {
      title = "Privacy Policy - Inlits";
      description = "Read the Inlits privacy policy to understand how we collect, use, and protect your personal information.";
    } else if (pathname === "/terms") {
      title = "Terms of Service - Inlits";
      description = "Read the Inlits terms of service and conditions for using our platform, audiobooks, and subscriptions.";
    }

    // Update document title
    document.title = title;

    // Update description meta tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Open Graph and Twitter tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);
  }, [location]);
}

function AppContent() {
  const { currentAudio, isPlayerVisible } = useAudio();
  useClientSEO();

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
