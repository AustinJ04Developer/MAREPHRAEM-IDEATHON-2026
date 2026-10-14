import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';
import { ProblemArea } from '../models/ProblemArea.js';
import { ReportSettings } from '../models/ReportSettings.js';

export const OFFICIAL_CATEGORIES_DATA = [
  {
    code: 'HCW',
    name: 'Healthcare & Wellness',
    abbreviation: 'HCW',
    isActive: true,
    isOther: false,
    displayOrder: 1,
  },
  {
    code: 'ASF',
    name: 'Agriculture & Smart Farming',
    abbreviation: 'ASF',
    isActive: true,
    isOther: false,
    displayOrder: 2,
  },
  {
    code: 'ENV',
    name: 'Environment & Sustainability',
    abbreviation: 'ENV',
    isActive: true,
    isOther: false,
    displayOrder: 3,
  },
  {
    code: 'WMG',
    name: 'Water Management',
    abbreviation: 'WMG',
    isActive: true,
    isOther: false,
    displayOrder: 4,
  },
  {
    code: 'ESD',
    name: 'Education & Skill Development',
    abbreviation: 'ESD',
    isActive: true,
    isOther: false,
    displayOrder: 5,
  },
  {
    code: 'SCT',
    name: 'Smart Cities & Transportation',
    abbreviation: 'SCT',
    isActive: true,
    isOther: false,
    displayOrder: 6,
  },
  {
    code: 'ERE',
    name: 'Energy & Renewable Energy',
    abbreviation: 'ERE',
    isActive: true,
    isOther: false,
    displayOrder: 7,
  },
  {
    code: 'I4M',
    name: 'Industry 4.0 & Manufacturing',
    abbreviation: 'I4M',
    isActive: true,
    isOther: false,
    displayOrder: 8,
  },
  {
    code: 'RDS',
    name: 'Rural Development & Social Innovation',
    abbreviation: 'RDS',
    isActive: true,
    isOther: false,
    displayOrder: 9,
  },
  {
    code: 'FTN',
    name: 'Food Technology & Nutrition',
    abbreviation: 'FTN',
    isActive: true,
    isOther: false,
    displayOrder: 10,
  },
  {
    code: 'OTH',
    name: 'Other Area',
    abbreviation: 'OTH',
    isActive: true,
    isOther: true,
    displayOrder: 11,
  },
];

export async function seedProblemAreas() {
  console.log('[Seed] Seeding Official Problem Areas...');

  for (const cat of OFFICIAL_CATEGORIES_DATA) {
    await ProblemArea.findOneAndUpdate(
      { code: cat.code },
      { $set: cat },
      { upsert: true, new: true }
    );
  }

  console.log(`[Seed] Successfully seeded ${OFFICIAL_CATEGORIES_DATA.length} problem areas.`);

  // Ensure default report settings
  const existingSettings = await ReportSettings.findOne();
  if (!existingSettings) {
    const defaultSettings = new ReportSettings();
    await defaultSettings.save();
    console.log('[Seed] Default ReportSettings created.');
  } else {
    console.log('[Seed] ReportSettings already present.');
  }
}

async function run() {
  try {
    await connectDB();
    await seedProblemAreas();
    await disconnectDB();
    console.log('[Seed] Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  run();
}
