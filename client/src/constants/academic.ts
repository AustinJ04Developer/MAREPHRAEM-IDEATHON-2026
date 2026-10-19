export interface DepartmentOption {
  code: string;
  name: string;
  abbreviation: string;
}

export const INSTITUTIONAL_DEPARTMENTS: DepartmentOption[] = [
  { code: 'CSE', name: 'Computer Science and Engineering', abbreviation: 'CSE' },
  { code: 'MECH', name: 'Mechanical Engineering', abbreviation: 'MECH' },
  { code: 'CIVIL', name: 'Civil Engineering', abbreviation: 'CIVIL' },
  { code: 'ECE', name: 'Electronics and Communication Engineering', abbreviation: 'ECE' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering', abbreviation: 'EEE' },
  { code: 'AIDS', name: 'Artificial Intelligence and Data Science', abbreviation: 'AI & DS' },
  { code: 'SH', name: 'Science and Humanities', abbreviation: 'S&H' },
];

export const INSTITUTIONAL_SECTIONS: string[] = ['A', 'B', 'C', 'D'];

export const DEPARTMENT_ALIASES: Record<string, string[]> = {
  CSE: [
    'CSE',
    'Computer Science',
    'Computer Science and Engineering',
    'Computer Science & Engineering',
    'CS & E',
    'CS and E',
  ],
  MECH: [
    'MECH',
    'Mechanical',
    'Mechanical Engineering',
    'Mech. Engg',
  ],
  CIVIL: [
    'CIVIL',
    'Civil',
    'Civil Engineering',
    'Civil Engg',
  ],
  ECE: [
    'ECE',
    'Electronics',
    'Electronic',
    'Electronics and Communication',
    'Electronic and Communication',
    'Electronics & Communication',
    'Electronic & Communication',
    'Electronics and Communication Engineering',
    'Electronics & Communication Engineering',
    'Electronic and Communication Engineering',
    'Electronic & Communication Engineering',
  ],
  EEE: [
    'EEE',
    'Electrical',
    'Electrical and Electronics',
    'Electrical and Electronic',
    'Electrical & Electronics',
    'Electrical & Electronic',
    'Electrical and Electronics Engineering',
    'Electrical & Electronics Engineering',
    'Electrical and Electronic Engineering',
    'Electrical & Electronic Engineering',
  ],
  AIDS: [
    'AIDS',
    'AI & DS',
    'AI/DS',
    'AI and DS',
    'AI&DS',
    'AI & Data Science',
    'AI and Data Science',
    'Artificial Intelligence',
    'Artificial Intelligence and Data Science',
    'Artificial Intelligence & Data Science',
    'Aritificial intelligence and data science',
    'Aritificial Intelligence & Data Science',
    'Data Science',
  ],
  SH: [
    'SH',
    'S&H',
    'S and H',
    'Science and Humanities',
    'Science & Humanities',
    'Science and Humanity',
  ],
};

export function normalizeDepartmentKey(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findCanonicalDepartment(input: string): DepartmentOption | null {
  const normInput = normalizeDepartmentKey(input);
  if (!normInput) return null;

  for (const dept of INSTITUTIONAL_DEPARTMENTS) {
    if (
      normalizeDepartmentKey(dept.code) === normInput ||
      normalizeDepartmentKey(dept.name) === normInput ||
      normalizeDepartmentKey(dept.abbreviation) === normInput
    ) {
      return dept;
    }
  }

  for (const [code, aliases] of Object.entries(DEPARTMENT_ALIASES)) {
    for (const alias of aliases) {
      if (normalizeDepartmentKey(alias) === normInput) {
        return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === code) || null;
      }
    }
  }

  if (
    (normInput.includes('artificial') && normInput.includes('intelligence')) ||
    normInput.includes('data science') ||
    normInput === 'aids' ||
    normInput === 'ai and ds' ||
    normInput === 'ai ds' ||
    normInput === 'ai'
  ) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'AIDS') || null;
  }
  if (
    normInput.includes('computer science') ||
    normInput === 'cse' ||
    (normInput.includes('computer') && normInput.includes('engineering'))
  ) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'CSE') || null;
  }
  if (
    normInput.includes('mechanical') ||
    normInput.includes('mechanic') ||
    normInput === 'mech'
  ) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'MECH') || null;
  }
  if (normInput.includes('civil')) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'CIVIL') || null;
  }
  if (
    (normInput.includes('electronic') && normInput.includes('communication')) ||
    normInput === 'ece'
  ) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'ECE') || null;
  }
  if (
    (normInput.includes('electrical') && normInput.includes('electronic')) ||
    normInput === 'eee'
  ) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'EEE') || null;
  }
  if (
    normInput.includes('humanities') ||
    normInput.includes('humanity') ||
    normInput === 'sh' ||
    normInput === 's and h' ||
    normInput === 's h' ||
    (normInput.includes('science') && normInput.includes('humanit'))
  ) {
    return INSTITUTIONAL_DEPARTMENTS.find((d) => d.code === 'SH') || null;
  }

  return null;
}
