import type { LoaderFunctionArgs } from '@remix-run/node';
import { ClientOnlyApp } from '@/components/client-only-app';

export function loader({ params }: LoaderFunctionArgs) {
  // Allow Remix to serve all unmatched routes so the client router can handle them.
  params['*'];
  return null;
}

export default function CatchAllRoute() {
  return <ClientOnlyApp />;
}
