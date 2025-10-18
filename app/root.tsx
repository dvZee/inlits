import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
 Outlet,
  Scripts,
  ScrollRestoration,
  useLocation
} from '@remix-run/react';
import { Suspense } from 'react';
import styles from './index.css?url';
import { ThemeProvider } from '@/components/theme-provider';
import { ConnectionProvider } from '@/lib/connection-context';
import { AudioProvider } from '@/lib/audio-context';
import { ErrorBoundary as NetworkErrorBoundary } from '@/components/error-boundary';
import { Loader2 } from 'lucide-react';

export const meta: MetaFunction = () => [
  { charSet: 'utf-8' },
  { title: 'Inlits' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1' }
];

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'preconnect', href: 'https://placehold.co' },
  { rel: 'dns-prefetch', href: 'https://placehold.co' }
];

function Document({
  children,
  title
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
            `
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
          <Outlet />
        </Suspense>
      </AppProviders>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  console.error(error);
  return (
    <Document title="Application error">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-muted-foreground">
          We encountered an unexpected error while loading this page. Please try
          refreshing, or come back later if the issue persists.
        </p>
        <code className="max-w-md overflow-x-auto rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </code>
      </div>
    </Document>
  );
}
