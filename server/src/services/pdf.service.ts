import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IRegistration } from '../models/Registration.js';
import { ReportSettings, IReportSettings } from '../models/ReportSettings.js';
import { env } from '../config/env.js';

interface ReportFilterSummary {
  problemArea?: string;
  department?: string;
  section?: string;
  fieldVisitStatus?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Generates an institutional consolidated registration report in PDF format (A4 Landscape).
 */
export async function generateConsolidatedPdf(
  registrations: IRegistration[],
  settings: IReportSettings,
  filters?: ReportFilterSummary
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Landscape A4: 841.89 x 595.28 pt
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 36, // 0.5 inch margins
      bufferPages: true,
      autoFirstPage: true,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;

    // Helper: Draw Header on current page
    const renderHeader = () => {
      let currentY = margin;

      // 1. If header image is configured and file exists, draw it
      if (settings.headerImageKey) {
        const imagePath = path.resolve(env.UPLOAD_DIR, settings.headerImageKey);
        if (fs.existsSync(imagePath)) {
          try {
            const imgWidth = Math.min(settings.maximumImageWidth || 600, contentWidth);
            const imgHeight = Math.min(settings.maximumImageHeight || 80, 100);
            let imgX = margin;
            if (settings.headerAlignment === 'center') {
              imgX = margin + (contentWidth - imgWidth) / 2;
            } else if (settings.headerAlignment === 'right') {
              imgX = margin + contentWidth - imgWidth;
            }

            doc.image(imagePath, imgX, currentY, {
              fit: [imgWidth, imgHeight],
              align: settings.headerAlignment === 'right' ? 'right' : 'center',
            });
            currentY += imgHeight + 10;
          } catch (e) {
            console.warn('[PDF] Failed to render header image, skipping:', e);
          }
        }
      }

      // 2. Institutional details
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e1b4b');
      doc.text(settings.collegeName || 'MAR EPHRAEM COLLEGE OF ENGINEERING AND TECHNOLOGY', margin, currentY, {
        align: settings.headerAlignment,
        width: contentWidth,
      });
      currentY += 16;

      if (settings.departmentName) {
        doc.font('Helvetica').fontSize(10).fillColor('#4338ca');
        doc.text(settings.departmentName, margin, currentY, {
          align: settings.headerAlignment,
          width: contentWidth,
        });
        currentY += 13;
      }

      // Event Banner
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a');
      doc.text(settings.eventName || 'Marephraem Ideasource - Ideathon 2026', margin, currentY, {
        align: settings.headerAlignment,
        width: contentWidth,
      });
      currentY += 15;

      // Report Title & Subtitle
      if (settings.showReportTitle) {
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b');
        doc.text(settings.reportTitle || 'Consolidated Project Registration Register', margin, currentY, {
          align: 'center',
          width: contentWidth,
        });
        currentY += 13;

        if (settings.reportSubtitle) {
          doc.font('Helvetica-Oblique').fontSize(9).fillColor('#64748b');
          doc.text(settings.reportSubtitle, margin, currentY, {
            align: 'center',
            width: contentWidth,
          });
          currentY += 12;
        }
      }

      // Meta bar: Generated Date & Filter details
      doc.lineWidth(0.5).strokeColor('#cbd5e1').moveTo(margin, currentY).lineTo(margin + contentWidth, currentY).stroke();
      currentY += 6;

      doc.font('Helvetica').fontSize(8).fillColor('#475569');
      const genDateStr = `Generated on: ${new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })} | Total Records: ${registrations.length}`;

      const appliedFilters: string[] = [];
      if (filters?.problemArea) appliedFilters.push(`Category: ${filters.problemArea}`);
      if (filters?.department) appliedFilters.push(`Dept: ${filters.department}`);
      if (filters?.section) appliedFilters.push(`Sec: ${filters.section}`);
      if (filters?.fieldVisitStatus) appliedFilters.push(`Field Visit: ${filters.fieldVisitStatus}`);

      const filterStr = appliedFilters.length > 0 ? `Filters: [${appliedFilters.join(' • ')}]` : 'All Categories & Departments';

      doc.text(genDateStr, margin, currentY, { width: contentWidth / 2, align: 'left' });
      doc.text(filterStr, margin + contentWidth / 2, currentY, { width: contentWidth / 2, align: 'right' });
      currentY += 14;

      doc.lineWidth(0.5).strokeColor('#cbd5e1').moveTo(margin, currentY).lineTo(margin + contentWidth, currentY).stroke();
      currentY += 8;

      return currentY;
    };

    // Columns config for landscape A4 table
    // contentWidth is ~769.89 pt
    const colWidths = {
      sno: 25,
      projId: 65,
      team: 95,
      leader: 85,
      members: 130,
      deptSec: 55,
      title: 120,
      category: 110,
      fieldVisit: 45,
      supervisor: 85,
    };

    const renderTableHeader = (y: number) => {
      doc.rect(margin, y, contentWidth, 18).fill('#312e81');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);

      let currentX = margin + 3;
      const headers = [
        { label: 'S.No', w: colWidths.sno },
        { label: 'Project ID', w: colWidths.projId },
        { label: 'Team Name', w: colWidths.team },
        { label: 'Team Leader', w: colWidths.leader },
        { label: 'Members (Reg No)', w: colWidths.members },
        { label: 'Dept/Sec', w: colWidths.deptSec },
        { label: 'Project Title', w: colWidths.title },
        { label: 'Problem Area', w: colWidths.category },
        { label: 'Field Visit', w: colWidths.fieldVisit },
      ];

      for (const h of headers) {
        doc.text(h.label, currentX, y + 5, { width: h.w - 4, ellipsis: true });
        currentX += h.w;
      }

      return y + 20;
    };

