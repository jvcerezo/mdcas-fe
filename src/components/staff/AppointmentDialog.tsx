/**
 * Create / edit an appointment.
 *
 * The form narrows itself as you go: choosing a branch limits the services to
 * what that branch offers, and the provider list to clinicians rostered there.
 * The end time is derived from the service's usual duration but stays editable,
 * because real appointments overrun.
 *
 * The backend validates all of this again — this is convenience, not security.
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

import { Button, Field, cx, inputClass } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { formatDuration, weekdayOf } from '@/lib/format';
import { APPOINTMENT_STATUSES } from '@/types';
import type { AppointmentInput, BookingOptions, StaffAppointment } from '@/types';

interface Props {
  options: BookingOptions;
  /** Editing an existing booking when present; creating one when not. */
  appointment?: StaffAppointment | null;
  /** Pre-fills a new booking when opened from a calendar cell. */
  defaults?: { date?: string; clinicSlug?: string; staffSlug?: string; start?: string };
  onClose: () => void;
  onSaved: () => void;
}

/** Adds minutes to an "HH:mm", clamped to the end of the day. */
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = Math.min((hours ?? 0) * 60 + (mins ?? 0) + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function AppointmentDialog({
  options,
  appointment,
  defaults,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(appointment);

  const [form, setForm] = useState<AppointmentInput>(() => ({
    clinicSlug:
      appointment?.clinicSlug ?? defaults?.clinicSlug ?? options.clinics[0]?.slug ?? '',
    staffSlug: appointment?.staffSlug ?? defaults?.staffSlug ?? '',
    serviceSlug: appointment?.serviceSlug ?? '',
    date: appointment?.date ?? defaults?.date ?? '',
    start: appointment?.start ?? defaults?.start ?? '09:00',
    end: appointment?.end ?? addMinutes(defaults?.start ?? '09:00', 60),
    patientName: appointment?.patientName ?? '',
    patientContact: appointment?.patientContact ?? '',
    patientEmail: appointment?.patientEmail ?? '',
    notes: appointment?.notes ?? '',
    status: appointment?.status ?? 'booked',
  }));

  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AppointmentInput>(key: K, value: AppointmentInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Close on Escape, the behaviour a dialog is expected to have.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const clinic = options.clinics.find((entry) => entry.slug === form.clinicSlug);

  /** Services this branch actually offers. */
  const services = useMemo(
    () => options.services.filter((service) => clinic?.serviceSlugs.includes(service.slug)),
    [options.services, clinic],
  );

  /** Providers rostered at this branch, flagged if not on shift that weekday. */
  const providers = useMemo(() => {
    const weekday = form.date ? weekdayOf(form.date) : null;
    return options.providers
      .filter((provider) =>
        provider.shifts.some((shift) => shift.clinicSlug === form.clinicSlug),
      )
      .map((provider) => ({
        ...provider,
        onShiftToday:
          weekday === null
            ? true
            : provider.shifts.some(
                (shift) => shift.clinicSlug === form.clinicSlug && shift.day === weekday,
              ),
      }))
      .sort((a, b) => Number(b.onShiftToday) - Number(a.onShiftToday));
  }, [options.providers, form.clinicSlug, form.date]);

  /** Picking a service sets a sensible end time; the user can still change it. */
  const handleServiceChange = (slug: string) => {
    const service = options.services.find((entry) => entry.slug === slug);
    setForm((current) => ({
      ...current,
      serviceSlug: slug,
      end: service ? addMinutes(current.start, service.durationMinutes) : current.end,
    }));
  };

  const handleStartChange = (start: string) => {
    const service = options.services.find((entry) => entry.slug === form.serviceSlug);
    setForm((current) => ({
      ...current,
      start,
      end: addMinutes(start, service?.durationMinutes ?? 60),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setWarnings([]);
    setSaving(true);

    const payload: AppointmentInput = {
      ...form,
      patientEmail: form.patientEmail?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    try {
      const result = appointment
        ? await api.updateAppointment(appointment.id, payload)
        : await api.createAppointment(payload);

      // Warnings are advisory — the booking saved. Show them, then close.
      if (result.warnings.length > 0) {
        setWarnings(result.warnings);
        setSaving(false);
        window.setTimeout(() => {
          onSaved();
          onClose();
        }, 2200);
        return;
      }

      onSaved();
      onClose();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Could not save this appointment.',
      );
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Edit appointment' : 'New appointment'}
        className="animate-rise relative max-h-[92vh] w-full overflow-y-auto rounded-t-[var(--radius-xl)] bg-surface-0 shadow-[var(--shadow-lift)] sm:max-w-2xl sm:rounded-[var(--radius-xl)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-0/95 px-6 py-5 backdrop-blur hairline">
          <div>
            <h2 className="text-xl">{editing ? 'Edit appointment' : 'New appointment'}</h2>
            <p className="mt-1 text-xs text-ink-400">
              {editing
                ? 'Changes appear on the public calendar immediately.'
                : 'Recorded on behalf of a patient who called in.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-surface-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {/* Appointment */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold tracking-[0.12em] text-ink-400 uppercase">
              Appointment
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Branch" required>
                <select
                  value={form.clinicSlug}
                  onChange={(event) => {
                    update('clinicSlug', event.target.value);
                    // The old provider/service may not exist at the new branch.
                    update('staffSlug', '');
                    update('serviceSlug', '');
                  }}
                  className={inputClass}
                  required
                >
                  {options.clinics.map((entry) => (
                    <option key={entry.slug} value={entry.slug}>
                      {entry.shortName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date" required>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => update('date', event.target.value)}
                  className={inputClass}
                  required
                />
              </Field>
            </div>

            <Field
              label="Procedure"
              required
              hint={
                form.serviceSlug
                  ? `usually ${formatDuration(
                      options.services.find((entry) => entry.slug === form.serviceSlug)
                        ?.durationMinutes ?? 60,
                    )}`
                  : undefined
              }
            >
              <select
                value={form.serviceSlug}
                onChange={(event) => handleServiceChange(event.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select a procedure…</option>
                {services.map((service) => (
                  <option key={service.slug} value={service.slug}>
                    {service.name} · {formatDuration(service.durationMinutes)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Dentist"
              required
              hint={form.date ? 'on-shift clinicians listed first' : undefined}
            >
              <select
                value={form.staffSlug}
                onChange={(event) => update('staffSlug', event.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select a clinician…</option>
                {providers.map((provider) => (
                  <option key={provider.slug} value={provider.slug}>
                    {provider.name}
                    {provider.credentials ? `, ${provider.credentials}` : ''}
                    {provider.onShiftToday ? '' : ' — not rostered this day'}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Start" required>
                <input
                  type="time"
                  value={form.start}
                  onChange={(event) => handleStartChange(event.target.value)}
                  className={inputClass}
                  step={300}
                  required
                />
              </Field>
              <Field label="End" required>
                <input
                  type="time"
                  value={form.end}
                  onChange={(event) => update('end', event.target.value)}
                  className={inputClass}
                  step={300}
                  required
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    update('status', event.target.value as AppointmentInput['status'])
                  }
                  className={inputClass}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </fieldset>

          {/* Patient */}
          <fieldset className="space-y-4 border-t pt-6 hairline">
            <legend className="text-xs font-semibold tracking-[0.12em] text-ink-400 uppercase">
              Patient
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(event) => update('patientName', event.target.value)}
                  className={inputClass}
                  placeholder="Juan dela Cruz"
                  required
                  minLength={2}
                />
              </Field>
              <Field label="Contact number" required>
                <input
                  type="tel"
                  value={form.patientContact}
                  onChange={(event) => update('patientContact', event.target.value)}
                  className={inputClass}
                  placeholder="+63 917 000 0000"
                  required
                />
              </Field>
            </div>

            <Field label="Email" hint="optional">
              <input
                type="email"
                value={form.patientEmail ?? ''}
                onChange={(event) => update('patientEmail', event.target.value)}
                className={inputClass}
                placeholder="patient@email.com"
              />
            </Field>

            <Field label="Notes" hint="staff only — never shown publicly">
              <textarea
                value={form.notes ?? ''}
                onChange={(event) => update('notes', event.target.value)}
                className={cx(inputClass, 'min-h-24 resize-y')}
                placeholder="Anything the clinician should know before the visit."
              />
            </Field>
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="rounded-[var(--radius-md)] border border-[var(--color-slot-full-line)] bg-[var(--color-slot-full)] px-3.5 py-2.5 text-sm text-[var(--color-slot-full-ink)]"
            >
              {error}
            </p>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-slot-filling-line)] bg-[var(--color-slot-filling)] px-3.5 py-2.5 text-sm text-[var(--color-slot-filling-ink)]">
              <p className="font-medium">Saved, with notes:</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t pt-6 hairline">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
