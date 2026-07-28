/**
 * The "at a glance" view a dentist or front desk opens first: today's chair
 * list, in order, with patient, procedure and time.
 */

import { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';

import { AppointmentDialog } from '@/components/staff/AppointmentDialog';
import { AppointmentRow } from '@/components/staff/AppointmentRow';
import {
  Button,
  Card,
  Container,
  EmptyState,
  ErrorState,
  LoadingState,
  cx,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { addDaysISO, formatDate, todayISO } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import type { StaffAppointment } from '@/types';

export function StaffTodayPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [clinicFilter, setClinicFilter] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffAppointment | null>(null);

  const { data: options } = useApi((signal) => api.bookingOptions(signal), []);

  const { data, loading, error, reload } = useApi(
    (signal) =>
      api.appointments(
        {
          from: date,
          to: date,
          clinic: clinicFilter ?? undefined,
          mine: onlyMine || undefined,
        },
        signal,
      ),
    [date, clinicFilter, onlyMine],
  );

  const appointments = data?.appointments ?? [];
  const active = appointments.filter(
    (item) => item.status !== 'cancelled' && item.status !== 'no-show',
  );

  const handleCancel = async (appointment: StaffAppointment) => {
    if (!window.confirm(`Cancel ${appointment.patientName}'s ${appointment.start} appointment?`))
      return;
    await api.cancelAppointment(appointment.id);
    reload();
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (appointment: StaffAppointment) => {
    setEditing(appointment);
    setDialogOpen(true);
  };

  return (
    <Container wide>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl">
            {date === todayISO() ? 'Today' : formatDate(date)}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {loading
              ? 'Loading…'
              : `${active.length} active ${active.length === 1 ? 'appointment' : 'appointments'}` +
                (appointments.length !== active.length
                  ? ` · ${appointments.length - active.length} cancelled or no-show`
                  : '')}
          </p>
        </div>

        <Button onClick={openNew} disabled={!options}>
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
            onClick={() => setDate(addDaysISO(date, -1))}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-9 rounded-full border border-[color-mix(in_srgb,var(--color-ink-900)_14%,transparent)] bg-white px-4 text-sm tabular"
          />
          <Button
            variant="secondary"
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={() => setDate(addDaysISO(date, 1))}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {date !== todayISO() ? (
            <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>
              Today
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
        </div>

        {/* Only meaningful for accounts linked to a clinician profile. */}
        {user?.staffSlug ? (
          <Chip active={onlyMine} onClick={() => setOnlyMine((value) => !value)}>
            Only my patients
          </Chip>
        ) : null}
      </div>

      {loading && appointments.length === 0 ? (
        <LoadingState label="Loading appointments" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : appointments.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing booked"
            description="No appointments for this day and filter. Create one when a patient calls in."
            action={
              <Button size="sm" onClick={openNew} disabled={!options}>
                New appointment
              </Button>
            }
          />
        </div>
      ) : (
        <Card className={cx('mt-6 overflow-hidden', loading && 'opacity-60')}>
          <ul className="divide-y divide-[color-mix(in_srgb,var(--color-ink-900)_7%,transparent)]">
            {appointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                onEdit={openEdit}
                onCancel={handleCancel}
              />
            ))}
          </ul>
        </Card>
      )}

      {dialogOpen && options ? (
        <AppointmentDialog
          options={options}
          appointment={editing}
          defaults={{ date, clinicSlug: clinicFilter ?? undefined }}
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
          ? 'border-ink-900 bg-ink-900 text-bone-50'
          : 'border-[color-mix(in_srgb,var(--color-ink-900)_12%,transparent)] bg-white text-ink-600 hover:border-ink-400',
      )}
    >
      {children}
    </button>
  );
}
