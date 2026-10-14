import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/marephraem_ideathon_2026'),
  JWT_SECRET: z.string().min(16).default('ideathon_2026_super_secure_jwt_secret_key_minimum_32_characters_long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  UPLOAD_DIR: z.string().default(path.resolve(process.cwd(), '../uploads/report-headers')),
  MAX_HEADER_IMAGE_SIZE_MB: z.coerce.number().default(5),
  ADMIN_INITIAL_EMAIL: z.string().email().default('admin@marephraem.edu.in'),
  ADMIN_INITIAL_PASSWORD: z.string().default('Admin@Ideathon2026!'),
  ADMIN_INITIAL_NAME: z.string().default('Ideathon Director'),

  // Email SMTP configuration
  ENABLE_EMAIL_NOTIFICATIONS: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('MAREPHRAEM IDEATHON 2026 <ideathon@marephraem.edu.in>'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
