/**
 * Standalone-mode API. Implements the same surface as the network client in
 * `api.ts`, so pages never learn which one they are talking to.
 *
 * ⚠️  SECURITY BOUNDARY — READ THIS BEFORE SHIPPING TO REAL PATIENTS.
 *
 * On the server, patient data is behind authentication: an unauthenticated
 * caller physically cannot retrieve a name or contact number. In this mode
 * there is no server, so every appointment — including patient names, phone
 * numbers and clinical notes — is in the browser's own storage, readable by
 * anyone with devtools on that device. Sign-in here is a UX gate, not a
 * security control, and the demo passwords ship in the JS bundle.
 *
 * The consequence: standalone mode is for demos, review and development. It
 * must not hold real patient records. Deploy the API for that.
 */

import {
  clinicBySlug,
  clinics,
  demoStaffUsers,
  organization,
  providers,
  serviceBySlug,
  services,
  staff,
  staffBySlug,
} from '@/data/content';
import { ApiError } from '@/lib/apiError';
import {
  buildPublicMonthSchedule,
  buildWeeklyRoster,
  toStaffViews,
  validateAppointment,
} from '@/lib/scheduleEngine';
import {
  deleteAppointment as removeAppointment,
  loadAppointments,
  loadSession,
  nextAppointmentId,
  saveAppointment,
  saveSession,
  type StoredAppointment,
} from '@/lib/localStore';
import { addDaysISO, todayISO } from '@/lib/format';
import type {
  AppointmentInput,
  AppointmentStatus,
  StaffAppointment,
  StaffUser,
} from '@/types';

/** Keeps loading states visible rather than resolving in the same tick. */
function settle<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 60));
}

function requireSession(): StaffUser {
  const user = loadSession();
  if (!user) throw new ApiError(401, 'Sign in to view the staff schedule.');
  return user;
}

function canAccess(user: StaffUser, clinicSlug: string): boolean {
  if (user.role === 'admin') return true;
  if (user.clinicSlugs.length === 0) return true;
  return user.clinicSlugs.includes(clinicSlug);
}

function within(appointment: StoredAppointment, from: string, to: string): boolean {
  return appointment.date >= from && appointment.date <= to;
}

