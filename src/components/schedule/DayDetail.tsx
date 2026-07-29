/**
 * Hour-by-hour availability for one day at one branch — the public view.
 *
 * Each hour is a single row: the time, and one tinted bar carrying both the
 * status label and the free-chair count. The previous version had four
 * elements per row (bar, badge, count, time) all restating the same fact,
 * which is what made a ten-hour day look like a wall of noise.
 *
 * There is no patient information in the data this renders, by design.
 */

import { CalendarOff } from 'lucide-react';

import { cx } from '@/components/ui';
import { SLOT_STYLES, formatDate, formatTime, todayISO } from '@/lib/format';
import type { PublicDay } from '@/types';

export function DayDetail({ day, phone }: { day: PublicDay; phone: string }) {
  const isPast = day.date < todayISO();

  if (day.closed) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-surface-200 bg-white shadow-[var(--shadow-hair)]">
        <Header day={day} />
        <div className="hatch flex flex-col items-center gap-2 rounded-b-[var(--radius-xl)] px-6 py-14 text-center">
          <CalendarOff className="h-5 w-5 text-ink-400" aria-hidden />
          <p className="text-sm text-ink-500">Closed on {day.dayName}s</p>
          {day.note ? <p className="text-xs text-ink-400">{day.note}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-surface-200 bg-white shadow-[var(--shadow-hair)]">
      <Header day={day} />

      {isPast ? (
        <p className="border-b border-surface-200 bg-surface-50 px-5 py-2 text-xs text-ink-400">
          This date has passed — shown for reference.
        </p>
      ) : null}

      <ul className="space-y-1.5 p-3 sm:p-4">
        {day.slots.map((slot) => {
          const style = SLOT_STYLES[slot.status];
          const free = Math.max(0, slot.capacity - slot.booked);

          return (
            <li key={slot.start} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-right text-xs font-medium text-ink-500 tabular">
                {formatTime(slot.start)}
              </span>

              <span
                className={cx(
                  'flex flex-1 items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5',
                  style.className,
                )}
              >
                <span className="text-sm font-semibold">{style.label}</span>
                <span className="text-xs tabular opacity-70">
                  {slot.capacity === 0 ? '—' : `${free}/${slot.capacity} free`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-surface-200 px-5 py-3.5 text-xs leading-relaxed text-ink-400">
        Updates as the front desk books appointments. To reserve a slot, call{' '}
        <a
          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
          className="font-medium text-ink-600 underline underline-offset-2"
        >
          {phone}
        </a>
        . We do not take bookings through this website.
      </p>
    </div>
  );
}

function Header({ day }: { day: PublicDay }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-surface-200 px-5 py-4">
      <h3 className="text-base font-bold">{formatDate(day.date)}</h3>
      {!day.closed && day.opens && day.closes ? (
        <span className="text-xs text-ink-400 tabular">
          {formatTime(day.opens)} – {formatTime(day.closes)}
        </span>
      ) : null}
    </div>
  );
}
