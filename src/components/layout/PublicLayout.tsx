import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer } from './Footer';
import { Header } from './Header';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/**
 * Shell for every public page.
 *
 * The organization details and branch list are fetched once here and shared
 * with the header and footer, so no page has to load them again.
 */
export function PublicLayout() {
  const location = useLocation();

  const { data: organization } = useApi((signal) => api.organization(signal), []);
  const { data: clinics } = useApi((signal) => api.clinics(signal), []);

  // React Router preserves scroll position across navigations; for a content
  // site, landing mid-page after following a link is disorienting.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:text-bone-50"
      >
        Skip to content
      </a>

      <Header hotline={organization?.hotline} />

      <main id="main" className="flex-1">
        <Outlet context={{ organization, clinics: clinics ?? [] }} />
      </main>

      <Footer organization={organization} clinics={clinics ?? []} />
    </div>
  );
}
