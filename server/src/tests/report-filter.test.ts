import { describe, it, expect } from 'vitest';
import {
  buildDepartmentConditions,
  buildSectionConditions,
  INSTITUTIONAL_DEPARTMENTS,
  INSTITUTIONAL_SECTIONS,
} from '../constants/academic.js';
import { buildReportFilter } from '../controllers/report.controller.js';

describe('Consolidated Report Filters & Academic Setup (Case-Insensitive)', () => {
  it('buildDepartmentConditions creates case-insensitive matching for CSE and its aliases', () => {
    const filter = buildDepartmentConditions('cse');
    expect(filter.$or).toBeDefined();

    // Verify regex flags and case-insensitivity
    const regexList = filter.$or.map((clause: any) => clause.department || clause['members.department']).filter(Boolean);
    const matchesCse = regexList.some((r: RegExp) => r.test('CSE') && r.test('cse'));
    const matchesFullName = regexList.some((r: RegExp) => r.test('Computer Science and Engineering'));

    expect(matchesCse).toBe(true);
    expect(matchesFullName).toBe(true);
  });

  it('treats "Artificial intelligence and data science" and "Artificial Intelligence & Data Science" as the same department', () => {
    // 1. Filtering with "Artificial intelligence and data science" (lowercase with "and")
    const filterAnd = buildDepartmentConditions('Artificial intelligence and data science');
    const regexAnd = filterAnd.$or
      .map((clause: any) => clause.department || clause['members.department'])
      .filter(Boolean);

    // Must match records stored as "Artificial Intelligence & Data Science" (with ampersand)
    expect(regexAnd.some((r: RegExp) => r.test('Artificial Intelligence & Data Science'))).toBe(true);
    // Must match records stored as "artificial intelligence and data science"
    expect(regexAnd.some((r: RegExp) => r.test('artificial intelligence and data science'))).toBe(true);
    // Must match records stored as "AI & DS" or "AIDS"
    expect(regexAnd.some((r: RegExp) => r.test('AI & DS'))).toBe(true);
    expect(regexAnd.some((r: RegExp) => r.test('AIDS'))).toBe(true);

    // 2. Filtering with "Artificial Intelligence & Data Science" (with ampersand)
    const filterAmp = buildDepartmentConditions('Artificial Intelligence & Data Science');
    const regexAmp = filterAmp.$or
      .map((clause: any) => clause.department || clause['members.department'])
      .filter(Boolean);

    // Must match records stored as "Artificial intelligence and data science"
    expect(regexAmp.some((r: RegExp) => r.test('Artificial intelligence and data science'))).toBe(true);
    expect(regexAmp.some((r: RegExp) => r.test('Artificial Intelligence & Data Science'))).toBe(true);
    expect(regexAmp.some((r: RegExp) => r.test('AI & DS'))).toBe(true);
  });

  it('buildSectionConditions matches sections irrespective of case and prefix', () => {
    const filterLower = buildSectionConditions('a');
    const regexListLower = filterLower.$or.map((clause: any) => clause.section || clause['members.section']).filter(Boolean);

    expect(regexListLower.some((r: RegExp) => r.test('A'))).toBe(true);
    expect(regexListLower.some((r: RegExp) => r.test('a'))).toBe(true);
    expect(regexListLower.some((r: RegExp) => r.test('Section A'))).toBe(true);

    const filterSecPrefix = buildSectionConditions('Section B');
    const regexListSecPrefix = filterSecPrefix.$or.map((clause: any) => clause.section || clause['members.section']).filter(Boolean);

    expect(regexListSecPrefix.some((r: RegExp) => r.test('B'))).toBe(true);
    expect(regexListSecPrefix.some((r: RegExp) => r.test('b'))).toBe(true);
    expect(regexListSecPrefix.some((r: RegExp) => r.test('Section B'))).toBe(true);
  });

  it('buildReportFilter combines problemArea, department, and section without overwriting $or', () => {
    const query = {
      problemArea: 'Healthcare & Wellness',
      department: 'CSE',
      section: 'A',
      fieldVisitStatus: 'Yes',
    };

    const filter = buildReportFilter(query);
    expect(filter.$and).toBeDefined();
    expect(filter.$and.length).toBe(5); // deletedAt, problemArea, department, section, fieldVisitStatus

    // Check that problemArea is case-insensitive
    const problemAreaClause = filter.$and[1];
    expect(problemAreaClause.$or).toBeDefined();
    const problemAreaRegex = problemAreaClause.$or[0].categoryNameSnapshot;
    expect(problemAreaRegex.flags).toContain('i');
    expect(problemAreaRegex.test('healthcare & wellness')).toBe(true);
  });

  it('includes standard institutional departments and sections', () => {
    expect(INSTITUTIONAL_DEPARTMENTS.length).toBeGreaterThanOrEqual(7);
    expect(INSTITUTIONAL_SECTIONS).toEqual(['A', 'B', 'C', 'D']);
  });
});
