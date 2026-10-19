import { Router } from 'express';
import {
  login,
  logout,
  getCurrentAdmin,
  changePassword,
} from '../controllers/auth.controller.js';
import {
  getDashboardSummary,
  getTimeSeriesStats,
} from '../controllers/dashboard.controller.js';
import {
  listRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  downloadRegistrationPdf,
} from '../controllers/registration.controller.js';
import {
  getConsolidatedReportData,
  exportRegistrationsCsv,
  exportConsolidatedPdf,
  getReportFilterOptions,
} from '../controllers/report.controller.js';
import {
  getReportSettings,
  updateReportSettings,
  uploadHeaderImageMiddleware,
  uploadHeaderImage,
  deleteHeaderImage,
} from '../controllers/settings.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

export const adminRouter = Router();

// ================= Authentication =================
adminRouter.post('/auth/login', authLimiter, login);
adminRouter.post('/auth/logout', logout);
adminRouter.get('/auth/me', requireAdmin, getCurrentAdmin);
adminRouter.post('/auth/change-password', requireAdmin, changePassword);

// ================= Dashboard =================
adminRouter.get('/dashboard/summary', requireAdmin, getDashboardSummary);
adminRouter.get('/dashboard/timeseries', requireAdmin, getTimeSeriesStats);

// ================= Registrations Management =================
adminRouter.get('/registrations', requireAdmin, listRegistrations);
adminRouter.get('/registrations/:id', requireAdmin, getRegistrationById);
adminRouter.patch('/registrations/:id', requireAdmin, updateRegistration);
adminRouter.delete('/registrations/:id', requireAdmin, deleteRegistration);
adminRouter.get('/registrations/:id/pdf', requireAdmin, downloadRegistrationPdf);

// ================= Reporting & Exports =================
adminRouter.get('/reports/consolidated', requireAdmin, getConsolidatedReportData);
adminRouter.get('/reports/filter-options', requireAdmin, getReportFilterOptions);
adminRouter.get('/reports/registrations.csv', requireAdmin, exportRegistrationsCsv);
adminRouter.get('/reports/registrations.pdf', requireAdmin, exportConsolidatedPdf);

// ================= Report Header Settings =================
adminRouter.get('/settings/report', requireAdmin, getReportSettings);
adminRouter.put('/settings/report', requireAdmin, updateReportSettings);
adminRouter.post(
  '/settings/report/header-image',
  requireAdmin,
  uploadHeaderImageMiddleware,
  uploadHeaderImage
);
adminRouter.delete('/settings/report/header-image', requireAdmin, deleteHeaderImage);
