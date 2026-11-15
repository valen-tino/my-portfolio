import { describe, it, expect } from 'vitest';
import {
  formatMonthYear,
  formatFullDate,
  toISODateAttribute,
  sortByLatestEndDate,
} from '../src/utils/dateFormat';
import { getGreetingText } from '../src/others/greeting';

describe('dateFormat utilities', () => {
  it('formats full ISO timestamps without timezone drift', () => {
    expect(formatMonthYear('2025-10-01T00:00:00.000Z')).toBe('Oct 2025');
    expect(formatFullDate('2025-10-01T00:00:00.000Z')).toBe('Oct 1, 2025');
    expect(toISODateAttribute('2025-10-01T00:00:00.000Z')).toBe('2025-10-01');
  });

  it('handles YYYY-MM, YYYY-MM-DD, and Present labels cleanly', () => {
    expect(formatMonthYear('2025-10')).toBe('Oct 2025');
    expect(formatFullDate('2026-05-15')).toBe('May 15, 2026');
    expect(toISODateAttribute('2026-05-15')).toBe('2026-05-15');
    expect(formatMonthYear('Present')).toBe('Present');
    expect(formatFullDate('Present')).toBe('Present');
  });
});

describe('sortByLatestEndDate', () => {
  it('places ongoing Present items first, then sorts by descending end date and start date tie-break', () => {
    const items = [
      { id: 'older', startDate: '2021-01-01', endDate: '2023-06-01T00:00:00.000Z' },
      { id: 'mid-early-start', startDate: '2023-03-01', endDate: '2024-09-01' },
      { id: 'mid-late-start', startDate: '2024-01-01', endDate: '2024-09-01' },
      { id: 'current', startDate: '2024-01-01', endDate: 'Present' },
      { id: 'period-only', period: '15 Oct 2024 - Jul 2026' },
    ];

    const sortedIds = sortByLatestEndDate(items).map((item) => item.id);
    expect(sortedIds).toEqual([
      'current',
      'period-only',
      'mid-late-start',
      'mid-early-start',
      'older',
    ]);
  });
});

describe('getGreetingText', () => {
  it('returns time-of-day greeting for morning, afternoon, and evening hours', () => {
    expect(getGreetingText(new Date(2026, 4, 15, 9, 0, 0))).toBe('Good Morning');
    expect(getGreetingText(new Date(2026, 4, 15, 14, 0, 0))).toBe('Good Afternoon');
    expect(getGreetingText(new Date(2026, 4, 15, 20, 0, 0))).toBe('Good Evening');
  });
});

