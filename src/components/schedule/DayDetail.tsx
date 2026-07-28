/**
 * Hour-by-hour breakdown for one day at one branch — the public view.
 *
 * Shows only how busy each hour is. There is no patient information in the
 * data this renders, by design.
 */

import { Phone } from 'lucide-react';

import { Card, cx } from '@/components/ui';
import { SLOT_STYLES, formatDate, formatTime, todayISO } from '@/lib/format';
import type { PublicDay, PublicMonthSchedule } from '@/types';

export function DayDetail({
  day,
  clinic,
}: {
  day: PublicDay;
  clinic: PublicMonthSchedule['clinic'];
}) {
  const isPast = day.date < todayISO();

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 hairline">
        <div>
          <h3 className="text-lg">{formatDate(day.date)}</h3>
          <p className="mt-1 text-sm text-ink-400">
            {day.closed
              ? (day.note ?? 'Closed')
              : `${clinic.shortName} · ${formatTime(day.opens ?? '')} – ${formatTime(day.closes ?? '')}`}
          </p>
        </div>

        {!day.closed ? (
          <a
            href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink-900 px-5 text-sm font-medium text-bone-50 transition-colors hover:bg-ink-700"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular">{clinic.phone}</span>
          </a>
        ) : null}
      </div>

      {day.closed ? (
        <div className="hatch px-6 py-16 text-center">
          <p className="text-sm text-ink-500">
            {clinic.shortName} is closed on {day.dayName}s.
          </p>
          {day.note ? <p className="mt-1.5 text-xs text-ink-400">{day.note}</p> : null}
        </div>
      ) : (
        <>
          {isPast ? (
            <p className="border-b bg-bone-200/50 px-6 py-2.5 text-xs text-ink-400 hairline">
              This date has passed — shown for reference.
            </p>
          ) : null}

          <ul className="divide-y divide-[color-mix(in_srgb,var(--color-ink-900)_7%,transparent)]">
            {day.slots.map((slot) => {
              const style = SLOT_STYLES[slot.status];
              const free = Math.max(0, slot.capacity - slot.booked);

              return (
                <li
                  key={slot.start}
                  className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-bone-50"
                >
                  <span className="w-24 shrink-0 text-sm font-medium text-ink-700 tabular">
                    {formatTime(slot.start)}
                  </span>

                  {/* The bar is the primary signal; the badge names it for
                      anyone who cannot rely on colour alone. */}
                  <span
                    className={cx(
                      'h-7 flex-1 rounded-[var(--radius-sm)] border',
                      style.className,
                    )}
                    aria-hidden
                  />

                  <span
                    className={cx(
                      'w-32 shrink-0 rounded-full border px-2.5 py-1 text-center text-xs font-medium',
                      style.className,
                    )}
                  >
                    {style.label}
                  </span>

                  <span className="hidden w-28 shrink-0 text-right text-xs text-ink-400 tabular sm:block">
                    {slot.capacity === 0
                      ? '—'
                      : `${free} of ${slot.capacity} free`}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="border-t bg-bone-100 px-6 py-4 text-xs leading-relaxed text-ink-400 hairline">
            Availability updates as the front desk books appointments. To reserve a slot, call{' '}
            <a
              href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
              className="font-medium text-ink-600 underline underline-offset-2"
            >
              {clinic.phone}
            </a>
            . We do not take bookings through this website.
          </p>
        </>
      )}
    </Card>
  );
}
