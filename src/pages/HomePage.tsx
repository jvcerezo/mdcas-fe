import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarCheck, Clock, MapPin, Phone } from 'lucide-react';

import {
  Badge,
  ButtonLink,
  Card,
  Container,
  ErrorState,
  Section,
  SectionHeading,
  cx,
} from '@/components/ui';
import { ServiceCard } from '@/components/ServiceCard';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { ACCENTS, formatAddress, isOpenNow, summariseHours } from '@/lib/format';
import type { Clinic } from '@/types';

export function HomePage() {
  const { data: organization } = useApi((signal) => api.organization(signal), []);
  const { data: clinics, error, reload } = useApi((signal) => api.clinics(signal), []);
  const { data: featured } = useApi(
    (signal) => api.services({ featured: true }, signal),
    [],
  );

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        {/* A single soft radial wash instead of a gradient banner — keeps the
            page feeling like paper rather than a template. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(120% 80% at 78% 0%, var(--color-brand-50) 0%, transparent 55%)',
          }}
        />

        <Container>
          <div className="grid items-center gap-16 py-20 sm:py-28 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:py-32">
            <div className="animate-rise">
              <Badge className="border-brand-200 bg-brand-50 text-brand-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
                </span>
                Live availability across all three branches
              </Badge>

              <h1 className="mt-7 text-[2.75rem] leading-[1.06] font-normal tracking-tight text-ink-900 sm:text-6xl lg:text-[4.25rem]">
                Know before
                <br />
                you call.
              </h1>

              <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-500">
                {organization?.description ??
                  'Maralit Dental Clinic has cared for Batangas families since 1998.'}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <ButtonLink to="/schedule" size="lg">
                  <CalendarCheck className="h-4 w-4" aria-hidden />
                  Check availability
                </ButtonLink>
                <ButtonLink to="/clinics" variant="secondary" size="lg">
                  Find your branch
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
              </div>

              <p className="mt-6 text-sm text-ink-400">
                Appointments are made by phone — see when a branch is free, then call.
              </p>
            </div>

            {/* A miniature of the real calendar. It sells the core feature far
                better than a stock photo of a dentist would. */}
            <div className="animate-rise lg:justify-self-end" style={{ animationDelay: '120ms' }}>
              <CalendarPreview />
            </div>
          </div>
        </Container>

        {organization ? (
          <Container>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-xl)] border bg-[color-mix(in_srgb,var(--color-ink-900)_8%,transparent)] hairline lg:grid-cols-4">
              {organization.stats.map((stat) => (
                <div key={stat.label} className="bg-bone-50 px-6 py-8 text-center">
                  <dt className="order-2 mt-2 text-xs tracking-wide text-ink-400 uppercase">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display text-3xl text-ink-900 tabular sm:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        ) : null}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Branches                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Three branches"
              title="Find the clinic nearest you"
              lead="Each branch keeps the same clinical standards and shares your records, so you can be seen wherever is convenient."
            />
            <Link
              to="/clinics"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-brand-700"
            >
              All branches
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {clinics?.map((clinic, index) => (
              <BranchCard key={clinic.slug} clinic={clinic} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* How booking works — the site does not book, so say so plainly.    */}
      {/* ---------------------------------------------------------------- */}
      <Section className="border-y bg-bone-200/50 hairline">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Booking takes one phone call"
            lead="We keep appointments on the phone so a real person can ask the right questions, check your history, and give you an honest time estimate."
            align="center"
          />

          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: 'Check the calendar',
                body: 'Open the availability page and find an hour marked open at your branch. Green means chairs are free.',
              },
              {
                icon: Phone,
                title: 'Call the branch',
                body: 'Ring the number on that branch page. Tell the front desk the day and time you saw, and what you need done.',
              },
              {
                icon: Clock,
                title: 'Get confirmed',
                body: 'The front desk books you with the right dentist and confirms your slot. It shows on the calendar right away.',
              },
            ].map((step, index) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-white hairline">
                    <step.icon className="h-4.5 w-4.5 text-brand-600" aria-hidden />
                  </span>
                  <span className="font-display text-sm text-ink-400 tabular">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl">{step.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Featured services                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Treatments"
              title="What we do most"
              lead="Indicative prices, published up front. Your written estimate at the consultation is the one that counts."
            />
            <Link
              to="/services"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-brand-700"
            >
              All services
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured?.slice(0, 6).map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing call to action                                            */}
      {/* ---------------------------------------------------------------- */}
      <Section className="pt-0">
        <Container>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-ink-900 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(90% 120% at 50% 0%, rgb(20 120 108 / 0.35) 0%, transparent 60%)',
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl leading-tight text-bone-50 sm:text-4xl">
                Toothache today? We keep slots open for emergencies.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-bone-300/80">
                Call the emergency line and we will get you seen at the nearest branch with a
                dentist on duty.
              </p>
              {organization ? (
                <a
                  href={`tel:${organization.emergencyHotline.replace(/[^\d+]/g, '')}`}
                  className="mt-9 inline-flex h-13 items-center gap-2.5 rounded-full bg-bone-50 px-8 text-base font-medium text-ink-900 transition-transform hover:scale-[1.02]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  <span className="tabular">{organization.emergencyHotline}</span>
                </a>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function BranchCard({ clinic, index }: { clinic: Clinic; index: number }) {
  const accent = ACCENTS[clinic.accentColor];
  const open = isOpenNow(clinic.hours);
  const hours = summariseHours(clinic.hours);

  return (
    <Card
      hover
      className="animate-rise flex flex-col p-7"
      // A short stagger makes the three cards feel deliberate rather than dumped.
      {...{ style: { animationDelay: `${index * 80}ms` } }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={cx('block h-1 w-9 rounded-full', accent.bg)} />
          <h3 className="mt-5 text-2xl">{clinic.shortName}</h3>
        </div>
        {clinic.isMainBranch ? (
          <Badge className="border-bone-300 bg-bone-200 text-ink-500">Main branch</Badge>
        ) : null}
      </div>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-500">{clinic.tagline}</p>

      <dl className="mt-7 space-y-3 text-sm">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          <dd className="leading-relaxed text-ink-600">{formatAddress(clinic.address)}</dd>
        </div>
        <div className="flex gap-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          <dd className="text-ink-600">
            {hours.slice(0, 2).map((row) => (
              <span key={row.days} className="block tabular">
                {row.days} · {row.time}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-7 flex items-center gap-2">
        <span
          className={cx(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
            open
              ? 'border-[var(--color-slot-open-line)] bg-[var(--color-slot-open)] text-[var(--color-slot-open-ink)]'
              : 'border-bone-300 bg-bone-200 text-ink-400',
          )}
        >
          <span
            className={cx(
              'h-1.5 w-1.5 rounded-full',
              open ? 'bg-[var(--color-slot-open-ink)]' : 'bg-ink-400',
            )}
          />
          {open ? 'Open now' : 'Closed now'}
        </span>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 border-t pt-6 hairline">
        <a
          href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
          className="text-sm font-medium text-ink-800 tabular transition-colors hover:text-brand-700"
        >
          {clinic.phone}
        </a>
        <Link
          to={`/clinics/${clinic.slug}`}
          className="group inline-flex items-center gap-1 text-sm font-medium text-brand-700"
        >
          View branch
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}

/**
 * A decorative, self-contained miniature of the availability grid. Uses fixed
 * sample values rather than live data — it illustrates the feature, and a real
 * fetch here would delay the hero for no benefit.
 */
function CalendarPreview() {
  const rows = [
    ['available', 'available', 'limited', 'available', 'full'],
    ['available', 'limited', 'full', 'full', 'available'],
    ['limited', 'full', 'available', 'limited', 'available'],
    ['available', 'available', 'limited', 'available', 'closed'],
  ] as const;

  const tone: Record<string, string> = {
    available: 'bg-[var(--color-slot-open)] border-[var(--color-slot-open-line)]',
    limited: 'bg-[var(--color-slot-filling)] border-[var(--color-slot-filling-line)]',
    full: 'bg-[var(--color-slot-full)] border-[var(--color-slot-full-line)]',
    closed: 'hatch bg-bone-200 border-bone-300',
  };

  return (
    <Card className="w-full max-w-sm p-7 shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg">Tanauan</p>
        <span className="text-xs text-ink-400">This week</span>
      </div>

      <div className="mt-6 grid grid-cols-[auto_repeat(5,1fr)] gap-1.5">
        <span />
        {['M', 'T', 'W', 'T', 'F'].map((day, index) => (
          <span key={index} className="pb-1 text-center text-[0.625rem] text-ink-400">
            {day}
          </span>
        ))}

        {rows.map((row, rowIndex) => (
          <Fragment key={rowIndex}>
            <span className="pr-2 text-right text-[0.625rem] leading-7 text-ink-400 tabular">
              {9 + rowIndex * 2 > 12 ? 9 + rowIndex * 2 - 12 : 9 + rowIndex * 2}
              {9 + rowIndex * 2 < 12 ? 'AM' : 'PM'}
            </span>
            {row.map((status, colIndex) => (
              <span
                key={colIndex}
                className={cx('h-7 rounded border', tone[status])}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 border-t pt-5 text-[0.6875rem] text-ink-500 hairline">
        {[
          ['available', 'Open'],
          ['limited', 'Filling up'],
          ['full', 'Booked'],
        ].map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className={cx('h-2.5 w-2.5 rounded-sm border', tone[key as string])} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}
