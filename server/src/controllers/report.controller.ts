import { Request, Response, NextFunction } from 'express';
import { Registration, IRegistration } from '../models/Registration.js';
import { ReportSettings } from '../models/ReportSettings.js';
import { generateRegistrationsCsv } from '../services/csv.service.js';
import { generateConsolidatedPdf } from '../services/pdf.service.js';

import {
  INSTITUTIONAL_DEPARTMENTS,
  INSTITUTIONAL_SECTIONS,
  buildDepartmentConditions,
  buildSectionConditions,
  findCanonicalDepartment,
  normalizeDepartmentKey,
} from '../constants/academic.js';

export function buildReportFilter(reqQuery: any): any {
  const { problemArea, department, section, fieldVisitStatus, startDate, endDate } = reqQuery;
  const conditions: any[] = [{ deletedAt: null }];

  if (problemArea && problemArea !== 'all') {
    const escapedArea = String(problemArea).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    conditions.push({
      $or: [
        { categoryNameSnapshot: new RegExp(`^${escapedArea}$`, 'i') },
        { categoryAbbreviationSnapshot: new RegExp(`^${escapedArea}$`, 'i') },
        { categoryCodeSnapshot: new RegExp(`^${escapedArea}$`, 'i') },
      ],
    });
  }

  if (department && department !== 'all') {
    conditions.push(buildDepartmentConditions(department));
  }

  if (section && section !== 'all') {
    conditions.push(buildSectionConditions(section));
  }

  if (fieldVisitStatus && (fieldVisitStatus === 'Yes' || fieldVisitStatus === 'No')) {
    conditions.push({ fieldVisitStatus });
  }

  if (startDate || endDate) {
    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    conditions.push({ createdAt: dateQuery });
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

export async function getConsolidatedReportData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter = buildReportFilter(req.query);
    const registrations = await Registration.find(filter).sort({ projectId: 1 });

    const totalRegistrations = registrations.length;
    const uniqueTeams = new Set(registrations.map((r) => r.teamName)).size;
    const totalMembers = registrations.reduce(
      (sum, r) => sum + (r.members ? r.members.length : 0),
      0
    );

    res.json({
      success: true,
      data: {
        registrations,
        summary: {
          totalRegistrations,
          totalTeams: uniqueTeams,
          totalMembers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function exportRegistrationsCsv(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter = buildReportFilter(req.query);
    const registrations = await Registration.find(filter).sort({ projectId: 1 });

    const csvContent = generateRegistrationsCsv(registrations);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="marephraem-ideathon-2026-registrations.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function exportConsolidatedPdf(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter = buildReportFilter(req.query);
    const registrations = await Registration.find(filter).sort({ projectId: 1 });

    let settings = await ReportSettings.findOne();
    if (!settings) {
      settings = new ReportSettings();
      await settings.save();
    }

    const filterSummary = {
      problemArea: req.query.problemArea as string,
      department: req.query.department as string,
      section: req.query.section as string,
      fieldVisitStatus: req.query.fieldVisitStatus as string,
    };

    const pdfBuffer = await generateConsolidatedPdf(registrations, settings, filterSummary);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="marephraem-ideathon-2026-report.pdf"'
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function getReportFilterOptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const baseFilter = { deletedAt: null };

    const [rootDepts, memberDepts, rootSections, memberSections] = await Promise.all([
      Registration.distinct('department', baseFilter),
      Registration.distinct('members.department', baseFilter),
      Registration.distinct('section', baseFilter),
      Registration.distinct('members.section', baseFilter),
    ]);

    const seenDeptKeys = new Set<string>();
    INSTITUTIONAL_DEPARTMENTS.forEach((d) => {
      seenDeptKeys.add(normalizeDepartmentKey(d.name));
      seenDeptKeys.add(normalizeDepartmentKey(d.code));
      seenDeptKeys.add(normalizeDepartmentKey(d.abbreviation));
    });

    const existingDepartments: string[] = [];
    [...rootDepts, ...memberDepts].forEach((d) => {
      if (!d) return;
      const str = String(d).trim();
      if (!str) return;

      const canonical = findCanonicalDepartment(str);
      if (canonical) {
        return;
      }

      const key = normalizeDepartmentKey(str);
      if (!seenDeptKeys.has(key)) {
        seenDeptKeys.add(key);
        existingDepartments.push(str);
      }
    });

    const seenSections = new Set<string>();
    const existingSections: string[] = [];
    [...rootSections, ...memberSections].forEach((s) => {
      if (!s) return;
      const raw = String(s).trim();
      const clean = raw.replace(/^section\s+/i, '').replace(/^sec\s+/i, '').trim().toUpperCase();
      const finalSec = clean || raw.toUpperCase();
      if (finalSec && !seenSections.has(finalSec)) {
        seenSections.add(finalSec);
        existingSections.push(finalSec);
      }
    });

    res.json({
      success: true,
      data: {
        departments: INSTITUTIONAL_DEPARTMENTS,
        sections: INSTITUTIONAL_SECTIONS,
        existingDepartments: existingDepartments.sort(),
        existingSections: existingSections.sort(),
      },
    });
  } catch (error) {
    next(error);
  }
}
