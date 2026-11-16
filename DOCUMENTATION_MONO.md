# Portfolio & CMS Platform - Mono Documentation

> **Note**: This file is the unified mono-documentation combining all documentation files in this repository:
> - `README.md`
> - `PORTFOLIO_DOCUMENTATION.md`
> - `CMS_STATUS.md`
> - `WARP.md`
> - `VERCEL_DEPLOYMENT_CHECKLIST.md`
> - `VERCEL_TROUBLESHOOTING.md`

---

## 📑 Unified Table of Contents
1. [Part I: Project Overview & Readme](#part-i-project-overview--readme)
2. [Part II: Complete Platform Architecture & Documentation](#part-ii-complete-platform-architecture--documentation)
   - [Executive Summary](#executive-summary)
   - [System Architecture](#system-architecture)
   - [Technology Stack](#technology-stack)
   - [Project Structure](#project-structure)
   - [Features & Modules](#features--modules)
   - [Database Schema](#database-schema)
   - [API Documentation](#api-documentation)
   - [Authentication & Security](#authentication--security)
   - [Frontend Components](#frontend-components)
   - [CMS System](#cms-system)
   - [Deployment Guide](#deployment-guide)
   - [Environment Configuration](#environment-configuration)
   - [Development Guide](#development-guide)
   - [Testing](#testing)
   - [Troubleshooting & Maintenance](#troubleshooting--maintenance)
3. [Part III: CMS Status & AI Architecture Chain of Thought](#part-iii-cms-status--ai-architecture-chain-of-thought)
   - [Project Overview & Architecture Chain of Thought](#project-overview--architecture-chain-of-thought)
   - [AI Integration Implementation](#ai-integration-implementation)
   - [Configuration & Deployment Status](#configuration--deployment-status)
   - [Performance Optimizations & Timeout Configurations](#performance-optimizations--timeout-configurations)
   - [Testing & Quality Assurance](#testing--quality-assurance)
   - [Next Steps & Improvements](#next-steps--improvements)
4. [Part IV: Warp Developer Guidance](#part-iv-warp-developer-guidance)
   - [Development Commands](#development-commands)
   - [Important Development Patterns](#important-development-patterns)
   - [Common Development Tasks](#common-development-tasks)
   - [Special Features](#special-features)
   - [Key Files Reference](#key-files-reference)
5. [Part V: Vercel Deployment Checklist](#part-v-vercel-deployment-checklist)
   - [Pre-Deployment Setup](#pre-deployment-setup)
   - [Deployment Steps](#deployment-steps)
   - [Post-Deployment Verification](#post-deployment-verification)
   - [Custom Domain Setup](#custom-domain-setup)
   - [Security & Maintenance Checklist](#security--maintenance-checklist)
6. [Part VI: Vercel Troubleshooting Guide](#part-vi-vercel-troubleshooting-guide)
   - [NS_BINDING_ABORTED Errors Fix](#ns_binding_aborted-errors-fix)
   - [LayerBase (DocumentDB 1.0.0) Connection Checklist](#ns_binding_aborted-errors-fix)
   - [Vercel Environment Variables & Debug Steps](#vercel-environment-variables--debug-steps)
   - [Emergency Minimal Test Endpoint](#emergency-minimal-test-endpoint)

---

# Part I: Project Overview & Readme

### Original source: `README.md`

# portfolio-react
My Actual Portfolio (Updated)

Full-stack portfolio Content Management System with AI integration, React frontend, Express.js backend, and LayerBase (DocumentDB 1.0.0) database via Mongoose.

---

# Part II: Complete Platform Architecture & Documentation

### Original source: `PORTFOLIO_DOCUMENTATION.md`

## Executive Summary

### Product Overview
A full-stack portfolio website with an integrated Content Management System (CMS) that enables dynamic content management without code changes. The platform showcases professional achievements, projects, education, and experience while providing a secure admin interface for content updates.

### Key Features
- **Dynamic Portfolio Display**: Showcases projects, skills, education, and professional experience
- **Secure CMS**: Password-protected admin panel for content management
- **AI Integration**: AI-powered content generation for portfolio items
- **Responsive Design**: Mobile-first approach with DaisyUI/Tailwind CSS
- **Real-time Updates**: Changes in CMS reflect immediately on the public site
- **Image Management**: Cloudinary integration for optimized image storage
- **Contact System**: Built-in contact form with message management

### Target Users
- **Primary**: Portfolio owner (admin) managing their professional presence
- **Secondary**: Potential employers, clients, and collaborators viewing the portfolio

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Vercel Platform                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐        ┌──────────────────────┐   │
│  │   React App      │  API   │   Express Server     │   │
│  │   (Frontend)     │◄──────►│   (Serverless)       │   │
│  │                  │        │                      │   │
│  │  - Public Site   │        │  - RESTful API       │   │
│  │  - CMS Interface │        │  - Authentication    │   │
│  │  - Router        │        │  - Business Logic    │   │
│  └──────────────────┘        └──────────────────────┘   │
│                                      │                  │
└──────────────────────────────────────┼──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │      LayerBase (DocumentDB 1.0.0)   │
                    │         (Cloud Database)            │
                    │                                     │
                    │  Collections:                       │
                    │  - users                            │
                    │  - portfolios                       │
                    │  - blogs                            │
                    │  - experiences                      │
                    │  - education                        │
                    │  - techtools                        │
                    │  - roles                            │
                    │  - workprocesses                    │
                    │  - sociallinks                      │
                    │  - contacts                         │
                    │  - abouts                           │
                    └─────────────────────────────────────┘
                    
                    ┌─────────────────────────────────────┐
                    │        External Services            │
                    ├─────────────────────────────────────┤
                    │  - Cloudinary (Image Storage)       │
                    │  - AI Service (Content Generation)  │
                    └─────────────────────────────────────┘
```

### Request Flow
1. User accesses the application via browser
2. React Router handles client-side routing
3. API calls are made to `/api/*` endpoints
4. Vercel serverless functions process requests
5. LayerBase (DocumentDB 1.0.0) stores/retrieves data
6. Response sent back through the stack

---

## Technology Stack

### Frontend
- **React 19.1.1**: Component-based UI framework
- **TypeScript 5.9.2**: Type-safe development
- **React Router v7**: Client-side routing (`react-router-dom`)
- **DaisyUI 5.1.7**: Component library built on Tailwind CSS (explicitly configured with `themes: ['light --default']` and `color-scheme: light`)
- **Tailwind CSS 3.4.4**: Utility-first CSS framework (`tailwind.config.cjs` editorial palette tokens + `Plus Jakarta Sans`)
- **GSAP 3.15.1**: Reduced-motion-safe entrance and ScrollTrigger animations (`src/utils/gsapAnimations.ts`)
- **Marked 18.1.3 & TipTap 3.33.0**: Markdown-to-HTML migration and rich WYSIWYG case study editing
- **Popover / Interest Polyfills**: Conditional async loading (`@oddbird/popover-polyfill`, `interestfor`) for accessible carousel toggletips
- **Axios 1.11.0**: HTTP client for API communication
- **Vite 7.1.4 & Vitest 5.1.0**: Frontend bundler (port `5173`) and automated test runner

### Backend
- **Node.js 22.19.0+**: JavaScript runtime
- **Express.js 5.1.0**: Web application framework (port `5001`)
- **LayerBase (DocumentDB 1.0.0) / Mongoose 8.18.0**: MongoDB-compatible cloud database and ODM (migrated from MongoDB Atlas)
- **JWT (jsonwebtoken 9.0.2)**: JSON Web Tokens for authentication
- **Bcrypt (bcryptjs 3.0.2)**: Password hashing
- **Multer 2.0.2 & Custom Cloudinary Storage Engine**: File upload handling
- **Cloudinary 2.11.0**: Cloud-based image and web-optimized video management

### AI Integration
- **OpenAI SDK / Deepseek API (`deepseek-v4.1-flash` via Opencode Go)**: Server-side AI content generation and rewriting

---

## Project Structure

```
my-portfolio/
├── index.html                    # Entry HTML loading Plus Jakarta Sans
├── public/                       # Static assets
│   ├── Valen-Jehaut.pdf          # Default fallback résumé PDF
│   ├── images/                   # Portfolio images & logos
│   ├── favicon.ico               # Site icon
│   ├── placeholder-tech.svg      # Vector placeholder for draft tech tools
│   └── tinologo.svg              # Logo asset
│
├── src/                          # React application source
│   ├── App.tsx                   # Main router, public FloatingNavigation/CVModal shell & /cms/* routes
│   ├── main.tsx                  # Application entry point
│   ├── index.css                 # Tailwind base/components, View Transitions, dock, tables & tab styles
│   ├── App.css                   # Public markdown/WYSIWYG light code styling, gallery & containment rules
│   │
│   ├── pages/                    # Page components
│   │   ├── Home.tsx              # Editorial homepage (HeroProjectStrip, Work, Process, Exp/Edu Tabs, Journal, Contact)
│   │   ├── PortfolioPage.tsx     # Work archive with Grid/Table view toggle & inline/mobile filters
│   │   ├── PortfolioDetail.tsx   # Split-screen case study detail (sticky left column & light code formatting)
│   │   ├── BlogPage.tsx          # Public journal archive (/blogs)
│   │   ├── BlogDetail.tsx        # Single journal article view (/blogs/:id)
│   │   └── DesignSystemPage.tsx  # Unlisted design-system reference (/design-system) with curated inspirations
│   │
│   ├── components/               # Consolidated UI components (legacy src/sections/ & src/hook/ removed)
│   │   ├── FloatingNavigation.tsx       # Bottom dock pill nav, mobile More drawer & brand-blue Résumé CTA
│   │   ├── HeroProjectStrip.tsx         # All-project 16:9 swipeable marquee, toggletip & Play/Pause button
│   │   ├── ProjectCard.tsx / BlogCard.tsx # Editorial cards with hover/focus CTA reveal & 16:9 project media
│   │   ├── ExperienceEducationSection.tsx # WAI-ARIA Experiences/Education tab switcher with hidden="until-found"
│   │   ├── WorkProcessSection.tsx       # Single-row 6-step ARIA tablist process showcase (CMS-backed with fallback)
│   │   ├── EditorialCarousel.tsx        # Scroll-snap carousel with inert off-screen slides & arrow buttons
│   │   ├── PortfolioFilterControls.tsx  # Shared Role, Year, Tech & keyword search filter controls
│   │   ├── PortfolioTable.tsx           # Left-aligned desktop table & minimal 2-column mobile index table
│   │   ├── MobileFilterDialog.tsx       # Native <dialog closedby="any"> mobile filter popup
│   │   ├── CVModal.tsx                  # Native <dialog closedby="any"> interactive résumé (latest end date first)
│   │   ├── LoadingScreen.tsx            # Brand-blue full-screen overlay with /favicon.ico & ease-in-out fade
│   │   ├── Footer.tsx                   # Vibrant CTA banner, Bali WITA clock, sitemap & social pills
│   │   ├── Icons.tsx / ImagePlaceholder.tsx / ScrollProgressBar.tsx / ImageLightboxModal.tsx / PasswordProtectionModal.tsx
│   │
│   ├── cms/                      # Complete CMS system (locked bright light-mode styling)
│   │   ├── components/           # CMS-specific components (CMSLayout, CMSStatusBanner, WYSIWYGEditor, ProtectedRoute, AIPortfolioModal)
│   │   ├── pages/                # CMS pages (Dashboard, Portfolios, Blogs, Experiences, WorkProcess, SocialLinks, Education, TechTools, Roles, Contacts, About, AITest)
│   │   ├── utils/                # errorUtils.ts (parseCMSError, formatCMSErrorText, stripHtmlContent)
│   │   ├── apiStorage.ts         # Client-side API storage helper
│   │   ├── auth.ts               # Authentication utilities
│   │   └── education.ts          # Fallback education seed
│   │
│   ├── data/portfolioData.ts     # Unified fallback datasets & live CMS adapter functions
│   ├── types/                    # portfolio.ts interfaces & polyfills.d.ts ambient declarations
│   ├── others/greeting.tsx       # Time-of-day dynamic greeting helper (getGreetingText)
│   ├── services/                 # api.ts (Axios REST client) & ai.ts (server-proxied AI client)
│   └── utils/                    # contentMigration.ts, dateFormat.ts, gsapAnimations.ts, tooltipPolyfills.ts, viewTransitions.ts, aiHelpers.ts
│
├── server/                       # Express backend
│   ├── config/                   # Configuration (Cloudinary, Database)
│   ├── data/                     # Default seed datasets (defaultWorkProcessSteps.js, defaultSocialLinks.js)
│   ├── middleware/               # Auth middlewares
│   ├── models/                   # Mongoose schemas (Portfolio, Blog, Experience, WorkProcess, SocialLink, Education, TechTool, Role, Contact, About, User)
│   ├── routes/                   # Express route handlers (about, ai, auth, blog, contact, education, experiences, portfolio, roles, socialLinks, techTools, upload, workProcess)
│   ├── utils/                    # Utility modules (errorHandler.js, skillMigration.js)
│   ├── scripts/                  # Seed & maintenance scripts (initDatabase.js, migrateMarkdownToWYSIWYG.js, syncExistingPortfolioSkills.js)
│   ├── services/                 # Server services (aiService.js)
│   └── index.js                  # Server entry point (port 5001)
│
├── api/                          # Vercel serverless integration
│   ├── [...path].js              # Catch-all serverless handler
│   └── serverless.js             # Express app serverless wrapper
│
├── tests/                        # Automated Vitest suite (27 test files, 128 tests)
├── tailwind.config.cjs           # Tailwind & DaisyUI theme tokens
├── vercel.json                   # Vercel deployment configuration
└── package.json                  # Project dependencies & scripts
```

---

## Database Schema

### Users Collection
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Portfolio Collection
```javascript
{
  title: { type: String, required: true },
  desc: { type: String, required: true },
  projectDetails: { type: String, default: '' },
  linkTo: { type: String, default: '' },
  imageURL: { type: String, default: '' },
  imageCloudinaryId: { type: String, default: null },
  videoURL: { type: String, default: null },
  videoCloudinaryId: { type: String, default: null },
  tech: [{ type: String }],
  roles: [{ type: String }],
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isPasswordProtected: { type: Boolean, default: false },
  password: { type: String, default: null },
  isPinned: { type: Boolean, default: false },
  year: { type: String, default: null },
  relatedExperience: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', default: null },
  relatedExperienceCompany: { type: String, default: null },
  relatedEducation: { type: mongoose.Schema.Types.ObjectId, ref: 'Education', default: null },
  relatedEducationInstitution: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Blogs Collection
```javascript
{
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['All', 'Event', 'News', 'Personal', 'Engineering', 'Update'], default: 'Personal' },
  tags: [{ type: String }],
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: null },
  attachedPortfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', default: null },
  isPublished: { type: Boolean, default: true },
  readingTime: { type: Number, default: 3 },
  publishedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Experiences Collection
```javascript
{
  title: { type: String, required: true },
  status: { type: String, enum: ['Current', 'Past', 'Contract', 'Internship', 'Freelance', 'Volunteer'], required: true },
  companyName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true },
  logoURL: { type: String, required: true },
  logoCloudinaryId: { type: String },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Education Collection
```javascript
{
  title: { type: String, required: true },
  institution: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true },
  link: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Tech Tools Collection
```javascript
{
  title: { type: String, required: true },
  imageURL: { type: String, required: true },
  imageCloudinaryId: { type: String },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Roles Collection
```javascript
{
  title: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: 'info' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}
```

### Contacts Collection
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isReplied: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

### Work Process Collection
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Social Links Collection
```javascript
{
  label: { type: String, required: true },
  href: { type: String, required: true },
  external: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### About Collection
```javascript
{
  description: { type: String, required: true },
  imageURL: { type: String, required: true },
  imageCloudinaryId: { type: String },
  cvURL: { type: String, default: '/Valen-Jehaut.pdf' },
  cvCloudinaryId: { type: String, default: null },
  name: { type: String },
  fullName: { type: String },
  location: { type: String },
  email: { type: String },
  heroHeadline: { type: String },
  heroSubheadline: { type: String },
  workProcessSubtitle: { type: String },
  yearsExperience: { type: String },
  yearsExperienceLabel: { type: String },
  selectedProjectsLabel: { type: String },
  degreesCount: { type: String },
  degreesLabel: { type: String },
  resumeSummary: { type: String },
  contactHeading: { type: String },
  contactSubtext: { type: String },
  footerCtaHeading: { type: String },
  footerBio: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## API Documentation

### Base Endpoints
- **GET `/api/health`**: Health check endpoint returning API status and uptime

### Authentication Endpoints
- **POST `/api/auth/login`**: Authenticate admin with email and password, returns JWT token
- **GET `/api/auth/me`**: Get current user profile (requires auth header)
- **POST `/api/auth/logout`**: Invalidate session client-side

### Content Management Endpoints
- **About**: `GET /api/about`, `PUT /api/about`
- **Blogs**: `GET /api/blogs` (supports `?category=...&search=...&published=true`), `POST /api/blogs`, `GET /api/blogs/:id`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`
- **Work Process**: `GET /api/work-process` (supports `?published=true`), `GET /api/work-process/:id`, `POST /api/work-process`, `POST /api/work-process/seed`, `PUT /api/work-process/:id`, `DELETE /api/work-process/:id`
- **Social Links**: `GET /api/social-links` (supports `?published=true`), `GET /api/social-links/:id`, `POST /api/social-links`, `POST /api/social-links/seed`, `PUT /api/social-links/:id`, `DELETE /api/social-links/:id`
- **Tech Tools**: `GET /api/tech-tools` (supports `?published=true`), `POST /api/tech-tools`, `POST /api/tech-tools/sync-from-portfolios` (auto-sync), `PUT /api/tech-tools/:id`, `DELETE /api/tech-tools/:id`
- **Roles**: `GET /api/roles`, `POST /api/roles`, `PUT /api/roles/:id`, `DELETE /api/roles/:id`
- **Education**: `GET /api/education`, `POST /api/education`, `PUT /api/education/:id`, `DELETE /api/education/:id`
- **Portfolios**: `GET /api/portfolio` (supports `?published=true`), `POST /api/portfolio`, `PUT /api/portfolio/:id`, `DELETE /api/portfolio/:id`
- **Experiences**: `GET /api/experiences`, `POST /api/experiences`, `PUT /api/experiences/:id`, `DELETE /api/experiences/:id`
- **Contacts**: `GET /api/contact`, `POST /api/contact`, `DELETE /api/contact/:id`

### File Upload Endpoints (Cloudinary)
- **GET `/api/upload/signature`**: Generate signed parameters for direct client-side Cloudinary uploads
- **POST `/api/upload/profile`**: Upload About portrait image (10MB Multer limit with JSON error responses)
- **POST `/api/upload/portfolio`**: Upload portfolio hero image
- **POST `/api/upload/portfolio-video`**: Upload portfolio hero video
- **POST `/api/upload/editor-media`**: Upload TipTap WYSIWYG single image/video
- **POST `/api/upload/editor-gallery`**: Upload TipTap WYSIWYG multi-item gallery media
- **POST `/api/upload/tech-tool`**: Upload tech tool logo/icon
- **POST `/api/upload/experience`**: Upload company logo
- **DELETE `/api/upload/:cloudinaryId`**: Delete uploaded asset from Cloudinary

### AI Endpoints
- **POST `/api/ai/rewrite-project-details`**: Rewrite project markdown content
- **POST `/api/ai/create-portfolio-from-text`**: Extract structured portfolio from raw text
- **GET `/api/ai/test-connection`**: Check AI provider connectivity
- **GET `/api/ai/status`**: Verify AI service configuration status

---

# Part III: CMS Status & AI Architecture Chain of Thought

### Original source: `CMS_STATUS.md`

## Project Overview & Architecture Chain of Thought
A full-stack portfolio Content Management System with AI integration.

### AI Architecture Chain of Thought
1. **Problem**: Portfolio owners need help crafting well-structured, engaging technical project documentation.
2. **Solution**: AI-powered content generation using LLM models.
3. **Security Architecture**:
```
Browser ──► API Service ──► Server Routes ──► AI Service ──► AI Provider API
         (No API Key)      (Authenticated)   (Secure)      (Server-side)
```

### Performance & Timeout Configurations
- **General API calls**: 2 minutes (120s)
- **AI Rewriting**: 2 minutes (120s)
- **AI Portfolio Generation**: 3.5 minutes (200s)
- **Connection Tests**: 1 minute (60s)

### Smart Tech Separation
AI-suggested technologies are automatically matched:
- **Matched**: Technologies matching existing `TechTool` entries are selected automatically.
- **Unmatched**: Technologies not in the system are collected into custom tags.

---

# Part IV: Warp Developer Guidance

### Original source: `WARP.md`

## Development Commands

```bash
# Start both frontend and backend concurrently
npm run dev

# Start frontend Vite dev server (port 5173)
npm run client

# Start backend Express server with nodemon (port 5001)
npm run server

# Run test suite with Vitest
npm test

# Build production bundle (TypeScript check + Vite)
npm run build

# Preview production build locally
npm run preview

# Seed database with initial records
npm run init-db

# Migrate legacy markdown records to standardized semantic HTML
npm run migrate-markdown
```

## Important Development Patterns

### API Client Pattern & Database Connectivity
Centralized through `src/cms/apiStorage.ts` and `src/services/api.ts`:
- `resolveApiBaseUrl()` resolves relative `'/api'` by default (routed via Vite's `/api` proxy in `vite.config.ts` during local/LAN development and Vercel rewrites in production), ignoring `VITE_APP_ENV=development`, placeholder domains, and `localhost` URLs on non-localhost hosts
- `connectToDatabase()` in `api/serverless.js` and `server/index.js` caches in-flight `cachedPromise` handshakes across concurrent cold-start requests, allows `*.vercel.app` and private LAN origins in CORS, and reports live MongoDB `readyState` via `GET /api/health`
- Automatic injection of JWT token (`Authorization: Bearer <token>`)
- Centralized error and authentication expiration handling

### File Upload Pattern (Images & Videos)
All media uploads go through Cloudinary via custom Multer storage engine:
- Server returns `{ imageURL, imageCloudinaryId }` or `{ videoURL, videoCloudinaryId }`
- Always store both fields in database to enable cleanup when replacing or deleting items
- Video files are stream-validated via Multer fileFilter and delivered with web-optimization flags (`q_auto,f_auto,w_1920,c_limit`)

### TipTap WYSIWYG Editor & Case Study Structure
- `src/cms/components/WYSIWYGEditor.tsx` powers project editing with single media, multi-media gallery, interactive portfolio embed nodes, and IME composition `Enter` guards (`isComposing` / `keyCode === 229`)
- Case studies are organized around 5 standard chapters:
  1. `1. Project Background & Context`
  2. `2. Development Process`
  3. `3. Implementation Details`
  4. `4. Team Structure & Roles`
  5. `5. Outcomes & Impact`
- Public case study views feature sticky left metadata (`lg:sticky`), explicit light `.portfolio-markdown` / `.wysiwyg-content` `<code>` and `<pre>` styling isolating DaisyUI dark-mode prose defaults, full-screen `<dialog>` `ImageLightboxModal`, and sticky `ScrollProgressBar`

### Editorial Redesign, Native Web Patterns & Testing
- **Pill Navigation & Native Dialogs**: Bottom dock navigation (`FloatingNavigation`) with a brand-blue `.dock-item-primary` `Résumé` CTA (`#2563eb`, white text & icon), plus native `<dialog closedby="any">` modals (`CVModal`, `MobileFilterDialog`, `PasswordProtectionModal`, `ImageLightboxModal`) without `body` scroll locking
- **View Transitions & GSAP**: `@view-transition { navigation: auto; }` combined with `navigateWithTransition` (`src/utils/viewTransitions.ts`) and reduced-motion-safe GSAP `ScrollTrigger` reveals (`src/utils/gsapAnimations.ts`)
- **All-Project Hero Carousel & `16:9` Portfolio Media**: `HeroProjectStrip` displays all published portfolios (`aspect-video` non-clickable previews, swipe/drag/arrow navigation, accessible `popover="hint"` toggletip via `tooltipPolyfills.ts`, Play/Pause icon button); `ProjectCard`, `PortfolioTable`, `PortfolioDetail`, and `ImagePlaceholder` share unified `16:9` proportions and hover/focus CTA reveal (`.card-hover-cta`)
- **Accessible Tabs & Date Ordering**: `ExperienceEducationSection` separates Experiences and Education with WAI-ARIA tabs and `hidden="until-found"` (`beforematch`); `dateFormat.ts` handles timezone-safe ISO date display (`Oct 2025` / `Oct 1, 2025`) and descending `sortByLatestEndDate` sorting mirrored in `GET /api/education`
- **Work Page Grid/Table Views & Mobile Filters**: `PortfolioPage` pairs inline Role/Year/Tech filters (converting to `MobileFilterDialog` on small viewports) with a Grid / `?view=table` Table toggle (`PortfolioTable`, left-aligned on desktop/tablet and minimal two-column index rows on mobile)
- **6-Step Spec-Driven Work Process & CMS CRUD**: `WorkProcessSection` combines 5 Design Thinking stages with **Development** right after **Prototype** (`Empathize` → `Define` → `Ideate` → `Prototype` → `Development` → `Test`) via plain-paragraph steps powered dynamically by `/api/work-process` and top-level CMS CRUD (`/cms/work-process`)
- **CMS Light Theme Lock & Staged Portrait Upload**: `tailwind.config.cjs` (`themes: ['light --default']`), `index.html`, `src/index.css`, and explicit Tailwind surfaces keep CMS contrast clean under OS dark mode; `AboutManagement` pairs direct Cloudinary / 10MB `/api/upload/profile` fallback with full-box drag-and-drop and staged previews until `Save Changes`
- **Full Frontend CMS Connectivity, Social Links CRUD & Brand-Blue Loading Screen**: `/api/social-links` + `/cms/social-links` (nested under `About Me ▾`), 17 extended `About` copy/identity fields, Experience company logo rendering (`exp.logoURL`), custom role ordering (`CMSStorage.getRoles()`), full education rendering in `CVModal`, 9-collection `Dashboard` stats, independent `Footer` CMS hydration, and `<LoadingScreen />` (`bg-brand` + centered `/favicon.ico` + `ease-in-out` fade that unmounts after transition completion alongside `<meta name="theme-color" content="#f8f8fa" />` in `index.html` to keep iOS Safari top/bottom bars light) integrated in `App.tsx`, `PortfolioDetail.tsx`, and `BlogDetail.tsx`
- **LayerBase (DocumentDB 1.0.0) & CMS-Wide Error States**: Production database migrated from MongoDB Atlas to **LayerBase (using DocumentDB 1.0.0)** via `MONGODB_URI`; `server/models/Experience.js` expanded (`title`/`companyName` `200`, `duration` `100`, `description` `20000` chars) for rich TipTap HTML payloads; unified backend `handleRouteError` (`server/utils/errorHandler.js`) returns structured HTTP `400` `{ success: false, message, errors, fieldErrors }` responses across all 10 CMS routes; frontend `parseCMSError` (`src/cms/utils/errorUtils.ts`), `CMSStatusBanner`, and `CMSFieldError` (`src/cms/components/CMSStatusBanner.tsx`) power consistent error banners and field-level validation across all 10 CRUD modules, `Dashboard.tsx` (`Retry` banner on partial/total failures), `Login.tsx`, and `auth.ts` (`AuthService.loginWithDetails`)
- **Automated Test Verification**: `npm test -- --run` runs **27 test suites (128 tests)** cleanly under Vitest + JSDOM, and `npm run build` validates TypeScript and Vite production bundling (`5173` frontend / `5001` backend)

> For full changelog history across every iteration, see [CHANGES_SUMMARY.md](file:///Users/valentinojehaut/Documents/GitHub/my-portfolio/CHANGES_SUMMARY.md).

---

# Part V: Vercel Deployment Checklist

### Original source: `VERCEL_DEPLOYMENT_CHECKLIST.md`

## Pre-Deployment Setup
1. **GitHub Repository**:
   - Push latest changes
   - Verify `.gitignore` includes `.env`, `node_modules/`, `dist/`, `build/`
2. **Environment Variables Required on Vercel**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `OPENAI_API_KEY` / `DEEPSEEK_API_KEY`
   - `NODE_ENV=production`

## Deployment Steps
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework preset: Vite (or Other)
   - Build command: `npm run build`
   - Output directory: `dist`
3. Enter all environment variables in Vercel Settings
4. Trigger production deployment and verify with health check `/api/health`

---

# Part VI: Vercel Troubleshooting Guide

### Original source: `VERCEL_TROUBLESHOOTING.md`

## NS_BINDING_ABORTED Errors Fix
If API requests abort or fail with `NS_BINDING_ABORTED`:
1. **LayerBase (DocumentDB 1.0.0) Network Access**: Ensure LayerBase allows connections from your deployment / serverless egress IPs (`0.0.0.0/0` where required for Vercel).
2. **Database Name & Connection Options in URI**: Ensure `MONGODB_URI` points to your LayerBase DocumentDB 1.0.0 cluster and specifies the target database (e.g. `portfolio_cms`).
3. **Vercel Environment Variables**: Ensure environment variables are assigned to Production and Redeploy.
4. **Vercel Function Logs**: Run `vercel logs --follow` to inspect function runtime errors.
5. **Emergency Minimal Test Endpoint**: Use `api/test.js` or `GET /api/health` to isolate connection issues between Vercel and LayerBase (DocumentDB 1.0.0).

---

*Mono-Documentation consolidated and updated on November 16, 2026.*

