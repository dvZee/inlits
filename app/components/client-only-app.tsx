import { useEffect, useState } from 'react';
import App from '@/App';

/**
 * Bridges the existing client-side router in App.tsx into Remix by
 * delaying rendering until we're firmly in the browser.
 */
export function ClientOnlyApp() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <App />;
}
