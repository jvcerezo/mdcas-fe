/**
 * Display formatting. The API speaks in "YYYY-MM-DD" and "HH:mm"; everything
 * that turns those into human-readable strings lives here so the wording stays
 * consistent across the public site and the staff portal.
 */

import type { Address, DayOfWeek, OpeningHours, PublicSlotStatus } from '@/types';
import { DAY_NAMES } from '@/types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** "09:00" -> "9:00 AM" */
export function formatTime(time: string): string {
  const [hourPart, minutePart] = time.split(':');
  const hours = Number(hourPart);
  const minutes = minutePart ?? '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${period}`;
}

/** "09:00" -> "9AM", for dense calendar gutters. */
export function formatHourShort(time: string): string {
  const hours = Number(time.split(':')[0]);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** "2026-07-29" -> "29 July 2026" */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${day} ${MONTH_NAMES[(month ?? 1) - 1]} ${year}`;
}

/** "2026-07-29" -> "Wed, 29 Jul" */
export function formatDateShort(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay();
  return `${DAY_NAMES[weekday]?.slice(0, 3)}, ${day} ${MONTH_NAMES[(month ?? 1) - 1]?.slice(0, 3)}`;
}

/** "2026-07" -> "July 2026" */
export function formatMonth(month: string): string {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  return `${MONTH_NAMES[monthNumber - 1]} ${year}`;
}

/** Today at the clinics, as "YYYY-MM-DD", regardless of the visitor's timezone. */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

/** Shifts a "YYYY-MM" key by whole months. */
export function shiftMonth(month: string, delta: number): string {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function addDaysISO(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
  return shifted.toISOString().slice(0, 10);
}

/** Weekday index for a "YYYY-MM-DD", built in UTC so it never drifts. */
export function weekdayOf(date: string): DayOfWeek {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay() as DayOfWeek;
}

/** PHP currency, no decimals — dental prices are never quoted in centavos. */
export function formatPeso(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceRange(min: number, max?: number): string {
  if (max === undefined || max === min) return formatPeso(min);
  return `${formatPeso(min)} – ${formatPeso(max)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours} hr ${rest} min`;
}

export function formatAddress(address: Address, multiline = false): string {
  const parts = [
    address.line1,
    address.line2,
    address.barangay ? `Brgy. ${address.barangay}` : undefined,
    `${address.city}, ${address.province}${address.postalCode ? ` ${address.postalCode}` : ''}`,
  ].filter(Boolean);
  return parts.join(multiline ? '\n' : ', ');
}

/**
 * Collapses a week of opening hours into readable lines, merging consecutive
 * days that share the same times — "Mon – Fri 8:00 AM – 6:00 PM".
 */
export function summariseHours(hours: OpeningHours[]): Array<{ days: string; time: string }> {
  const ordered = [...hours].sort((a, b) => {
    // Present the week Monday-first; Sunday reads better last.
    const rank = (day: DayOfWeek) => (day === 0 ? 7 : day);
    return rank(a.day) - rank(b.day);
  });

  const rows: Array<{ days: string; time: string }> = [];
  let runStart: OpeningHours | null = null;
  let runEnd: OpeningHours | null = null;

  const key = (entry: OpeningHours) =>
    entry.closed ? 'closed' : `${entry.opens}-${entry.closes}`;

  const flush = () => {
    if (!runStart || !runEnd) return;
    const label =
      runStart.day === runEnd.day
        ? DAY_NAMES[runStart.day]!.slice(0, 3)
        : `${DAY_NAMES[runStart.day]!.slice(0, 3)} – ${DAY_NAMES[runEnd.day]!.slice(0, 3)}`;
    rows.push({
      days: label,
      time: runStart.closed
        ? 'Closed'
        : formatTimeRange(runStart.opens ?? '', runStart.closes ?? ''),
    });
    runStart = null;
    runEnd = null;
  };

  for (const entry of ordered) {
    if (runStart && runEnd && key(entry) === key(runEnd)) {
      runEnd = entry;
      continue;
    }
    flush();
    runStart = entry;
    runEnd = entry;
  }
  flush();

  return rows;
}

/** Whether a branch is open at this exact moment, for the "Open now" pill. */
export function isOpenNow(hours: OpeningHours[]): boolean {
  const now = new Date();
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
  });
  const shortDay = dayFormatter.format(now);
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(shortDay);

  const today = hours.find((entry) => entry.day === dayIndex);
  if (!today || today.closed || !today.opens || !today.closes) return false;

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  return time >= today.opens && time < today.closes;
}

/* -------------------------------------------------------------------------- */
/* Schedule status presentation                                               */
/* -------------------------------------------------------------------------- */

export interface SlotStyle {
  label: string;
  description: string;
  /** Tailwind classes for the block itself. */
  className: string;
  /** Tailwind classes for the legend swatch. */
  swatch: string;
}

export const SLOT_STYLES: Record<PublicSlotStatus | 'closed', SlotStyle> = {
  available: {
    label: 'Open',
    description: 'Chairs are free this hour. Call the branch to book.',
    className:
      'bg-[var(--color-slot-open)] text-[var(--color-slot-open-ink)] border-[var(--color-slot-open-line)]',
    swatch: 'bg-[var(--color-slot-open)] border-[var(--color-slot-open-line)]',
  },
  limited: {
    label: 'Filling up',
    description: 'Partly booked — some chairs remain.',
    className:
      'bg-[var(--color-slot-filling)] text-[var(--color-slot-filling-ink)] border-[var(--color-slot-filling-line)]',
    swatch: 'bg-[var(--color-slot-filling)] border-[var(--color-slot-filling-line)]',
  },
  full: {
    label: 'Fully booked',
    description: 'Every dentist on duty is booked this hour.',
    className:
      'bg-[var(--color-slot-full)] text-[var(--color-slot-full-ink)] border-[var(--color-slot-full-line)]',
    swatch: 'bg-[var(--color-slot-full)] border-[var(--color-slot-full-line)]',
  },
  unavailable: {
    label: 'No clinician',
    description: 'The branch is open, but nobody is rostered this hour.',
    className:
      'bg-[var(--color-slot-none)] text-[var(--color-slot-none-ink)] border-[var(--color-slot-none-line)]',
    swatch: 'bg-[var(--color-slot-none)] border-[var(--color-slot-none-line)]',
  },
  closed: {
    label: 'Closed',
    description: 'The branch is closed on this day.',
    className: 'hatch bg-bone-200 text-ink-400 border-bone-300',
    swatch: 'hatch bg-bone-200 border-bone-300',
  },
};

/** Branch accent colours, resolved to Tailwind classes. */
export const ACCENTS = {
  teal: {
    text: 'text-[var(--color-branch-teal)]',
    bg: 'bg-[var(--color-branch-teal)]',
    softBg: 'bg-[var(--color-branch-teal-soft)]',
    border: 'border-[var(--color-branch-teal)]',
    ring: 'ring-[var(--color-branch-teal)]',
  },
  indigo: {
    text: 'text-[var(--color-branch-indigo)]',
    bg: 'bg-[var(--color-branch-indigo)]',
    softBg: 'bg-[var(--color-branch-indigo-soft)]',
    border: 'border-[var(--color-branch-indigo)]',
    ring: 'ring-[var(--color-branch-indigo)]',
  },
  amber: {
    text: 'text-[var(--color-branch-amber)]',
    bg: 'bg-[var(--color-branch-amber)]',
    softBg: 'bg-[var(--color-branch-amber-soft)]',
    border: 'border-[var(--color-branch-amber)]',
    ring: 'ring-[var(--color-branch-amber)]',
  },
} as const;

export const STATUS_BADGES: Record<string, string> = {
  booked: 'bg-brand-50 text-brand-700 border-brand-200',
  confirmed: 'bg-[var(--color-slot-open)] text-[var(--color-slot-open-ink)] border-[var(--color-slot-open-line)]',
  completed: 'bg-bone-200 text-ink-600 border-bone-300',
  cancelled: 'bg-[var(--color-slot-full)] text-[var(--color-slot-full-ink)] border-[var(--color-slot-full-line)]',
  'no-show': 'bg-[var(--color-slot-filling)] text-[var(--color-slot-filling-ink)] border-[var(--color-slot-filling-line)]',
};
