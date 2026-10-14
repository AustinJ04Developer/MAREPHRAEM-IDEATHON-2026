import { SequenceCounter } from '../models/SequenceCounter.js';

/**
 * Concurrency-safe atomic sequence allocator for Project IDs.
 * Generates formatted IDs such as "HCW-001", "HCW-002", "ASF-001", "SHS-001".
 * Sequence numbers above 999 expand naturally (e.g., "HCW-1000") while retaining at least 3 digits.
 */
export async function getNextProjectId(abbreviation: string): Promise<string> {
  const cleanAbbr = abbreviation.toUpperCase().trim();
  const scopeKey = `SEQ_${cleanAbbr}`;

  const counter = await SequenceCounter.findOneAndUpdate(
    { scope: scopeKey },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seqNumber = counter.value;
  const paddedNumber = String(seqNumber).padStart(3, '0');
  return `${cleanAbbr}-${paddedNumber}`;
}
