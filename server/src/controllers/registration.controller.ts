import { Request, Response, NextFunction } from 'express';
import { Registration } from '../models/Registration.js';
import { ReportSettings } from '../models/ReportSettings.js';
import { registrationUpdateSchema } from '../validators/index.js';
import { generateIndividualRegistrationPdf } from '../services/pdf.service.js';
import { buildDepartmentConditions, buildSectionConditions } from '../constants/academic.js';

export async function listRegistrations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const {
      search,
      problemArea,
      department,
      section,
      fieldVisitStatus,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const conditions: any[] = [{ deletedAt: null }];

    // Search query across Project ID, Team Name, Project Title, Team Leader, Member Name, Reg No
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { projectId: searchRegex },
          { teamName: searchRegex },
          { projectTitle: searchRegex },
          { teamLeaderName: searchRegex },
          { teamLeaderRegisterNumber: searchRegex },
          { 'members.memberName': searchRegex },
          { 'members.registerNumber': searchRegex },
          { supervisorName: searchRegex },
        ],
      });
    }

    // Filters
    if (problemArea && typeof problemArea === 'string' && problemArea !== 'all') {
      const escapedArea = problemArea.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({
        $or: [
          { categoryNameSnapshot: new RegExp(`^${escapedArea}$`, 'i') },
          { categoryAbbreviationSnapshot: new RegExp(`^${escapedArea}$`, 'i') },
          { categoryCodeSnapshot: new RegExp(`^${escapedArea}$`, 'i') },
        ],
      });
    }

    if (department && typeof department === 'string' && department !== 'all') {
      conditions.push(buildDepartmentConditions(department));
    }

    if (section && typeof section === 'string' && section !== 'all') {
      conditions.push(buildSectionConditions(section));
    }

    if (fieldVisitStatus && (fieldVisitStatus === 'Yes' || fieldVisitStatus === 'No')) {
      conditions.push({ fieldVisitStatus });
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
      conditions.push({ createdAt: dateFilter });
    }

    const query = conditions.length === 1 ? conditions[0] : { $and: conditions };

    // Sorting
    const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [total, registrations] = await Promise.all([
      Registration.countDocuments(query),
      Registration.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    ]);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRegistrationById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const registration = await Registration.findOne({ _id: id, deletedAt: null });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const validatedData = registrationUpdateSchema.parse(req.body);

    const registration = await Registration.findOne({ _id: id, deletedAt: null });
    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
      return;
    }

    // Update authorized fields; PRESERVE originally issued Project ID and abbreviation!
    if (validatedData.teamName) registration.teamName = validatedData.teamName;
    if (validatedData.projectTitle) registration.projectTitle = validatedData.projectTitle;
    if (validatedData.department) registration.department = validatedData.department;
    if (validatedData.section) registration.section = validatedData.section;
    if (validatedData.otherProblemArea !== undefined) registration.otherProblemArea = validatedData.otherProblemArea;
    if (validatedData.fieldVisitStatus) registration.fieldVisitStatus = validatedData.fieldVisitStatus;
    if (validatedData.supervisorName) registration.supervisorName = validatedData.supervisorName;
    if (validatedData.supervisorDesignation) registration.supervisorDesignation = validatedData.supervisorDesignation;
    if (validatedData.supervisorBranch) registration.supervisorBranch = validatedData.supervisorBranch;

    if (validatedData.members && validatedData.members.length > 0) {
      const leaderIndex = validatedData.teamLeaderIndex ?? 0;
      const updatedMembers = validatedData.members.map((mem, idx) => ({
        ...mem,
        section: mem.section || '',
        isLeader: idx === leaderIndex,
      }));
      registration.members = updatedMembers as any;
      if (updatedMembers[leaderIndex]) {
        registration.teamLeaderName = updatedMembers[leaderIndex].memberName;
        registration.teamLeaderRegisterNumber = updatedMembers[leaderIndex].registerNumber;
      }
    }

    await registration.save();

    res.json({
      success: true,
      message: `Registration ${registration.projectId} updated successfully.`,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const registration = await Registration.findOne({ _id: id, deletedAt: null });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
      return;
    }

    // Soft delete to preserve historical sequence and prevent Project ID reuse
    registration.deletedAt = new Date();
    registration.registrationStatus = 'Archived';
    await registration.save();

    res.json({
      success: true,
      message: `Registration ${registration.projectId} has been archived.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadRegistrationPdf(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const registration = await Registration.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id.toUpperCase() }],
      deletedAt: null,
    });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
      return;
    }

    // Fetch report settings
    let settings = await ReportSettings.findOne();
    if (!settings) {
      settings = new ReportSettings();
      await settings.save();
    }

    const pdfBuffer = await generateIndividualRegistrationPdf(registration, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${registration.projectId}-registration-slip.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
