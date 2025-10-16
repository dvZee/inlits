import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function GetStartedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/signup', { replace: true });
  }, [navigate]);

  return null;
}
