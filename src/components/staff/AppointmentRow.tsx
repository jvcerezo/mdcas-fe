import { Clock, Mail, Phone, Pencil, StickyNote, X } from 'lucide-react';

import { cx } from '@/components/ui';
import { STATUS_BADGES, formatTimeRange } from '@/lib/format';
import type { StaffAppointment } from '@/types';

/**
 * One appointment, at a glance: who, what procedure, when, and with whom.
 * This is the staff-only view — it deliberately shows everything the public
 * calendar hides.
 */
export function AppointmentRow({
  appointment,
  onEdit,
  onCancel,
  showDate = false,
}: {
  appointment: StaffAppointment;
  onEdit: (appointment: StaffAppointment) => void;
  onCancel: (appointment: StaffAppointment) => void;
  showDate?: boolean;
}) {
  const inactive = appointment.status === 'cancelled' || appointment.status === 'no-show';

  return (
    <li
      className={cx(
        'group grid gap-4 px-5 py-4 transition-colors hover:bg-bone-100 sm:grid-cols-[7.5rem_1fr_auto] sm:items-center',
        inactive && 'opacity-60',
      )}
    >
      {/* Time */}
      <div className="flex items-center gap-2 sm:block">
        <p className="text-sm font-medium text-ink-900 tabular">
          {formatTimeRange(appointment.start, appointment.end)}
        </p>
        {showDate ? (
          <p className="text-xs text-ink-400 tabular sm:mt-0.5">{appointment.date}</p>
        ) : null}
      </div>

      {/* Patient and procedure */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cx(
              'font-medium text-ink-900',
              inactive && 'line-through decoration-ink-400',
            )}
          >
            {appointment.patientName}
          </p>
          <span
            className={cx(
              'rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium',
              STATUS_BADGES[appointment.status] ?? 'border-bone-300 bg-bone-200 text-ink-500',
            )}
          >
            {appointment.status}
          </span>
        </div>

        <p className="mt-1 text-sm text-ink-600">
          {appointment.serviceName}
          <span className="text-ink-400"> · {appointment.staffName}</span>
          <span className="text-ink-400"> · {appointment.clinicName}</span>
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <a
            href={`tel:${appointment.patientContact.replace(/[^\d+]/g, '')}`}
            className="inline-flex items-center gap-1.5 tabular transition-colors hover:text-brand-700"
          >
            <Phone className="h-3 w-3" aria-hidden />
            {appointment.patientContact}
          </a>
          {appointment.patientEmail ? (
            <a
              href={`mailto:${appointment.patientEmail}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-700"
            >
              <Mail className="h-3 w-3" aria-hidden />
              {appointment.patientEmail}
            </a>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" aria-hidden />
            {appointment.serviceDurationMinutes} min
          </span>
        </div>

        {appointment.notes ? (
          <p className="mt-2 flex gap-2 rounded-[var(--radius-sm)] bg-bone-200/70 px-2.5 py-1.5 text-xs leading-relaxed text-ink-600">
            <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-ink-400" aria-hidden />
            {appointment.notes}
          </p>
        ) : null}
      </div>

      {/* Actions — always visible on touch, revealed on hover for pointers. */}
      <div className="flex gap-1.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(appointment)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs text-ink-600 transition-colors hairline hover:border-ink-400 hover:text-ink-900"
        >
          <Pencil className="h-3 w-3" aria-hidden />
          Edit
        </button>
        {!inactive ? (
          <button
            type="button"
            onClick={() => onCancel(appointment)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--color-slot-full-line)] px-3 text-xs text-[var(--color-slot-full-ink)] transition-colors hover:bg-[var(--color-slot-full)]"
          >
            <X className="h-3 w-3" aria-hidden />
            Cancel
          </button>
        ) : null}
      </div>
    </li>
  );
}