export const localApi = {
  /* ---------------------------------------------------------------- */
  /* Public                                                            */
  /* ---------------------------------------------------------------- */

  organization: () => settle(organization),

  clinics: () => settle(clinics),

  clinic: (slug: string) => {
    const clinic = clinicBySlug.get(slug);
    if (!clinic) throw new ApiError(404, `No branch with the slug "${slug}".`);
    return settle({
      ...clinic,
      services: clinic.serviceSlugs
        .map((serviceSlug) => serviceBySlug.get(serviceSlug))
        .filter((service): service is NonNullable<typeof service> => Boolean(service)),
      staff: staff.filter((member) =>
        member.shifts.some((shift) => shift.clinicSlug === slug),
      ),
      roster: buildWeeklyRoster({ clinicSlug: slug }),
    });
  },

  services: (params: { clinic?: string; featured?: boolean } = {}) => {
    let result = services;
    if (params.clinic) {
      const clinic = clinicBySlug.get(params.clinic);
      result = clinic
        ? clinic.serviceSlugs
            .map((slug) => serviceBySlug.get(slug))
            .filter((service): service is NonNullable<typeof service> => Boolean(service))
        : [];
    }
    if (params.featured) result = result.filter((service) => service.featured);
    return settle(result);
  },

  service: (slug: string) => {
    const service = serviceBySlug.get(slug);
    if (!service) throw new ApiError(404, `No service with the slug "${slug}".`);
    return settle({
      ...service,
      clinics: clinics.filter((clinic) => clinic.serviceSlugs.includes(slug)),
      staff: staff.filter((member) => member.serviceSlugs.includes(slug)),
    });
  },

  staff: (params: { clinic?: string } = {}) =>
    settle(
      params.clinic
        ? staff.filter((member) =>
            member.shifts.some((shift) => shift.clinicSlug === params.clinic),
          )
        : staff,
    ),

  staffMember: (slug: string) => {
    const member = staffBySlug.get(slug);
    if (!member) throw new ApiError(404, `No staff member with the slug "${slug}".`);
    return settle({
      ...member,
      services: member.serviceSlugs
        .map((serviceSlug) => serviceBySlug.get(serviceSlug))
        .filter((service): service is NonNullable<typeof service> => Boolean(service)),
      roster: buildWeeklyRoster({ staffSlug: slug }),
    });
  },

  roster: (params: { clinic?: string } = {}) =>
    settle(buildWeeklyRoster({ clinicSlug: params.clinic })),

  schedule: (clinicSlug: string, month: string) => {
    const result = buildPublicMonthSchedule(clinicSlug, month, loadAppointments());
    if (!result) throw new ApiError(404, `No branch with the slug "${clinicSlug}".`);
    return settle(result);
  },

  allSchedules: (month: string) => {
    const appointments = loadAppointments();
    return settle({
      month,
      clinics: clinics
        .map((clinic) => buildPublicMonthSchedule(clinic.slug, month, appointments))
        .filter((schedule): schedule is NonNullable<typeof schedule> => Boolean(schedule)),
    });
  },

  /* ---------------------------------------------------------------- */
  /* Auth — a demo gate, not a security control (see file header)      */
  /* ---------------------------------------------------------------- */

  login: (email: string, password: string) => {
    const match = demoStaffUsers.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );
    // Same message either way, matching the server's behaviour.
    if (!match || match.password !== password) {
      throw new ApiError(401, 'Incorrect email or password.');
    }

    const { password: _password, ...user } = match;
    const session: StaffUser = {
      ...user,
      staffProfile: user.staffSlug ? staffBySlug.get(user.staffSlug) : undefined,
    };
    saveSession(session);
    return settle({ token: `local-session-${user.id}`, user: session });
  },

  me: () => settle(requireSession()),

  /* ---------------------------------------------------------------- */
  /* Staff                                                             */
  /* ---------------------------------------------------------------- */

  bookingOptions: () => {
    const user = requireSession();
    return settle({
      clinics: clinics
        .filter((clinic) => canAccess(user, clinic.slug))
        .map((clinic) => ({
          slug: clinic.slug,
          name: clinic.name,
          shortName: clinic.shortName,
          accentColor: clinic.accentColor,
          hours: clinic.hours,
          serviceSlugs: clinic.serviceSlugs,
        })),
      providers: providers.map((member) => ({
        slug: member.slug,
        name: member.name,
        credentials: member.credentials,
        role: member.role,
        specialty: member.specialty,
        serviceSlugs: member.serviceSlugs,
        shifts: member.shifts,
      })),
      services: services.map((service) => ({
        slug: service.slug,
        name: service.name,
        category: service.category,
        durationMinutes: service.durationMinutes,
      })),
      statuses: [
        'booked',
        'confirmed',
        'completed',
        'cancelled',
        'no-show',
      ] as AppointmentStatus[],
    });
  },

  appointments: (params: {
    from?: string;
    to?: string;
    clinic?: string;
    staff?: string;
    status?: string;
    mine?: boolean;
  }) => {
    const user = requireSession();
    const today = todayISO();
    const from = params.from ?? today;
    const to = params.to ?? addDaysISO(today, 6);

    if (params.clinic && !canAccess(user, params.clinic)) {
      throw new ApiError(403, `Your account does not cover the ${params.clinic} branch.`);
    }

    let staffSlug = params.staff;
    if (params.mine) {
      if (!user.staffSlug) {
        throw new ApiError(400, 'This account is not linked to a staff profile.');
      }
      staffSlug = user.staffSlug;
    }

    let result = loadAppointments().filter((item) => within(item, from, to));
    if (params.clinic) result = result.filter((item) => item.clinicSlug === params.clinic);
    if (staffSlug) result = result.filter((item) => item.staffSlug === staffSlug);
    if (params.status) result = result.filter((item) => item.status === params.status);

    // Without an explicit branch filter, narrow to the branches this account
    // covers — the same scoping the server applies.
    if (!params.clinic) result = result.filter((item) => canAccess(user, item.clinicSlug));

    result = [...result].sort(
      (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
    );

    return settle({ from, to, count: result.length, appointments: toStaffViews(result) });
  },

  createAppointment: (input: AppointmentInput) => {
    const user = requireSession();
    if (!canAccess(user, input.clinicSlug)) {
      throw new ApiError(403, `Your account does not cover the ${input.clinicSlug} branch.`);
    }

    const existing = loadAppointments();
    const { errors, warnings } = validateAppointment(input, existing);
    if (errors.length > 0) {
      throw new ApiError(409, errors[0] ?? 'The booking could not be saved.', { errors });
    }

    const now = new Date().toISOString();
    const created: StoredAppointment = {
      ...input,
      id: nextAppointmentId(),
      createdBy: user.email,
      createdAt: now,
      updatedAt: now,
    };
    saveAppointment(created);

    return settle({ appointment: toStaffViews([created])[0] as StaffAppointment, warnings });
  },

  updateAppointment: (id: string, patch: Partial<AppointmentInput>) => {
    const user = requireSession();
    const existing = loadAppointments();
    const current = existing.find((item) => item.id === id);
    if (!current) throw new ApiError(404, 'No appointment with that id.');
    if (!canAccess(user, current.clinicSlug)) {
      throw new ApiError(403, 'Your account does not cover that branch.');
    }

    const merged: StoredAppointment = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const { errors, warnings } = validateAppointment(merged, existing, id);
    if (errors.length > 0) {
      throw new ApiError(409, errors[0] ?? 'The booking could not be saved.', { errors });
    }

    saveAppointment(merged);
    return settle({ appointment: toStaffViews([merged])[0] as StaffAppointment, warnings });
  },

  cancelAppointment: (id: string) => {
    const user = requireSession();
    const current = loadAppointments().find((item) => item.id === id);
    if (!current) throw new ApiError(404, 'No appointment with that id.');
    if (!canAccess(user, current.clinicSlug)) {
      throw new ApiError(403, 'Your account does not cover that branch.');
    }

    const cancelled: StoredAppointment = {
      ...current,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    saveAppointment(cancelled);
    return settle({ appointment: toStaffViews([cancelled])[0] as StaffAppointment });
  },

  deleteAppointment: (id: string) => {
    const user = requireSession();
    if (user.role !== 'admin') {
      throw new ApiError(403, 'Only an administrator can permanently delete an appointment.');
    }
    removeAppointment(id);
    return settle(undefined as void);
  },
};
