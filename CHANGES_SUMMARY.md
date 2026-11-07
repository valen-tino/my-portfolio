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
9. [Files Created, Modified, or Removed](#9-files-created-modified-or-removed)

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
- **Current Test Status**: 18 tests passing across 5 test suites.
- **Production Build**: 0 errors, building in ~1.5–2.0s with Vite.

---

## 9. Files Created, Modified, or Removed

| File | Status | Description |
| :--- | :--- | :--- |
| `src/cms/components/WYSIWYGEditor.tsx` | Created | Complete TipTap WYSIWYG editor with section presets, media upload, and gallery controls. |
| `src/components/ImageLightboxModal.tsx` | Created | Full-screen image preview modal with gallery navigation. |
| `src/components/ScrollProgressBar.tsx` | Created | Sticky case study progress bar with active section tracking. |
| `src/utils/contentMigration.ts` | Created | Markdown-to-HTML converter and section heading standardizer. |
| `server/scripts/migrateMarkdownToWYSIWYG.js` | Created | Database migration script standardizing portfolio records. |
| `src/main.tsx` | Modified | Added `import './App.css'` to stylesheet pipeline. |
| `src/App.css` | Modified | Section title typography, responsive gallery breakpoints, and lightbox badges. |
| `src/pages/PortfolioDetail.tsx` | Modified | Mobile/desktop header alignment, sticky progress bar, action buttons layout. |
| `src/cms/pages/PortfolioManagement.tsx` | Modified | 40% / 60% split screen editor layout, `⌘S` shortcut. |
| `server/config/cloudinary.js` | Modified | Custom CloudinaryStorage engine, video file filters, stream error handling. |
| `server/routes/upload.js` | Modified | Wrapped upload middleware with descriptive JSON error handling. |
| `server/services/aiService.js` | Modified | Updated AI prompt schemas for standardized case study sections. |
| `tests/WYSIWYGEditor.test.tsx` | Created | Comprehensive tests for WYSIWYG editor, lists, and galleries. |
| `tests/PortfolioDetail.test.tsx` | Modified | Tests for video rendering, lightbox opening, and progress bar. |
| `tests/setup.ts` | Modified | Added `@testing-library/jest-dom/vitest`. |
| `tsconfig.json` | Modified | Added `"tests"` to `"include"`. |
| `src/components/CursorInverter/*` | Removed | Removed non-native cursor components. |

