import { describe, it, expect } from 'vitest';
import { generateConsolidatedPdf, generateIndividualRegistrationPdf } from '../services/pdf.service.js';
import { IReportSettings } from '../models/ReportSettings.js';

describe('PDF Generation Engine', () => {
  const dummySettings: any = {
    organizationName: 'Mar Ephraem College of Engineering & Technology',
    eventName: 'MAREPHRAEM IDEATHON 2026',
    collegeName: 'Mar Ephraem College of Engineering & Technology',
    departmentName: 'IEDC',
    reportTitle: 'Consolidated Project Registration Register',
    reportSubtitle: 'Official Verification',
    headerAlignment: 'center',
    maximumImageWidth: 500,
    maximumImageHeight: 80,
    showReportTitle: true,
    showGeneratedDate: true,
    showPageNumbers: true,
    showFooter: true,
    footerText: 'Official Document',
  };

  const dummyRegistration: any = {
    projectId: 'HCW-001',
    teamName: 'MediInnovators',
    teamLeaderName: 'Austin J',
    teamLeaderRegisterNumber: '961421104050',
    department: 'CSE',
    section: 'B',
    projectTitle: 'Smart Medical Drone Delivery',
    categoryNameSnapshot: 'Healthcare & Wellness',
    categoryAbbreviationSnapshot: 'HCW',
    otherProblemArea: null,
    fieldVisitStatus: 'Yes',
    supervisorName: 'Dr. Michael',
    supervisorDesignation: 'HOD',
    supervisorBranch: 'CSE',
    registrationStatus: 'Confirmed',
    createdAt: new Date(),
    members: [
      {
        memberName: 'Austin J',
        registerNumber: '961421104050',
        department: 'CSE',
        section: 'B',
        isLeader: true,
      },
      {
        memberName: 'Sarah Connor',
        registerNumber: '961421104051',
        department: 'CSE',
        section: 'B',
        isLeader: false,
      },
    ],
  };

  it('generates a valid binary PDF buffer for individual registration slip', async () => {
    const pdfBuffer = await generateIndividualRegistrationPdf(dummyRegistration, dummySettings);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    // PDF magic bytes header: %PDF
    const pdfHeader = pdfBuffer.slice(0, 4).toString('ascii');
    expect(pdfHeader).toBe('%PDF');
  });

  it('generates a valid binary PDF buffer for consolidated report', async () => {
    const pdfBuffer = await generateConsolidatedPdf([dummyRegistration], dummySettings);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    const pdfHeader = pdfBuffer.slice(0, 4).toString('ascii');
    expect(pdfHeader).toBe('%PDF');
  });

  it('handles empty registration list in consolidated PDF gracefully', async () => {
    const pdfBuffer = await generateConsolidatedPdf([], dummySettings);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    const pdfHeader = pdfBuffer.slice(0, 4).toString('ascii');
    expect(pdfHeader).toBe('%PDF');
  });
});
