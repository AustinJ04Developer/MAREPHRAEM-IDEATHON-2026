import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/database.js';
import { Administrator } from '../models/Administrator.js';
import { env } from '../config/env.js';

export async function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || env.ADMIN_INITIAL_EMAIL).toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || env.ADMIN_INITIAL_PASSWORD;
  const name = process.env.ADMIN_NAME || env.ADMIN_INITIAL_NAME;

  console.log(`[Bootstrap] Checking administrator account for: ${email}`);

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const existingAdmin = await Administrator.findOne({ email });
  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.isActive = true;
    await existingAdmin.save();
    console.log(`[Bootstrap] Updated credentials for administrator: ${existingAdmin.email} (${existingAdmin.name})`);
    return existingAdmin;
  }

  const newAdmin = new Administrator({
    name,
    email,
    passwordHash,
    role: 'superadmin',
    isActive: true,
  });

  await newAdmin.save();
  console.log('========================================================');
  console.log('✅ Initial Administrator successfully bootstrapped:');
  console.log(`   Name:     ${newAdmin.name}`);
  console.log(`   Email:    ${newAdmin.email}`);
  console.log(`   Role:     ${newAdmin.role}`);
  console.log('========================================================');
  return newAdmin;
}

async function run() {
  try {
    await connectDB();
    await bootstrapAdmin();
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Bootstrap] Failed to bootstrap administrator:', error);
    process.exit(1);
  }
}

if (
  process.argv[1]?.endsWith('bootstrap-admin.ts') ||
  process.argv[1]?.endsWith('bootstrap-admin.js')
) {
  run();
}
