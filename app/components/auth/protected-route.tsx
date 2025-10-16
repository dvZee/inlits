import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  roles,
  requireEmailVerification = true
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  if (roles && (!profile || !roles.includes(profile.role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}