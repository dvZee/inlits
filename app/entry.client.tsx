import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';
import { observeLinks, prefetchLikelyRoutes } from '@/lib/route-prefetcher';

const requestIdleCallback =
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = event.message ?? '';
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('xhr')
    ) {
      console.error('Network error detected:', message);
      window.dispatchEvent(
        new CustomEvent('network:error', {
          detail: { message }
        })
      );
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message ?? String(event.reason ?? '');
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      message.includes('xhr')
    ) {
      console.error('Network promise rejection detected:', message);
      window.dispatchEvent(
        new CustomEvent('network:error', {
          detail: { message }
        })
      );
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('New version available:', event.data.version);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );

  observeLinks();
  requestIdleCallback(() => {
    prefetchLikelyRoutes();
  });
});
