import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutList, LogOut } from 'lucide-react';

import { Container, cx } from '@/components/ui';
import { useAuth } from '@/lib/auth';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  dentist: 'Dentist',
  frontdesk: 'Front desk',
};

export function StaffLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/staff/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md hairline">
        <Container wide>
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-baseline gap-2.5">
                <span className="font-display text-base text-ink-900">Maralit Dental</span>
                <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.1em] text-surface-0 uppercase">
                  Staff
                </span>
              </Link>

              <nav className="hidden items-center gap-1 sm:flex" aria-label="Staff portal">
                {[
                  { to: '/staff/today', label: 'Today', icon: LayoutList },
                  { to: '/staff/schedule', label: 'Schedule', icon: CalendarDays },
                ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cx(
                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-surface-100 text-ink-900'
                          : 'text-ink-500 hover:bg-surface-50 hover:text-ink-900',
                      )
                    }
                  >
                    <link.icon className="h-4 w-4" aria-hidden />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-ink-800">{user?.name}</p>
                <p className="text-xs text-ink-400">
                  {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                  {user && user.clinicSlugs.length > 0
                    ? ` · ${user.clinicSlugs.join(', ')}`
                    : ' · all branches'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm text-ink-600 transition-colors hairline hover:border-ink-400 hover:text-ink-900"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="flex gap-1 border-t py-2 hairline sm:hidden" aria-label="Staff portal">
            {[
              { to: '/staff/today', label: 'Today' },
              { to: '/staff/schedule', label: 'Schedule' },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'flex-1 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors',
                    isActive ? 'bg-surface-100 text-ink-900' : 'text-ink-500',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </Container>
      </header>

      <main className="flex-1 py-8">
        <Outlet />
      </main>
    </div>
  );
}
