import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegistrationPage } from './pages/RegistrationPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

describe('Registration Form & Admin Login Components', () => {
  it('renders Registration form sections A, B, and C', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <RegistrationPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/1. Team Identity & Communication/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Team Members Roster/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Designate Team Leader/i)).toBeInTheDocument();
    expect(screen.getByText(/4. Project & Problem Statement Vertical/i)).toBeInTheDocument();
    expect(screen.getByText(/5. Faculty Supervisor Mentorship/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Official Registration/i })).toBeInTheDocument();

    // Verify Department & Section dropdown setup
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(4); // Category, Team Dept, Team Sec, Member Dept, Member Year, Member Sec
  });

  it('renders Admin Login page with credentials inputs and rate-limit indicator', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AdminLoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Organizer Portal Login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin@marephraem.edu.in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate-Limited Endpoint/i)).toBeInTheDocument();
  });
});
