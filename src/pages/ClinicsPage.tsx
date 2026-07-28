import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';

import {
  Badge,
  Card,
  Container,
  ErrorState,
  LoadingState,
  Section,
  cx,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { ACCENTS, formatAddress, isOpenNow, summariseHours } from '@/lib/format';

export function ClinicsPage() {
  const { data: clinics, loading, error, reload } = useApi((signal) => api.clinics(signal), []);

  return (
    <>
      <Section className="pb-0">
        <Container>
          <p className="eyebrow mb-4">Our branches</p>
          <h1 className="max-w-3xl text-4xl leading-[1.1] sm:text-5xl">
            Three clinics across Batangas
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">
            The same clinical standards and shared patient records at every branch. Choose the
            one nearest you — or the one with the specialist you need.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          {loading ? (
            <LoadingState label="Loading branches" />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <div className="space-y-6">
              {clinics?.map((clinic) => {
                const accent = ACCENTS[clinic.accentColor];
                const open = isOpenNow(clinic.hours);
                const hours = summariseHours(clinic.hours);

                return (
                  <Card key={clinic.slug} hover className="overflow-hidden">
                    <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
                      <div className="p-8 sm:p-10">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={cx('h-1 w-9 rounded-full', accent.bg)} />
                          {clinic.isMainBranch ? (
                            <Badge className="border-bone-300 bg-bone-200 text-ink-500">
                              Main branch
                            </Badge>
                          ) : null}
                          <Badge
                            className={cx(
                              open
                                ? 'border-[var(--color-slot-open-line)] bg-[var(--color-slot-open)] text-[var(--color-slot-open-ink)]'
                                : 'border-bone-300 bg-bone-200 text-ink-400',
                            )}
                          >
                            {open ? 'Open now' : 'Closed now'}
                          </Badge>
                        </div>

                        <h2 className="mt-5 text-3xl">{clinic.shortName}</h2>
                        <p className="mt-3 text-lg text-ink-500">{clinic.tagline}</p>
                        <p className="mt-5 max-w-xl leading-relaxed text-ink-600">
                          {clinic.description}
                        </p>

                        <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                          {clinic.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink-600"
                            >
                              <span
                                className={cx(
                                  'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                                  accent.bg,
                                )}
                              />
                              {highlight}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                          <Link
                            to={`/clinics/${clinic.slug}`}
                            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-medium text-bone-50 transition-colors hover:bg-ink-700"
                          >
                            View this branch
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                          <Link
                            to="/schedule"
                            className="inline-flex h-11 items-center rounded-full border bg-white px-6 text-sm font-medium text-ink-800 transition-colors hairline hover:border-ink-400"
                          >
                            Check availability
                          </Link>
                        </div>
                      </div>

                      <div className="border-t bg-bone-100/70 p-8 hairline sm:p-10 lg:border-t-0 lg:border-l">
                        <dl className="space-y-6 text-sm">
                          <div className="flex gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                            <div>
                              <dt className="sr-only">Address</dt>
                              <dd className="leading-relaxed text-ink-700">
                                {formatAddress(clinic.address)}
                              </dd>
                              {clinic.mapUrl ? (
                                <a
                                  href={clinic.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1.5 inline-block text-xs font-medium text-brand-700 underline underline-offset-2"
                                >
                                  Get directions
                                </a>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                            <div>
                              <dt className="sr-only">Phone</dt>
                              <dd>
                                <a
                                  href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
                                  className="block text-ink-700 tabular transition-colors hover:text-brand-700"
                                >
                                  {clinic.phone}
                                </a>
                                {clinic.mobile ? (
                                  <a
                                    href={`tel:${clinic.mobile.replace(/[^\d+]/g, '')}`}
                                    className="block text-ink-500 tabular transition-colors hover:text-brand-700"
                                  >
                                    {clinic.mobile}
                                  </a>
                                ) : null}
                              </dd>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                            <div>
                              <dt className="sr-only">Email</dt>
                              <dd>
                                <a
                                  href={`mailto:${clinic.email}`}
                                  className="break-all text-ink-700 transition-colors hover:text-brand-700"
                                >
                                  {clinic.email}
                                </a>
                              </dd>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <dt className="sr-only">Opening hours</dt>
                              <dd className="space-y-1">
                                {hours.map((row) => (
                                  <div
                                    key={row.days}
                                    className="flex justify-between gap-4 text-ink-700"
                                  >
                                    <span>{row.days}</span>
                                    <span className="tabular">{row.time}</span>
                                  </div>
                                ))}
                              </dd>
                            </div>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
