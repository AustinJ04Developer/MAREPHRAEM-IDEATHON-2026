import { Request, Response, NextFunction } from 'express';
import { ProblemArea } from '../models/ProblemArea.js';
import { Registration } from '../models/Registration.js';
import { registrationInputSchema } from '../validators/index.js';
import { generateCustomAbbreviation, isValidAbbreviation } from '../utils/abbreviation.js';
import { getNextProjectId } from '../services/sequence.service.js';
import { sendRegistrationConfirmationEmail } from '../services/email.service.js';

export async function getProblemAreas(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const areas = await ProblemArea.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    next(error);
  }
}

export async function previewAbbreviation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const title = (req.query.title as string) || '';
    if (!title.trim()) {
      res.status(400).json({
        success: false,
        message: 'A custom problem area title is required for preview',
      });
      return;
    }

    const abbreviation = generateCustomAbbreviation(title);
    res.json({
      success: true,
      data: {
        title,
        abbreviation,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to generate abbreviation from custom title',
    });
  }
}

export async function createRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate request body with Zod
    const validatedData = registrationInputSchema.parse(req.body);

    // 2. Fetch and validate official Problem Area
    const problemArea = await ProblemArea.findById(validatedData.categoryId);
    if (!problemArea) {
      res.status(400).json({
        success: false,
        message: 'The selected problem area does not exist.',
      });
      return;
    }

    if (!problemArea.isActive) {
      res.status(400).json({
        success: false,
        message: 'The selected problem area category is currently inactive.',
      });
      return;
    }

    // 3. Handle Other Area rules
    let effectiveAbbreviation = problemArea.abbreviation;
    let customTitle: string | null = null;

    if (problemArea.isOther) {
      if (!validatedData.otherProblemArea || validatedData.otherProblemArea.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'Please specify a descriptive title for your custom problem area (minimum 3 characters).',
        });
        return;
      }

      customTitle = validatedData.otherProblemArea.trim();
      effectiveAbbreviation = generateCustomAbbreviation(customTitle);
    } else {
      // Rejects unexpected custom title when a predefined official category is selected
      if (validatedData.otherProblemArea && validatedData.otherProblemArea.trim().length > 0) {
        res.status(400).json({
          success: false,
          message: 'Custom problem area can only be specified when "Other Area" is selected.',
        });
        return;
      }
    }

    if (!isValidAbbreviation(effectiveAbbreviation)) {
      res.status(400).json({
        success: false,
        message: `Generated abbreviation "${effectiveAbbreviation}" is invalid.`,
      });
      return;
    }

    // 4. Concurrency-safe atomic Project ID generation
    const projectId = await getNextProjectId(effectiveAbbreviation);

    // 5. Structure members and link Team Leader
    const leaderIndex = validatedData.teamLeaderIndex;
    const membersWithLeader = validatedData.members.map((mem, idx) => ({
      ...mem,
      isLeader: idx === leaderIndex,
    }));

    const leaderMember = membersWithLeader[leaderIndex];
    const effectiveContactEmail =
      (leaderMember?.email && leaderMember.email.trim().toLowerCase()) ||
      (validatedData.contactEmail && validatedData.contactEmail.trim().toLowerCase()) ||
      '';

    // 6. Create Registration record with historical snapshots
    const registration = new Registration({
      projectId,
      categoryId: problemArea._id,
      categoryCodeSnapshot: problemArea.code,
      categoryNameSnapshot: problemArea.name,
      categoryAbbreviationSnapshot: effectiveAbbreviation,
      otherProblemArea: customTitle,

      teamName: validatedData.teamName,
      contactEmail: effectiveContactEmail,
      teamLeaderName: leaderMember.memberName,
      teamLeaderRegisterNumber: leaderMember.registerNumber,
      department: validatedData.department,
      section: validatedData.section,

      members: membersWithLeader,

      projectTitle: validatedData.projectTitle,
      fieldVisitStatus: validatedData.fieldVisitStatus,

      supervisorName: validatedData.supervisorName,
      supervisorDesignation: validatedData.supervisorDesignation,
      supervisorBranch: validatedData.supervisorBranch,

      registrationStatus: 'Confirmed',
    });

    await registration.save();

    // Trigger asynchronous confirmation email
    if (effectiveContactEmail) {
      sendRegistrationConfirmationEmail(registration, effectiveContactEmail).catch((err) => {
        console.warn('[Email] Non-blocking background email error:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successfully completed for MAREPHRAEM IDEATHON 2026.',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicRegistrationById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { projectId } = req.params;
    const registration = await Registration.findOne({
      projectId: projectId.toUpperCase().trim(),
      deletedAt: null,
    }).select('-__v');

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'No registration record found for the provided Project ID.',
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