    let startY = renderHeader();
    let y = renderTableHeader(startY);

    if (registrations.length === 0) {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#64748b');
      doc.text('No registration records found matching the specified criteria.', margin, y + 20, {
        align: 'center',
        width: contentWidth,
      });
    } else {
      registrations.forEach((reg, index) => {
        // Compute row height dynamically based on members and title length
        const membersList = (reg.members || [])
          .map((m) => `${m.memberName} (${m.registerNumber})`)
          .join('\n');

        const categoryText = reg.otherProblemArea
          ? `Other Area:\n"${reg.otherProblemArea}"`
          : reg.categoryNameSnapshot;

        // Estimate height
        const membersLines = Math.max(1, (reg.members || []).length);
        const titleLines = Math.ceil(reg.projectTitle.length / 24);
        const estimatedLines = Math.max(membersLines, titleLines, 1);
        const rowHeight = Math.max(22, estimatedLines * 9 + 8);

        // Check for page break
        if (y + rowHeight > pageHeight - margin - 25) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 36 });
          const newStartY = renderHeader();
          y = renderTableHeader(newStartY);
        }

        // Alternating row background
        if (index % 2 === 0) {
          doc.rect(margin, y, contentWidth, rowHeight).fill('#f8fafc');
        }

        // Draw light bottom border
        doc.lineWidth(0.3).strokeColor('#e2e8f0').moveTo(margin, y + rowHeight).lineTo(margin + contentWidth, y + rowHeight).stroke();

        doc.fillColor('#1e293b').font('Helvetica').fontSize(7);
        let currentX = margin + 3;

        // 1. S.No
        doc.text(String(index + 1), currentX, y + 4, { width: colWidths.sno - 4 });
        currentX += colWidths.sno;

        // 2. Project ID (bold brand color)
        doc.font('Helvetica-Bold').fillColor('#4338ca');
        doc.text(reg.projectId, currentX, y + 4, { width: colWidths.projId - 4 });
        currentX += colWidths.projId;

        // 3. Team Name
        doc.font('Helvetica-Bold').fillColor('#0f172a');
        doc.text(reg.teamName, currentX, y + 4, { width: colWidths.team - 4 });
        currentX += colWidths.team;

        // 4. Team Leader
        doc.font('Helvetica').fillColor('#1e293b');
        doc.text(`${reg.teamLeaderName}\n(${reg.teamLeaderRegisterNumber})`, currentX, y + 4, {
          width: colWidths.leader - 4,
        });
        currentX += colWidths.leader;

