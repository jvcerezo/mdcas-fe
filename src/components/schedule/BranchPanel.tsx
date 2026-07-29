/**
 * Everything you need to actually get to a branch and call it: a map pin,
 * the address, directions, and today's hours.
 *
 * The map is an OpenStreetMap embed rather than Google Maps. Google's Embed
 * API needs a billable key, and the keyless `output=embed` URL is undocumented
 * and can break without warning. OSM's export embed is stable, free, and needs
 * no key. Directions still hand off to Google Maps, which is what people
 * actually navigate with here.
 */

import { Clock, ExternalLink, MapPin, Navigation, Phone } from 'lucide-react';

import { Card, cx } from '@/components/ui';
import { formatAddress, formatTimeRange, isOpenNow, weekdayOf } from '@/lib/format';
import type { Clinic } from '@/types';

/** A tight bounding box around the pin, so the embed opens at street level. */
function embedUrl(lat: number, lng: number): string {
  const pad = 0.004;
  const bbox = [lng - pad, lat - pad / 2, lng + pad, lat + pad / 2].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function directionsUrl(clinic: Clinic): string {
  // Prefer coordinates — a street address in Los Baños is often ambiguous.
  if (clinic.coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`;
  }
  const query = encodeURIComponent(`${clinic.name}, ${formatAddress(clinic.address)}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

function largerMapUrl(clinic: Clinic): string {
  if (clinic.coordinates) {
    const { lat, lng } = clinic.coordinates;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  }
  return clinic.mapUrl ?? '#';
}

export function BranchPanel({ clinic, date }: { clinic: Clinic; date: string | null }) {
  const open = isOpenNow(clinic.hours);
  const weekday = date ? weekdayOf(date) : null;
  const dayHours =
    weekday === null ? null : (clinic.hours.find((entry) => entry.day === weekday) ?? null);

  return (
    <Card className="overflow-hidden">
      {/* Map */}
      <div className="relative aspect-[16/10] w-full bg-surface-100">
        {clinic.coordinates ? (
          <iframe
            key={clinic.slug}
            title={`Map showing ${clinic.name}`}
            src={embedUrl(clinic.coordinates.lat, clinic.coordinates.lng)}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-400">
            <MapPin className="h-5 w-5" aria-hidden />
            <span className="text-xs">Map unavailable for this branch</span>
          </div>
        )}

        <a
          href={largerMapUrl(clinic)}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-ink-700 shadow-[var(--shadow-soft)] backdrop-blur transition-colors hover:text-brand-700"
        >
          <ExternalLink className="h-3 w-3" aria-hidden />
          Larger map
        </a>
      </div>

      {/* Address and status */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold">{clinic.name}</h3>
            <p className="mt-1.5 flex gap-2 text-sm leading-relaxed text-ink-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
              {formatAddress(clinic.address)}
            </p>
          </div>
          <span
            className={cx(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              open
                ? 'border-[var(--color-slot-open-line)] bg-[var(--color-slot-open)] text-[var(--color-slot-open-ink)]'
                : 'border-surface-200 bg-surface-100 text-ink-400',
            )}
          >
            <span
              className={cx(
                'h-1.5 w-1.5 rounded-full',
                open ? 'bg-[var(--color-slot-open-ink)]' : 'bg-ink-400',
              )}
            />
            {open ? 'Open now' : 'Closed now'}
          </span>
        </div>

        {/* Hours for the day currently selected on the calendar. */}
        {dayHours ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
            <Clock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
            {dayHours.closed || !dayHours.opens || !dayHours.closes ? (
              <span>Closed on the selected day</span>
            ) : (
              <span className="tabular">
                {formatTimeRange(dayHours.opens, dayHours.closes)} on the selected day
              </span>
            )}
          </p>
        ) : null}

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <a
            href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-brand-700"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            Call
          </a>
          <a
            href={directionsUrl(clinic)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-surface-300 bg-white text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            Directions
          </a>
        </div>

        <p className="mt-3 text-center text-xs text-ink-400 tabular">{clinic.phone}</p>
      </div>
    </Card>
  );
}
