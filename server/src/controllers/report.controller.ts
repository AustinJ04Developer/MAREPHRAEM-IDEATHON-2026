import { Request, Response, NextFunction } from 'express';
import { Registration, IRegistration } from '../models/Registration.js';
import { ReportSettings } from '../models/ReportSettings.js';
import { generateRegistrationsCsv } from '../services/csv.service.js';
import { generateConsolidatedPdf } from '../services/pdf.service.js';

function buildReportFilter(reqQuery: any): any {
  const { problemArea, department, section, fieldVisitStatus, startDate, endDate } = reqQuery;
  const filter: any = { deletedAt: null };

  if (problemArea && problemArea !== 'all') {
    filter.$or = [
      { categoryNameSnapshot: problemArea },
      { categoryAbbreviationSnapshot: problemArea.toUpperCase() },
    ];
  }

  if (department && department !== 'all') {
    filter.department = department;
  }

  if (section && section !== 'all') {
    filter.section = section;
  }

  if (fieldVisitStatus && (fieldVisitStatus === 'Yes' || fieldVisitStatus === 'No')) {
    filter.fieldVisitStatus = fieldVisitStatus;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  return filter;
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
