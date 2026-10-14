import { describe, it, expect } from 'vitest';
import { sanitizeCsvCell, generateRegistrationsCsv } from '../services/csv.service.js';

describe('CSV Formula Injection Protection & Sanitization', () => {
  it('mitigates formula injection by prefixing risky trigger characters with a single quote', () => {
    // Risky trigger characters: =, +, -, @, \t, \r
    expect(sanitizeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(sanitizeCsvCell('+cmd|')).toBe(`"'+cmd|"`);
    expect(sanitizeCsvCell('-2*3')).toBe(`"'-2*3"`);
    expect(sanitizeCsvCell('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
  });

  it('escapes internal quotes correctly', () => {
    expect(sanitizeCsvCell('Team "Alpha"')).toBe(`"Team ""Alpha"""`);
  });

  it('safely formats standard strings and numbers', () => {
    expect(sanitizeCsvCell('Healthcare & Wellness')).toBe(`"Healthcare & Wellness"`);
    expect(sanitizeCsvCell(42)).toBe(`"42"`);
    expect(sanitizeCsvCell(null)).toBe(`""`);
    expect(sanitizeCsvCell(undefined)).toBe(`""`);
  });

  it('generates a full CSV with headers and rows correctly', () => {
    const mockRegistrations: any[] = [
      {
        projectId: 'HCW-001',
        teamName: 'BioHealth',
        teamLeaderName: 'John Doe',
        teamLeaderRegisterNumber: '961421104001',
        categoryNameSnapshot: 'Healthcare & Wellness',
        otherProblemArea: null,
        department: 'CSE',
        section: 'A',
        projectTitle: 'Smart IoT Patient Monitor',
        supervisorName: 'Dr. Smith',
        supervisorDesignation: 'Professor',
        supervisorBranch: 'CSE',
        fieldVisitStatus: 'Yes',
        members: [
          {
            memberName: 'John Doe',
            registerNumber: '961421104001',
            department: 'CSE',
            section: 'A',
          },
        ],
        createdAt: new Date('2026-03-15T10:00:00Z'),
      },
    ];

    const csv = generateRegistrationsCsv(mockRegistrations);
    expect(csv).toContain('Project ID');
    expect(csv).toContain('HCW-001');
    expect(csv).toContain('BioHealth');
    expect(csv).toContain('Smart IoT Patient Monitor');
  });
});
