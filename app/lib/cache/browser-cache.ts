import { createCache } from './cache-utils';

const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const storage = isBrowser
  ? window.localStorage
  : ({
      get length() {
        return 0;
      },
      key: () => null,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    } as Storage);

// Browser cache implementation using localStorage with TTL (no-op during SSR)
const browserCache = createCache({
  storage,
  prefix: 'inlits_browser_',
  defaultTTL: 24 * 60 * 60 * 1000 // 24 hours
});

export { browserCache };
