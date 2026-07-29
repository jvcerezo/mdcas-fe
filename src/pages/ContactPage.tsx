/**
 * Contact and "how to book".
 *
 * There is intentionally no booking form. Appointments are taken by phone so
 * the front desk can check history and give an honest time estimate — saying
 * that plainly is better than a form that silently goes nowhere.
 */

import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, Mail, MapPin, Phone, TriangleAlert } from 'lucide-react';

import {
  Card,
  Container,
  ErrorState,
  LoadingState,
  Section,
  SectionHeading,
  cx,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { ACCENTS, formatAddress, summariseHours } from '@/lib/format';

export function ContactPage() {
  const { data: organization } = useApi((signal) => api.organization(signal), []);
  const { data: clinics, loading, error, reload } = useApi((signal) => api.clinics(signal), []);

  return (
    <>
      <Section className="pb-0">
        <Container>
          <p className="eyebrow mb-4">Contact</p>
          <h1 className="max-w-3xl text-4xl leading-[1.1] sm:text-5xl">
            Booking takes one phone call
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">
            We take appointments by phone rather than through a form. It means a real person
            can check your history, ask what is actually wrong, and give you a realistic
            estimate of the time you will need in the chair.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/schedule"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-brand-700"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden />
              Check availability first
            </Link>
            {organization ? (
              <a
                href={`tel:${organization.hotline.replace(/[^\d+]/g, '')}`}
                className="inline-flex h-12 items-center gap-2 rounded-full border bg-white px-6 text-sm font-medium text-ink-800 transition-colors hairline hover:border-ink-400"
              >
                <Phone className="h-4 w-4 text-brand-600" aria-hidden />
                <span className="tabular">{organization.hotline}</span>
              </a>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* Emergency */}
      {organization ? (
        <Section className="py-12">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-[var(--radius-xl)] border border-[var(--color-slot-full-line)] bg-[var(--color-slot-full)] px-7 py-6">
              <div className="flex gap-4">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-slot-full-ink)]"
                  aria-hidden
                />
                <div>
                  <h2 className="text-base font-medium text-[var(--color-slot-full-ink)]">
                    Dental emergency
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-slot-full-ink)]/80">
                    Severe pain, swelling, a knocked-out tooth or bleeding that will not stop.
                  </p>
                </div>
              </div>
              <a
                href={`tel:${organization.emergencyHotline.replace(/[^\d+]/g, '')}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-slot-full-ink)] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                <span className="tabular">{organization.emergencyHotline}</span>
              </a>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Per-branch contact */}
      <Section className="pt-4">
        <Container>
          <SectionHeading
            eyebrow="Call a branch"
            title="Reach the clinic directly"
            lead="Each branch keeps its own front desk. Call the one you want to be seen at — they can also book you into another branch if a specialist you need is there."
          />

          {loading ? (
            <LoadingState label="Loading branches" />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {clinics?.map((clinic) => {
                const accent = ACCENTS[clinic.accentColor];
                const hours = summariseHours(clinic.hours);

                return (
                  <Card key={clinic.slug} hover className="flex flex-col p-7">
                    <span className={cx('h-1 w-9 rounded-full', accent.bg)} />
                    <h3 className="mt-5 text-xl">{clinic.shortName}</h3>

                    <a
                      href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
                      className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-brand-700"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      <span className="tabular">{clinic.phone}</span>
                    </a>

                    <dl className="mt-6 flex-1 space-y-4 text-sm">
                      {clinic.mobile ? (
                        <div className="flex gap-3">
                          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
                          <dd>
                            <a
                              href={`tel:${clinic.mobile.replace(/[^\d+]/g, '')}`}
                              className="text-ink-600 tabular transition-colors hover:text-brand-700"
                            >
                              {clinic.mobile}
                            </a>
                          </dd>
                        </div>
                      ) : null}

                      <div className="flex gap-3">
                        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
                        <dd>
                          <a
                            href={`mailto:${clinic.email}`}
                            className="break-all text-ink-600 transition-colors hover:text-brand-700"
                          >
                            {clinic.email}
                          </a>
                        </dd>
                      </div>

                      <div className="flex gap-3">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
                        <dd className="leading-relaxed text-ink-600">
                          {formatAddress(clinic.address)}
                        </dd>
                      </div>

                      <div className="flex gap-3">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
                        <dd className="min-w-0 flex-1 space-y-1">
                          {hours.map((row) => (
                            <span key={row.days} className="flex justify-between gap-3 text-ink-600">
                              <span>{row.days}</span>
                              <span className="tabular">{row.time}</span>
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      to={`/clinics/${clinic.slug}`}
                      className="mt-6 border-t pt-5 text-sm font-medium text-brand-700 hairline"
                    >
                      View branch details →
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      {/* What to have ready */}
      <Section className="border-t bg-surface-100/40 hairline">
        <Container>
          <SectionHeading
            eyebrow="Before you call"
            title="Have these ready"
            lead="It makes the call quicker and gets you a more accurate slot."
            align="center"
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
            {[
              {
                title: 'A day and time from the calendar',
                body: 'Check the availability page and note an hour marked open at your branch.',
              },
              {
                title: 'What is bothering you',
                body: 'Even roughly — "pain in a lower back tooth" helps us allocate the right amount of chair time.',
              },
              {
                title: 'Your HMO card, if you have one',
                body: 'We will need the card number to start an approval before your visit.',
              },
              {
                title: 'Previous x-rays or records',
                body: 'If you have been treated elsewhere, bring what you have to the appointment.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[var(--radius-lg)] border bg-white p-6 hairline">
                <h3 className="text-base font-medium">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-500">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
