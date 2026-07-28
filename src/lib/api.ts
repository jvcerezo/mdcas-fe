/**
 * Typed client for the MDCAS API.
 *
 * In development `VITE_API_URL` is left blank and Vite proxies `/api` to the
 * backend, so the browser sees a single origin. In production it is set to the
 * deployed API's base URL.
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
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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

export const api = {
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
