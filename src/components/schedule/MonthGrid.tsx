/**
 * The public month calendar.
 *
 * Every cell summarises one day as a small stack of hour bars — a sparkline of
 * how busy the branch is — so a whole month reads at a glance. Selecting a day
 * opens the hour-by-hour breakdown beneath.
 *
 * Nothing here can display patient information: `PublicDay` and `PublicSlot`
 * carry only counts and a status.
 */

import { cx } from '@/components/ui';
import { SLOT_STYLES, todayISO, weekdayOf } from '@/lib/format';
import type { PublicDay, PublicSlotStatus } from '@/types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday-first column index for a weekday, since PH clinics run Mon–Sat. */
function columnFor(day: number): number {
  return day === 0 ? 6 : day - 1;
}

const BAR_TONES: Record<PublicSlotStatus, string> = {
  available: 'bg-[var(--color-slot-open-line)]',
  limited: 'bg-[var(--color-slot-filling-line)]',
  full: 'bg-[var(--color-slot-full-line)]',
  unavailable: 'bg-[var(--color-slot-none-line)]',
};

export function MonthGrid({
  days,
  selectedDate,
  onSelect,
}: {
  days: PublicDay[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const today = todayISO();
  const firstDay = days[0];
  const leadingBlanks = firstDay ? columnFor(weekdayOf(firstDay.date)) : 0;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="pb-2 text-center text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-400 uppercase"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label[0]}</span>
          </div>
        ))}

        {Array.from({ length: leadingBlanks }, (_, index) => (
          <div key={`blank-${index}`} aria-hidden />
        ))}

        {days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            isToday={day.date === today}
            isPast={day.date < today}
            isSelected={day.date === selectedDate}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({
  day,
  isToday,
  isPast,
  isSelected,
  onSelect,
}: {
  day: PublicDay;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  onSelect: (date: string) => void;
}) {
  const dayNumber = Number(day.date.slice(8, 10));
  const disabled = day.closed;

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(day.date)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={
        day.closed
          ? `${day.dayName} ${dayNumber}, closed`
          : `${day.dayName} ${dayNumber}, ${day.availableSlots} of ${day.totalSlots} hours open`
      }
      className={cx(
        'group relative flex aspect-square flex-col rounded-[var(--radius-md)] border p-1.5 text-left transition-all duration-200 sm:p-2.5',
        disabled
          ? 'hatch cursor-not-allowed border-bone-300 bg-bone-200/60'
          : 'border-[color-mix(in_srgb,var(--color-ink-900)_9%,transparent)] bg-white hover:border-ink-400 hover:shadow-[var(--shadow-hair)]',
        isSelected && 'ring-2 ring-brand-600 ring-offset-1 ring-offset-bone-100',
        // Past days stay legible but visibly recede.
        isPast && !disabled && 'opacity-55',
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cx(
            'text-xs font-medium tabular sm:text-sm',
            isToday ? 'text-brand-700' : disabled ? 'text-ink-400' : 'text-ink-700',
          )}
        >
          {dayNumber}
        </span>
        {isToday ? (
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
        ) : null}
      </span>

      {day.closed ? (
        <span className="mt-auto hidden text-[0.625rem] leading-tight text-ink-400 sm:block">
          Closed
        </span>
      ) : (
        <>
          {/* One thin bar per open hour — the day's shape at a glance. */}
          <span className="mt-auto flex gap-px" aria-hidden>
            {day.slots.map((slot) => (
              <span
                key={slot.start}
                className={cx('h-4 flex-1 rounded-[1px] sm:h-5', BAR_TONES[slot.status])}
              />
            ))}
          </span>
          <span className="mt-1.5 hidden text-[0.625rem] leading-none text-ink-400 tabular sm:block">
            {day.availableSlots}/{day.totalSlots} open
          </span>
        </>
      )}
    </button>
  );
}

/** The shared legend. Wording is kept identical to the API's own legend. */
export function ScheduleLegend({ className }: { className?: string }) {
  const entries: Array<PublicSlotStatus | 'closed'> = [
    'available',
    'limited',
    'full',
    'unavailable',
    'closed',
  ];

  return (
    <div className={cx('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>
      {entries.map((key) => {
        const style = SLOT_STYLES[key];
        return (
          <span key={key} className="inline-flex items-center gap-2 text-xs text-ink-500">
            <span className={cx('h-3 w-3 shrink-0 rounded-sm border', style.swatch)} aria-hidden />
            {style.label}
          </span>
        );
      })}
    </div>
  );
}
