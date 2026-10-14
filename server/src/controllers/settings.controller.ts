import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ReportSettings } from '../models/ReportSettings.js';
import { reportSettingsSchema } from '../validators/index.js';
import { env } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// Multer storage with cryptographic safe filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `header-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const uploadHeaderImageMiddleware = multer({
  storage,
  limits: {
    fileSize: env.MAX_HEADER_IMAGE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Invalid image file format. Only PNG, JPEG, and WebP images are allowed.'));
      return;
    }
    cb(null, true);
  },
}).single('headerImage');

export async function getReportSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let settings = await ReportSettings.findOne();
    if (!settings) {
      settings = new ReportSettings();
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReportSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = reportSettingsSchema.parse(req.body);

    let settings = await ReportSettings.findOne();
    if (!settings) {
      settings = new ReportSettings();
    }

    Object.assign(settings, validatedData);
    settings.updatedBy = req.admin?._id as any;
    await settings.save();

    res.json({
      success: true,
      message: 'Report header and institutional settings updated successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadHeaderImage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      });
      return;
    }

    let settings = await ReportSettings.findOne();
    if (!settings) {
      settings = new ReportSettings();
    }

    const previousKey = settings.headerImageKey;

    settings.headerImageKey = req.file.filename;
    settings.headerImageMimeType = req.file.mimetype;
    settings.updatedBy = req.admin?._id as any;
    await settings.save();

    // Safely remove previous image if it was replaced and file exists
    if (previousKey && previousKey !== req.file.filename) {
      const prevPath = path.resolve(env.UPLOAD_DIR, previousKey);
      if (fs.existsSync(prevPath)) {
        try {
          fs.unlinkSync(prevPath);
        } catch (e) {
          console.warn('[Upload] Could not remove old header image:', e);
        }
      }
    }

    res.json({
      success: true,
      message: 'Header image uploaded and configured successfully.',
      data: {
        headerImageKey: settings.headerImageKey,
        headerImageMimeType: settings.headerImageMimeType,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHeaderImage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const settings = await ReportSettings.findOne();
    if (!settings || !settings.headerImageKey) {
      res.status(400).json({
        success: false,
        message: 'No active header image to remove.',
      });
      return;
    }

    const fileKey = settings.headerImageKey;
    settings.headerImageKey = null;
    settings.headerImageMimeType = null;
    settings.headerImageWidth = null;
    settings.headerImageHeight = null;
    settings.updatedBy = req.admin?._id as any;
    await settings.save();

    const filePath = path.resolve(env.UPLOAD_DIR, fileKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('[Upload] Could not delete header image file:', e);
      }
    }

    res.json({
      success: true,
      message: 'Header image removed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function serveHeaderImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { filename } = req.params;

    // Prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(env.UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'Image not found.',
      });
      return;
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}
