import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Administrator, IAdministrator } from '../models/Administrator.js';

export interface AuthenticatedRequest extends Request {
  admin?: IAdministrator;
}

interface JwtPayload {
  adminId: string;
  email: string;
  role: string;
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined = req.cookies?.ideathon_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in as an administrator.',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const admin = await Administrator.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid session or account is inactive.',
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
}
