import { IRegistration } from '../models/Registration.js';

/**
 * Escapes a single CSV cell value and mitigates CSV formula injection attacks
 * (DDE injection via =, +, -, @, tab, or carriage return).
 */
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Formula injection mitigation: if starts with =, +, -, @, \t, \r, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape inner double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Generates an RFC 4180-compliant, formula-safe CSV string of registration records.
 */
export function generateRegistrationsCsv(registrations: IRegistration[]): string {
  const headers = [
    'S.No',
    'Project ID',
    'Team Name',
    'Team Leader',
    'Leader Register No',
    'Members Count',
    'Team Members',
    'Department',
    'Section',
    'Project Title',
    'Problem Area',
    'Specified Problem Area (Custom)',
    'Supervisor Name',
    'Supervisor Designation',
    'Supervisor Branch',
    'Field Visit Status',
    'Submission Date',
  ];

  const headerRow = headers.map(sanitizeCsvCell).join(',');

  const rows = registrations.map((reg, index) => {
    const membersSummary = (reg.members || [])
      .map(
        (m) =>
          `${m.memberName} [Reg: ${m.registerNumber}, ${m.year ? `${m.year}, ` : ''}${m.department}-${m.section}, Email: ${
            m.email || 'N/A'
          }, Phone: ${m.phone || 'N/A'}${m.isLeader ? ', LEADER' : ''}]`
      )
      .join('; ');

    const rowData = [
      index + 1,
      reg.projectId,
      reg.teamName,
      reg.teamLeaderName,
      reg.teamLeaderRegisterNumber,
      reg.members ? reg.members.length : 0,
      membersSummary,
      reg.department,
      reg.section,
      reg.projectTitle,
      reg.categoryNameSnapshot,
      reg.otherProblemArea || 'N/A',
      reg.supervisorName,
      reg.supervisorDesignation,
      reg.supervisorBranch,
      reg.fieldVisitStatus,
      new Date(reg.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    ];

    return rowData.map(sanitizeCsvCell).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}