        // 5. Members List
        doc.font('Helvetica').fontSize(6.5).fillColor('#334155');
        doc.text(membersList, currentX, y + 4, { width: colWidths.members - 4 });
        currentX += colWidths.members;

        // 6. Dept / Section
        doc.font('Helvetica').fontSize(7).fillColor('#1e293b');
        doc.text(`${reg.department}\nSec: ${reg.section}`, currentX, y + 4, {
          width: colWidths.deptSec - 4,
        });
        currentX += colWidths.deptSec;

        // 7. Project Title
        doc.font('Helvetica').fontSize(7).fillColor('#0f172a');
        doc.text(reg.projectTitle, currentX, y + 4, { width: colWidths.title - 4 });
        currentX += colWidths.title;

        // 8. Problem Area
        doc.font('Helvetica').fontSize(6.5).fillColor('#1e293b');
        doc.text(categoryText, currentX, y + 4, { width: colWidths.category - 4 });
        currentX += colWidths.category;

        // 9. Field Visit Status
        const fvColor = reg.fieldVisitStatus === 'Yes' ? '#047857' : '#64748b';
        doc.font('Helvetica-Bold').fontSize(7).fillColor(fvColor);
        doc.text(reg.fieldVisitStatus, currentX, y + 4, { width: colWidths.fieldVisit - 4 });

        y += rowHeight;
      });
    }

    // Add page numbers and footer to all buffered pages
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const footerY = pageHeight - margin + 8;

      doc.lineWidth(0.5).strokeColor('#cbd5e1').moveTo(margin, footerY - 5).lineTo(margin + contentWidth, footerY - 5).stroke();

      doc.font('Helvetica').fontSize(7).fillColor('#64748b');

      if (settings.showFooter && settings.footerText) {
        doc.text(settings.footerText, margin, footerY, {
          width: contentWidth - 100,
          align: 'left',
          ellipsis: true,
        });
      }

      if (settings.showPageNumbers) {
        doc.text(`Page ${i + 1} of ${range.count}`, margin + contentWidth - 90, footerY, {
          width: 90,
          align: 'right',
        });
      }
    }

    doc.end();
  });
}

/**
 * Generates an official Individual Registration Slip / Certificate in PDF format (A4 Portrait).
 */
