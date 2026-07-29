/**
 * The staff month schedule.
 *
 * The same month grid the public sees, but each day shows real booking counts,
 * and selecting one lists every appointment with patient, procedure and time.
 * Clicking an empty day opens the booking form pre-filled with that date.
 */

import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';

import { AppointmentDialog } from '@/components/staff/AppointmentDialog';
import { AppointmentRow } from '@/components/staff/AppointmentRow';
import {
  Button,
  Card,
  Container,
  ErrorState,
  LoadingState,
  cx,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import {
  currentMonth,
  formatDate,
  formatMonth,
  shiftMonth,
  todayISO,
  weekdayOf,
} from '@/lib/format';
import { useAuth } from '@/lib/auth';
import type { StaffAppointment } from '@/types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function columnFor(day: number): number {
  return day === 0 ? 6 : day - 1;
}

/** Every "YYYY-MM-DD" in a month. */
function daysInMonth(month: string): string[] {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from(
    { length: count },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`,
  );
}

export function StaffSchedulePage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [clinicFilter, setClinicFilter] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffAppointment | null>(null);

  const { data: options } = useApi((signal) => api.bookingOptions(signal), []);

  const days = useMemo(() => daysInMonth(month), [month]);
  const first = days[0] ?? '';
  const last = days[days.length - 1] ?? '';

  const { data, loading, error, reload } = useApi(
    (signal) =>
      api.appointments(
        {
          from: first,
          to: last,
          clinic: clinicFilter ?? undefined,
          mine: onlyMine || undefined,
        },
        signal,
      ),
    [first, last, clinicFilter, onlyMine],
  );

  /** Bookings bucketed by date, so each cell is an O(1) lookup. */
  const byDate = useMemo(() => {
    const map = new Map<string, StaffAppointment[]>();
    for (const appointment of data?.appointments ?? []) {
      const bucket = map.get(appointment.date);
      if (bucket) bucket.push(appointment);
      else map.set(appointment.date, [appointment]);
    }
    return map;
  }, [data]);

  // Keep the selection inside the month being viewed.
  useEffect(() => {
    if (!selectedDate.startsWith(month)) {
      const today = todayISO();
      setSelectedDate(today.startsWith(month) ? today : (days[0] ?? today));
    }
  }, [month, selectedDate, days]);

  const selected = byDate.get(selectedDate) ?? [];
  const leadingBlanks = first ? columnFor(weekdayOf(first)) : 0;
  const today = todayISO();

  const handleCancel = async (appointment: StaffAppointment) => {
    if (!window.confirm(`Cancel ${appointment.patientName}'s appointment?`)) return;
    await api.cancelAppointment(appointment.id);
    reload();
  };

  return (
    <Container wide>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl">Schedule</h1>
          <p className="mt-2 text-sm text-ink-500">
            {data ? `${data.count} appointments in ${formatMonth(month)}` : 'Loading…'}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          disabled={!options}
        >
          <CalendarPlus className="h-4 w-4" aria-hidden />
          New appointment
        </Button>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-b pb-5 hairline">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-40 text-center font-display text-lg">
            {formatMonth(month)}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {month !== currentMonth() ? (
            <Button variant="ghost" size="sm" onClick={() => setMonth(currentMonth())}>
              This month
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip active={clinicFilter === null} onClick={() => setClinicFilter(null)}>
            All my branches
          </Chip>
          {options?.clinics.map((clinic) => (
            <Chip
              key={clinic.slug}
              active={clinicFilter === clinic.slug}
              onClick={() => setClinicFilter(clinic.slug)}
            >
              {clinic.shortName}
            </Chip>
          ))}
          {user?.staffSlug ? (
            <Chip active={onlyMine} onClick={() => setOnlyMine((value) => !value)}>
              Only my patients
            </Chip>
          ) : null}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingState label="Loading schedule" />
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:items-start">
          {/* Month grid */}
          <Card className={cx('p-4 sm:p-6', loading && 'opacity-60')}>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="pb-2 text-center text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-400 uppercase"
                >
                  {label}
                </div>
              ))}

              {Array.from({ length: leadingBlanks }, (_, index) => (
                <div key={`blank-${index}`} aria-hidden />
              ))}

              {days.map((date) => {
                const bookings = byDate.get(date) ?? [];
                const activeCount = bookings.filter(
                  (item) => item.status !== 'cancelled' && item.status !== 'no-show',
                ).length;
                const isSelected = date === selectedDate;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    aria-pressed={isSelected}
                    className={cx(
                      'flex aspect-square flex-col rounded-[var(--radius-md)] border p-2 text-left transition-all',
                      'border-[color-mix(in_srgb,var(--color-ink-900)_9%,transparent)] bg-white hover:border-ink-400',
                      isSelected && 'ring-2 ring-brand-600 ring-offset-1',
                      date < today && 'opacity-60',
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={cx(
                          'text-sm font-medium tabular',
                          date === today ? 'text-brand-700' : 'text-ink-700',
                        )}
                      >
                        {Number(date.slice(8, 10))}
                      </span>
                      {date === today ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
                      ) : null}
                    </span>

                    {activeCount > 0 ? (
                      <span className="mt-auto">
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-medium text-brand-700 tabular">
                          {activeCount}
                        </span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected day */}
          <div className="xl:sticky xl:top-24">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 hairline">
                <div>
                  <h2 className="text-base font-medium">{formatDate(selectedDate)}</h2>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {selected.length} {selected.length === 1 ? 'appointment' : 'appointments'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(null);
                    setDialogOpen(true);
                  }}
                  disabled={!options}
                >
                  <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                  Add
                </Button>
              </div>

              {selected.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <p className="text-sm text-ink-400">Nothing booked on this day.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[color-mix(in_srgb,var(--color-ink-900)_7%,transparent)]">
                  {selected.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={(item) => {
                        setEditing(item);
                        setDialogOpen(true);
                      }}
                      onCancel={handleCancel}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {dialogOpen && options ? (
        <AppointmentDialog
          options={options}
          appointment={editing}
          defaults={{ date: selectedDate, clinicSlug: clinicFilter ?? undefined }}
          onClose={() => setDialogOpen(false)}
          onSaved={reload}
        />
      ) : null}
    </Container>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-full border px-4 py-1.5 text-sm transition-all',
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-[var(--shadow-brand)]'
          : 'border-[color-mix(in_srgb,var(--color-ink-900)_12%,transparent)] bg-white text-ink-600 hover:border-ink-400',
      )}
    >
      {children}
    </button>
  );
}
