import { useEffect, useState } from 'react';
import App from '@/App';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export function ClientOnlyApp() {
  const [isClient, setIsClient] = useState(false);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <App />;
}
