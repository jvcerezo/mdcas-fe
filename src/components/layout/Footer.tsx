import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

import { Container } from '@/components/ui';
import { formatAddress } from '@/lib/format';
import type { Clinic, Organization } from '@/types';

export function Footer({
  organization,
  clinics,
}: {
  organization: Organization | null;
  clinics: Clinic[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-surface-100/60 hairline">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div>
            <p className="font-display text-2xl text-ink-900">
              {organization?.name ?? 'Maralit Dental Clinic'}
            </p>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-500">
              {organization?.tagline ?? 'Three branches across Batangas. One standard of care.'}
            </p>

            <div className="mt-8 flex flex-col gap-2.5 text-sm">
              {organization ? (
                <>
                  <a
                    href={`tel:${organization.hotline.replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center gap-2.5 text-ink-700 transition-colors hover:text-brand-700"
                  >
                    <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    <span className="tabular">{organization.hotline}</span>
                  </a>
                  <a
                    href={`mailto:${organization.email}`}
                    className="inline-flex items-center gap-2.5 text-ink-700 transition-colors hover:text-brand-700"
                  >
                    <Mail className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {organization.email}
                  </a>
                </>
              ) : null}
            </div>

            {organization ? (
              <div className="mt-8 flex gap-2">
                <SocialLink href={organization.social.facebook} label="Facebook">
                  <Facebook className="h-4 w-4" />
                </SocialLink>
                <SocialLink href={organization.social.instagram} label="Instagram">
                  <Instagram className="h-4 w-4" />
                </SocialLink>
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
              Branches
            </h3>
            <ul className="mt-5 space-y-4">
              {clinics.map((clinic) => (
                <li key={clinic.slug}>
                  <Link
                    to={`/clinics/${clinic.slug}`}
                    className="group block text-sm text-ink-700 transition-colors hover:text-brand-700"
                  >
                    <span className="font-medium">{clinic.shortName}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-400">
                      {formatAddress(clinic.address)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { to: '/schedule', label: 'Check availability' },
                { to: '/services', label: 'Services & pricing' },
                { to: '/clinics', label: 'Find a branch' },
                { to: '/about', label: 'About the practice' },
                { to: '/contact', label: 'Book an appointment' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-ink-600 transition-colors hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t pt-8 text-xs text-ink-400 hairline sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {organization?.name ?? 'Maralit Dental Clinic'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {organization ? (
              <span>
                Dental emergency:{' '}
                <a
                  href={`tel:${organization.emergencyHotline.replace(/[^\d+]/g, '')}`}
                  className="tabular font-medium text-ink-600 transition-colors hover:text-brand-700"
                >
                  {organization.emergencyHotline}
                </a>
              </span>
            ) : null}
            <Link to="/staff/login" className="transition-colors hover:text-ink-700">
              Staff sign in
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border text-ink-500 transition-all hairline hover:border-ink-400 hover:text-ink-900"
    >
      {children}
    </a>
  );
}
