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
15. [WYSIWYG Expansion, Public Formatting & CV Upload](#15-wysiwyg-expansion-public-formatting--cv-upload)
16. [Blog & News Publication System](#16-blog--news-publication-system)
17. [Tech Tools Auto-Provisioning & Draft Privacy](#17-tech-tools-auto-provisioning--draft-privacy)
18. [TipTap Portfolio Embed Node & Modal Widget](#18-tiptap-portfolio-embed-node--modal-widget)
19. [Blog System Refinements & Portfolio Skills Full Migration](#19-blog-system-refinements--portfolio-skills-full-migration)
20. [Portfolio Embed Persistence & "My Works" Filter Redesign](#20-portfolio-embed-persistence--my-works-filter-redesign)
21. [Portfolio Filter Z-Index Elevation & Color Badge Synchronization](#21-portfolio-filter-z-index-elevation--color-badge-synchronization)
22. [Vercel Serverless Route Parity & Blog 404 Resolution](#22-vercel-serverless-route-parity--blog-404-resolution)
23. [Mobile Viewport Layout Containment & Blog Tag Filter Z-Index Elevation](#23-mobile-viewport-layout-containment--blog-tag-filter-z-index-elevation)
24. [Removal of All Static AI Keys & Client-Side Credential Isolation](#24-removal-of-all-static-ai-keys--client-side-credential-isolation)
25. [Files Created, Modified, or Removed](#25-files-created-modified-or-removed)

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

## 15. WYSIWYG Expansion, Public View Formatting, and Cloudinary CV Upload

### Feature Overview
- **WYSIWYG Editor Expansion with Configurable Modes**:
  - Enhanced `src/cms/components/WYSIWYGEditor.tsx` with `enableSectionPresets?: boolean`, `enableGalleries?: boolean`, and `minHeight?: string`.
  - Bypassed case study chapter title rewrite (`standardizeSectionTitles`) when `enableSectionPresets` is `false`, ensuring non-portfolio content preserves natural headings without case study prefixes.
  - Replaced legacy textareas in:
    - Experience Management (`src/cms/pages/ExperienceManagement.tsx`) for role descriptions.
    - Education Management (`src/cms/pages/EducationManagement.tsx`) for coursework and achievement descriptions.
    - About Me Management (`src/cms/pages/AboutManagement.tsx`) for personal biographies.
  - Stripped HTML tags (`replace(/<[^>]*>/g, ' ')`) in card list summaries for clean plain-text previews.
- **Public View Rich Formatting & Valid DOM Hierarchy**:
  - Created `formatPublicDescription` in `src/utils/contentMigration.ts` to parse legacy plain-text and markdown with `marked` while leaving semantic HTML intact without case study mutations.
  - Replaced outer `<p>` wrappers in:
    - Experience Section (`src/sections/experience/experience.tsx`)
    - Education Cards (`src/sections/education/educationcard.tsx`)
    - About Me Section (`src/sections/aboutme/aboutme.tsx`)
    with `<div className="wysiwyg-content ...">`, preventing invalid DOM nesting (block elements inside `<p>`).
  - Added dedicated styling rules in `src/App.css` under `.wysiwyg-content` guaranteeing list bullet styling (`list-disc`), decimal numbers (`list-decimal`), left alignment, and proper paragraph margins.
- **Cloudinary CV Upload & Dynamic Navbar/About Link**:
  - Updated `About` schema in `server/models/About.js` and `server/routes/about.js` with `cvURL` (default `'/Valen-Jehaut.pdf'`) and `cvCloudinaryId` (default `null`). Replaced Cloudinary CV assets are deleted via `deleteImage(oldId, 'raw')`.
  - Implemented direct signed client-to-Cloudinary upload in `src/services/api.ts` (`uploadCV`) and `src/cms/apiStorage.ts` (`CMSStorage.uploadCV`) targeting `resource_type: 'raw'` and folder `portfolio-cms/cv`.
  - Added CV Management Card in `src/cms/pages/AboutManagement.tsx` with file picker, PDF MIME guard, 15MB limit, and reset button.
  - Dynamically bound `cvURL` to "Download CV" buttons in `src/sections/aboutme/aboutme.tsx` and `src/sections/nav/nav.tsx` (both desktop and mobile) with `target="_blank" rel="noopener noreferrer"`.
- **Test Coverage**:
  - `tests/publicFormatting.test.tsx`: 8 tests verifying list, paragraph, and legacy fallback rendering across all public sections.
  - `tests/AboutManagement.test.tsx`: 3 tests verifying CV display, upload trigger, state update, and PDF validation.
  - All 45 tests across 9 test files passing cleanly with 0 build errors.

---

## 16. Blog & News Publication System

- **Public Showcase & Archive System**:
  - Implemented multi-dimensional filter bar (`src/sections/blog/blog.tsx`) featuring Category pills (`All`, `Event`, `Personal`, `News`, `Tech`), Year pills, interactive Tags dropdown, and keyword search.
  - Developed responsive blog card (`src/sections/blog/blogcard.tsx`) with category badge, read time, date, excerpt, tags, and pinned indicators.
  - Created full archive page at `/blog` (`src/pages/BlogPage.tsx`) and reading view at `/blog/:id` (`src/pages/BlogDetail.tsx`).
  - Embedded homepage preview section (`#blog`) with 3-post limit and full archive link button between Portfolio and Experience.
  - Implemented delegated link handler on article content bodies to transition internal routes (`/portfolio/...`) smoothly via client-side routing.
- **Backend Architecture & Dual-Lookup Routing**:
  - Created Mongoose model `server/models/Blog.js` with indexed sparse `slug`, category enum, tags, cover image, read time, and pre-save year and kebab-case slug derivation.
  - Created RESTful routes `server/routes/blog.js` with dual lookup (`_id` or `slug` via `mongoose.Types.ObjectId.isValid`), published filter `{ isPublished: { $ne: false } }`, deterministic sorting (`{ isPinned: -1, date: -1, createdAt: -1 }`), and Cloudinary cover cleanup on delete.
  - Mounted routes under `/api/blog` in `server/index.js`.
- **Admin Dashboard**:
  - Created `src/cms/pages/BlogManagement.tsx` under protected route `/cms/blogs`.
  - Added TipTap WYSIWYG editor (`enableSectionPresets={false}`, `enablePortfolioEmbed={true}`), cover upload directly to Cloudinary (`blogs` folder), tags input, and pinned/published toggles.
  - Added "Blogs & News" navigation entry to `src/cms/components/CMSLayout.tsx`.

---

## 17. Tech Tools Auto-Provisioning & Draft Privacy

- **Atomic Auto-Sync**:
  - In `server/routes/portfolio.js`, implemented `syncUncatalogedSkills`: saving a portfolio item with custom comma-separated skills checks `TechTool` via case-insensitive regex. If absent, it atomically upserts the tool as draft (`isPublished: false`, `/placeholder-tech.svg`, `order: 0`) using `$setOnInsert`.
  - Client-side chip input in `PortfolioManagement.tsx` remains strictly local React state until the portfolio is explicitly saved, avoiding orphan drafts from uncommitted input.
  - On portfolio save, `PortfolioManagement.tsx` refreshes `availableTechTools` to synchronize newly provisioned tools.
- **Public Marquee Isolation**:
  - Updated `server/routes/techTools.js` to support `?published=true`, filtering by `{ isPublished: { $ne: false } }`.
  - Updated `src/sections/skills/skills.tsx` to query `CMSStorage.getTechTools(true)`. Draft tools are excluded from the public marquee.
  - Implemented `duplicateToFill` with compound React keys (`key={`${tool._id || tool.title}-${idx}`}`) to prevent duplicate key collisions and avoid visual marquee gaps.
  - Added `onError` fallback on `src/sections/skills/logocard.tsx` to prevent broken image badges.
- **CMS Draft Management**:
  - In `src/cms/pages/TechToolsManagement.tsx`, auto-provisioned draft tools are displayed with a `Draft (Placeholder)` badge.
  - Added `isPublished` toggle in the edit modal, allowing administrators to upload official icons, adjust titles, and publish tools to the public marquee.

---

## 18. TipTap Portfolio Embed Node & Modal Widget

- **Custom Node (`PortfolioEmbedNode`)**:
  - Implemented custom atomic block node in `src/cms/components/WYSIWYGEditor.tsx` with non-rendered attributes (`portfolioId`, `title`, `desc`, `imageURL`, `linkTo`, `tech`, `roles`, `year`, `affiliation`).
  - Explicitly registered `PortfolioEmbedNode` in `useEditor({ extensions: [...] })`, preserving embedded card tags during HTML parsing and serialization.
  - Semantic HTML serialization into `<div data-portfolio-embed="true" ...>` with card layout, thumbnail, case study badge, affiliation, and action button.
- **Interactive NodeView (`PortfolioEmbedNodeView`)**:
  - Wrapped root in `<NodeViewWrapper>` from `@tiptap/react` to maintain DOM cursor tracking and avoid orphan nodes.
  - Floating dark action bar with attached title and `✕ Remove` button invoking `deleteNode()`.
  - Card preview button with `e.preventDefault()` to prevent accidental navigation while editing CMS content.
- **Modal Selector (`PortfolioSelectModal`)**:
  - Added "💼 Attach Portfolio" toolbar button with `onMouseDown={(e) => e.preventDefault()}` to preserve ProseMirror editor focus.
  - Searchable modal with live title/description/tech query, project thumbnails, and instant insertion into editor cursor position.

---

## 19. Blog System Refinements & Portfolio Skills Full Migration

### Dynamic Blog Category Omission & Reset
- In `src/sections/blog/blog.tsx`, category pills are dynamically filtered so categories with 0 published items are omitted from the filter bar.
- Added auto-reset `useEffect` to defensively reset `selectedCategory` to `'All'` if the currently selected category has 0 posts.

### Homepage Blog Decoupling & Section Suppression
- Decoupled homepage mode (`limit={3}`) from archive mode:
  - When `limit` is present, the filter bar and search box are completely suppressed.
  - Renders latest blogs grid up to `limit` and an explicit "See More Blogs" CTA button linking to `/blogs` (`btn btn-outline btn-info btn-sm sm:btn-md`).
  - If 0 published blogs exist, the entire `#blog` section returns `null` and is omitted from the DOM without layout disruption.
- In `src/pages/Home.tsx`, simplified structure by rendering `<BlogSection limit={3} />` directly, aligning with `ExperienceSection` and `EducationSection`.

### Canonical `/blogs` Routing & Breadcrumbs
- In `src/App.tsx`, registered canonical `/blogs` route and redirected `/blog` to `/blogs` via `<Navigate to="/blogs" replace />`.
- Supported dual reading routes `/blogs/:id` and `/blog/:id`.
- Standardized links across `src/sections/blog/blogcard.tsx`, `src/pages/BlogDetail.tsx`, and `src/sections/nav/nav.tsx`.

### Portfolio Select Modal Overflow & Hidden Filtering
- In `PortfolioSelectModal` (`src/cms/components/WYSIWYGEditor.tsx`):
  - Strictly filtered out uncataloged / hidden portfolios (`p.isPublished !== false`).
  - Fixed flexbox scrolling overflow by setting `shrink-0` on headers and `min-h-0 flex-1 overflow-y-auto overscroll-contain` on the container, allowing all portfolios to scroll without being clamped.
  - Displayed dynamic portfolio count in modal title: `Attach Portfolio Case Study ({count} available)`.

### Existing Portfolio Skills Migration & Auto-Sync
- Created `server/utils/skillMigration.js` with case-insensitive `Set` deduplication and atomic `TechTool.bulkWrite` (`updateOne` with `$setOnInsert` and `upsert: true`).
- Hooked automatic, non-blocking scan upon MongoDB connection in `server/index.js`.
- Created standalone CLI migration tool `server/scripts/syncExistingPortfolioSkills.js`.
- Added manual sync button "Sync Skills from Portfolios" in `src/cms/pages/TechToolsManagement.tsx` backed by `POST /api/tech-tools/sync-from-portfolios`.

---

## 20. Portfolio Embed Persistence & "My Works" Filter Redesign

### TipTap PortfolioEmbedNode Serialization Fix & White Button Text
- **Attribute Persistence**: In `src/cms/components/WYSIWYGEditor.tsx`, removed `rendered: false` from `PortfolioEmbedNode.addAttributes()`. In `renderHTML({ node, HTMLAttributes })`, read defensively from `node?.attrs || HTMLAttributes` and merged into the outer `div`, preserving valid JSON array serialization for `tech` and `roles`. Fixed the bug where attached case study cards reverted to `"Untitled Project"` after save.
- **Trailing Paragraph Flow**: Added trailing paragraph insertion in `PortfolioSelectModal.onSelect` so authors can click and type below newly embedded atom cards.
- **White Action Button**:
  - Added `.portfolio-embed-card` directly to `PortfolioEmbedNodeView` in `WYSIWYGEditor.tsx`.
  - Added `text-white !text-white !no-underline` to the anchor button in both the React NodeView and serialized HTML.
  - Added scoped CSS rule in `src/App.css` (`.portfolio-embed-card a.btn, [data-portfolio-embed] a.btn { color: #ffffff !important; text-decoration: none !important; }`) to neutralize `.ProseMirror a` and `@tailwindcss/typography` specificity cascades.

### "My Works" Multi-Dimensional Filter Redesign
- **Partitioned Two-Row Layout**: Redesigned the filter bar in `src/sections/portfolios/portfolio.tsx` matching the clean Blog filter pattern:
  - **Row 1**: Role pill buttons (`All`, `UI/UX`, `Web Developer`, `WordPress Developer`) with `btn-primary` active states and neutral count badges, alongside a real-time keyword search input (`🔍 Search projects and technologies...`).
  - **Divider**: Separator line (`border-t border-base-300/60`).
  - **Row 2**: Year pills (`All`, `2024`, etc.), Technology filter dropdown (`Filter by Tech (${count})`), selected technology tags with remove buttons, and an active `✕ Clear All` button.
  - **Results Summary**: Centered `"Showing X of Y projects"` summary.
- **Null-Safe Multi-Field Keyword Search**: Added real-time filtering across project title, description, and technologies.
- **Friendly Empty State**: When 0 projects match, renders a centered message with a "Reset Filters" action button calling `clearAllFilters`.
- **Homepage Protection**: Retained `{!limit && ...}` guard so `<Portfolio limit={3} />` on the homepage remains completely clean.

---

## 21. Portfolio Filter Z-Index Elevation & Color Badge Synchronization

### Stacking Context Elevation (Dropdown Below Card Fix)
- **Problem**: The technology filter dropdown (`portfolio-tech-menu` with `z-50`) rendered visually underneath adjacent portfolio cards when expanded, due to portfolio cards having `relative` position, `z-10` badges (e.g. affiliation, pinned), and transform transitions (`hover:scale-105`) while the filter container was statically positioned.
- **Resolution**:
  - Assigned `relative z-30` to `.portfolio-filter` and its inner card container (`bg-base-200/60`).
  - Assigned `relative inline-block z-40` to the dropdown anchor button container.
  - Assigned `relative z-10` to the portfolio project card grid container below.
  - This establishes an immutable parent stacking context where all dropdown menus float above card elements and badges.

### Year Pill Selection Color (`#00BAFE`)
- Updated the selected year pill (both `'All'` and individual years) to use the brand cyan color `#00BAFE`:
  `bg-[#00BAFE] text-white border-[#00BAFE] hover:bg-[#00BAFE]/90 font-semibold shadow-sm`.
- Retained clean unselected state (`btn-ghost hover:bg-base-300`).

### Role Tab Badge Color Synchronization
- **Role Badge Mapping**: Integrated `ROLE_COLOR_STYLES` dictionary mapping each role's CMS badge color (`primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`, `neutral`) to DaisyUI button styles.
- **Outline & Fill Dynamics**:
  - Inactive role tabs render as outlines matching their CMS badge color (e.g. `btn-outline btn-secondary`, `btn-outline btn-accent`, `border-[#00BAFE] text-[#00BAFE]`).
  - Active role tabs render as solid fills in their CMS badge color with matching content text color and shadow.
  - `'All'` role button renders in brand `#00BAFE` (filled when selected, outlined when unselected).

---

## 22. Vercel Serverless Route Parity & Blog 404 Resolution

### Root Cause & Serverless Router Alignment
- **Problem**: Vercel production deployment returned `404 Not Found` for all `/api/blog` requests (`Error fetching blogs: AxiosError: Request failed with status code 404`), preventing fetching, displaying, adding, editing, or deleting blog posts. While local Express (`server/index.js`) mounted `blogRoutes`, `api/serverless.js` (the Vercel catch-all API handler) never imported or registered the router.
- **Resolution**:
  - Imported `const blogRoutes = require('../server/routes/blog');` in `api/serverless.js`.
  - Mounted both canonical singular `/api/blog` and plural alias `/api/blogs` in `api/serverless.js`.
  - Added `/api/blogs` alias in `server/index.js` for complete local and production environment parity.

### Safe Cold-Start Skills Migration
- Integrated `{ syncAllPortfolioSkills } = require('../server/utils/skillMigration');` into `api/serverless.js`.
- Wrapped execution behind a module-level `let skillsSynced = false;` latch inside the pre-middleware, triggered as a non-blocking background promise (`syncAllPortfolioSkills().catch(...)`) so cold-start HTTP responses are never delayed or failed by background sync.

### Mongoose Model Recompilation Defense
- Updated all schemas in `server/models/` (`Blog.js`, `User.js`, `About.js`, `Contact.js`, `Education.js`, `Experience.js`, `Portfolio.js`, `Role.js`, `TechTool.js`) with `mongoose.models?.ModelName || mongoose.model(...)` to prevent `OverwriteModelError` during serverless container reuse.

### Automated Integration Verification
- Created `tests/serverlessBlog.test.ts` running in native Node runtime (`// @vitest-environment node`) with ephemeral HTTP server and `fetch`.
- Verified `GET /api/blog` (200), `GET /api/blogs` (200), `OPTIONS /api/blog` with CORS headers (200/204), unauthenticated `POST /api/blog` (401), and non-existent endpoints (404).

---

## 23. Mobile Viewport Layout Containment & Blog Tag Filter Z-Index Elevation

### Mobile Content Layout Shift & Viewport Bleed (Image 1)
- **Problem**: On mobile viewports (e.g., iPhone / iOS Safari), portfolio case study details and blog articles shifted and compressed to the left (~60% width), leaving an empty white gutter on the right side. This occurred because unbroken inline tokens (such as URLs in code or text), markdown tables, and media elements exceeded the mobile viewport width without wrapping. Because `html, body, #root, .App` lacked horizontal containment, WebKit expanded the layout viewport to the widest child element and zoomed the document out.
- **Root Cause & Technical Resolutions**:
  - **`overflow-x: clip` Root Containment**: Applied `overflow-x: clip; max-width: 100%; width: 100%; -webkit-text-size-adjust: 100%;` to `html, body, #root, .App`. Unlike `overflow-x: hidden` (which forces `overflow-y` to compute to `auto` and creates an independent scroll box that permanently breaks `position: sticky` on reading progress bars and sticky sidebars), `overflow-x: clip` cleanly clips horizontal overflow at the padding-box boundary without breaking `position: sticky` or window momentum scrolling.
  - **Selective Inline Code Wrapping vs Pre Code Block Preservation**: Targeted inline code tokens using `:not(pre) > code` with `overflow-wrap: anywhere !important; word-break: break-word !important; white-space: normal !important;`, while strictly preserving preformatted code blocks (`pre` & `pre code`) with `white-space: pre !important; overflow-x: auto !important; word-break: normal !important;` so syntax highlighting, tabs, and indentation remain pristine.
  - **Responsive Tables & Embedded Media**: Forced markdown `<table>` elements to `display: block !important; width: 100% !important; max-width: 100% !important; overflow-x: auto !important;` and constrained embedded media (`img`, `iframe`, `video`) to `max-width: 100% !important; height: auto;`.
  - **Flex `min-w-0` and Container Constraints**: Added `min-w-0 w-full max-w-full` to flex child `<main>` and `overflow-x-clip` to markdown bodies in `BlogDetail.tsx` and `PortfolioDetail.tsx` (while keeping wrapper ancestors free of `overflow-hidden` to protect `<ScrollProgressBar>`).
  - **Button Word-Break Exclusion**: Scoped link breaking to `a:not(.btn)` to prevent button text splitting (e.g. "Visit Project").

### Blog Tag Filter Dropdown Z-Index Stacking (Image 2)
- **Problem**: On the Blog Archive page (`/blogs`), opening the `🏷️ Filter by Tag ▾` dropdown rendered the menu underneath the blog card directly below it because the filter bar was statically positioned while blog cards possessed `position: relative` with `z-10` badges.
- **Resolution**:
  - Applied `relative z-30` to the filter bar container (`src/sections/blog/blog.tsx`).
  - Applied `relative inline-block z-40` to the tag dropdown anchor.
  - Retained `z-50` on the dropdown popover menu.
  - Applied `relative z-10` to the blog posts grid container.
  - Harmonized active year filter buttons (both `"All"` and numeric years) to cyan `#00BAFE` (`bg-[#00BAFE] text-white border-[#00BAFE] hover:bg-[#00BAFE]/90 font-semibold shadow-sm`), matching the portfolio archive implementation.
  - Added explicit test IDs (`blog-filter-bar`, `blog-tag-dropdown-anchor`, `blog-posts-grid`) and unit tests in `tests/blog.test.tsx`.

---

## 24. Removal of All Static AI Keys & Client-Side Credential Isolation

### Security Hardening & Zero Static Credentials
- **Problem**: Hardcoded API key literals (`oc_sk_c26451b97d8f_PeNlC8VXODkpok9xUXa2RwUZzOMUUic4`) were present as fallback defaults in server service and route files, and exposed in frontend configuration constants bundled to client browsers.
- **Resolutions**:
  - **Server Service Isolation (`server/services/aiService.js`)**: Removed static fallback literal; `DEEPSEEK_API_KEY` is now derived strictly from runtime `process.env.DEEPSEEK_API_KEY`.
  - **Server Route Status Check (`server/routes/ai.js`)**: Updated `hasApiKey` check to `!!process.env.DEEPSEEK_API_KEY`, eliminating the static string fallback.
  - **Client-Side Credential Stripping (`src/services/ai.ts`, `src/utils/aiHelpers.ts`)**: Removed `apiKey` property entirely from `OPENCODE_AI_CONFIG` and `AI_MODEL_CONFIG`. Because the browser never calls AI providers directly (all generation and rewriting requests are routed through authenticated `/api/ai/*` backend endpoints), client bundles now contain zero credential exposure.
  - **Documentation & Examples (`.env.example`)**: Replaced the active key literal with a generic placeholder `DEEPSEEK_API_KEY=your-deepseek-or-opencode-api-key`.
  - **Automated Regression Defense (`tests/aiHelpers.test.ts`)**: Added unit test assertions verifying that client configurations (`AI_MODEL_CONFIG`, `OPENCODE_AI_CONFIG`) do not expose an `apiKey` property.

---

## 25. Files Created, Modified, or Removed

| File | Status | Description |
| :--- | :--- | :--- |
| `server/services/aiService.js` | Modified | Removed static fallback key literal; strictly relies on `process.env.DEEPSEEK_API_KEY`. |
| `server/routes/ai.js` | Modified | Updated `hasApiKey` status check to evaluate `process.env.DEEPSEEK_API_KEY` without fallbacks. |
| `src/services/ai.ts` | Modified | Removed `apiKey` property from `OPENCODE_AI_CONFIG`. |
| `src/utils/aiHelpers.ts` | Modified | Removed `apiKey` property from `AI_MODEL_CONFIG`. |
| `.env.example` | Modified | Replaced active key literal with generic placeholder. |
| `tests/aiHelpers.test.ts` | Modified | Updated test assertions to verify client configs never expose `apiKey`. |
| `src/App.css` | Modified | Added root `overflow-x: clip`, `:not(pre) > code` wrapping, `pre` preservation, table/media overflow, and `a:not(.btn)` breaking. |
| `src/sections/blog/blog.tsx` | Modified | Elevated filter bar (`z-30`), tag anchor (`z-40`), grid (`z-10`), added test IDs, and styled year filter with `#00BAFE`. |
| `src/pages/BlogDetail.tsx` | Modified | Added `min-w-0` to flex child `<main>` and `overflow-x-clip` to article content body. |
| `src/pages/PortfolioDetail.tsx` | Modified | Added `w-full min-w-0` to wrappers and `overflow-x-clip` to markdown details container. |
| `tests/blog.test.tsx` | Modified | Added assertions for filter bar `z-30`, tag anchor `z-40`, grid `z-10`, `#00BAFE` year pills, and article containment. |
| `tests/PortfolioDetail.test.tsx` | Modified | Verified that `<ScrollProgressBar>` maintains `sticky` positioning and is not inside an `overflow-hidden` container. |
| `api/serverless.js` | Modified | Imported and mounted `/api/blog` and `/api/blogs`, added latched non-blocking skills migration. |
| `server/index.js` | Modified | Mounted `/api/blogs` compatibility alias alongside `/api/blog`. |
| `server/models/Blog.js` | Modified | Added `mongoose.models?.Blog` recompilation guard. |
| `server/models/*.js` | Modified | Added `mongoose.models?.ModelName` compilation safety guards across all Mongoose models. |
| `tests/setup.ts` | Modified | Guarded DOM-specific polyfills with `typeof document !== 'undefined'` for Node test compatibility. |
| `tests/serverlessBlog.test.ts` | Created | Automated integration tests for serverless blog routes, CORS preflight, and auth middleware. |
| `public/placeholder-tech.svg` | Created | Vector placeholder icon for draft auto-provisioned skills. |
| `server/models/Blog.js` | Created | Mongoose schema for blog posts with category enum, tags, slug, and pre-save hook. |
| `server/models/TechTool.js` | Modified | Added `isPublished: { type: Boolean, default: true }`. |
| `server/utils/skillMigration.js` | Created | Reusable, atomic portfolio skills migration module with case-insensitive bulkWrite. |
| `server/scripts/syncExistingPortfolioSkills.js` | Created | Standalone CLI script for migrating uncataloged skills across all existing portfolios. |
| `server/routes/blog.js` | Created | CRUD routes for blogs with dual ID/slug lookup, filter, sorting, and asset cleanup. |
| `server/routes/techTools.js` | Modified | Added `?published=true` filter and `POST /api/tech-tools/sync-from-portfolios`. |
| `server/routes/portfolio.js` | Modified | Imported `TechTool` and added atomic `syncUncatalogedSkills` ($setOnInsert). |
| `server/index.js` | Modified | Mounted `blogRoutes` and triggers non-blocking skill migration upon DB connection. |
| `src/services/api.ts` | Modified | Added `syncSkillsFromPortfolios`, `getTechTools(publishedOnly)`, and blog CRUD methods. |
| `src/cms/apiStorage.ts` | Modified | Added `syncSkillsFromPortfolios`, `BlogItem` interface, and blog methods. |
| `src/cms/components/WYSIWYGEditor.tsx` | Modified | Fixed TipTap attribute stripping, added white button styling, trailing paragraph, and modal scrolling. |
| `src/cms/components/CMSLayout.tsx` | Modified | Added "Blogs & News" navigation menu item. |
| `src/cms/pages/BlogManagement.tsx` | Created | Admin dashboard for blog posts with WYSIWYG editor and Cloudinary upload. |
| `src/cms/pages/TechToolsManagement.tsx` | Modified | Added "Sync Skills from Portfolios" button, draft badge, and `isPublished` toggle. |
| `src/cms/pages/PortfolioManagement.tsx` | Modified | Reloads tech tools after saving to sync auto-provisioned tool IDs. |
| `src/sections/skills/skills.tsx` | Modified | Queries published-only tools; implemented `duplicateToFill` with compound keys. |
| `src/sections/skills/logocard.tsx` | Modified | Added `onError` fallback on image tag. |
| `src/sections/portfolios/portfolio.tsx` | Modified | Redesigned two-row filter bar, real-time search, null-safe filtering, 0-match empty state, elevated stacking context (z-30), #00BAFE selected year pill, and CMS badge color synchronization for role tabs. |
| `src/sections/blog/blogcard.tsx` | Created | Public blog card component with canonical `/blogs/:id` detail links. |
| `src/sections/blog/blog.tsx` | Created | Dynamic category pills, homepage decoupling, search suppression, and CTA button. |
| `src/pages/BlogPage.tsx` | Created | Public blog archive page at `/blogs`. |
| `src/pages/BlogDetail.tsx` | Created | Public article reading view with canonical `/blogs` back navigation. |
| `src/pages/Home.tsx` | Modified | Embedded `<BlogSection limit={3} />` with automatic empty section suppression. |
| `src/sections/nav/nav.tsx` | Modified | Updated `isSubpage` to handle `/blogs` routes. |
| `src/App.css` | Modified | Added scoped white text and text-decoration override for portfolio embed buttons. |
| `src/App.tsx` | Modified | Registered canonical `/blogs` route with `/blog` redirect. |
| `tests/blog.test.tsx` | Created | Automated tests for category omission, homepage mode, "See More Blogs" CTA, and 404. |
| `tests/BlogManagement.test.tsx` | Created | Automated tests for CMS blog CRUD operations and image upload. |
| `tests/techToolAutoSync.test.tsx` | Created | Automated tests for skills migration, CMS sync button, and draft badge isolation. |
| `tests/App.test.tsx` | Modified | Verified `#blog` inclusion in hierarchy and omission when empty. |
| `tests/WYSIWYGEditor.test.tsx` | Modified | Verified portfolio embed modal filtering of draft items and round-trip HTML serialization. |
| `tests/portfolio.test.tsx` | Modified | Verified two-row filter bar, real-time search input, 0-match empty state, #00BAFE year pill, and role badge color styles. |
| `README.md` | Modified | Updated feature highlights and primary documentation cross-references. |
| `WARP.md` | Modified | Updated architecture, models, routes, database collections, and dev port 5001. |
| `PORTFOLIO_DOCUMENTATION.md` | Modified | Synchronized React 19/Vite tech stack, project tree, Blog module, two-row filter bar, and endpoints. |
| `DOCUMENTATION_MONO.md` | Modified | Synchronized mono-documentation schemas, collections, project structure, and API routes. |
| `CMS_STATUS.md` | Modified | Documented latest milestones, blog features, portfolio embed persistence, and filter color styling. |
| `tsconfig.json` | Modified | Added `"tests"` to `"include"`. |
| `src/components/CursorInverter/*` | Removed | Removed non-native cursor components. |


