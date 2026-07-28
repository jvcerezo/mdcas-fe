import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { StaffLayout } from '@/components/staff/StaffLayout';
import { RequireAuth } from '@/components/staff/RequireAuth';
import { AuthProvider } from '@/lib/auth';

import { HomePage } from '@/pages/HomePage';
import { ClinicsPage } from '@/pages/ClinicsPage';
import { ClinicDetailPage } from '@/pages/ClinicDetailPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { StaffLoginPage } from '@/pages/staff/StaffLoginPage';
import { StaffSchedulePage } from '@/pages/staff/StaffSchedulePage';
import { StaffTodayPage } from '@/pages/staff/StaffTodayPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="clinics" element={<ClinicsPage />} />
            <Route path="clinics/:slug" element={<ClinicDetailPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Staff portal — sign-in is public, everything past it is guarded. */}
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route
            path="/staff"
            element={
              <RequireAuth>
                <StaffLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/staff/today" replace />} />
            <Route path="today" element={<StaffTodayPage />} />
            <Route path="schedule" element={<StaffSchedulePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
