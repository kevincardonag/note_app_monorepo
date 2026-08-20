import { describe, it, expect } from 'vitest';
import { formatNoteDate } from '../date-utils';

describe('formatNoteDate', () => {
  it("returns 'Today' for current date", () => {
    const today = new Date();
    expect(formatNoteDate(today)).toBe('Today');
    expect(formatNoteDate(today.toISOString())).toBe('Today');
  });

  it("returns 'Yesterday' for previous day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatNoteDate(yesterday)).toBe('Yesterday');
    expect(formatNoteDate(yesterday.toISOString())).toBe('Yesterday');
  });

  it("returns 'MMM DD' format without the year for older dates", () => {
    // A fixed date: 2025-05-15
    const date = new Date(2025, 4, 15); // Month is 0-indexed (4 = May)
    expect(formatNoteDate(date)).toBe('May 15');
  });

  it('returns empty string for invalid date', () => {
    expect(formatNoteDate('invalid-date-string')).toBe('');
  });
});
