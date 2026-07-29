/**
 * Browser-backed persistence for standalone mode.
 *
 * ⚠️  THIS IS PER-BROWSER STORAGE, NOT A DATABASE.
 *
 * Appointments written here live in one browser profile on one device. The
 * front desk's bookings will not appear on a patient's phone, on the other
 * clinic PC, or in a private window. Clearing site data erases them.
 *
 * That is a hard limit of running with no server, not a bug to work around:
 * "staff book it, everyone sees it" needs shared storage by definition. This
 * exists so the whole product is demonstrable end to end before the API is
 * deployed. Point `VITE_API_URL` at the backend and this file stops being used.
 */

import { clinics, providers, serviceBySlug } from '@/data/content';
import { todayISO, addDaysISO, weekdayOf } from '@/lib/format';
import { toMinutes, toTimeString } from '@/lib/scheduleEngine';
import type { AppointmentStatus, StaffUser } from '@/types';

const APPOINTMENTS_KEY = 'mdcas.local.appointments.v1';
const SESSION_KEY = 'mdcas.local.session.v1';
const SEEDED_KEY = 'mdcas.local.seeded.v1';

export interface StoredAppointment {
  id: string;
  clinicSlug: string;
  staffSlug: string;
  serviceSlug: string;
  date: string;
  start: string;
  end: string;
  patientName: string;
  patientContact: string;
  patientEmail?: string;
  notes?: string;
  status: AppointmentStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* -------------------------------------------------------------------------- */
/* Safe storage access                                                        */
/* -------------------------------------------------------------------------- */

// Private browsing and locked-down profiles can throw on any storage access,
// so every call is guarded. Falling back to memory keeps the app usable for
// the session even when nothing can be persisted.
let memoryFallback: Record<string, string> = {};

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryFallback[key] ?? null;
  }
}

function writeKey(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryFallback[key] = value;
  }
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    delete memoryFallback[key];
  }
}

/* -------------------------------------------------------------------------- */
/* Demo data                                                                  */
/* -------------------------------------------------------------------------- */

const PATIENT_NAMES = [
  'Maria Clara Santos', 'Jose Antonio Cruz', 'Angelica Reyes', 'Rafael Mendoza',
  'Kristine Joy Bautista', 'Emmanuel Dizon', 'Patricia Anne Lim', 'Carlo Miguel Ramos',
  'Sofia Isabel Garcia', 'Benjamin Torres', 'Rowena Aguilar', 'Dante Villanueva',
  'Charmaine Ocampo', 'Julius Fernandez', 'Marianne Castillo', 'Elmer Panganiban',
  'Trisha Mae Gonzales', 'Ferdinand Alvarez', 'Lourdes Manalo', 'Nathaniel Rivera',
  'Divina Gracia Salazar', 'Ronaldo Bautista', 'Jasmine Delos Reyes', 'Arnel Macaraig',
  'Vanessa Marquez', 'Christopher Tolentino', 'Bernadette Cabrera', 'Marilou Katigbak',
];

const NOTES = [
  'Follow-up from last visit.',
  'Patient reports sensitivity on the upper right.',
  'HMO approval already on file.',
  'First visit — needs full charting.',
  'Requested the same dentist as last time.',
  'Nervous patient — allow extra chair time.',
  '', '', '',
];

/** Deterministic PRNG (mulberry32) so the demo data is stable across reloads. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, items: readonly T[]): T | undefined {
  return items.length === 0 ? undefined : items[Math.floor(random() * items.length)];
}

function statusFor(random: () => number, date: string, today: string): AppointmentStatus {
  if (date < today) {
    const roll = random();
    if (roll < 0.85) return 'completed';
    if (roll < 0.95) return 'cancelled';
    return 'no-show';
  }
  const roll = random();
  if (roll < 0.1) return 'cancelled';
  if (roll < 0.55) return 'confirmed';
  return 'booked';
}

/**
 * Generates demo bookings from the real roster: a booking only ever exists for
 * a provider actually on shift at that branch, in a service both the provider
 * performs and the branch offers, inside opening hours. The demo data
 * therefore cannot contradict the schedule engine.
 */
