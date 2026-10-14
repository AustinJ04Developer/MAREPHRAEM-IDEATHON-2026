import { Router } from 'express';
import {
  getProblemAreas,
  previewAbbreviation,
  createRegistration,
  getPublicRegistrationById,
} from '../controllers/public.controller.js';
import { getReportSettings, serveHeaderImage } from '../controllers/settings.controller.js';
import { downloadRegistrationPdf } from '../controllers/registration.controller.js';
import { registrationLimiter } from '../middleware/rateLimiter.middleware.js';

export const publicRouter = Router();

publicRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    event: 'Marephraem Ideasource 2026',
  });
});

publicRouter.get('/problem-areas', getProblemAreas);
publicRouter.get('/abbreviation-preview', previewAbbreviation);
publicRouter.post('/registrations', registrationLimiter, createRegistration);
publicRouter.get('/registrations/:projectId', getPublicRegistrationById);
publicRouter.get('/registrations/:id/pdf', downloadRegistrationPdf);
publicRouter.get('/settings/report/public', getReportSettings);
publicRouter.get('/uploads/header-image/:filename', serveHeaderImage);
