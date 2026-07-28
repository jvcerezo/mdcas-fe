import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/components/ui';
import { useAuth } from '@/lib/auth';

/**
 * Guards the staff portal.
 *
 * Waits for the stored token to be revalidated before deciding — redirecting
 * during that window would bounce a signed-in user to the login page on every
 * refresh.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Checking your session" />
      </div>
    );
  }

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
