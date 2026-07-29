/**
 * The centralized availability page.
 *
 * Layout intent — the previous version stacked three separate control bands
 * (branch tabs, month navigation, legend) above the calendar, so nothing had
 * priority and everything competed. This version has one decision per band:
 *
 *   1. Which branch?      — full-width selector cards, with location context
 *   2. Which day?         — the calendar, month navigation inside its header
 *   3. What do I do now?  — map, directions, phone, and the day's hours
 *
 * Everything shown is public and redacted: hours are marked open, filling up,
 * fully booked or closed, and nothing else is exposed.
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Info, MapPin } from 'lucide-react';

import { BranchPanel } from '@/components/schedule/BranchPanel';
import { DayDetail } from '@/components/schedule/DayDetail';
import { MonthGrid, ScheduleLegend } from '@/components/schedule/MonthGrid';
import { Container, ErrorState, LoadingState, Spinner, cx } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { currentMonth, formatMonth, isOpenNow, shiftMonth, todayISO } from '@/lib/format';

export function SchedulePage() {
  const [month, setMonth] = useState(currentMonth());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Full clinic records carry the coordinates, address and hours the map and
  // directions panel needs — the schedule payload deliberately stays minimal.
  const { data: clinics } = useApi((signal) => api.clinics(signal), []);

  const { data, loading, error, reload } = useApi(
    (signal) => api.allSchedules(month, signal),
    [month],
  );

  const schedules = data?.clinics ?? [];
  const current =
    schedules.find((schedule) => schedule.clinic.slug === activeSlug) ?? schedules[0];
  const currentClinic = clinics?.find((clinic) => clinic.slug === current?.clinic.slug);

  // Default to the first branch, and keep the selected day valid when the
  // month or branch changes underneath it.
  useEffect(() => {
    if (!current) return;
    if (!activeSlug) setActiveSlug(current.clinic.slug);

    const today = todayISO();
    const stillValid =
      selectedDate && current.days.some((day) => day.date === selectedDate && !day.closed);

    if (!stillValid) {
      const preferred =
        current.days.find((day) => day.date === today && !day.closed) ??
        current.days.find((day) => day.date >= today && !day.closed) ??
        current.days.find((day) => !day.closed);
      setSelectedDate(preferred?.date ?? null);
    }
  }, [current, activeSlug, selectedDate]);

  const selectedDay = current?.days.find((day) => day.date === selectedDate) ?? null;

  return (
    <>
      {/* Page header */}
      <section className="border-b border-surface-200 bg-white">
        <Container>
          <div className="py-14 sm:py-16">
            <p className="eyebrow mb-3">Availability</p>
            <h1 className="max-w-2xl text-4xl leading-[1.1] sm:text-5xl">
              Find a free slot, then call
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
              Live availability at all three branches. Appointments are booked by phone, so
              pick a time that suits you and ring the clinic directly.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {/* 1 — Branch selector */}
        <div role="tablist" aria-label="Branch" className="grid gap-3 sm:grid-cols-3">
          {schedules.map((schedule) => {
            const clinic = clinics?.find((entry) => entry.slug === schedule.clinic.slug);
            const isActive = schedule.clinic.slug === current?.clinic.slug;
            const open = clinic ? isOpenNow(clinic.hours) : false;

            return (
              <button
                key={schedule.clinic.slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSlug(schedule.clinic.slug)}
                className={cx(
                  'group rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-200',
                  isActive
                    ? 'border-brand-500 bg-brand-50 shadow-[var(--shadow-hair)] ring-2 ring-brand-500/20'
                    : 'border-surface-200 bg-white hover:border-brand-300 hover:shadow-[var(--shadow-hair)]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cx(
                      'text-[0.9375rem] font-bold',
                      isActive ? 'text-brand-800' : 'text-ink-800',
                    )}
                  >
                    {schedule.clinic.shortName}
                  </span>
                  <span
                    className={cx(
                      'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                      open ? 'bg-[var(--color-slot-open-ink)]' : 'bg-surface-300',
                    )}
                    aria-hidden
                  />
                </div>

                <span
                  className={cx(
                    'mt-1.5 flex items-center gap-1.5 text-xs',
                    isActive ? 'text-brand-700' : 'text-ink-400',
                  )}
                >
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                  {clinic
                    ? `${clinic.address.barangay ?? clinic.address.line1}, ${clinic.address.city}`
                    : 'Los Baños'}
                </span>
              </button>
            );
          })}
        </div>

        {loading && !current ? (
          <LoadingState label="Loading availability" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : current ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
            {/* 2 — Calendar */}
            <div className="rounded-[var(--radius-xl)] border border-surface-200 bg-white shadow-[var(--shadow-hair)]">
              <div className="flex items-center justify-between gap-4 border-b border-surface-200 px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMonth(shiftMonth(month, -1))}
                    aria-label="Previous month"
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-surface-100 hover:text-ink-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="min-w-40 text-center text-base font-bold sm:min-w-44 sm:text-lg">
                    {formatMonth(month)}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMonth(shiftMonth(month, 1))}
                    aria-label="Next month"
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-surface-100 hover:text-ink-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {loading ? <Spinner className="h-3.5 w-3.5 text-ink-400" /> : null}
                  {month !== currentMonth() ? (
                    <button
                      type="button"
                      onClick={() => setMonth(currentMonth())}
                      className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      Today
                    </button>
                  ) : null}
                </div>
              </div>

              <div className={cx('p-3 sm:p-5', loading && 'opacity-60 transition-opacity')}>
                <MonthGrid
                  days={current.days}
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>

              <div className="border-t border-surface-200 px-4 py-3.5 sm:px-5">
                <ScheduleLegend />
              </div>
            </div>

            {/* 3 — Where and how to book */}
            <div className="space-y-5 lg:sticky lg:top-24">
              {currentClinic ? (
                <BranchPanel clinic={currentClinic} date={selectedDate} />
              ) : null}

              {selectedDay ? (
                <DayDetail day={selectedDay} phone={current.clinic.phone} />
              ) : null}

              <div className="flex gap-3 rounded-[var(--radius-lg)] border border-surface-200 bg-surface-50 p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                <p className="text-xs leading-relaxed text-ink-500">
                  Availability reflects how many dentists are on duty and already booked.
                  Patient details are never shown here.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </>
  );
}
