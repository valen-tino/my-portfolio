const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const ISO_DATE_RE = /^(\d{4})-(\d{2})(?:-(\d{2}))?(?:T.*)?$/;

function parseCalendarDate(value?: string | null): {
  year: number;
  month: number;
  day?: number;
} | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = ISO_DATE_RE.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : undefined;

  if (!Number.isInteger(year) || month < 1 || month > 12) return null;
  if (day !== undefined && (day < 1 || day > 31)) return null;

  return { year, month, day };
}

/**
 * Formats ISO timestamps ("2025-10-01T00:00:00.000Z"), ISO dates ("2025-10-01"),
 * or year-month values ("2025-10") into "Oct 2025" without local timezone drift.
 */
export function formatMonthYear(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase() === 'present') return 'Present';

  const parsed = parseCalendarDate(trimmed);
  if (parsed) {
    return `${MONTH_SHORT[parsed.month - 1]} ${parsed.year}`;
  }

  return trimmed;
}

/**
 * Formats ISO timestamps ("2025-10-01T00:00:00.000Z") or dates ("2025-10-01")
 * into "Oct 1, 2025" without local timezone drift. Falls back to month-year for
 * YYYY-MM strings or trimmed input for non-ISO values.
 */
export function formatFullDate(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase() === 'present') return 'Present';

  const parsed = parseCalendarDate(trimmed);
  if (parsed) {
    if (parsed.day !== undefined) {
      return `${MONTH_SHORT[parsed.month - 1]} ${parsed.day}, ${parsed.year}`;
    }
    return `${MONTH_SHORT[parsed.month - 1]} ${parsed.year}`;
  }

  return trimmed;
}

/**
 * Normalizes an ISO timestamp into a canonical YYYY-MM-DD (or YYYY-MM) string
 * suitable for semantic `<time dateTime="...">` attributes.
 */
export function toISODateAttribute(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  const parsed = parseCalendarDate(trimmed);
  if (!parsed) return trimmed;

  const mm = String(parsed.month).padStart(2, '0');
  if (parsed.day !== undefined) {
    const dd = String(parsed.day).padStart(2, '0');
    return `${parsed.year}-${mm}-${dd}`;
  }
  return `${parsed.year}-${mm}`;
}

const MONTH_INDEX_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const ONGOING_KEYWORDS = new Set(['present', 'now', 'current', 'ongoing']);

function parseDateRank(value?: string | null): number {
  if (!value || typeof value !== 'string') return -1;
  const trimmed = value.trim();
  if (!trimmed) return -1;

  if (ONGOING_KEYWORDS.has(trimmed.toLowerCase())) {
    return Number.POSITIVE_INFINITY;
  }

  const iso = parseCalendarDate(trimmed);
  if (iso) {
    return iso.year * 10000 + iso.month * 100 + (iso.day ?? 31);
  }

  const dayMonthYear = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(trimmed);
  if (dayMonthYear) {
    const day = Number(dayMonthYear[1]);
    const month = MONTH_INDEX_MAP[dayMonthYear[2].toLowerCase()];
    const year = Number(dayMonthYear[3]);
    if (month && year) {
      return year * 10000 + month * 100 + Math.min(day, 31);
    }
  }

  const monthYear = /^([A-Za-z]+)\s+(\d{4})$/.exec(trimmed);
  if (monthYear) {
    const month = MONTH_INDEX_MAP[monthYear[1].toLowerCase()];
    const year = Number(monthYear[2]);
    if (month && year) {
      return year * 10000 + month * 100 + 31;
    }
  }

  const yearOnly = /^(\d{4})$/.exec(trimmed);
  if (yearOnly) {
    return Number(yearOnly[1]) * 10000 + 1231;
  }

  return -1;
}

export interface TimelineSortable {
  startDate?: string;
  endDate?: string;
  period?: string;
}

/**
 * Sorts timeline records (Experiences, Education) so entries with the latest
 * end date appear first ("Present"/"Now" highest, then descending end dates,
 * tie-broken by descending start date).
 */
export function sortByLatestEndDate<T extends TimelineSortable>(items: readonly T[]): T[] {
  const getScores = (item: T): [number, number] => {
    const parts = item.period ? item.period.split(/\s+[-–—]\s+/) : [];
    const periodStart = parts[0];
    const periodEnd = parts.length > 1 ? parts[parts.length - 1] : undefined;

    const startScore = Math.max(parseDateRank(item.startDate), parseDateRank(periodStart));
    const endScoreRaw =
      item.endDate !== undefined && item.endDate.trim() !== ''
        ? parseDateRank(item.endDate)
        : periodEnd !== undefined
          ? parseDateRank(periodEnd)
          : startScore;

    return [endScoreRaw, startScore];
  };

  return [...items].sort((a, b) => {
    const [endA, startA] = getScores(a);
    const [endB, startB] = getScores(b);
    if (endB !== endA) return endB - endA;
    if (startB !== startA) return startB - startA;
    return 0;
  });
}