function buildDemoAppointments(): StoredAppointment[] {
  const today = todayISO();
  const random = createRandom(20260729);
  const result: StoredAppointment[] = [];
  let counter = 0;

  for (let offset = -14; offset <= 45; offset += 1) {
    const date = addDaysISO(today, offset);
    const day = weekdayOf(date);

    for (const clinic of clinics) {
      const hours = clinic.hours.find((entry) => entry.day === day);
      if (!hours || hours.closed || !hours.opens || !hours.closes) continue;

      const clinicOpen = toMinutes(hours.opens);
      const clinicClose = toMinutes(hours.closes);

      for (const provider of providers) {
        const shift = provider.shifts.find(
          (entry) => entry.clinicSlug === clinic.slug && entry.day === day,
        );
        if (!shift) continue;

        const eligible = provider.serviceSlugs.filter((slug) =>
          clinic.serviceSlugs.includes(slug),
        );
        if (eligible.length === 0) continue;

        const shiftStart = Math.max(toMinutes(shift.start), clinicOpen);
        const shiftEnd = Math.min(toMinutes(shift.end), clinicClose);
        const taken = new Set<number>();

        for (let slot = shiftStart; slot + 60 <= shiftEnd; slot += 60) {
          if (random() > 0.38) continue;
          if (taken.has(slot)) continue;

          const serviceSlug = pick(random, eligible);
          if (!serviceSlug) continue;
          const service = serviceBySlug.get(serviceSlug);
          if (!service) continue;

          // Round up to whole hours so bookings align to the calendar grid.
          const blocks = Math.max(1, Math.ceil(service.durationMinutes / 60));
          const end = slot + blocks * 60;
          if (end > shiftEnd) continue;

          let clashes = false;
          for (let block = slot; block < end; block += 60) {
            if (taken.has(block)) clashes = true;
          }
          if (clashes) continue;
          for (let block = slot; block < end; block += 60) taken.add(block);

          counter += 1;
          const note = pick(random, NOTES) ?? '';
          result.push({
            id: `demo-${String(counter).padStart(5, '0')}`,
            clinicSlug: clinic.slug,
            staffSlug: provider.slug,
            serviceSlug,
            date,
            start: toTimeString(slot),
            end: toTimeString(end),
            patientName: pick(random, PATIENT_NAMES) ?? 'Walk-in Patient',
            patientContact: `+63 9${Math.floor(random() * 900000000 + 100000000)}`,
            notes: note || undefined,
            status: statusFor(random, date, today),
            createdBy: 'demo@maralitdental.ph',
          });
        }
      }
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Appointments                                                               */
/* -------------------------------------------------------------------------- */

let cache: StoredAppointment[] | null = null;

export function loadAppointments(): StoredAppointment[] {
  if (cache) return cache;

  const raw = readKey(APPOINTMENTS_KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as StoredAppointment[];
      return cache;
    } catch {
      // Corrupt payload — fall through and reseed rather than crash the app.
    }
  }

  cache = buildDemoAppointments();
  writeKey(APPOINTMENTS_KEY, JSON.stringify(cache));
  writeKey(SEEDED_KEY, new Date().toISOString());
  return cache;
}

function persist(items: StoredAppointment[]): void {
  cache = items;
  writeKey(APPOINTMENTS_KEY, JSON.stringify(items));
}

export function saveAppointment(appointment: StoredAppointment): void {
  const items = loadAppointments();
  const index = items.findIndex((item) => item.id === appointment.id);
  if (index === -1) persist([...items, appointment]);
  else persist(items.map((item) => (item.id === appointment.id ? appointment : item)));
}

export function deleteAppointment(id: string): boolean {
  const items = loadAppointments();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  persist(next);
  return true;
}

export function nextAppointmentId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Wipes local bookings and regenerates the demo set. */
export function resetDemoData(): void {
  cache = null;
  removeKey(APPOINTMENTS_KEY);
  removeKey(SEEDED_KEY);
  loadAppointments();
}

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

export function loadSession(): StaffUser | null {
  const raw = readKey(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StaffUser;
  } catch {
    return null;
  }
}

export function saveSession(user: StaffUser | null): void {
  if (user) writeKey(SESSION_KEY, JSON.stringify(user));
  else removeKey(SESSION_KEY);
}
