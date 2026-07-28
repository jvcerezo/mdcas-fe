/**
 * The centralized schedule page.
 *
 * One month, one branch at a time, switched with tabs. Everything shown here
 * is public and redacted — hours are marked open, filling up, fully booked or
 * closed, and nothing else is exposed.
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

import { DayDetail } from '@/components/schedule/DayDetail';
import { MonthGrid, ScheduleLegend } from '@/components/schedule/MonthGrid';
import {
  Button,
  Card,
  Container,
  ErrorState,
  LoadingState,
  Section,
  cx,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { ACCENTS, currentMonth, formatMonth, shiftMonth, todayISO } from '@/lib/format';

export function SchedulePage() {
  const [month, setMonth] = useState(currentMonth());
  const [activeClinic, setActiveClinic] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi(
    (signal) => api.allSchedules(month, signal),
    [month],
  );

  const schedules = data?.clinics ?? [];
  const current =
    schedules.find((schedule) => schedule.clinic.slug === activeClinic) ?? schedules[0];

  // Default to the first branch once data lands, and keep the selected day
  // valid when the month changes underneath it.
  useEffect(() => {
    if (!current) return;
    if (!activeClinic) setActiveClinic(current.clinic.slug);

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
  }, [current, activeClinic, selectedDate]);

  const selectedDay = current?.days.find((day) => day.date === selectedDate) ?? null;
  const isCurrentMonth = month === currentMonth();

  return (
    <>
      <Section className="pb-0">
        <Container>
          <p className="eyebrow mb-4">Availability</p>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl leading-[1.1] sm:text-5xl">
                When each branch is free
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-500">
                A live view of every hour across our three branches. Find a slot that suits
                you, then call that branch to book — appointments are made by phone.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-10">
        <Container>
          {/* Branch tabs */}
          <div
            className="flex flex-wrap gap-2 border-b pb-5 hairline"
            role="tablist"
            aria-label="Branch"
          >
            {schedules.map((schedule) => {
              const isActive = schedule.clinic.slug === current?.clinic.slug;
              const accent = ACCENTS[schedule.clinic.accentColor];
              return (
                <button
                  key={schedule.clinic.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveClinic(schedule.clinic.slug)}
                  className={cx(
                    'inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'border-ink-900 bg-ink-900 text-bone-50'
                      : 'border-[color-mix(in_srgb,var(--color-ink-900)_12%,transparent)] bg-white text-ink-600 hover:border-ink-400',
                  )}
                >
                  <span
                    className={cx(
                      'h-2 w-2 rounded-full',
                      isActive ? 'bg-bone-50' : accent.bg,
                    )}
                  />
                  {schedule.clinic.shortName}
                </button>
              );
            })}
          </div>

          {/* Month navigation */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMonth(shiftMonth(month, -1))}
                aria-label="Previous month"
                className="!h-9 !w-9 !px-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-44 text-center font-display text-xl">
                {formatMonth(month)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMonth(shiftMonth(month, 1))}
                aria-label="Next month"
                className="!h-9 !w-9 !px-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isCurrentMonth ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMonth(currentMonth())}
                  className="ml-1"
                >
                  Today
                </Button>
              ) : null}
            </div>

            <ScheduleLegend />
          </div>

          {loading && !current ? (
            <LoadingState label="Loading availability" />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : current ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
              <Card className={cx('p-5 sm:p-7', loading && 'opacity-60 transition-opacity')}>
                <MonthGrid
                  days={current.days}
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
              </Card>

              <div className="lg:sticky lg:top-28">
                {selectedDay ? (
                  <DayDetail day={selectedDay} clinic={current.clinic} />
                ) : (
                  <Card className="px-6 py-16 text-center">
                    <p className="text-sm text-ink-400">
                      Select a day to see hour-by-hour availability.
                    </p>
                  </Card>
                )}

                <div className="mt-5 flex gap-3 rounded-[var(--radius-lg)] border bg-bone-200/50 p-4 hairline">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  <p className="text-xs leading-relaxed text-ink-500">
                    Availability reflects how many dentists are on duty and already booked.
                    Patient details are never shown here. Call the branch to reserve a slot —
                    the front desk will confirm it and it will appear on this calendar.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
