const mongoose = require('mongoose');
const { marked } = require('marked');
const Portfolio = require('../models/Portfolio');
require('dotenv').config();

function isMarkdownContent(content) {
  if (!content || !content.trim()) return false;
  const trimmed = content.trim();

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

  const hasAnyHtmlTag = /<[a-z][\s\S]*>/i.test(trimmed);
  return !hasAnyHtmlTag;
}

function standardizeSectionTitles(html, projectTitle) {
  if (!html || !html.trim()) return '';
  let updated = html.trim();

  // 1. Remove duplicate leading H1 matching project title
  if (projectTitle) {
    const escaped = projectTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updated = updated.replace(new RegExp(`^\\s*<h1[^>]*>\\s*${escaped}\\s*<\\/h1>`, 'i'), '');
  }

  // 2. Normalize common case-study section headings into standard numbered sections
  updated = updated
    .replace(/<h[12][^>]*>\s*(?:1\.?\s*)?(?:Project\s+)?(?:Background(?:\s+&amp;|\s+&)?\s+Context|Overview)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">1. Project Background & Context</h2>')
    .replace(/<h[12][^>]*>\s*(?:2\.?\s*)?(?:Development\s+Process(?:\s+&amp;|\s+&)?\s*(?:Architecture)?|Design\s+Process)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">2. Development Process</h2>')
    .replace(/<h[12][^>]*>\s*(?:3\.?\s*)?(?:Implementation\s+Details|Technologies\s+Used|Tools\s+Used)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">3. Implementation Details</h2>')
    .replace(/<h[12][^>]*>\s*(?:4\.?\s*)?(?:Team\s+Structure|My\s+Role|Role\s+and\s+Responsibilities|Collaboration)\s*<\/h[12]>/gi, '<h2 class="portfolio-section-title">4. Team Structure & Roles</h2>')
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

function convertMarkdownToHtml(content, projectTitle) {
  if (!content || !content.trim()) return '';
  const parsed = isMarkdownContent(content)
    ? marked.parse(content.trim(), { async: false }).trim()
    : content.trim();
  return standardizeSectionTitles(parsed, projectTitle);
}

async function runMigration(dryRun = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const portfolios = await Portfolio.find({});
  console.log(`Found ${portfolios.length} portfolio items.`);

  let migratedCount = 0;

  for (const portfolio of portfolios) {
    if (portfolio.projectDetails) {
      const htmlContent = convertMarkdownToHtml(portfolio.projectDetails, portfolio.title);
      if (htmlContent !== portfolio.projectDetails) {
        console.log(`🔄 Migrating & standardizing section titles for "${portfolio.title}" (${portfolio._id})...`);
        if (!dryRun) {
          portfolio.projectDetails = htmlContent;
          await portfolio.save();
        }
        migratedCount++;
      }
    }
  }

  console.log(`🎉 Migration complete! ${migratedCount} portfolio(s) ${dryRun ? 'would be ' : ''}migrated/standardized.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  runMigration(isDryRun).catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
}

module.exports = {
  isMarkdownContent,
  convertMarkdownToHtml,
  runMigration
};

