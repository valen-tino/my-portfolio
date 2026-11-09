import { marked } from 'marked';

export const STANDARD_SECTION_TITLES = [
  '1. Project Background & Context',
  '2. Development Process',
  '3. Implementation Details',
  '4. Team Structure & Roles',
  '5. Outcomes & Impact'
] as const;

/**
 * Standardizes section headings and applies the .portfolio-section-title class.
 * Also removes redundant top-level H1 tags matching the project title.
 */
export function standardizeSectionTitles(html: string, projectTitle?: string): string {
  if (!html || !html.trim()) return '';
  let updated = html.trim();

  // 1. Remove duplicate leading H1 matching project title or generic title
  if (projectTitle) {
    const escaped = projectTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updated = updated.replace(new RegExp(`^\\s*<h1[^>]*>\\s*${escaped}\\s*<\\/h1>`, 'i'), '');
  }

  // 2. Normalize common case-study section headings into standard numbered sections
  updated = updated
    .replace(/<h[12][^>]*>\s*(?:1\.?\s*)?(?:Project\s+)?(?:Background(?:\s+&amp;|\s+&)?\s+Context|Overview)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">1. Project Background & Context</h2>')
    .replace(/<h[12][^>]*>\s*(?:2\.?\s*)?(?:Development\s+Process(?:\s*(?:&amp;|&)\s*Architecture)?|Design\s+Process)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">2. Development Process</h2>')
    .replace(/<h[12][^>]*>\s*(?:3\.?\s*)?(?:Implementation\s+Details(?:\s*(?:&amp;|&)\s*Key\s+Features)?|Technologies\s+Used|Tools\s+Used)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">3. Implementation Details</h2>')
    .replace(/<h[12][^>]*>\s*(?:4\.?\s*)?(?:Team\s+Structure(?:\s*(?:&amp;|&)\s*Roles)?|My\s+Role|Role\s+and\s+Responsibilities|Collaboration)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">4. Team Structure & Roles</h2>')
    .replace(/<h[12][^>]*>\s*(?:5\.?\s*)?(?:Outcomes\s*(?:&amp;|&)\s*Impact|Project\s+Results)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">5. Outcomes & Impact</h2>');

  // 3. Ensure any remaining h1 is converted to h2 with portfolio-section-title class
  updated = updated.replace(/<h1(\s+[^>]*)?>([\s\S]*?)<\/h1>/gi, '<h2 class="portfolio-section-title">$2</h2>');

  // 4. Ensure all h2 tags carry the portfolio-section-title class
  updated = updated.replace(/<h2(?![^>]*class=["'][^"']*portfolio-section-title)([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attrs, content) => {
    if (/class=["']/.test(attrs)) {
      return `<h2${attrs.replace(/class=["']([^"']*)["']/, 'class="$1 portfolio-section-title"')}>${content}</h2>`;
    }
    return `<h2 class="portfolio-section-title"${attrs}>${content}</h2>`;
  });

  return updated.trim();
}

/**
 * Detects whether a given projectDetails string is legacy Markdown / plain text
 * rather than WYSIWYG semantic HTML.
 */
export function isMarkdownContent(content: string): boolean {
  if (!content || !content.trim()) return false;
  const trimmed = content.trim();

  // If it starts with standard block HTML tags and has no raw markdown headers, treat as HTML
  const startsWithHtmlTag = /^<(p|h[1-6]|div|ul|ol|li|blockquote|pre|figure|video|img|section|article)\b/i.test(trimmed);
  const hasMarkdownHeadings = /^#{1,6}\s+.+/m.test(trimmed);
  const hasMarkdownLists = /^[-*+]\s+.+/m.test(trimmed);
  const hasMarkdownLinks = /\[[^\]]+\]\([^)]+\)/.test(trimmed);
  const hasMarkdownCodeFences = /```[\s\S]*?```/.test(trimmed);

  if (startsWithHtmlTag && !hasMarkdownHeadings && !hasMarkdownCodeFences) {
    return false;
  }

  if (hasMarkdownHeadings || hasMarkdownLists || hasMarkdownLinks || hasMarkdownCodeFences) {
    return true;
  }

  // If there are no HTML tags at all, treat plain text as markdown so paragraphs are wrapped in <p>
  const hasAnyHtmlTag = /<[a-z][\s\S]*>/i.test(trimmed);
  return !hasAnyHtmlTag;
}

/**
 * Converts legacy Markdown content to clean semantic HTML for the WYSIWYG editor and public view.
 * If content is already HTML, returns it standardized with section title formatting.
 */
export function migrateContentToHtml(content: string, projectTitle?: string): string {
  if (!content || !content.trim()) return '';
  const parsedHtml = isMarkdownContent(content)
    ? (marked.parse(content.trim(), { async: false }) as string).trim()
    : content.trim();

  return standardizeSectionTitles(parsedHtml, projectTitle);
}

/**
 * Formats general content (Experience, About Me, Education) for public display:
 * - If already semantic HTML, returns content directly.
 * - If legacy Markdown or plain text with newlines, parses via marked without
 *   mutating headings into case study chapter titles.
 */
export function formatPublicDescription(content: string): string {
  if (!content || !content.trim()) return '';
  const trimmed = content.trim();

  // If already contains block HTML tags, return as HTML
  const hasBlockHtml = /<(p|ul|ol|li|h[1-6]|div|blockquote)\b/i.test(trimmed);
  if (hasBlockHtml) {
    return trimmed;
  }

  // Parse legacy markdown or plain text with marked
  const parsed = marked.parse(trimmed, { async: false, breaks: true }) as string;
  return parsed.trim();
}

/**
 * Ensures Cloudinary video URLs include web delivery optimization flags (q_auto, f_auto, w_1920, c_limit).
 */
export function optimizeCloudinaryVideoUrl(url?: string | null): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/video/upload/') && !url.includes('q_auto')) {
    return url.replace('/video/upload/', '/video/upload/q_auto,f_auto,w_1920,c_limit/');
  }
  return url;
}

