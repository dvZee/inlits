import type { LoaderFunctionArgs } from '@remix-run/node';
import App from '@/App';

export function loader({ params }: LoaderFunctionArgs) {
  params['*'];
  return null;
}

export default function CatchAllRoute() {
  return <App />;
}
