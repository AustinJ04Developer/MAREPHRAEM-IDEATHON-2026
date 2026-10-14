export interface ProblemArea {
  _id: string;
  code: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  isOther: boolean;
  displayOrder: number;
}

export interface TeamMember {
  memberName: string;
  department: string;
  year?: string;
  registerNumber: string;
  section?: string;
  email?: string;
  phone?: string;
  isLeader?: boolean;
}

export interface Registration {
  _id: string;
  projectId: string;
  categoryId: string | ProblemArea;
  categoryCodeSnapshot: string;
  categoryNameSnapshot: string;
  categoryAbbreviationSnapshot: string;
  otherProblemArea?: string | null;

  teamName: string;
  teamLeaderName: string;
  teamLeaderRegisterNumber: string;
  contactEmail?: string;
  department: string;
  section?: string;

  members: TeamMember[];

  projectTitle: string;
  fieldVisitStatus: 'Yes' | 'No';

  supervisorName: string;
  supervisorDesignation: string;
  supervisorBranch: string;

  registrationStatus: 'Confirmed' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface ReportSettings {
  _id?: string;
  organizationName: string;
  eventName: string;
  collegeName: string;
  departmentName: string;
  reportTitle: string;
  reportSubtitle: string;
  address: string;
  contactInformation: string;
  footerText: string;

  headerImageKey?: string | null;
  headerImageMimeType?: string | null;
  headerImageWidth?: number | null;
  headerImageHeight?: number | null;

  headerAlignment: 'left' | 'center' | 'right';
  imageFit: 'contain' | 'cover';
  maximumImageWidth: number;
  maximumImageHeight: number;

  showReportTitle: boolean;
  showGeneratedDate: boolean;
  showPageNumbers: boolean;
  showFooter: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt?: string | null;
}

export interface DashboardSummary {
  totalRegistrations: number;
  totalTeams: number;
  totalMembers: number;
  fieldVisitYesCount: number;
  fieldVisitNoCount: number;
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  abbreviation: string;
  isOther: boolean;
  count: number;
}
