# Portfolio & CMS Enhancements - Complete Changelog & Architecture Summary

This document provides a comprehensive, centralized record of all architecture improvements, bug fixes, UI/UX redesigns, and new features implemented across the Portfolio and CMS platform.

---

## 📑 Table of Contents
1. [Core Infrastructure & Environment](#1-core-infrastructure--environment)
2. [WYSIWYG Editor & Case Study Section Creator](#2-wysiwyg-editor--case-study-section-creator)
3. [Media Upload & Cloudinary Video Engine](#3-media-upload--cloudinary-video-engine)
4. [Responsive Gallery & Image Lightbox System](#4-responsive-gallery--image-lightbox-system)
5. [Portfolio Detail Public UX & Case Study Progress Bar](#5-portfolio-detail-public-ux--case-study-progress-bar)
6. [AI Service Upgrades (Opencode Go / Deepseek Flash)](#6-ai-service-upgrades-opencode-go--deepseek-flash)
7. [UI Cleanup & Portfolio Cards](#7-ui-cleanup--portfolio-cards)
8. [Testing & Build Tooling](#8-testing--build-tooling)
9. [Portfolio Creation Year & Archive Filter](#9-portfolio-creation-year--archive-filter)
10. [Unified Experience & Education Affiliation System](#10-unified-experience--education-affiliation-system)
11. [Direct Signed Cloudinary Video Upload (413 Fix)](#11-direct-signed-cloudinary-video-upload-413-fix)
12. [Homepage Hierarchy & UI Alignment](#12-homepage-hierarchy--ui-alignment)
13. [Portfolio Public Visibility & Draft Management](#13-portfolio-public-visibility--draft-management)
14. [Custom Technologies Input & Tokenization System](#14-custom-technologies-input--tokenization-system)
15. [Files Created, Modified, or Removed](#15-files-created-modified-or-removed)

---

## 1. Core Infrastructure & Environment

### Port 5001 & AirPlay Conflict Resolution
- **Issue**: macOS Monterey/Ventura/Sonoma uses port `5000` by default for the AirPlay Receiver daemon (`ControlCenter`), causing `EADDRINUSE` server crash on boot.
- **Resolution**:
  - Changed default server port from `5000` to `5001` across `.env`, `.env.example`, `server/index.js`, and `src/services/api.ts`.
  - Configured local MongoDB URI default to `mongodb://127.0.0.1:27017/portfolio`.

### CSS Pipeline Integration Fix
- **Issue**: `src/App.css` existed in the codebase but was never imported into `src/main.tsx` or `src/index.css`. Because Vite treeshakes unreferenced files, custom classes like `.gallery-zoom-badge`, `.portfolio-section-title`, and `.portfolio-gallery` were completely missing from the compiled stylesheet bundle.
- **Resolution**:
  - Added `import './App.css';` to `src/main.tsx` directly after `import './index.css';`.
  - Verified bundle size increase in `dist/assets/*.css` and confirmed all selectors are compiled.

---

## 2. WYSIWYG Editor & Case Study Section Creator

### TipTap Integration & Migration from Markdown Editor
- Replaced the legacy `@uiw/react-md-editor` with a rich **TipTap (ProseMirror)** WYSIWYG editor (`src/cms/components/WYSIWYGEditor.tsx`).
- Enabled formatting controls: H2, H3, Bold, Italic, Bullet List, Numbered List, Blockquote, Link, Single Media Upload, and Gallery Upload.

### "Create Section Title" Feature
- Added a dedicated toolbar dropdown (`📑 Section Title ▾`) allowing admins to insert standardized case study chapters or custom section titles.
- **5 Standard Chapters**:
  1. `1. Project Background & Context`
  2. `2. Development Process`
  3. `3. Implementation Details`
  4. `4. Team Structure & Roles`
  5. `5. Outcomes & Impact`
- Supports custom section titles with inline creation (`onKeyDown Enter`).
- Automatically wraps inserted headers with `<h2 class="portfolio-section-title">` followed by an active paragraph.

### List Formatting Bug Fix (`• List` and `1. List`)
- **Root Cause**: `useEffect([value, editor])` compared raw TipTap HTML against `migrateContentToHtml(value)`. Because entity decoding differed (`&amp;` vs `&`), the comparison evaluated to `false` on every keystroke, causing `setContent()` to re-run, reset focus, and collapse empty list elements (`<ul><li><p></p></li></ul>`). Furthermore, toolbar button clicks blurred the editor.
- **Fix**:
  - Added `lastEmittedHtmlRef` to bypass redundant `setContent` triggers for internal updates.
  - Added `onMouseDown={(e) => e.preventDefault()}` on all toolbar buttons to preserve text selection.
  - Added explicit CSS for `.ProseMirror ul`, `.ProseMirror ol`, `.ProseMirror li`, and `.ProseMirror li > p { margin: 0 !important; }`.

### "Edit Portfolio Item" Screen Redesign
- Redesigned `src/cms/pages/PortfolioManagement.tsx` into an asymmetric two-column workspace:
  - **Left Column (40% width)**: Core metadata (Title, Description, Category, Hero Image/Video URL, Cloudinary upload, Technologies, Roles, URL Link, Protected Password, Display Order).
  - **Right Column (60% width)**: Primary focus on rich **Project Details** with sticky header, quick AI Rewrite button, and word/character count.
  - Added global `⌘S` / `Ctrl+S` keyboard shortcut to save portfolio items.

---

## 3. Media Upload & Cloudinary Video Engine

### Custom Multer Cloudinary Storage Engine
- **Issue**: Multer v2 removed native support for `multer-storage-cloudinary`, throwing `TypeError: CloudinaryStorage is not a constructor`.
- **Fix**: Implemented a native `CloudinaryStorage` class in `server/config/cloudinary.js` implementing Multer's `_handleFile` and `_removeFile` protocols with stream error handling (`uploadStream.on('error', cb)`).

### Video Upload 500 Error Resolution
- **Root Cause**: Passing `allowed_formats` to `cloudinary.uploader.upload_stream` for video uploads caused Cloudinary to reject streams with `"An unknown file format not allowed"`, and synchronous `transformation: [{ width: 1920, ... }]` caused Cloudinary transcoding timeouts. Additionally, uncaught Multer errors triggered Express's default HTML 500 handler.
- **Fix**:
  - Removed `allowed_formats` and synchronous `transformation` from upload parameters in `portfolioVideoStorage` and `editorMediaStorage`.
  - Added strict `videoFileFilter` and `editorMediaFileFilter` in Multer checking file extensions (`.mp4`, `.webm`, `.mov`, `.mkv`, `.m4v`) and MIME types.
  - Dynamic URL optimization (`q_auto,f_auto,w_1920,c_limit`) is applied on delivery via `optimizeVideoUrl()` and `optimizeCloudinaryVideoUrl()`.
  - Wrapped Multer upload callbacks in `server/routes/upload.js` (`/portfolio-video`, `/editor-media`, `/editor-gallery`) to catch errors gracefully and return descriptive 400 JSON responses.

---

## 4. Responsive Gallery & Image Lightbox System

### Lightbox Preview Modal (`src/components/ImageLightboxModal.tsx`)
- Built an accessible full-screen image viewer:
  - Supports single image preview and multi-image gallery navigation (`‹ Prev` / `Next ›`).
  - Keyboard controls (`ArrowLeft`, `ArrowRight`, `Escape`).
  - Image counter (`1 / N`) and caption display.
  - Available inside the CMS editor and on public portfolio pages.

### Responsive Gallery Breakpoints
- **Mobile (`≤ 640px`)**: Horizontal touch/swipe carousel with CSS scroll snapping (`scroll-snap-type: x mandatory`), `85%` card width with next-card preview peek.
- **Tablet (`641px – 1024px`)**: 2-column CSS Grid (`grid-template-columns: repeat(2, minmax(0, 1fr))`).
- **Desktop (`> 1024px`)**: Custom per-item flex widths (`25%`, `33%`, `50%`, `75%`, `100%`) managed via the editor.

### "Click to View Image" Badge Display Rules
- **Desktop (`> 1024px`)**: Badge is hidden by default (`opacity: 0`). When the user's cursor hovers over the image, it fades in smoothly (`opacity: 1`).
- **Tablet & Mobile (`≤ 1024px`)**: Because touch devices lack hover, images are rendered with a darker filter (`filter: brightness(0.72) contrast(1.05)`), and the `"Click to view image"` badge is positioned in the center of the image (`top: 50%; left: 50%; transform: translate(-50%, -50%)`).

---

## 5. Portfolio Detail Public UX & Case Study Progress Bar

### Numbered Section Title Typography
- Updated `.portfolio-section-title` in `src/App.css` to match clean case-study styling:
  - Removed blue accent bar pseudo-element (`.portfolio-section-title::after`).
  - Added full-width subtle bottom divider (`border-bottom: 1px solid rgba(156, 163, 175, 0.3)`).
  - Clean font styling: `font-family: 'Sora'`, `font-size: 1.375rem`, `font-weight: 700`, `letter-spacing: -0.02em`.
  - Section spacing: `margin-top: 2.25rem`, `padding-bottom: 0.5rem`, `margin-bottom: 1rem`.

### Sticky Case Study Reading Progress Bar (`src/components/ScrollProgressBar.tsx`)
- Placed directly above the case study content (Option B):
  - Tracks reading progress percentage (`0%` to `100%`) using `requestAnimationFrame` for 60fps performance.
  - Dynamically displays the current active chapter title (e.g. `1. Project Background & Context`).
  - **Split-Screen Aware**: On desktop, tracks the right-hand scrollable container (`w-3/5 overflow-y-auto h-screen`). On mobile, tracks window scroll.
  - **Hidden Element Filtering**: Uses `h.offsetParent !== null` so hidden desktop layout elements in the DOM do not conflict with mobile/tablet tracking.

### Action Buttons Positioning & Visibility
- **Desktop View**: Moved "Visit Project" and "Back to Portfolio" buttons directly below the **Technologies Used** section (removed `mt-auto`).
- **Mobile View**: Fixed "Visit Project" button invisibility by replacing `btn btn-outline text-white` with `btn btn-info btn-lg gap-2 text-white shadow-md`.

---

## 6. AI Service Upgrades (Opencode Go / Deepseek Flash)

### Model & Token Upgrades
- Upgraded AI integration to Opencode Go using `deepseek-v4.1-flash` with token limits expanded to `8192`.
- Preserved environment variable names (`DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`) for backward compatibility.

### Standardized Case Study Output Prompts
- Updated `server/services/aiService.js` and `src/utils/aiHelpers.ts`:
  - Enforced exact 5-section chapter structure with bold inline field labels:
    - `## 1. Project Background & Context` (`**Target Users:**`, `**Objectives:**`)
    - `## 2. Development Process` (`**Technical Approach:**`, `**Key Challenges:**`)
    - `## 3. Implementation Details` (`**Core Features:**`, `**Technologies:**`, `**Notable Achievements:**`)
    - `## 4. Team Structure & Roles` (`**Project Team:**`)
    - `## 5. Outcomes & Impact` (`**Deliverables:**`, `**Key Improvements:**`, `**User Feedback:**`, `**Lessons Learned:**`)

---

## 7. UI Cleanup & Portfolio Cards

### Removed Custom Cursor Inverter
- Removed `CursorInverter.tsx`, `CursorToggle.tsx`, `CursorInverter.css`, and `PerformanceMonitor.ts` to restore native system cursor behavior.

### Portfolio Card Line Clamping & Overflow Badges
- Configured 2-line title clamping and 3-line description clamping.
- Limited role badges to 2 visible badges with a `+N more` badge showing a native tooltip for remaining roles.

---

## 8. Testing & Build Tooling

### TypeScript & Vitest Test Setup
- Fixed `Property 'toBeInTheDocument' does not exist on type 'Assertion'` by updating `tests/setup.ts` to import `@testing-library/jest-dom/vitest`.
- Included `"tests"` in `tsconfig.json`.
- Implemented comprehensive automated test suites covering:
  - WYSIWYG editor rendering, gallery insertion, list toggling, and section title creation.
  - Legacy markdown detection and HTML migration.
  - Cloudinary video optimization flags.
  - Lightbox modal interactions and keyboard navigation.
  - Case study scroll progress bar tracking.
- **Current Test Status**: 27 tests passing across 6 test suites (`npm test`).
- **Production Build**: 0 errors, building cleanly in ~1.5–1.7s with Vite.

---

## 9. Portfolio Creation Year & Archive Filter

### Project Year Field
- Added `year` field (4-digit string) to `server/models/Portfolio.js` and `server/routes/portfolio.js`.
- Added `Project Year (optional)` input to the admin CMS editor modal in `src/cms/pages/PortfolioManagement.tsx`.
- Displays `📅 {year}` badge in the admin card list, portfolio cards, and detail views.

### Archive Year Filter Bar
- Extracted unique years in descending order (`src/sections/portfolios/portfolio.tsx`).
- Added interactive Year filter badges alongside Roles and Technologies in the horizontal filter bar.
- Updated filter dependencies and wired `clearAllFilters` to reset selected year.
- Validated with unit tests in `tests/portfolio.test.tsx`.

---

## 10. Unified Experience & Education Affiliation System

### Unified Affiliation Dropdown
- Combined "Related Work Experience" and "Educational Background" selectors into a single dropdown in `src/cms/pages/PortfolioManagement.tsx`.
- Organized with `<optgroup label="💼 Work Experiences">` and `<optgroup label="🎓 Educational Background">`.
- Implemented mutual exclusivity state machine: selecting an education item explicitly clears experience fields, and vice versa. Selecting "None" clears all fields to `null`.
- Allows labeling university, bootcamp, freelance, and workplace projects.

### Public & Admin Badge Display
- **Card Image Overlay**: Dedicated badge slot on `src/sections/portfolios/portfoliocard.tsx` rendering `💼 {company}` or `🎓 {institution}`, dynamically offset below pinned badge (`${isPinned ? 'top-10' : 'top-2'}`).
- **Privacy Masking**: Hidden when `isPasswordProtected: true` until unlocked.
- **Detail View**: Displayed in both Mobile and Desktop Split-Screen headers in `src/pages/PortfolioDetail.tsx`.
- **Admin CMS**: Displayed in emerald badges `🎓 {institution}` in the card list.

---

## 11. Direct Signed Cloudinary Uploads for Video & Gallery (413 Fix)

### Issue & Resolution
- **Issue**: Vercel serverless request body size limit is 4.5 MB. Large video uploads proxied through `/api/upload/portfolio-video` and multi-file gallery/media uploads proxied through `/api/upload/editor-gallery` and `/api/upload/editor-media` failed with HTTP 413 (Payload Too Large).
- **Resolution**:
  - Implemented direct client-to-Cloudinary signed upload architecture via `GET /api/upload/signature` in `src/services/api.ts` for:
    - Portfolio videos (`uploadPortfolioVideo`)
    - Single editor media (`uploadEditorMedia`)
    - Multi-file gallery batches (`uploadEditorGallery`) using concurrent parallel uploads via `Promise.all()`
  - Added client-side size guards (25 MB per image, 100 MB per video) and upload progress tracking in `src/cms/pages/PortfolioManagement.tsx` and `src/cms/components/WYSIWYGEditor.tsx`.
  - Added unit tests in `tests/WYSIWYGEditor.test.tsx` verifying file size validation (27 tests passing across 6 suites).

---

## 12. Homepage Hierarchy & UI Alignment

### Section Order & Theme Tweaks
- Reordered homepage sections (`src/pages/Home.tsx`):
  Hero → About Me → Tools that I'm currently using → My Works → My Experiences → My Educational Background → Social Media Cards + Contact Form → Footer.
- Changed "My Works" section background color from `#CA8A03` to clean white `#FFFFFF`.
- Standardized educational background content card container width in `src/sections/education/education.tsx` to `w-96`, aligning with experience cards.

---

## 13. Portfolio Public Visibility & Draft Management

### Feature Overview
- **Admin Visibility Control**: Added a clear public visibility toggle inside the portfolio edit/create modal (`src/cms/pages/PortfolioManagement.tsx`). Admins can toggle between `"🌐 Visible on Public Website"` and `"🚫 Hidden from Public Website"` with explanatory microcopy.
- **Visual Status Badges**:
  - Modal Header: Displays dynamic badges `🌐 Public (Visible)` or `🚫 Hidden from Public`.
  - Admin Card List: Displays `🚫 Hidden` badge for unpublished items while keeping them accessible and editable for administrators.
  - Creation Defaults: Explicitly defaults `isPublished: true` for both manual creation and AI-assisted portfolio generation.
- **Airtight Public Exclusion**:
  - `src/cms/apiStorage.ts`: Updated `CMSStorage.getPortfolios(publishedOnly = false)` to pass `publishedOnly` parameter to `apiService.getPortfolios(publishedOnly)`.
  - `src/sections/portfolios/portfolio.tsx`: Calls `CMSStorage.getPortfolios(true)` and applies defensive filtering `item.isPublished !== false`. Filter extractions (`allTechs`, `allRoles`, `allYears`) strictly derive from published items to prevent metadata leakage.
  - `src/pages/PortfolioDetail.tsx`: Calls `CMSStorage.getPortfolios(true)` and checks `p.isPublished !== false`, gracefully redirecting direct URL access to the "Portfolio Not Found" fallback screen.
  - `server/routes/portfolio.js`: Query filter uses `{ isPublished: { $ne: false } }` when `published === 'true'` to preserve backward compatibility for legacy records.
- **Test Coverage**:
  - `tests/portfolio.test.tsx`: Verified unpublished items and their metadata tags (tech, role, year) are excluded from the public showcase.
  - `tests/PortfolioDetail.test.tsx`: Verified direct route access to an unpublished item renders "Portfolio Not Found" fallback and calls `CMSStorage.getPortfolios(true)`.

---

## 14. Custom Technologies Input & Tokenization System

### Defect & Resolution
- **Issue**: The comma-separated input field inside "Technologies Used" in `src/cms/pages/PortfolioManagement.tsx` was unresponsive:
  - No `+ Add` button or key event listeners (`Enter`, `,`), providing zero visual feedback or chip creation until form save.
  - Stale closure in `Cmd+S` keyboard shortcut listener permanently dropped any uncommitted text in `techInput`.
  - "Clear all" failed to clear `techInput`, causing cleared technologies to resurface upon saving.
  - Case-sensitive deduplication allowed duplicate tags (`React` vs `react`) without canonical catalog matching.
- **Resolution**:
  - Implemented and exported pure `normalizeAndDeduplicateTech` helper for whitespace trimming, case-insensitive catalog normalization against `availableTechTools`, and duplicate suppression.
  - Implemented `handleAddCustomTech` with functional state updater `setEditingItem(prev => ...)`.
  - Grouped the input with a `+ Add` button (`onMouseDown` preventDefault prevents focus blur race conditions) and attached `onKeyDown` intercepting `Enter` and `,`.
  - Added `techInputRef` to eliminate stale closure bugs in `handleSave` and `Cmd+S` / `Ctrl+S` shortcut listener.
  - Synchronized "Clear all", `handleEdit`, and `handleCancel` to reset `techInput` and `techInputRef.current`.
  - In `handleAIPortfolioGenerate`, merged `portfolio.customTech` directly into `newItem.tech` as visible chips upon generation.
  - Added full test suite in `tests/PortfolioManagement.test.tsx` verifying chip creation on button click, Enter, and comma, case normalization, pre-save flush, and Clear all sync (34 total tests passing).

---

## 15. Files Created, Modified, or Removed

| File | Status | Description |
| :--- | :--- | :--- |
| `src/cms/pages/PortfolioManagement.tsx` | Modified | Added `normalizeAndDeduplicateTech`, `handleAddCustomTech`, `techInputRef`, input group with `+ Add` button, and pre-save sync. |
| `tests/PortfolioManagement.test.tsx` | Created | Automated Vitest suite for interactive tag creation, Enter/comma handling, duplicate suppression, and pre-save flushing. |
| `server/routes/portfolio.js` | Modified | Updated GET `/api/portfolio` query filter to `{ isPublished: { $ne: false } }` for legacy record parity. |
| `src/cms/apiStorage.ts` | Modified | Added `publishedOnly = false` parameter to `CMSStorage.getPortfolios`. |
| `src/sections/portfolios/portfolio.tsx` | Modified | Public showcase queries published-only items and derives metadata filters strictly from published projects. |
| `src/pages/PortfolioDetail.tsx` | Modified | Public detail route guards against unpublished items with fallback screen. |
| `tests/portfolio.test.tsx` | Modified | Unit test asserting hidden portfolios and metadata are excluded from public showcase. |
| `tests/PortfolioDetail.test.tsx` | Modified | Unit test asserting unpublished portfolio direct URLs trigger fallback view. |
| `server/models/Portfolio.js` | Modified | Added `year`, `relatedExperience`, `relatedExperienceCompany`, `relatedEducation`, `relatedEducationInstitution`. |
| `server/routes/upload.js` | Modified | Added `GET /api/upload/signature` for direct Cloudinary signed uploads. |
| `src/services/api.ts` | Modified | Direct signed Cloudinary uploads, parameter interfaces updated for `year`, `relatedExperience`, `relatedEducation`. |
| `src/pages/Home.tsx` | Modified | Reordered homepage section hierarchy and white background for My Works. |
| `src/sections/portfolios/portfoliocard.tsx` | Modified | Dynamic badge overlay for experience/education with privacy masking and pinned offsets. |
| `src/sections/education/education.tsx` | Modified | Standardized card container width to `w-96`. |
| `tests/portfoliocard.test.tsx` | Modified | Unit tests for experience and education badge rendering and password masking. |
| `src/cms/components/WYSIWYGEditor.tsx` | Created | Complete TipTap WYSIWYG editor with section presets, media upload, and gallery controls. |
| `src/components/ImageLightboxModal.tsx` | Created | Full-screen image preview modal with gallery navigation. |
| `src/components/ScrollProgressBar.tsx` | Created | Sticky case study progress bar with active section tracking. |
| `src/utils/contentMigration.ts` | Created | Markdown-to-HTML converter and section heading standardizer. |
| `server/scripts/migrateMarkdownToWYSIWYG.js` | Created | Database migration script standardizing portfolio records. |
| `src/main.tsx` | Modified | Added `import './App.css'` to stylesheet pipeline. |
| `src/App.css` | Modified | Section title typography, responsive gallery breakpoints, and lightbox badges. |
| `server/config/cloudinary.js` | Modified | Custom CloudinaryStorage engine, video file filters, stream error handling. |
| `server/services/aiService.js` | Modified | Updated AI prompt schemas for standardized case study sections. |
| `tests/WYSIWYGEditor.test.tsx` | Created | Comprehensive tests for WYSIWYG editor, lists, and galleries. |
| `tests/setup.ts` | Modified | Added `@testing-library/jest-dom/vitest`. |
| `tsconfig.json` | Modified | Added `"tests"` to `"include"`. |
| `src/components/CursorInverter/*` | Removed | Removed non-native cursor components. |

