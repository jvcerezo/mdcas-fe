import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireAuth={false}>
                <SignUpPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireAuth={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requireAuth={true}>
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl">Profile Page - Coming Soon</h1>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute requireAuth={true}>
                <AppointmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requireAuth={true}>
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl">Settings Page - Coming Soon</h1>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
