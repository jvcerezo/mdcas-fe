import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Phone, X } from 'lucide-react';

import { Container, cx } from '@/components/ui';

const NAV_LINKS = [
  { to: '/clinics', label: 'Our branches' },
  { to: '/services', label: 'Services' },
  { to: '/schedule', label: 'Availability' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Header({ hotline }: { hotline?: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever navigation happens.
  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent the page scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b bg-bone-100/85 backdrop-blur-md hairline'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between gap-8 py-4">
          <Link to="/" className="group flex items-center gap-3" aria-label="Maralit Dental Clinic — home">
            <Mark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.0625rem] tracking-tight text-ink-900">
                Maralit Dental
              </span>
              <span className="mt-1 text-[0.6875rem] tracking-[0.16em] text-ink-400 uppercase">
                Batangas
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'relative rounded-full px-4 py-2 text-[0.9375rem] transition-colors',
                    isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive ? (
                      <span className="absolute inset-x-4 -bottom-0.5 h-px bg-brand-600" />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {hotline ? (
              <a
                href={`tel:${hotline.replace(/[^\d+]/g, '')}`}
                className="hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-ink-800 transition-colors hairline hover:border-ink-400 sm:inline-flex"
              >
                <Phone className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                <span className="tabular">{hotline}</span>
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-bone-200 lg:hidden"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {open ? (
        <div className="animate-fade border-t bg-bone-100 hairline lg:hidden">
          <Container className="py-4">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cx(
                      'border-b py-3.5 text-base transition-colors hairline last:border-0',
                      isActive ? 'text-ink-900' : 'text-ink-500',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/staff/login"
                className="mt-4 text-sm text-ink-400 transition-colors hover:text-ink-700"
              >
                Staff sign in →
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

/** The wordmark: a tooth abstracted to two arcs. */
function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-bone-50 transition-transform duration-300 group-hover:scale-105">
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
        <path
          d="M6 3.6c-1.9 0-3 1.5-3 3.6 0 2.4.7 4 1.4 6.2.5 1.6.8 3.3 1 5 .1 1.1.6 2 1.5 2 1 0 1.4-.9 1.6-2l.6-3.6c.1-.9.5-1.4 1.4-1.4s1.3.5 1.4 1.4l.6 3.6c.2 1.1.6 2 1.6 2 .9 0 1.4-.9 1.5-2 .2-1.7.5-3.4 1-5C20.3 11.2 21 9.6 21 7.2c0-2.1-1.1-3.6-3-3.6-1.4 0-2.2.5-3.2 1-.9.5-1.7.8-2.8.8s-1.9-.3-2.8-.8c-1-.5-1.8-1-3.2-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
