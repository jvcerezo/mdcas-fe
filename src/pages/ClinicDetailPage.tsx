/**
 * A single branch: what it offers, who works there, when they are in, and how
 * to book. Booking is by phone, so the contact details are given prominence.
 */

import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';

import { ServiceCard } from '@/components/ServiceCard';
import { StaffCard } from '@/components/StaffCard';
import {
  Badge,
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
import {
  ACCENTS,
  formatAddress,
  formatTimeRange,
  isOpenNow,
  summariseHours,
} from '@/lib/format';
import { DAY_NAMES, type DayOfWeek, type ScheduleEntry } from '@/types';

export function ClinicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: clinic, loading, error, reload } = useApi(
    (signal) => api.clinic(slug ?? '', signal),
    [slug],
  );

  if (loading) return <LoadingState label="Loading branch" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!clinic) return null;

  const accent = ACCENTS[clinic.accentColor];
  const open = isOpenNow(clinic.hours);
  const hours = summariseHours(clinic.hours);

  // Only clinicians belong in the roster table; assistants and front desk are
  // listed under the team but are not booked into a chair.
  const providers = clinic.staff.filter(
    (member) => member.role === 'Dentist' || member.role === 'Dental Hygienist',
  );

  return (
    <>
      {/* Hero */}
      <section className={cx('border-b hairline', accent.softBg)}>
        <Container>
          <div className="py-14 sm:py-20">
            <Link
              to="/clinics"
              className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              All branches
            </Link>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {clinic.isMainBranch ? (
                    <Badge className="border-bone-400 bg-white/70 text-ink-600">
                      Main branch
                    </Badge>
                  ) : null}
                  <Badge
                    className={cx(
                      open
                        ? 'border-[var(--color-slot-open-line)] bg-[var(--color-slot-open)] text-[var(--color-slot-open-ink)]'
                        : 'border-bone-400 bg-white/70 text-ink-400',
                    )}
                  >
                    {open ? 'Open now' : 'Closed now'}
                  </Badge>
                  <span className="text-xs text-ink-400 tabular">
                    Serving since {clinic.yearEstablished}
                  </span>
                </div>

                <h1 className="mt-6 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
                  {clinic.shortName}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
                  {clinic.description}
                </p>
              </div>

              {/* Booking card — the primary action on this page. */}
              <Card className="p-7 shadow-[var(--shadow-soft)]">
                <p className="text-xs font-semibold tracking-[0.12em] text-ink-400 uppercase">
                  Book an appointment
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  Call this branch directly. The front desk will find you a slot and confirm it
                  on the spot.
                </p>

                <a
                  href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
                  className="mt-6 flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-ink-900 text-base font-medium text-bone-50 transition-colors hover:bg-ink-700"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  <span className="tabular">{clinic.phone}</span>
                </a>

                {clinic.mobile ? (
                  <a
                    href={`tel:${clinic.mobile.replace(/[^\d+]/g, '')}`}
                    className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-full border bg-white text-sm font-medium text-ink-700 transition-colors hairline hover:border-ink-400"
                  >
                    <span className="tabular">{clinic.mobile}</span>
                    <span className="text-ink-400">· mobile</span>
                  </a>
                ) : null}

                <Link
                  to="/schedule"
                  className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden />
                  See this month's availability
                </Link>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Practical details */}
      <Section className="py-14">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-7">
              <MapPin className="h-5 w-5 text-ink-400" aria-hidden />
              <h2 className="mt-4 text-base font-medium">Where to find us</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                {formatAddress(clinic.address, true)}
              </p>
              {clinic.mapUrl ? (
                <a
                  href={clinic.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-brand-700 underline underline-offset-2"
                >
                  Open in Google Maps
                </a>
              ) : null}
              <a
                href={`mailto:${clinic.email}`}
                className="mt-4 flex items-center gap-2 text-sm break-all text-ink-600 transition-colors hover:text-brand-700"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
                {clinic.email}
              </a>
            </Card>

            <Card className="p-7">
              <Clock className="h-5 w-5 text-ink-400" aria-hidden />
              <h2 className="mt-4 text-base font-medium">Opening hours</h2>
              <dl className="mt-4 space-y-2 text-sm">
                {hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-4">
                    <dt className="text-ink-500">{row.days}</dt>
                    <dd className="text-ink-800 tabular">{row.time}</dd>
                  </div>
                ))}
              </dl>
              {clinic.hours.find((entry) => entry.note)?.note ? (
                <p className="mt-4 border-t pt-4 text-xs text-ink-400 hairline">
                  {clinic.hours.find((entry) => entry.note)?.note}
                </p>
              ) : null}
            </Card>

            <Card className="p-7">
              <ShieldCheck className="h-5 w-5 text-ink-400" aria-hidden />
              <h2 className="mt-4 text-base font-medium">At this branch</h2>
              <ul className="mt-4 space-y-2.5">
                {clinic.amenities.map((amenity) => (
                  <li key={amenity} className="flex gap-2.5 text-sm leading-relaxed text-ink-600">
                    <CheckCircle2
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500"
                      aria-hidden
                    />
                    {amenity}
                  </li>
                ))}
              </ul>
              {clinic.acceptedInsurers.length > 0 ? (
                <div className="mt-5 border-t pt-4 hairline">
                  <p className="text-xs tracking-wide text-ink-400 uppercase">HMOs accepted</p>
                  <p className="mt-2 text-sm text-ink-600">
                    {clinic.acceptedInsurers.join(' · ')}
                  </p>
                </div>
              ) : null}
            </Card>
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section className="border-t bg-bone-200/40 hairline">
        <Container>
          <SectionHeading
            eyebrow="Services"
            title={`What we offer at ${clinic.shortName}`}
            lead={`${clinic.services.length} treatments are available at this branch. Prices are indicative — your written estimate at the consultation is the one that counts.`}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clinic.services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Team */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="The team"
            title="Who you will see"
            lead={`${clinic.staff.length} clinicians and support staff work at this branch.`}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clinic.staff.map((member) => (
              <StaffCard key={member.slug} member={member} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Weekly roster */}
      {providers.length > 0 ? (
        <Section className="border-t bg-bone-200/40 pt-16 hairline">
          <Container>
            <SectionHeading
              eyebrow="Weekly roster"
              title="Who is in, and when"
              lead="Regular weekly hours for the clinicians at this branch. For a specific date, check the availability calendar."
            />
            <div className="mt-10">
              <RosterTable roster={clinic.roster} />
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

/** Weekly roster as a day-by-day list. Contains no patient data. */
function RosterTable({ roster }: { roster: ScheduleEntry[] }) {
  const byDay = new Map<DayOfWeek, ScheduleEntry[]>();
  for (const entry of roster) {
    const bucket = byDay.get(entry.day);
    if (bucket) bucket.push(entry);
    else byDay.set(entry.day, [entry]);
  }

  // Monday first — Sunday reads better at the end of the week.
  const days = ([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).filter((day) => byDay.has(day));

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-[color-mix(in_srgb,var(--color-ink-900)_7%,transparent)]">
        {days.map((day) => (
          <div key={day} className="grid gap-4 px-6 py-5 sm:grid-cols-[9rem_1fr]">
            <h3 className="text-sm font-medium text-ink-400">{DAY_NAMES[day]}</h3>
            <ul className="space-y-2.5">
              {byDay.get(day)?.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
                >
                  <span className="text-sm text-ink-800">
                    {entry.staff.name}
                    {entry.staff.credentials ? (
                      <span className="text-ink-400"> · {entry.staff.credentials}</span>
                    ) : null}
                  </span>
                  <span className="text-sm text-ink-500 tabular">
                    {formatTimeRange(entry.start, entry.end)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
