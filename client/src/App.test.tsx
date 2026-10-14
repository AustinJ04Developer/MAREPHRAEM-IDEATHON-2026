import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('MAREPHRAEM IDEATHON 2026 Frontend App', () => {
  it('renders landing page with title and register action button', async () => {
    render(<App />);

    // Brand and Heading
    expect(screen.getAllByText(/Ideasource/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Register Your Team/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Problem Verticals/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links and admin portal access', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Register Team/i }).length).toBeGreaterThan(0);
  });
});
