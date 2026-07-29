/**
 * Data access for the app.
 *
 * Two interchangeable implementations sit behind one `api` object:
 *
 *   NETWORK     — talks to the MDCAS backend. Used whenever `VITE_API_URL` is
 *                 set, and in local development where Vite proxies `/api` to
 *                 a backend running on port 5000.
 *
 *   STANDALONE  — runs the whole product in the browser: content is bundled,
 *                 the schedule engine is ported to the client, and bookings
 *                 live in localStorage. Used when no API is configured.
 *
 * Pages never know which is active, so deploying the backend later is a
 * one-line environment change rather than a rewrite.
 *
 * Standalone mode cannot share data between devices and has no real
 * authentication — see the warnings in `localStore.ts` and `localBackend.ts`.
 */

import type {
  AllPublicSchedules,
  AppointmentInput,
  AppointmentListResponse,
  BookingOptions,
  Clinic,
  ClinicDetail,
  Organization,
  PublicMonthSchedule,
  ScheduleEntry,
  Service,
  ServiceDetail,
  StaffAppointment,
  StaffMember,
  StaffMemberDetail,
  StaffUser,
} from '@/types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/**
 * Standalone mode is the default, so a fresh checkout and a bare Vercel deploy
 * both just work. It is disabled by setting `VITE_API_URL`, or forced either
 * way with `VITE_DATA_MODE=local | api`.
 *
 * In `npm run dev` the Vite proxy makes a same-origin `/api` work with no
 * `VITE_API_URL`, so network mode is opt-in there via `VITE_DATA_MODE=api`.
 */
const MODE = import.meta.env.VITE_DATA_MODE;
export const STANDALONE = MODE === 'local' || (MODE !== 'api' && BASE_URL === '');

const TOKEN_KEY = 'mdcas.staff.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // Private browsing modes can throw on storage access.
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Storage unavailable — the session just won't survive a reload. */
  }

  // Standalone mode keeps the signed-in user alongside the token. Clearing one
  // without the other would leave `me()` resolving for a signed-out user.
  if (STANDALONE && !token) saveSession(null);
}

import { ApiError } from '@/lib/apiError';
import { localApi } from '@/lib/localBackend';
import { saveSession } from '@/lib/localStore';

export { ApiError };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attaches the staff token. Required for anything under /staff-portal. */
  auth?: boolean;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(
      0,
      'Could not reach the clinic server. Check your connection and try again.',
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const record = payload as { error?: string; details?: unknown } | null;

    // An expired or revoked token should not leave a stale session behind.
    if (response.status === 401) setToken(null);

    throw new ApiError(
      response.status,
      record?.error ?? `Request failed (${response.status})`,
      record?.details,
    );
  }

  return payload as T;
}

const networkApi = {
  /* ---------------------------------------------------------------- */
  /* Public                                                            */
  /* ---------------------------------------------------------------- */

  organization: (signal?: AbortSignal) => request<Organization>('/organization', { signal }),

  clinics: (signal?: AbortSignal) => request<Clinic[]>('/clinics', { signal }),

  clinic: (slug: string, signal?: AbortSignal) =>
    request<ClinicDetail>(`/clinics/${slug}`, { signal }),

  services: (params: { clinic?: string; featured?: boolean } = {}, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    if (params.clinic) query.set('clinic', params.clinic);
    if (params.featured) query.set('featured', 'true');
    const suffix = query.toString() ? `?${query}` : '';
    return request<Service[]>(`/services${suffix}`, { signal });
  },

  service: (slug: string, signal?: AbortSignal) =>
    request<ServiceDetail>(`/services/${slug}`, { signal }),

  staff: (params: { clinic?: string } = {}, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    if (params.clinic) query.set('clinic', params.clinic);
    const suffix = query.toString() ? `?${query}` : '';
    return request<StaffMember[]>(`/staff${suffix}`, { signal });
  },

  staffMember: (slug: string, signal?: AbortSignal) =>
    request<StaffMemberDetail>(`/staff/${slug}`, { signal }),

  roster: (params: { clinic?: string } = {}, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    if (params.clinic) query.set('clinic', params.clinic);
    const suffix = query.toString() ? `?${query}` : '';
    return request<ScheduleEntry[]>(`/roster${suffix}`, { signal });
  },

  /** The redacted month calendar for one branch. */
  schedule: (clinicSlug: string, month: string, signal?: AbortSignal) =>
    request<PublicMonthSchedule>(`/schedule/${clinicSlug}?month=${month}`, { signal }),

  /** The redacted month calendar for every branch at once. */
  allSchedules: (month: string, signal?: AbortSignal) =>
    request<AllPublicSchedules>(`/schedule?month=${month}`, { signal }),

  /* ---------------------------------------------------------------- */
  /* Staff — all require a token                                       */
  /* ---------------------------------------------------------------- */

  login: (email: string, password: string) =>
    request<{ token: string; user: StaffUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  me: (signal?: AbortSignal) => request<StaffUser>('/auth/me', { auth: true, signal }),

  bookingOptions: (signal?: AbortSignal) =>
    request<BookingOptions>('/staff-portal/options', { auth: true, signal }),

  appointments: (
    params: {
      from?: string;
      to?: string;
      clinic?: string;
      staff?: string;
      status?: string;
      mine?: boolean;
    },
    signal?: AbortSignal,
  ) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.clinic) query.set('clinic', params.clinic);
    if (params.staff) query.set('staff', params.staff);
    if (params.status) query.set('status', params.status);
    if (params.mine) query.set('mine', 'true');
    return request<AppointmentListResponse>(`/staff-portal/appointments?${query}`, {
      auth: true,
      signal,
    });
  },

  createAppointment: (input: AppointmentInput) =>
    request<{ appointment: StaffAppointment; warnings: string[] }>(
      '/staff-portal/appointments',
      { method: 'POST', body: input, auth: true },
    ),

  updateAppointment: (id: string, patch: Partial<AppointmentInput>) =>
    request<{ appointment: StaffAppointment; warnings: string[] }>(
      `/staff-portal/appointments/${id}`,
      { method: 'PATCH', body: patch, auth: true },
    ),

  /** Cancels by default, preserving the record for reporting. */
  cancelAppointment: (id: string) =>
    request<{ appointment: StaffAppointment }>(`/staff-portal/appointments/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  /** Permanently removes the record. Admin only. */
  deleteAppointment: (id: string) =>
    request<void>(`/staff-portal/appointments/${id}?hard=true`, {
      method: 'DELETE',
      auth: true,
    }),
};

/**
 * The two implementations must stay interchangeable, so the standalone adapter
 * is assigned to the network client's type with no cast. Adding a method to
 * one and not the other, or changing a signature, fails the build here rather
 * than at runtime in whichever mode nobody tested.
 */
const standaloneApi: typeof networkApi = localApi;

export const api: typeof networkApi = STANDALONE ? standaloneApi : networkApi;
