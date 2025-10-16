import { prefetchRouteData } from '@/lib/api/fetch-utils';

const isBrowser = typeof window !== 'undefined';

// Routes that should be prefetched
const PREFETCH_ROUTES = [
  { path: '/', prefetch: prefetchRouteData.home },
  { path: '/profile', prefetch: () => prefetchRouteData.profile('current') }
];

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (!isBrowser || typeof IntersectionObserver === 'undefined') {
    return null;
  }

  if (!observer) {
    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const route = PREFETCH_ROUTES.find(r => r.path === link.pathname);
            if (route) {
              route.prefetch().catch(console.error);
              observer?.unobserve(link);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  return observer;
}

// Helper to start observing links
export function observeLinks() {
  if (!isBrowser || typeof document === 'undefined') {
    return;
  }

  const instance = getObserver();
  if (!instance) {
    return;
  }

  const links = document.querySelectorAll('a');
  links.forEach(link => {
    if (PREFETCH_ROUTES.some(route => route.path === link.pathname)) {
      instance.observe(link);
    }
  });
}

// Clean up
export function stopObservingLinks() {
  observer?.disconnect();
}