export async function generateIndividualRegistrationPdf(
  reg: IRegistration,
  settingsParam?: IReportSettings | null
): Promise<Buffer> {
  let settings = settingsParam;
  if (!settings) {
    try {
      settings = (await ReportSettings.findOne().lean()) as any;
    } catch {
      // fallback
    }
  }
  const effectiveSettings = settings || ({} as any);

  return new Promise((resolve, reject) => {
    // Portrait A4: 595.28 x 841.89 pt
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 40,
      bufferPages: true,
      autoFirstPage: true,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    let currentY = margin;

    // Header image if configured
    if (effectiveSettings.headerImageKey) {
      const imagePath = path.resolve(env.UPLOAD_DIR, effectiveSettings.headerImageKey);
      if (fs.existsSync(imagePath)) {
        try {
          const imgWidth = Math.min(effectiveSettings.maximumImageWidth || 500, contentWidth);
          const imgHeight = Math.min(effectiveSettings.maximumImageHeight || 75, 80);
          let imgX = margin;
          if (effectiveSettings.headerAlignment === 'center') {
            imgX = margin + (contentWidth - imgWidth) / 2;
          } else if (effectiveSettings.headerAlignment === 'right') {
            imgX = margin + contentWidth - imgWidth;
          }
          doc.image(imagePath, imgX, currentY, {
            fit: [imgWidth, imgHeight],
            align: effectiveSettings.headerAlignment === 'right' ? 'right' : 'center',
          });
          currentY += imgHeight + 8;
        } catch (e) {
          console.warn('[PDF] Failed to load individual header image:', e);
        }
      }
    }

    // Institutional Banner
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e1b4b').text(
      effectiveSettings.collegeName || 'MAR EPHRAEM COLLEGE OF ENGINEERING AND TECHNOLOGY',
      margin,
      currentY,
      { align: 'center', width: contentWidth }
    );
    currentY += 18;

    if (effectiveSettings.departmentName) {
      doc.font('Helvetica').fontSize(10).fillColor('#4338ca').text(
        effectiveSettings.departmentName,
        margin,
        currentY,
        { align: 'center', width: contentWidth }
      );
      currentY += 14;
    }

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(
      effectiveSettings.eventName || 'Marephraem Ideasource - Ideathon 2026',
      margin,
      currentY,
      { align: 'center', width: contentWidth }
    );
    currentY += 16;

    // Decorative divider
    doc.lineWidth(1).strokeColor('#4338ca').moveTo(margin, currentY).lineTo(margin + contentWidth, currentY).stroke();
    currentY += 12;

    // Title badge: OFFICIAL REGISTRATION CONFIRMATION SLIP
    doc.rect(margin, currentY, contentWidth, 24).fill('#f1f5f9');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text(
      'OFFICIAL PROJECT REGISTRATION SLIP',
      margin,
      currentY + 6,
      { align: 'center', width: contentWidth }
    );
    currentY += 34;

    // Large Project ID Card
    doc.roundedRect(margin, currentY, contentWidth, 54, 4).fillAndStroke('#eef2ff', '#6366f1');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#4338ca').text('OFFICIAL PROJECT ID', margin + 15, currentY + 10);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#1e1b4b').text(reg.projectId, margin + 15, currentY + 24);

    doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(
      `Date: ${new Date(reg.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}\nStatus: ${reg.registrationStatus}`,
      margin + contentWidth - 160,
      currentY + 14,
      { width: 145, align: 'right' }
    );
    currentY += 66;

    // Section 1: Team & Project Details
    const drawSectionHeader = (title: string, yPos: number) => {
      doc.rect(margin, yPos, contentWidth, 18).fill('#312e81');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(title, margin + 8, yPos + 4);
      return yPos + 24;
    };

    currentY = drawSectionHeader('1. PROJECT & PROBLEM AREA DETAILS', currentY);

    const projectFields = [
      { label: 'Project Title', value: reg.projectTitle },
      { label: 'Problem Area Category', value: `${reg.categoryNameSnapshot} [Code: ${reg.categoryAbbreviationSnapshot}]` },
      ...(reg.otherProblemArea ? [{ label: 'Specified Problem Area', value: reg.otherProblemArea }] : []),
      { label: 'Field Visit Conducted', value: reg.fieldVisitStatus },
    ];

    projectFields.forEach((item) => {
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(item.label + ':', margin + 8, currentY, { width: 150 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#0f172a').text(item.value, margin + 165, currentY, { width: contentWidth - 175 });
      currentY += 18;
    });
    currentY += 6;

    // Section 2: Team Information
    currentY = drawSectionHeader('2. TEAM INFORMATION & LEADER', currentY);

    const teamFields = [
      { label: 'Team Name', value: reg.teamName },
      { label: 'Team Leader', value: `${reg.teamLeaderName} (Reg: ${reg.teamLeaderRegisterNumber})` },
      { label: 'Department & Section', value: reg.section ? `${reg.department} - Section ${reg.section}` : reg.department },
      { label: 'Total Team Members', value: String(reg.members?.length || 1) },
    ];

    teamFields.forEach((item) => {
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(item.label + ':', margin + 8, currentY, { width: 150 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#0f172a').text(item.value, margin + 165, currentY, { width: contentWidth - 175 });
      currentY += 18;
    });
    currentY += 6;

    // Section 3: Registered Team Members Table
    currentY = drawSectionHeader('3. REGISTERED TEAM MEMBERS', currentY);

    const memCols = { sno: 25, name: 110, regNo: 75, year: 55, deptSec: 65, contact: 185 };
    doc.rect(margin, currentY, contentWidth, 16).fill('#f1f5f9');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b');
    doc.text('S.No', margin + 4, currentY + 4, { width: memCols.sno });
    doc.text('Member Name', margin + 4 + memCols.sno, currentY + 4, { width: memCols.name });
    doc.text('Register Number', margin + 4 + memCols.sno + memCols.name, currentY + 4, { width: memCols.regNo });
    doc.text('Year', margin + 4 + memCols.sno + memCols.name + memCols.regNo, currentY + 4, { width: memCols.year });
    doc.text('Dept & Sec', margin + 4 + memCols.sno + memCols.name + memCols.regNo + memCols.year, currentY + 4, { width: memCols.deptSec });
    doc.text('Email & Phone', margin + 4 + memCols.sno + memCols.name + memCols.regNo + memCols.year + memCols.deptSec, currentY + 4, { width: memCols.contact });
    currentY += 18;

    (reg.members || []).forEach((mem, idx) => {
      doc.lineWidth(0.3).strokeColor('#e2e8f0').moveTo(margin, currentY + 16).lineTo(margin + contentWidth, currentY + 16).stroke();
      doc.font(mem.isLeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5).fillColor('#0f172a');
      doc.text(String(idx + 1), margin + 4, currentY + 2, { width: memCols.sno });
      doc.text(`${mem.memberName}${mem.isLeader ? ' (Leader)' : ''}`, margin + 4 + memCols.sno, currentY + 2, { width: memCols.name });
      doc.text(mem.registerNumber, margin + 4 + memCols.sno + memCols.name, currentY + 2, { width: memCols.regNo });
      doc.text(mem.year || '—', margin + 4 + memCols.sno + memCols.name + memCols.regNo, currentY + 2, { width: memCols.year });
      doc.text(`${mem.department} - ${mem.section}`, margin + 4 + memCols.sno + memCols.name + memCols.regNo + memCols.year, currentY + 2, { width: memCols.deptSec });
      const contactInfo = [mem.email, mem.phone].filter(Boolean).join(' • ') || 'N/A';
      doc.text(contactInfo, margin + 4 + memCols.sno + memCols.name + memCols.regNo + memCols.year + memCols.deptSec, currentY + 2, { width: memCols.contact, ellipsis: true });
      currentY += 18;
    });
    currentY += 8;

    // Section 4: Faculty Supervisor
    currentY = drawSectionHeader('4. FACULTY SUPERVISOR DETAILS', currentY);
    const supFields = [
      { label: 'Supervisor Name', value: reg.supervisorName },
      { label: 'Designation & Branch', value: `${reg.supervisorDesignation}, ${reg.supervisorBranch}` },
    ];
    supFields.forEach((item) => {
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(item.label + ':', margin + 8, currentY, { width: 150 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#0f172a').text(item.value, margin + 165, currentY, { width: contentWidth - 175 });
      currentY += 18;
    });

    // Verification Signatures Area
    if (currentY + 80 > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 30;
    } else {
      currentY = Math.max(currentY + 25, pageHeight - margin - 85);
    }

    const sigWidth = contentWidth / 3;
    doc.lineWidth(0.5).strokeColor('#94a3b8');
    doc.moveTo(margin + 10, currentY).lineTo(margin + sigWidth - 20, currentY).stroke();
    doc.moveTo(margin + sigWidth + 10, currentY).lineTo(margin + sigWidth * 2 - 20, currentY).stroke();
    doc.moveTo(margin + sigWidth * 2 + 10, currentY).lineTo(margin + contentWidth - 10, currentY).stroke();

    doc.font('Helvetica').fontSize(8).fillColor('#475569');
    doc.text('Team Leader Signature', margin + 10, currentY + 5, { width: sigWidth - 30, align: 'center' });
    doc.text('Faculty Supervisor Signature', margin + sigWidth + 10, currentY + 5, { width: sigWidth - 30, align: 'center' });
    doc.text('Convener / Principal', margin + sigWidth * 2 + 10, currentY + 5, { width: sigWidth - 30, align: 'center' });

    // Footer
    const footerY = pageHeight - margin + 12;
    doc.lineWidth(0.5).strokeColor('#cbd5e1').moveTo(margin, footerY - 5).lineTo(margin + contentWidth, footerY - 5).stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8');
    doc.text(effectiveSettings.footerText || 'Marephraem Ideasource 2026 Registration Management System', margin, footerY, {
      width: contentWidth,
      align: 'center',
    });

    doc.end();
  });
}
