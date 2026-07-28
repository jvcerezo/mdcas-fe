/**
 * Mirrors `mdcas-be/src/types.ts`. Keep the two in sync — these are the shapes
 * the API actually returns.
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type AccentColor = 'teal' | 'indigo' | 'amber';

export type StaffRole = 'Dentist' | 'Dental Hygienist' | 'Dental Assistant' | 'Front Desk';

export interface OpeningHours {
  day: DayOfWeek;
  opens?: string;
  closes?: string;
  closed: boolean;
  note?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  barangay?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export interface Clinic {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  isMainBranch: boolean;
  yearEstablished: number;
  address: Address;
  coordinates?: { lat: number; lng: number };
  mapUrl?: string;
  phone: string;
  mobile?: string;
  email: string;
  accentColor: AccentColor;
  heroImage?: string;
  hours: OpeningHours[];
  serviceSlugs: string[];
  highlights: string[];
  amenities: string[];
  acceptedInsurers: string[];
}

export interface Service {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  durationMinutes: number;
  priceMin: number;
  priceMax?: number;
  icon: string;
  featured: boolean;
  notes?: string[];
}

export interface StaffShift {
  clinicSlug: string;
  day: DayOfWeek;
  start: string;
  end: string;
}

export interface StaffMember {
  slug: string;
  name: string;
  credentials: string;
  role: StaffRole;
  specialty: string;
  bio: string;
  photo?: string;
  yearsExperience: number;
  languages: string[];
  serviceSlugs: string[];
  shifts: StaffShift[];
}

export interface ScheduleEntry {
  id: string;
  day: DayOfWeek;
  dayName: string;
  start: string;
  end: string;
  clinic: {
    slug: string;
    name: string;
    shortName: string;
    accentColor: AccentColor;
    city: string;
    phone: string;
  };
  staff: {
    slug: string;
    name: string;
    credentials: string;
    role: StaffRole;
    specialty: string;
    photo?: string;
  };
  serviceSlugs: string[];
}

/** A branch page payload — the branch plus everything it needs, in one call. */
export interface ClinicDetail extends Clinic {
  services: Service[];
  staff: StaffMember[];
  roster: ScheduleEntry[];
}

export interface ServiceDetail extends Service {
  clinics: Clinic[];
  staff: StaffMember[];
}

export interface StaffMemberDetail extends StaffMember {
  services: Service[];
  roster: ScheduleEntry[];
}

export interface Organization {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  hotline: string;
  mobile: string;
  email: string;
  emergencyHotline: string;
  yearEstablished: number;
  social: { facebook: string; instagram: string };
  stats: Array<{ label: string; value: string }>;
}

/* -------------------------------------------------------------------------- */
/* Public schedule — redacted. No patient data exists in these shapes.        */
/* -------------------------------------------------------------------------- */

export type PublicSlotStatus = 'available' | 'limited' | 'full' | 'unavailable';

export interface PublicSlot {
  start: string;
  end: string;
  capacity: number;
  booked: number;
  status: PublicSlotStatus;
}

export interface PublicDay {
  date: string;
  day: DayOfWeek;
  dayName: string;
  closed: boolean;
  note?: string;
  opens?: string;
  closes?: string;
  slots: PublicSlot[];
  totalSlots: number;
  availableSlots: number;
}

export interface PublicMonthSchedule {
  clinic: {
    slug: string;
    name: string;
    shortName: string;
    accentColor: AccentColor;
    phone: string;
    mobile?: string;
    email: string;
  };
  month: string;
  year: number;
  monthNumber: number;
  days: PublicDay[];
}

export interface AllPublicSchedules {
  month: string;
  clinics: PublicMonthSchedule[];
}

/* -------------------------------------------------------------------------- */
/* Staff-only                                                                 */
/* -------------------------------------------------------------------------- */

export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'booked',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',
];

export interface StaffAppointment {
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
  clinicName: string;
  staffName: string;
  serviceName: string;
  serviceDurationMinutes: number;
}

export interface AppointmentListResponse {
  from: string;
  to: string;
  count: number;
  appointments: StaffAppointment[];
}

export type StaffUserRole = 'admin' | 'dentist' | 'frontdesk';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffUserRole;
  clinicSlugs: string[];
  staffSlug?: string;
  active: boolean;
  staffProfile?: StaffMember;
}

export interface BookingOptions {
  clinics: Array<{
    slug: string;
    name: string;
    shortName: string;
    accentColor: AccentColor;
    hours: OpeningHours[];
    serviceSlugs: string[];
  }>;
  providers: Array<{
    slug: string;
    name: string;
    credentials: string;
    role: StaffRole;
    specialty: string;
    serviceSlugs: string[];
    shifts: StaffShift[];
  }>;
  services: Array<{
    slug: string;
    name: string;
    category: string;
    durationMinutes: number;
  }>;
  statuses: AppointmentStatus[];
}

export interface AppointmentInput {
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
}
