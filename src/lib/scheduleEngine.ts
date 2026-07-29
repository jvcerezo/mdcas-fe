/**
 * Client-side port of the backend scheduling engine.
 *
 * Mirrors `mdcas-be/src/services/scheduleService.ts`. Used only in standalone
 * mode; when the API is configured the server computes all of this instead.
 *
 * The public/staff split still holds here — `buildPublicMonthSchedule` returns
 * `PublicDay`/`PublicSlot`, which have no field capable of carrying a patient
 * name, contact or procedure. Redaction is a property of the types, not of
 * remembering to strip fields.
 *
 * The one thing this cannot reproduce is the security boundary. On the server
 * patient data never leaves the machine unless you are authenticated; in the
 * browser it is all in memory regardless. See the warning in `localBackend.ts`.
 */

import { clinicBySlug, providers, serviceBySlug, staff, staffBySlug } from '@/data/content';
import { DAY_NAMES } from '@/types';
import type {
  AppointmentStatus,
  DayOfWeek,
  PublicDay,
  PublicMonthSchedule,
  PublicSlot,
  PublicSlotStatus,
  ScheduleEntry,
  StaffAppointment,
} from '@/types';
import type { StoredAppointment } from '@/lib/localStore';

export const SLOT_MINUTES = 60;

/** Statuses that occupy a slot. Cancelled and no-show free the block again. */
export const BLOCKING_STATUSES: AppointmentStatus[] = ['booked', 'confirmed', 'completed'];

