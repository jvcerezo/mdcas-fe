/**
 * Everything you need to actually get to a branch and call it: a map, the
 * address, directions, and the selected day's hours.
 *
 * THE PIN IS ONLY EVER AS GOOD AS THE DATA BEHIND IT.
 *
 * Two modes, in order of preference:
 *
 *   1. `clinic.coordinates` is set — an exact OpenStreetMap marker. Use this
 *      for production. OSM's export embed is free, keyless and stable, unlike
 *      Google's Embed API which needs a billable key.
 *
 *   2. No coordinates — Google geocodes the street address and drops its own
 *      pin. Less precise, but it derives from a real address rather than a
 *      guessed latitude, so it lands on the right street instead of an
 *      arbitrary point. This is the honest fallback while addresses are still
 *      being confirmed.
 *
 * Never hardcode approximate coordinates to make mode 1 fire. A confidently
 * wrong pin on a clinic site sends someone in pain to the wrong building; an
 * approximate pin that is visibly derived from the address does not.
 *
 * Directions always hand off to Google Maps, which is what people navigate
 * with here.
 */

import { Clock, ExternalLink, MapPin, Navigation, Phone } from 'lucide-react';

import { Card, cx } from '@/components/ui';
import { formatAddress, formatTimeRange, isOpenNow, weekdayOf } from '@/lib/format';
import type { Clinic } from '@/types';

/** The full postal address, used as the geocoding query. */
function addressQuery(clinic: Clinic): string {
  return `${clinic.name}, ${formatAddress(clinic.address)}`;
}

/** Mode 1: a tight bounding box around the exact pin, at street level. */
function osmEmbedUrl(lat: number, lng: number): string {
  const pad = 0.004;
  const bbox = [lng - pad, lat - pad / 2, lng + pad, lat + pad / 2].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/** Mode 2: let Google geocode the address and place its own marker. */
function googleEmbedUrl(clinic: Clinic): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(addressQuery(clinic))}&z=16&output=embed`;
}

function directionsUrl(clinic: Clinic): string {
  if (clinic.coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressQuery(clinic))}`;
}

function largerMapUrl(clinic: Clinic): string {
  if (clinic.coordinates) {
    const { lat, lng } = clinic.coordinates;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  }
  return clinic.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(addressQuery(clinic))}`;
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
        <iframe
          // Re-keying on the slug forces a fresh load when the branch changes;
          // some browsers keep the previous map otherwise.
          key={clinic.slug}
          title={`Map showing ${clinic.name}`}
          src={
            clinic.coordinates
              ? osmEmbedUrl(clinic.coordinates.lat, clinic.coordinates.lng)
              : googleEmbedUrl(clinic)
          }
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Say so when the pin is geocoded rather than surveyed. Quietly
            overstating precision is what makes people drive to the wrong
            place. */}
        {!clinic.coordinates ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.6875rem] font-medium text-ink-500 shadow-[var(--shadow-hair)] backdrop-blur">
            <MapPin className="h-3 w-3" aria-hidden />
            Approximate — call to confirm
          </span>
        ) : null}

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
