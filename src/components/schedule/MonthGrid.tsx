/**
 * The public month calendar.
 *
 * Each cell is a date and one slim meter — a segment per open hour, tinted by
 * how busy that hour is. That single graphic is the whole point: a month's
 * shape is legible at a glance without reading anything.
 *
 * Everything else that used to live in a cell (a fraction, a second label) was
 * repeating what the meter already said, so it is gone. Detail belongs in the
 * day panel, not tiled thirty times.
 *
 * Nothing here can display patient information: `PublicDay` and `PublicSlot`
 * carry only counts and a status.
 */

import { cx } from '@/components/ui';
import { SLOT_STYLES, todayISO, weekdayOf } from '@/lib/format';
import type { PublicDay, PublicSlotStatus } from '@/types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday-first column index, since the clinics run Mon–Sat. */
function columnFor(day: number): number {
  return day === 0 ? 6 : day - 1;
}

const METER_TONES: Record<PublicSlotStatus, string> = {
  available: 'bg-[var(--color-slot-open-ink)]/55',
  limited: 'bg-[var(--color-slot-filling-ink)]/45',
  full: 'bg-[var(--color-slot-full-ink)]/30',
  unavailable: 'bg-surface-200',
};

/** One status standing in for a whole day, for the compact mobile bar. */
function summarise(day: PublicDay): PublicSlotStatus {
  if (day.totalSlots === 0) return 'unavailable';
  if (day.availableSlots === 0) return 'full';
  if (day.availableSlots < day.totalSlots / 2) return 'limited';
  return 'available';
}

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
    // Tighter gaps on a phone buy back width for the cells themselves, which
    // are the tap targets.
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="pb-2 text-center text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-400 uppercase"
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

  return (
    <button
      type="button"
      onClick={() => !day.closed && onSelect(day.date)}
      disabled={day.closed}
      aria-pressed={isSelected}
      aria-label={
        day.closed
          ? `${day.dayName} ${dayNumber}, closed`
          : `${day.dayName} ${dayNumber}, ${day.availableSlots} of ${day.totalSlots} hours open`
      }
      className={cx(
        'group relative flex aspect-square flex-col justify-between rounded-[var(--radius-md)] border p-1 text-left transition-all duration-200 sm:p-2.5',
        day.closed
          ? 'hatch cursor-not-allowed border-surface-200 bg-surface-50'
          : 'border-surface-200 bg-white hover:border-brand-300 hover:shadow-[var(--shadow-hair)]',
        isSelected && '!border-brand-500 bg-brand-50 ring-2 ring-brand-500/25',
        isPast && !day.closed && !isSelected && 'opacity-50',
      )}
    >
      <span
        className={cx(
          'inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold tabular sm:text-sm',
          isToday
            ? 'bg-brand-600 text-white'
            : day.closed
              ? 'text-ink-300'
              : isSelected
                ? 'text-brand-800'
                : 'text-ink-600',
        )}
      >
        {dayNumber}
      </span>

      {/* The day's shape, at two densities.
          On tablet and up there is room for one segment per open hour. On a
          phone a cell is roughly 38px wide, where ten segments plus their gaps
          collapse into an unreadable smear — so below `sm` it becomes a single
          proportional bar: how much of the day is still open, tinted by how
          busy the day is overall. */}
      {!day.closed ? (
        <>
          <span className="hidden gap-[2px] sm:flex" aria-hidden>
            {day.slots.map((slot) => (
              <span
                key={slot.start}
                className={cx('h-2 flex-1 rounded-full', METER_TONES[slot.status])}
              />
            ))}
          </span>

          <span
            className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-200 sm:hidden"
            aria-hidden
          >
            <span
              className={cx('block h-full rounded-full', METER_TONES[summarise(day)])}
              style={{
                width: `${day.totalSlots === 0 ? 0 : (day.availableSlots / day.totalSlots) * 100}%`,
              }}
            />
          </span>
        </>
      ) : null}
    </button>
  );
}

/**
 * The legend. Four entries — the calendar only ever uses four tones, and a
 * fifth was one more thing to decode for no added information.
 */
export function ScheduleLegend({ className }: { className?: string }) {
  const entries: Array<PublicSlotStatus | 'closed'> = [
    'available',
    'limited',
    'full',
    'closed',
  ];

  return (
    <div className={cx('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
      {entries.map((key) => {
        const style = SLOT_STYLES[key];
        return (
          <span key={key} className="inline-flex items-center gap-2 text-xs text-ink-500">
            <span
              className={cx('h-2.5 w-6 shrink-0 rounded-full border', style.swatch)}
              aria-hidden
            />
            {style.label}
          </span>
        );
      })}
    </div>
  );
}
