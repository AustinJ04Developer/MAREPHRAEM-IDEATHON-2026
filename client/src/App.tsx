import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/AdminLayout';

import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRegistrationsPage } from './pages/AdminRegistrationsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminReportSettingsPage } from './pages/AdminReportSettingsPage';

// Public layout wrapper with Navbar & Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <RegistrationPage />
                </PublicLayout>
              }
            />
            <Route
              path="/confirmation/:projectId"
              element={
                <PublicLayout>
                  <ConfirmationPage />
                </PublicLayout>
              }
            />
            <Route
              path="/admin/login"
              element={
                <PublicLayout>
                  <AdminLoginPage />
                </PublicLayout>
              }
            />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="registrations" element={<AdminRegistrationsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings/report" element={<AdminReportSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
