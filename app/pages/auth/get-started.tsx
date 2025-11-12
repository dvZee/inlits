import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';

export function GetStartedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/signup', { replace: true });
  }, [navigate]);

  return null;
}
