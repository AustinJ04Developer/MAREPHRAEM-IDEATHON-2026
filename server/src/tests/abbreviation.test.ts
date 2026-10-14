import { describe, it, expect } from 'vitest';
import {
  generateCustomAbbreviation,
  isValidAbbreviation,
  OFFICIAL_ABBREVIATIONS,
  RESERVED_ABBREVIATIONS,
} from '../utils/abbreviation.js';

describe('Three-Character Abbreviation System', () => {
  it('should maintain all 10 official fixed abbreviations exactly', () => {
    expect(OFFICIAL_ABBREVIATIONS['Healthcare & Wellness']).toBe('HCW');
    expect(OFFICIAL_ABBREVIATIONS['Agriculture & Smart Farming']).toBe('ASF');
    expect(OFFICIAL_ABBREVIATIONS['Environment & Sustainability']).toBe('ENV');
    expect(OFFICIAL_ABBREVIATIONS['Water Management']).toBe('WMG');
    expect(OFFICIAL_ABBREVIATIONS['Education & Skill Development']).toBe('ESD');
    expect(OFFICIAL_ABBREVIATIONS['Smart Cities & Transportation']).toBe('SCT');
    expect(OFFICIAL_ABBREVIATIONS['Energy & Renewable Energy']).toBe('ERE');
    expect(OFFICIAL_ABBREVIATIONS['Industry 4.0 & Manufacturing']).toBe('I4M');
    expect(OFFICIAL_ABBREVIATIONS['Rural Development & Social Innovation']).toBe('RDS');
    expect(OFFICIAL_ABBREVIATIONS['Food Technology & Nutrition']).toBe('FTN');
  });

  it('all official abbreviations must match ^[A-Z0-9]{3}$', () => {
    for (const abbr of Object.values(OFFICIAL_ABBREVIATIONS)) {
      expect(isValidAbbreviation(abbr)).toBe(true);
      expect(abbr).toHaveLength(3);
    }
  });

  it('generates correct abbreviations for 3+ word titles', () => {
    expect(generateCustomAbbreviation('Smart Healthcare Systems')).toBe('SHS');
    expect(generateCustomAbbreviation('Climate Change Solutions')).toBe('CCS');
    expect(generateCustomAbbreviation('Renewable Energy Storage')).toBe('RES');
    expect(generateCustomAbbreviation('Waste Management and Recycling')).toBe('WMR');
  });

  it('generates correct abbreviations for 2 word titles', () => {
    const abbr = generateCustomAbbreviation('Cyber Security');
    expect(isValidAbbreviation(abbr)).toBe(true);
    expect(abbr).toHaveLength(3);
    expect(abbr.startsWith('CS')).toBe(true);
  });

  it('generates correct abbreviations for 1 word titles', () => {
    expect(generateCustomAbbreviation('Robotics')).toBe('ROB');
    expect(generateCustomAbbreviation('Blockchain')).toBe('BLO');
    expect(generateCustomAbbreviation('AI')).toBe('AIX');
  });

  it('handles punctuation and special characters gracefully', () => {
    const abbr = generateCustomAbbreviation('Bio-Tech & Nano-Devices!');
    expect(isValidAbbreviation(abbr)).toBe(true);
    expect(abbr).toHaveLength(3);
  });

  it('resolves collisions deterministically when custom title matches a reserved official abbreviation', () => {
    // A title whose naive initials would be HCW ("Home Care Wellness")
    const customAbbr = generateCustomAbbreviation('Home Care Wellness');
    expect(isValidAbbreviation(customAbbr)).toBe(true);
    expect(customAbbr).toHaveLength(3);
    // Must NOT be the reserved HCW
    expect(RESERVED_ABBREVIATIONS.has(customAbbr)).toBe(false);
  });

  it('throws an error for empty or non-alphanumeric input', () => {
    expect(() => generateCustomAbbreviation('')).toThrow();
    expect(() => generateCustomAbbreviation('   ')).toThrow();
    expect(() => generateCustomAbbreviation('!@#$%^')).toThrow();
  });
});