/* -------------------------------------------------------------------------- */
/* Time helpers                                                               */
/* -------------------------------------------------------------------------- */

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function toTimeString(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function rangeContains(windowStart: number, windowEnd: number, start: number, end: number): boolean {
  return start >= windowStart && end <= windowEnd;
}

/** Every "YYYY-MM-DD" in a "YYYY-MM" month. Built in UTC so it cannot drift. */
export function eachDayOfMonth(month: string): string[] {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from(
    { length: count },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`,
  );
}

function dayOfWeek(date: string): DayOfWeek {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay() as DayOfWeek;
}

/* -------------------------------------------------------------------------- */
/* Public month calendar                                                      */
/* -------------------------------------------------------------------------- */

function slotStatus(capacity: number, booked: number): PublicSlotStatus {
  if (capacity === 0) return 'unavailable';
  if (booked >= capacity) return 'full';
  if (booked > 0) return 'limited';
  return 'available';
}

export function buildPublicMonthSchedule(
  clinicSlug: string,
  month: string,
  appointments: StoredAppointment[],
): PublicMonthSchedule | null {
  const clinic = clinicBySlug.get(clinicSlug);
  if (!clinic) return null;

  const days = eachDayOfMonth(month);

  // Group blocking bookings by date once, rather than scanning per slot.
  const byDate = new Map<string, StoredAppointment[]>();
  for (const appointment of appointments) {
    if (appointment.clinicSlug !== clinicSlug) continue;
    if (!BLOCKING_STATUSES.includes(appointment.status)) continue;
    if (!appointment.date.startsWith(month)) continue;
    const bucket = byDate.get(appointment.date);
    if (bucket) bucket.push(appointment);
    else byDate.set(appointment.date, [appointment]);
  }

  const clinicProviders = providers.filter((member) =>
    member.shifts.some((shift) => shift.clinicSlug === clinicSlug),
  );

  const publicDays: PublicDay[] = days.map((date) => {
    const day = dayOfWeek(date);
    const hours = clinic.hours.find((entry) => entry.day === day);

    if (!hours || hours.closed || !hours.opens || !hours.closes) {
      return {
        date,
        day,
        dayName: DAY_NAMES[day],
        closed: true,
        note: hours?.note,
        slots: [],
        totalSlots: 0,
        availableSlots: 0,
      };
    }

    const opens = toMinutes(hours.opens);
    const closes = toMinutes(hours.closes);
    const dayAppointments = byDate.get(date) ?? [];

    const slots: PublicSlot[] = [];
    for (let start = opens; start + SLOT_MINUTES <= closes; start += SLOT_MINUTES) {
      const end = start + SLOT_MINUTES;

      const rostered = new Set<string>();
      for (const provider of clinicProviders) {
        const onShift = provider.shifts.some(
          (shift) =>
            shift.clinicSlug === clinicSlug &&
            shift.day === day &&
            rangeContains(toMinutes(shift.start), toMinutes(shift.end), start, end),
        );
        if (onShift) rostered.add(provider.slug);
      }

      const bookedProviders = new Set<string>();
      for (const appointment of dayAppointments) {
        if (rangesOverlap(toMinutes(appointment.start), toMinutes(appointment.end), start, end)) {
          bookedProviders.add(appointment.staffSlug);
        }
      }

      // A booking is proof of attendance even when the roster disagrees.
      const capacity = new Set([...rostered, ...bookedProviders]).size;
      const booked = bookedProviders.size;

      slots.push({
        start: toTimeString(start),
        end: toTimeString(end),
        capacity,
        booked,
        status: slotStatus(capacity, booked),
      });
    }

    return {
      date,
      day,
      dayName: DAY_NAMES[day],
      closed: false,
      note: hours.note,
      opens: hours.opens,
      closes: hours.closes,
      slots,
      totalSlots: slots.length,
      availableSlots: slots.filter(
        (slot) => slot.status === 'available' || slot.status === 'limited',
      ).length,
    };
  });

  return {
    clinic: {
      slug: clinic.slug,
      name: clinic.name,
      shortName: clinic.shortName,
      accentColor: clinic.accentColor,
      phone: clinic.phone,
      mobile: clinic.mobile,
      email: clinic.email,
    },
    month,
    year: Number(month.slice(0, 4)),
    monthNumber: Number(month.slice(5, 7)),
    days: publicDays,
  };
}

/* -------------------------------------------------------------------------- */
/* Staff views                                                                */
/* -------------------------------------------------------------------------- */

export function toStaffViews(items: StoredAppointment[]): StaffAppointment[] {
  return items.map((appointment) => {
    const clinic = clinicBySlug.get(appointment.clinicSlug);
    const member = staffBySlug.get(appointment.staffSlug);
    const service = serviceBySlug.get(appointment.serviceSlug);
    return {
      ...appointment,
      clinicName: clinic?.name ?? appointment.clinicSlug,
      staffName: member?.name ?? appointment.staffSlug,
      serviceName: service?.name ?? appointment.serviceSlug,
      serviceDurationMinutes: service?.durationMinutes ?? 60,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Weekly roster                                                              */
/* -------------------------------------------------------------------------- */

export function buildWeeklyRoster(
  filters: { clinicSlug?: string; staffSlug?: string; serviceSlug?: string } = {},
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];

  for (const member of staff) {
    if (filters.staffSlug && member.slug !== filters.staffSlug) continue;
    if (filters.serviceSlug && !member.serviceSlugs.includes(filters.serviceSlug)) continue;

    for (const shift of member.shifts) {
      if (filters.clinicSlug && shift.clinicSlug !== filters.clinicSlug) continue;
      const clinic = clinicBySlug.get(shift.clinicSlug);
      if (!clinic) continue;

      entries.push({
        id: `${member.slug}-${shift.clinicSlug}-${shift.day}-${shift.start}`,
        day: shift.day,
        dayName: DAY_NAMES[shift.day],
        start: shift.start,
        end: shift.end,
        clinic: {
          slug: clinic.slug,
          name: clinic.name,
          shortName: clinic.shortName,
          accentColor: clinic.accentColor,
          city: clinic.address.city,
          phone: clinic.phone,
        },
        staff: {
          slug: member.slug,
          name: member.name,
          credentials: member.credentials,
          role: member.role,
          specialty: member.specialty,
          photo: member.photo,
        },
        serviceSlugs: member.serviceSlugs,
      });
    }
  }

  return entries.sort(
    (a, b) =>
      a.day - b.day ||
      a.start.localeCompare(b.start) ||
      a.clinic.shortName.localeCompare(b.clinic.shortName),
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

/**
 * Same rules as the server: double-booking a provider is an error, everything
 * else is a warning, because staff legitimately book outside the roster for
 * overtime or a doctor coming in specially.
 */
export function validateAppointment(
  input: {
    clinicSlug: string;
    staffSlug: string;
    serviceSlug: string;
    date: string;
    start: string;
    end: string;
    status: AppointmentStatus;
  },
  existing: StoredAppointment[],
  excludeId?: string,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const clinic = clinicBySlug.get(input.clinicSlug);
  const member = staffBySlug.get(input.staffSlug);
  const service = serviceBySlug.get(input.serviceSlug);

  if (!clinic) errors.push(`Unknown branch "${input.clinicSlug}".`);
  if (!member) errors.push(`Unknown staff member "${input.staffSlug}".`);
  if (!service) errors.push(`Unknown service "${input.serviceSlug}".`);
  if (errors.length > 0) return { errors, warnings };

  const start = toMinutes(input.start);
  const end = toMinutes(input.end);
  if (end <= start) {
    errors.push('The end time must be after the start time.');
    return { errors, warnings };
  }

  const day = dayOfWeek(input.date);

  if (clinic && service && !clinic.serviceSlugs.includes(service.slug)) {
    warnings.push(`${clinic.shortName} does not normally offer ${service.name}.`);
  }
  if (member && service && !member.serviceSlugs.includes(service.slug)) {
    warnings.push(`${member.name} is not listed as performing ${service.name}.`);
  }

  if (clinic) {
    const hours = clinic.hours.find((entry) => entry.day === day);
    if (!hours || hours.closed || !hours.opens || !hours.closes) {
      warnings.push(`${clinic.shortName} is closed on ${DAY_NAMES[day]}s.`);
    } else if (start < toMinutes(hours.opens) || end > toMinutes(hours.closes)) {
      warnings.push(`Outside ${clinic.shortName} opening hours (${hours.opens}–${hours.closes}).`);
    }
  }

  if (member) {
    const onShift = member.shifts.some(
      (shift) =>
        shift.clinicSlug === input.clinicSlug &&
        shift.day === day &&
        rangeContains(toMinutes(shift.start), toMinutes(shift.end), start, end),
    );
    if (!onShift) {
      warnings.push(
        `${member.name} is not rostered at ${clinic?.shortName ?? input.clinicSlug} at this time.`,
      );
    }
  }

  if (BLOCKING_STATUSES.includes(input.status)) {
    const clash = existing.find(
      (other) =>
        other.id !== excludeId &&
        other.staffSlug === input.staffSlug &&
        other.date === input.date &&
        BLOCKING_STATUSES.includes(other.status) &&
        rangesOverlap(toMinutes(other.start), toMinutes(other.end), start, end),
    );
    if (clash) {
      errors.push(
        `${member?.name ?? input.staffSlug} already has a booking from ${clash.start} to ${clash.end} on ${input.date}.`,
      );
    }
  }

  return { errors, warnings };
}
