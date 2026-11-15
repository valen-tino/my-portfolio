# Portfolio & CMS Platform - Complete Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Features & Modules](#features--modules)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Authentication & Security](#authentication--security)
9. [Frontend Components](#frontend-components)
10. [CMS System](#cms-system)
11. [Deployment Guide](#deployment-guide)
12. [Environment Configuration](#environment-configuration)
13. [Development Guide](#development-guide)
14. [Testing](#testing)
15. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### Product Overview
A full-stack portfolio website with an integrated Content Management System (CMS) that enables dynamic content management without code changes. The platform showcases professional achievements, projects, education, and experience while providing a secure admin interface for content updates.

### Key Features
- **Dynamic Portfolio Display**: Showcases projects, skills, education, and professional experience
- **Secure CMS**: Password-protected admin panel for content management
- **AI Integration**: OpenAI-powered content generation for portfolio items
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
│                     Vercel Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐        ┌──────────────────────┐  │
│  │   React App      │  API   │   Express Server     │  │
│  │   (Frontend)     │◄──────►│   (Serverless)       │  │
│  │                  │        │                      │  │
│  │  - Public Site   │        │  - RESTful API       │  │
│  │  - CMS Interface │        │  - Authentication    │  │
│  │  - Router        │        │  - Business Logic    │  │
│  └──────────────────┘        └──────────────────────┘  │
│                                      │                  │
└──────────────────────────────────────┼──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │         MongoDB Atlas               │
                    │      (Cloud Database)               │
                    │                                      │
                    │  Collections:                       │
                    │  - users                            │
                    │  - portfolios                       │
                    │  - blogs                            │
                    │  - experiences                      │
                    │  - workprocesses                    │
                    │  - sociallinks                      │
                    │  - education                        │
                    │  - techtools                        │
                    │  - roles                            │
                    │  - contacts                         │
                    │  - abouts                           │
                    └──────────────────────────────────────┘
                    
                    ┌──────────────────────────────────────┐
                    │        External Services             │
                    ├──────────────────────────────────────┤
                    │  - Cloudinary (Image Storage)        │
                    │  - OpenAI API (Content Generation)   │
                    └──────────────────────────────────────┘
```

### Request Flow
1. User accesses the application via browser
2. React Router handles client-side routing
3. API calls are made to `/api/*` endpoints
4. Vercel serverless functions process requests
5. MongoDB Atlas stores/retrieves data
6. Response sent back through the stack

---

## Technology Stack

### Frontend
- **React 19.1.1**: Component-based UI framework
- **TypeScript 5.9.2**: Type-safe development
- **Vite 7.1.4**: Next-generation frontend tooling and bundler (dev server port `5173`)
- **React Router v7**: Client-side routing (`react-router-dom`)
- **DaisyUI 5.1.7**: Component library built on Tailwind CSS (`themes: ['light --default']` + `color-scheme: light`)
- **Tailwind CSS 3.4.4**: Utility-first CSS framework (`tailwind.config.cjs` editorial palette tokens + `Plus Jakarta Sans`)
- **GSAP 3.15.1**: Reduced-motion-aware entrance and ScrollTrigger animations (`src/utils/gsapAnimations.ts`)
- **TipTap / ProseMirror**: Rich WYSIWYG editor with custom node views
- **Marked 18.1.3**: Markdown-to-HTML migration and public description formatting
- **Popover / Interest Polyfills**: Conditional async loading (`@oddbird/popover-polyfill`, `interestfor`) for accessible tooltip hints
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 5.1.0**: Web application framework (dev server port `5001`)
- **MongoDB/Mongoose 8.18.0**: NoSQL database and ODM
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Multer**: File upload handling
- **Cloudinary**: Cloud-based image and web-optimized video management

### Development Tools
- **Vite**: Rapid HMR and production build bundling
- **Vitest 5.1.0 & Testing Library**: Unit and integration test suite (`tests/`)
- **Nodemon**: Development server auto-restart
- **Concurrently**: Run multiple scripts

### Deployment
- **Vercel**: Hosting platform with serverless functions
- **MongoDB Atlas**: Cloud database hosting
- **GitHub**: Version control and CI/CD integration

---

## Project Structure

```
my-portfolio/
├── index.html                  # HTML entry point (Plus Jakarta Sans font + light theme-color #f8f8fa)
├── public/                     # Static assets
│   ├── Valen-Jehaut.pdf       # Default résumé PDF fallback
│   ├── favicon.ico            # Site icon
│   ├── placeholder-tech.svg   # Draft tech-tool vector placeholder
│   ├── tinologo.svg           # Brand mark
│   └── images/                # Static portfolio images & assets
│
├── src/                        # React application source
│   ├── App.tsx                # Router, public shell (FloatingNavigation + CVModal) & CMS routes
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Tailwind layer base/components, View Transitions, dock, tables & tabs
│   ├── App.css                # Editorial WYSIWYG/markdown code, gallery & layout containment styles
│   │
│   ├── pages/                 # Page components
│   │   ├── Home.tsx           # Editorial landing page with HeroProjectStrip, Work, Process, Exp/Edu Tabs, Journal & Contact
│   │   ├── PortfolioPage.tsx  # Work archive with Grid/Table toggle & inline/mobile filters
│   │   ├── PortfolioDetail.tsx # Split-screen case study detail (sticky left column & light code styling)
│   │   ├── BlogPage.tsx       # Public journal archive (/blogs)
│   │   ├── BlogDetail.tsx     # Single journal article view (/blogs/:id)
│   │   └── DesignSystemPage.tsx # Unlisted design system reference (/design-system) with curated inspirations
│   │
│   ├── components/            # Consolidated public & shared UI components
│   │   ├── FloatingNavigation.tsx      # Bottom pill dock nav, mobile More drawer & brand blue Résumé CTA
│   │   ├── HeroProjectStrip.tsx        # All-project 16:9 swipeable marquee, toggletip & Play/Pause button
│   │   ├── ProjectCard.tsx             # 16:9 portfolio card with hover/focus CTA & lock gate
│   │   ├── BlogCard.tsx                # Journal article card with hover/focus CTA & ISO-formatted dates
│   │   ├── ExperienceEducationSection.tsx # Accessible WAI-ARIA Experiences / Education tab switcher
│   │   ├── WorkProcessSection.tsx      # Single-row 6-step ARIA tablist work-process section (CMS-backed)
│   │   ├── EditorialCarousel.tsx       # Scroll-snap editorial carousel with keyboard & ARIA controls
│   │   ├── PortfolioFilterControls.tsx # Shared Role, Year, Tech & search filter controls
│   │   ├── PortfolioTable.tsx          # Left-aligned desktop table & minimal 2-column mobile index table
│   │   ├── MobileFilterDialog.tsx      # Native <dialog closedby="any"> mobile filter popup
│   │   ├── CVModal.tsx                 # Native <dialog closedby="any"> interactive résumé preview (latest end date first)
│   │   ├── LoadingScreen.tsx           # Brand-blue full-screen overlay with centered /favicon.ico (unmounts after fade-out)
│   │   ├── Footer.tsx                  # Vibrant CTA banner footer, Bali WITA clock, sitemap & social links
│   │   ├── Icons.tsx                   # Inline SVG icon system (aria-hidden by default)
│   │   ├── ImagePlaceholder.tsx        # 16:9 editorial visual placeholder fallback
│   │   ├── ScrollProgressBar.tsx       # Case study reading progress bar
│   │   ├── ImageLightboxModal.tsx      # Native <dialog> gallery image viewer
│   │   └── PasswordProtectionModal.tsx # Native <dialog> case study password modal
│   │
│   ├── data/                  # Unified static fallbacks & live CMS mappers
│   │   └── portfolioData.ts   # FALLBACK data, SOCIAL_LINKS & CMS adapter functions
│   │
│   ├── types/                 # Shared TypeScript interfaces & ambient polyfill types
│   │   ├── portfolio.ts
│   │   └── polyfills.d.ts
│   │
│   ├── utils/                 # Shared frontend helpers
│   │   ├── contentMigration.ts # Markdown-to-HTML case study migration & formatPublicDescription
│   │   ├── dateFormat.ts       # Timezone-safe ISO date formatting & sortByLatestEndDate
│   │   ├── gsapAnimations.ts   # Reduced-motion-safe GSAP + ScrollTrigger hooks
│   │   ├── tooltipPolyfills.ts # Conditional @oddbird/popover-polyfill & interestfor loader
│   │   ├── viewTransitions.ts  # document.startViewTransition wrapper with focus restoration
│   │   └── aiHelpers.ts        # AI prompt/response helpers
│   │
│   ├── others/                # Miscellaneous helpers
│   │   └── greeting.tsx       # Time-of-day dynamic greeting helper (getGreetingText)
│   │
│   ├── cms/                   # CMS System (locked bright light-mode styling)
│   │   ├── pages/             # CMS admin pages (Login, Dashboard, Portfolio, Blog, Experience, WorkProcess, Education, TechTools, Roles, SocialLinks, Contacts, About, AITest)
│   │   ├── components/        # CMSLayout, WYSIWYGEditor, ProtectedRoute, AIPortfolioModal
│   │   ├── apiStorage.ts      # API integration layer
│   │   ├── auth.ts            # Authentication utilities
│   │   └── education.ts       # Static fallback education entries
│   │
│   └── services/              # API clients
│       ├── api.ts             # Axios REST API client
│       └── ai.ts              # Frontend AI endpoint client
│
├── server/                    # Express backend (port 5001)
│   ├── index.js               # Server entry point
│   ├── data/                  # Default seed datasets (defaultWorkProcessSteps.js, defaultSocialLinks.js)
│   ├── models/                # Mongoose schemas (User, Portfolio, Blog, Experience, WorkProcess, SocialLink, Education, TechTool, Role, Contact, About)
│   ├── routes/                # API routes (auth, about, portfolio, blog, experiences, workProcess, socialLinks, education, techTools, roles, contact, upload, ai)
│   ├── utils/                 # skillMigration.js
│   ├── scripts/               # initDatabase.js, migrateMarkdownToWYSIWYG.js, syncExistingPortfolioSkills.js
│   ├── services/              # aiService.js
│   ├── middleware/            # auth.js
│   └── config/                # database.js, cloudinary.js
│
├── api/                       # Vercel serverless functions
│   ├── serverless.js          # Express serverless wrapper
│   ├── [...path].js           # Catch-all Vercel route handler
│   ├── index.js / test.js / diag.js / diag2.js
│
├── tests/                     # Automated Vitest test suites (26 files, 122 tests)
├── .gitignore
├── package.json
├── tailwind.config.cjs
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## Features & Modules

### 1. Public Portfolio Website

#### Navigation, Loading Screen, Transitions & Résumé Modal
- **Brand-Blue Loading Screen (`LoadingScreen`)**: Full-screen overlay using the brand blue background (`bg-brand` / `#2563eb`), centered `/favicon.ico`, and smooth `ease-in-out` opacity transition (`transition-opacity duration-500 ease-in-out motion-reduce:duration-150`, toggling `opacity-100` to `opacity-0 pointer-events-none`) that unmounts from the DOM once fade-out completes (`onTransitionEnd` + `550ms` fallback), working together with `<meta name="theme-color" content="#f8f8fa" />` (`index.html`) so iPhone (iOS Safari) top and bottom browser bars stay light (`#f8f8fa`). Integrated in `App.tsx`, `PortfolioDetail.tsx`, and `BlogDetail.tsx`.
- **Floating Pill Navigation (`FloatingNavigation`)**: Persistent bottom dock (`Home`, `Selected Work`, `Work`, `Journal`, `About`, `Contact`, mobile `More` drawer, and primary brand-blue `.dock-item-primary` `Résumé` action button with white text & `DownloadIcon`).
- **Native View Transitions (`viewTransitions.ts`)**: Combines `@view-transition { navigation: auto; }` CSS keyframes with `document.startViewTransition()` on route changes and focus handoff to destination `<h1>`/`<main>`.
- **Interactive Résumé Dialog (`CVModal`)**: Native `<dialog closedby="any">` summarizing CMS `name`, `location`, `email`, `resumeSummary`, experience, and the full `educationList` sorted latest-end-date-first (`sortByLatestEndDate`) plus direct PDF download (`aboutData.cvURL`).

#### Hero Section & All-Project Preview Strip
- Dynamic time-of-day greeting (`getGreetingText`: `Good Morning` / `Good Afternoon` / `Good Evening`) paired with Plus Jakarta Sans display typography, CMS-driven Hero copy (`heroHeadline`, `heroSubheadline` from `About`), and configurable email/location links.
- **All-Project Marquee Carousel (`HeroProjectStrip`)**: Displays **all** published `16:9` (`aspect-video`) project visuals without clickable links, titles, or overlay arrows; supports touch swipe, pointer-drag panning, arrow step buttons, Play/Pause icon toggle button, and an accessible `popover="hint"` `"i"` toggletip (`tooltipPolyfills.ts`).
- GSAP entrance and scroll-triggered section animations (`gsapAnimations.ts`), disabled automatically when `prefers-reduced-motion: reduce`.

#### About Me, Work Process & Design System
- Personal profile image, rich WYSIWYG biography (`formatPublicDescription`), CMS-driven About stat cards (`yearsExperience`, `yearsExperienceLabel`, `selectedProjectsLabel`, `degreesCount`, `degreesLabel`), published Tech Tools list, and curated `/design-system` reference page (`DesignSystemPage`) featuring inspirations led by Daniella Marynova (`hellodani.co`) and Marijana Pavlinić (`marijanapav.com`) ahead of Pentagram, Studio Lenzing, and It’s Nice That.
- **6-Step Spec-Driven Work Process (`WorkProcessSection`)**: Horizontal single-row ARIA tablist covering **Empathize**, **Define**, **Ideate**, **Prototype**, **Development** (Spec-Driven Development using AI-assisted workflows from PRD → ERD → Design Brief → Local Development → Unit Tests → CI/CD Pipeline → Staging → In Production → Agile iteration), and **Test** in plain paragraph prose with dynamic `workProcessSubtitle` from CMS About copy, powered by `GET /api/work-process?published=true` with static fallback.

#### Experience & Education Tabbed Timeline (`ExperienceEducationSection`)
- WAI-ARIA `tablist`/`tab`/`tabpanel` separating **Experiences** and **Education** with uploaded company logo thumbnails (`exp.logoURL`), arrow/`Home`/`End` keyboard switching, `#education` / `#experience` hash linking, and `hidden="until-found"` (`beforematch`) searchability.
- Timezone-safe ISO date formatting (`Oct 2025 – Present`) via `dateFormat.ts` and automatic latest-end-date-first sorting (`sortByLatestEndDate`).

#### Portfolio Projects (`/portfolio` & `/portfolio/:id`)
- **Custom Role Ordering**: Homepage Selected Work filter pills follow custom Role `order` metadata fetched from `CMSStorage.getRoles()`.
- **Slim Inline Filter Bar & Mobile Popup (`PortfolioPage`, `PortfolioFilterControls`, `MobileFilterDialog`)**: Desktop/tablet inline Role pills, Year pills, multi-select Tech dropdown, and keyword `<search>`; collapses on mobile (`< 768px`) to a `Filter` button with active count badge opening a native `<dialog closedby="any">` popup.
- **Grid & Table View Switcher (`PortfolioTable`)**: Accessible `role="toolbar"` switching between 16:9 Grid cards (`.card-hover-cta` CTA revealed on hover/focus) and a left-aligned Table (`?view=table`, hover/focus 16:9 thumbnail preview on desktop, minimal two-column index rows hiding Role/Link/Year on mobile `@container (width < 640px)`).
- **Single Portfolio Case Study (`PortfolioDetail`)**: Sticky left metadata column (`lg:sticky`) alongside independently scrollable right details; explicit light editorial styling on `.portfolio-markdown` / `.wysiwyg-content` `<code>` and `<pre>` elements preventing DaisyUI dark-mode surface bleed; native `PasswordProtectionModal`, `ScrollProgressBar`, and `ImageLightboxModal`.

#### Blog & News System (`/blogs` & `/blogs/:id`)
- Editorial `BlogCard` carousel on Home and filterable `<search>` archive on `/blogs` (dynamic categories, tags, ISO dates formatted via `formatFullDate`, hover/focus CTA reveal).
- Public reading view (`/blogs/:id` or `/blogs/:slug`) with cover images, reading time, rich WYSIWYG content, and embedded interactive Case Study cards.

#### Contact & Vibrant Footer (`Footer`)
- Live contact form submitting via `CMSStorage.addContactEntry` with `mailto:` error fallback, CMS-configurable contact copy (`contactHeading`, `contactSubtext`, `email`), and `role="status"` live announcements, paired with CMS-managed Social Links (`/api/social-links`).
- Multi-tier `bg-brand` CTA footer featuring editorial color accents (`mint`/`orange`/`pink`), CMS-configurable `footerCtaHeading` and `footerBio`, live Bali time (`Asia/Makassar`), route sitemap navigation, social pills (independently hydrated on subpages when props are omitted), and smooth `"Back to top"` scroll.

### 2. Content Management System (CMS)

#### Authentication System
- Secure login page
- JWT-based authentication
- Session management
- Protected routes
- Automatic logout on inactivity

#### Dashboard
- Overview statistics connected across all 9 CMS collections (Portfolios, Blogs, Experiences, Work Process, Education, Tech Tools, Roles, Social Links, Contact Entries, plus About Me status)
- Quick actions for creating and managing every content type
- Recent activity & unpublished/unread status summaries
- System health status

#### Content Management Modules

##### About Management & Site Copy
- Profile photo upload with direct signed Cloudinary upload (`profiles` folder) and `/api/upload/profile` 10MB fallback
- Full-surface clickable & drag-and-drop dropzone with MIME/10MB client validation and staged preview persistence until **Save Changes** is submitted
- Dedicated PDF Curriculum Vitae upload (`cvURL`, `cvCloudinaryId`) synced to public CV buttons and modal
- Structured forms for Identity & Contact (`name`, `fullName`, `location`, `email`), Hero & Process Copy (`heroHeadline`, `heroSubheadline`, `workProcessSubtitle`), About Stats & Résumé Summary (`yearsExperience`, `yearsExperienceLabel`, `selectedProjectsLabel`, `degreesCount`, `degreesLabel`, `resumeSummary`), and Contact & Footer Copy (`contactHeading`, `contactSubtext`, `footerCtaHeading`, `footerBio`)
- Rich WYSIWYG description editor and real-time public preview

##### Social Links Management
- Dedicated CMS module (`/cms/social-links`, nested under **About Me ▾** in `CMSLayout.tsx`) backed by `/api/social-links`
- Full CRUD for footer and contact social pills (`label`, `href`, `external`, `order`, `isPublished`)
- One-click **Import Default Social Links** seeding (`Email`, `GitHub`, `LinkedIn`)
- Instant **Up** / **Down** reordering and publish/hide visibility toggles

##### Portfolio Management
- CRUD operations for projects
- Image and web-optimized video uploads (`mp4`, `webm`, `mov`, `mkv`)
- Redesigned 40% (Metadata) / 60% (Project Details) split-screen workspace with `⌘S` quick save
- Integrated TipTap WYSIWYG editor with rich formatting
- Case Study "Section Title" generator with 5 standard presets:
  1. `1. Project Background & Context`
  2. `2. Development Process`
  3. `3. Implementation Details`
  4. `4. Team Structure & Roles`
  5. `5. Outcomes & Impact`
- Single media node with custom width (25%–100%), aspect ratio (16:9, 4:3, 1:1), and alignment controls
- Multi-media gallery node with per-item sizing, batch upload, and instant Lightbox preview
- Technology tagging system and role assignment
- Publish/draft status and password protection
- AI-powered content generation and rewriting using `deepseek-v4.1-flash` (Opencode Go)

##### Public Case Study & Portfolio Detail UX
- Consistent `Project Overview` and `Project Details` heading hierarchy on desktop and mobile
- Sticky Case Study Reading Progress Bar (`ScrollProgressBar`) tracking scroll percentage and active chapter title
- Responsive gallery layouts: mobile horizontal swipe carousel (85% card width + snap), tablet 2-column grid, desktop custom flex
- Lightbox image viewer (`ImageLightboxModal`) with arrow keys, escape shortcut, and image counter
- "Click to view image" badge with desktop cursor hover trigger and mobile/tablet centered badge with dark filter
- Direct placement of "Visit Project" (high-contrast `btn-info`) and "Back to Portfolio" action buttons below Technologies Used

##### Blog Management
- Full CRUD operations for blog posts and announcements.
- WYSIWYG rich text editor with headings, lists, blockquotes, media alignment, and section generators.
- "Attach Portfolio Case Study" interactive popup: lists published portfolios with real-time search, embedding rich interactive cards directly into article content.
- Dynamic slug auto-generation from title with manual override capability.
- Category selection (`Event`, `News`, `Personal`, `Engineering`, `Update`), tags, and Cloudinary cover image upload.
- Estimated reading time calculator and publish/draft status toggles.

##### Experience Management
- Job history management
- Company logo uploads
- Status indicators (Current/Past/Contract/etc.)
- Month/year date pickers
- Rich text descriptions
- Publication control

##### Work Process Management
- Top-level CMS navigation module (`/cms/work-process`)
- Full CRUD for plain-paragraph process stages (`title`, `description`, `order`, `isPublished`)
- One-click **Import Default 6 Steps** seeding (`Empathize` → `Define` → `Ideate` → `Prototype` → `Development` → `Test`)
- Instant **Up** / **Down** reordering and visibility toggles (`Published` / `Hidden`)

##### Education Management
- Degree/certification management
- Institution details
- Month/year date ranges
- Certificate link management
- Description fields

##### Tech Tools Management
- Skills inventory and categorization
- Icon/logo uploads and Cloudinary integration
- "Sync Skills from Portfolios" one-click action triggering atomic bulk migration of uncataloged skills
- Automatic draft provisioning (`isPublished: false`) with placeholder vector icon (`placeholder-tech.svg`)
- Draft status badge (`Draft - Hidden from Public`) and publish toggle
- Display ordering

##### Roles Management
- Professional role definitions
- DaisyUI color selection (`primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`, `neutral`)
- Direct badge color synchronization with public portfolio filter pills (solid active / colored outline inactive)
- Description management

##### Contact Entries
- Message inbox
- Read/unread status
- Reply tracking
- Bulk operations
- Export functionality

### 3. AI Integration

#### AI Portfolio Generator
- OpenAI GPT integration
- Project description generation
- Technology suggestions
- Role recommendations
- Content refinement

#### Features
- Context-aware generation
- Multiple regeneration options
- Edit before save
- Technology matching with existing tools

---

## Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

#### portfolios
```javascript
{
  _id: ObjectId,
  title: String (required),
  desc: String (required),
  projectDetails: String,
  linkTo: String,
  imageURL: String,
  imageCloudinaryId: String,
  videoURL: String,
  videoCloudinaryId: String,
  tech: [String],
  roles: [String],
  customTech: String,
  order: Number (default: 0),
  isPublished: Boolean (default: true),
  isPasswordProtected: Boolean (default: false),
  password: String (default: null),
  isPinned: Boolean (default: false),
  year: String (default: null),
  relatedExperience: ObjectId (ref: 'Experience', default: null),
  relatedExperienceCompany: String (default: null),
  relatedEducation: ObjectId (ref: 'Education', default: null),
  relatedEducationInstitution: String (default: null),
  createdAt: Date,
  updatedAt: Date
}
```

#### blogs
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (required, unique),
  summary: String (required),
  content: String (required),
  category: String (enum: ['All', 'Event', 'News', 'Personal', 'Engineering', 'Update'], default: 'Personal'),
  tags: [String],
  coverImage: String,
  coverImagePublicId: String,
  attachedPortfolioId: ObjectId (ref: 'Portfolio', default: null),
  isPublished: Boolean (default: true),
  readingTime: Number (default: 3),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### experiences
```javascript
{
  _id: ObjectId,
  title: String (required),
  status: String (enum: ['Current', 'Past', 'Contract', 'Internship', 'Freelance', 'Volunteer']),
  companyName: String (required),
  startDate: Date (required),
  endDate: Date,
  duration: String (deprecated),
  description: String (required),
  logoURL: String,
  logoCloudinaryId: String,
  order: Number (default: 0),
  isPublished: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### education
```javascript
{
  _id: ObjectId,
  title: String (required),
  institution: String (required),
  startDate: Date (required),
  endDate: Date,
  description: String,
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### techtools
```javascript
{
  _id: ObjectId,
  title: String (required, unique),
  imageURL: String (required),
  imageCloudinaryId: String,
  order: Number (default: 0),
  isPublished: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### roles
```javascript
{
  _id: ObjectId,
  title: String (required, unique),
  description: String,
  color: String (default: '#3B82F6'),
  order: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### contacts
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  message: String (required),
  isRead: Boolean (default: false),
  isReplied: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

#### abouts
```javascript
{
  _id: ObjectId,
  description: String (required),
  imageURL: String,
  imageCloudinaryId: String,
  cvURL: String,
  cvCloudinaryId: String,
  name: String,
  fullName: String,
  location: String,
  email: String,
  heroHeadline: String,
  heroSubheadline: String,
  workProcessSubtitle: String,
  yearsExperience: String,
  yearsExperienceLabel: String,
  selectedProjectsLabel: String,
  degreesCount: String,
  degreesLabel: String,
  resumeSummary: String,
  contactHeading: String,
  contactSubtext: String,
  footerCtaHeading: String,
  footerBio: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### workprocesses
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  order: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### sociallinks
```javascript
{
  _id: ObjectId,
  label: String (required),
  href: String (required),
  external: Boolean,
  order: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Documentation

### Base URL
- Development: `http://localhost:5001/api`
- Production: `https://your-domain.vercel.app/api`

### Authentication Endpoints

#### POST /api/auth/login
Login to the CMS system.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "admin@example.com"
  }
}
```

#### POST /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "user_id",
    "email": "admin@example.com"
  }
}
```

### Content Endpoints

#### About Section

**GET /api/about**
Get about section content.

**PUT /api/about** (Protected)
Update about section.

**Request Body:**
```json
{
  "description": "About me text...",
  "imageURL": "https://...",
  "imageCloudinaryId": "...",
  "cvURL": "https://...",
  "cvCloudinaryId": "..."
}
```

#### Work Process

**GET /api/work-process**
List work process steps sorted by `order` (supports `?published=true`).

**GET /api/work-process/:id**
Fetch a single process step.

**POST /api/work-process** (Protected)
Create a new process step (`title`, `description`, `order`, `isPublished`).

**POST /api/work-process/seed** (Protected)
Seed the default 6 steps (`Empathize` through `Test`) when empty (or with `{ "force": true }`).

**PUT /api/work-process/:id** (Protected)
Update an existing process step or reorder/toggle publication.

**DELETE /api/work-process/:id** (Protected)
Delete a process step.

#### Social Links

**GET /api/social-links**
List social links sorted by `order` (supports `?published=true`).

**GET /api/social-links/:id**
Fetch a single social link.

**POST /api/social-links** (Protected)
Create a new social link (`label`, `href`, `external`, `order`, `isPublished`).

**POST /api/social-links/seed** (Protected)
Seed default social links (`Email`, `GitHub`, `LinkedIn`) when empty (or with `{ "force": true }`).

**PUT /api/social-links/:id** (Protected)
Update an existing social link or reorder/toggle publication.

**DELETE /api/social-links/:id** (Protected)
Delete a social link.

#### Portfolio Management

**GET /api/portfolios**
Get all portfolios.

Query Parameters:
- `published=true` - Get only published items

**GET /api/portfolios/:id**
Get single portfolio by ID.

**POST /api/portfolios** (Protected)
Create new portfolio.

**PUT /api/portfolios/:id** (Protected)
Update portfolio.

**DELETE /api/portfolios/:id** (Protected)
Delete portfolio.

#### Experience Management

**GET /api/experiences**
Get all experiences.

Query Parameters:
- `published=true` - Get only published items

**GET /api/experiences/:id**
Get single experience.

**POST /api/experiences** (Protected)
Create new experience.

**PUT /api/experiences/:id** (Protected)
Update experience.

**DELETE /api/experiences/:id** (Protected)
Delete experience.

#### Education Management

**GET /api/education**
Get all education items.

**POST /api/education** (Protected)
Create education item.

**PUT /api/education/:id** (Protected)
Update education item.

**DELETE /api/education/:id** (Protected)
Delete education item.

#### Tech Tools

**GET /api/tech-tools**
Get all tech tools.

Query Parameters:
- `published=true` - Get only published items for public marquee

**POST /api/tech-tools** (Protected)
Create tech tool.

**POST /api/tech-tools/sync-from-portfolios** (Protected)
Automatically scan all portfolio projects and insert uncataloged skills into Tech Tools as draft items (`isPublished: false`) with placeholder branding.

**PUT /api/tech-tools/:id** (Protected)
Update tech tool.

**DELETE /api/tech-tools/:id** (Protected)
Delete tech tool.

#### Blog & News Management

**GET /api/blogs**
Get all blog posts.

Query Parameters:
- `published=true` - Return only published posts (for public blog page)
- `category=...` - Filter by category (`Event`, `News`, `Personal`, `Engineering`, `Update`)
- `search=...` - Case-insensitive keyword search in title, summary, or content

**GET /api/blogs/:id**
Get single blog post by MongoDB ObjectId or URL-friendly slug.

**POST /api/blogs** (Protected)
Create new blog post with optional portfolio case study attachment.

**PUT /api/blogs/:id** (Protected)
Update blog post details, content, cover image, or publication status.

**DELETE /api/blogs/:id** (Protected)
Delete blog post and delete associated Cloudinary cover image.

#### Roles

**GET /api/roles**
Get all roles.

**POST /api/roles** (Protected)
Create role.

**PUT /api/roles/:id** (Protected)
Update role.

**DELETE /api/roles/:id** (Protected)
Delete role.

#### Contact Form

**GET /api/contacts** (Protected)
Get all contact messages.

**POST /api/contacts**
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here..."
}
```

**PUT /api/contacts/:id/read** (Protected)
Mark message as read.

**PUT /api/contacts/:id/reply** (Protected)
Mark message as replied.

**DELETE /api/contacts/:id** (Protected)
Delete contact message.

### File Upload Endpoints

**GET /api/upload/signature** (Protected)
Generate signed upload parameters for direct Cloudinary transfers.

**POST /api/upload/profile** (Protected)
Upload profile portrait image (10MB Multer limit with structured JSON errors).

**POST /api/upload/portfolio** (Protected)
Upload portfolio hero image.

**POST /api/upload/portfolio-video** (Protected)
Upload portfolio hero video.

**POST /api/upload/editor-media** & **POST /api/upload/editor-gallery** (Protected)
Upload single or batch WYSIWYG media assets.

**POST /api/upload/tech-tool** (Protected)
Upload tech tool icon.

**POST /api/upload/experience** (Protected)
Upload company logo.

**DELETE /api/upload/:cloudinaryId** (Protected)
Delete an uploaded Cloudinary asset.

### AI Endpoints

**POST /api/ai/generate-portfolio** (Protected)
Generate portfolio content using AI.

**Request Body:**
```json
{
  "prompt": "Create a portfolio item for a React e-commerce project"
}
```

---

## Authentication & Security

### Security Measures

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password requirements
   - No plain text storage

2. **JWT Implementation**
   - Secure token generation
   - Token expiration (24 hours)
   - HTTP-only cookie option available

3. **API Protection**
   - Protected routes require valid JWT
   - Rate limiting on authentication endpoints
   - CORS configuration

4. **Input Validation**
   - Server-side validation
   - SQL injection prevention (NoSQL)
   - XSS protection

5. **File Upload Security**
   - File type validation
   - Size limits (10MB default)
   - Cloudinary integration for safe storage

### Authentication Flow

```
1. User enters credentials
2. Frontend sends POST to /api/auth/login
3. Server validates credentials
4. Server generates JWT token
5. Token sent to frontend
6. Frontend stores token in localStorage
7. Token included in subsequent requests
8. Server validates token for protected routes
9. Token expires after 24 hours
10. User must re-authenticate
```

---

## Frontend Components

### Component Architecture

#### Layout & Navigation Components
- **FloatingNavigation**: Persistent bottom pill dock (`Home`, `Selected Work`, `Work`, `Journal`, `About`, `Contact`), mobile `More` drawer, and brand-blue `.dock-item-primary` `Résumé` action trigger
- **Footer**: Vibrant editorial multi-tier footer with `bg-brand` CTA banner, live Bali WITA time (`Asia/Makassar`), route navigation, and `SOCIAL_LINKS`
- **CMSLayout**: Admin panel layout wrapper

#### Showcase & Section Components
- **HeroProjectStrip**: All-project `16:9` marquee strip with non-clickable visuals, touch swipe / pointer-drag / arrow controls, accessible `popover="hint"` toggletip, and Play/Pause icon button
- **WorkProcessSection**: Single-row ARIA `tablist` cycling through workflow phases
- **ExperienceEducationSection**: Accessible `Experiences` / `Education` tab switcher with hash sync, `hidden="until-found"` (`beforematch`), and descending end-date ordering (`sortByLatestEndDate`)
- **EditorialCarousel**: Keyboard- and swipe-friendly scroll-snap carousel with `inert` off-screen slides
- **PortfolioFilterControls**: Shared inline/modal filter state for Roles, Years, Technologies, and keyword `<search>`
- **PortfolioTable**: Left-aligned desktop archive table with below-row `16:9` preview and minimal two-column mobile index rows
- **ProjectCard / BlogCard**: `16:9` / editorial cards with `.card-hover-cta` hover/focus reveal and formatted metadata

#### Modal, Detail & Utility Components
- **LoadingScreen**: Full-screen brand-blue (`bg-brand`) loading overlay with centered `/favicon.ico` and smooth `ease-in-out` fade transition (`opacity-100` to `opacity-0 pointer-events-none`)
- **CVModal**: Native `<dialog closedby="any">` résumé viewer with CMS copy, descending end dates, full education list, and PDF download
- **MobileFilterDialog**: Native `<dialog closedby="any">` mobile filter sheet for `/portfolio`
- **PasswordProtectionModal**: Native `<dialog closedby="any">` password unlock dialog for protected projects
- **ImageLightboxModal**: Native `<dialog closedby="any">` single/gallery image lightbox
- **ScrollProgressBar**: Sticky case study reading progress indicator on `PortfolioDetail`
- **ImagePlaceholder / Icons**: `16:9` editorial fallback visuals and inline `aria-hidden` SVG icons
- **ProtectedRoute**: JWT validation wrapper for `/cms/*` routes

### State Management

#### Local State
- Component-level state with useState
- Form data management
- UI state (modals, dropdowns)

#### Global State
- Authentication state in localStorage
- API response caching
- Theme preferences

#### Data Flow
```
API Response → CMSStorage → Component State → UI Render
User Input → Component State → API Call → Database Update
```

---

## CMS System

### Access Control

#### Admin Authentication
- Single admin user system
- Email/password authentication
- JWT token management
- Auto-logout on inactivity

#### Permission Levels
- **Public**: View portfolio content
- **Admin**: Full CRUD operations

### Content Management Features

#### Rich Text Editing
- Multi-line text support
- Markdown compatibility
- Preview functionality

#### Media Management
- Drag-and-drop upload
- Image preview
- Automatic optimization
- Cloudinary CDN delivery

#### Data Validation
- Required field validation
- Format validation (email, URL)
- Size limits
- Type checking

#### Bulk Operations
- Multiple item selection
- Bulk delete
- Bulk status updates
- Export functionality

### User Interface

#### Dashboard Analytics
- Total items count
- Published vs draft
- Recent activities
- Quick stats

#### Navigation Structure
```
CMS Dashboard
├── Dashboard
├── Portfolios
├── Blogs & News
├── Experiences
├── Work Process
├── Contact Entries
└── About Me ▾
    ├── About Me Content
    ├── Social Links
    ├── Tech Tools
    ├── Roles
    ├── Education
    └── AI Diagnostics
```

#### Light Theme Lock & Responsive Design
- Explicit `data-theme="light"`, `color-scheme: light`, DaisyUI `themes: ['light --default']`, and high-contrast light Tailwind cards/inputs preventing OS Dark Mode color inversion across all CMS views
- Mobile-optimized forms and touch-friendly controls
- Adaptive layouts and progressive enhancement

---

## Deployment Guide

### Prerequisites

1. **Accounts Required**
   - GitHub account
   - Vercel account
   - MongoDB Atlas account
   - Cloudinary account
   - OpenAI API account (optional)

2. **Local Development**
   - Node.js 16+ installed
   - Git installed
   - Code editor (VS Code recommended)

### Step-by-Step Deployment

#### 1. Prepare the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/my-portfolio.git
cd my-portfolio

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
# Edit .env with your credentials
```

#### 2. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Update `MONGODB_URI` in .env

#### 3. Configure Cloudinary

1. Create Cloudinary account
2. Get cloud name, API key, and secret
3. Update Cloudinary variables in .env

#### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? my-portfolio
# - In which directory? ./
# - Override settings? No
```

#### 5. Configure Environment Variables in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from .env:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `OPENAI_API_KEY`
   - `NODE_ENV` = production

#### 6. Update API URLs

`src/services/api.ts` automatically resolves the API base URL via `resolveApiBaseUrl()`, defaulting to same-origin `'/api'` in both development (forwarded by Vite's `/api` proxy in `vite.config.ts`) and production (handled by Vercel rewrites in `vercel.json`):

```typescript
// src/services/api.ts
// Uses relative '/api' in production and on non-localhost devices (e.g. iPhone LAN preview),
// ignoring VITE_APP_ENV=development and placeholder domains when bundled with Vite.
const API_BASE_URL = resolveApiBaseUrl();
```

#### 7. Redeploy

```bash
# Push changes
git add .
git commit -m "Update API URLs for production"
git push

# Vercel will auto-deploy from GitHub
```

### Post-Deployment

#### 1. Test the Application
- Visit your Vercel URL
- Test public portfolio sections
- Login to CMS (/cms/login)
- Test CRUD operations
- Verify image uploads
- Check contact form

#### 2. Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS settings
4. Update CORS origins in serverless.js

#### 3. Monitor & Maintain
- Check Vercel logs for errors
- Monitor MongoDB Atlas metrics
- Review Cloudinary usage
- Update dependencies regularly

---

## Environment Configuration

### Required Environment Variables

```env
# Database
MONGODB_URI=              # MongoDB connection string
                         # Format: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=              # Random string for JWT signing (min 32 chars)
ADMIN_EMAIL=             # Admin login email
ADMIN_PASSWORD=          # Admin login password

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=   # Your Cloudinary cloud name
CLOUDINARY_API_KEY=      # Cloudinary API key
CLOUDINARY_API_SECRET=   # Cloudinary API secret

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=          # OpenAI API key for content generation

# Application
NODE_ENV=                # Environment: development | production
PORT=                    # Server port (default: 5001)
FRONTEND_URL=            # Frontend URL for CORS
```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/portfolio-dev
FRONTEND_URL=http://localhost:5173
```

#### Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-portfolio.vercel.app
```

---

## Development Guide

### Setting Up Development Environment

#### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd .. && npm install
```

#### 2. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or separately:
# Backend only
npm run server

# Frontend only
npm run client
```

#### 3. Development URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
- CMS: `http://localhost:5173/cms`

### Code Standards

#### TypeScript Guidelines
- Use explicit types for function parameters
- Define interfaces for complex objects
- Avoid `any` type
- Use enums for constant sets

#### React Best Practices
- Functional components with hooks
- Custom hooks for reusable logic
- Proper dependency arrays in useEffect
- Memoization for expensive computations

#### API Design
- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Error handling middleware

#### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request
```

### Adding New Features

#### 1. Adding a New CMS Section

```typescript
// 1. Create model (server/models/NewSection.js)
const newSectionSchema = new mongoose.Schema({
  // Define schema
});

// 2. Create routes (server/routes/newSection.js)
router.get('/', async (req, res) => {
  // Implementation
});

// 3. Create CMS page (src/cms/pages/NewSectionManagement.tsx)
const NewSectionManagement: React.FC = () => {
  // Component
};

// 4. Add to router (src/App.tsx)
<Route path="/cms/new-section" element={<NewSectionManagement />} />

// 5. Add to navigation (src/cms/components/CMSLayout.tsx)
{ path: '/cms/new-section', label: 'New Section' }
```

#### 2. Adding AI Features

```typescript
// 1. Create AI endpoint (server/routes/ai.js)
router.post('/generate-content', async (req, res) => {
  const response = await openai.createCompletion({
    // Configuration
  });
});

// 2. Add to frontend service (src/services/api.ts)
async generateContent(prompt: string) {
  return this.post('/ai/generate-content', { prompt });
}

// 3. Integrate in component
const handleAIGenerate = async () => {
  const content = await apiService.generateContent(prompt);
  // Use generated content
};
```

---

## Testing

### Manual Testing Checklist

#### Public Site
- [ ] Hero section loads correctly
- [ ] Navigation works on all devices
- [ ] Portfolio items display properly
- [ ] Contact form submits successfully
- [ ] Responsive design on mobile/tablet/desktop
- [ ] All external links work
- [ ] Images load and display correctly

#### CMS System
- [ ] Login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] All CRUD operations work
- [ ] Image uploads successful
- [ ] Form validation works
- [ ] Date pickers function correctly
- [ ] Logout works properly

#### API Endpoints
- [ ] All GET endpoints return data
- [ ] POST endpoints create records
- [ ] PUT endpoints update correctly
- [ ] DELETE endpoints remove records
- [ ] Protected routes require authentication
- [ ] Error responses are consistent

### Automated Testing (Vitest & Testing Library)

Run the full automated suite (currently **26 test files, 122 tests**) and production TypeScript + Vite build:

```bash
npm test -- --run
npm run build
```

Automated coverage spans:
- Public pages & navigation (`App.test.tsx`, `HomeRedesign.test.tsx`, `FloatingNavigation.test.tsx`, `PortfolioPage.test.tsx`, `PortfolioDetail.test.tsx`, `BlogPage.test.tsx`, `blog.test.tsx`)
- Interactive widgets & dialogs (`LoadingScreen.test.tsx`, `CVModal.test.tsx`, `WorkProcessSection.test.tsx`, `EditorialCarousel.test.tsx`, `portfoliocard.test.tsx`)
- Formatting, CMS CRUD, serverless routing & AI safety (`dateFormat.test.ts`, `publicFormatting.test.tsx`, `PortfolioManagement.test.tsx`, `BlogManagement.test.tsx`, `WorkProcessManagement.test.tsx`, `SocialLinksManagement.test.tsx`, `AboutManagement.test.tsx`, `WYSIWYGEditor.test.tsx`, `techToolAutoSync.test.tsx`, `serverlessBlog.test.ts`, `serverlessWorkProcess.test.ts`, `serverlessSocialLinks.test.ts`, `aiHelpers.test.ts`)

---

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Failed
**Error:** `MongoNetworkError: connection timed out`

**Solution:**
- Check MongoDB URI is correct
- Verify IP whitelist includes your IP
- Check network connection
- Ensure database user has correct permissions

#### 2. JWT Token Invalid
**Error:** `JsonWebTokenError: invalid signature`

**Solution:**
- Ensure JWT_SECRET matches in .env
- Clear localStorage and re-login
- Check token hasn't expired

#### 3. Image Upload Fails
**Error:** `Cloudinary upload error`

**Solution:**
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Ensure correct file format (jpg, png, gif)
- Check Cloudinary quota

#### 4. Vercel Deployment Fails
**Error:** `Build failed`

**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set
- Check for TypeScript errors

#### 5. CORS Errors
**Error:** `Access-Control-Allow-Origin`

**Solution:**
- Update CORS origin in serverless.js
- Include your domain in allowed origins
- Check API URL in frontend matches backend

#### 6. Date Picker Issues
**Problem:** Dates not saving correctly

**Solution:**
- Ensure using YYYY-MM format
- Check timezone handling
- Verify MongoDB date conversion

### Debug Mode

Enable debug logging:

```javascript
// Backend
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
  console.log('Debug mode enabled');
}

// Frontend
if (process.env.NODE_ENV === 'development') {
  console.log('API calls:', url, data);
}
```

### Performance Optimization

#### 1. Image Optimization
- Use Cloudinary transformations
- Implement lazy loading
- Set appropriate image sizes

#### 2. Database Optimization
- Add indexes for frequently queried fields
- Use MongoDB aggregation pipeline
- Implement caching strategy

#### 3. Frontend Optimization
- Code splitting with React.lazy
- Memoize expensive computations
- Optimize re-renders

#### 4. API Optimization
- Implement pagination
- Use field selection in queries
- Add response caching

---

## Maintenance & Updates

### Regular Maintenance Tasks

#### Weekly
- Review contact form submissions
- Check for security updates
- Monitor error logs

#### Monthly
- Update npm dependencies
- Review and optimize images
- Backup database
- Check SSL certificate

#### Quarterly
- Security audit
- Performance review
- Feature planning
- User feedback implementation

### Backup Strategy

#### Database Backup
```bash
# MongoDB Atlas automatic backups
# Configure in Atlas dashboard → Backup

# Manual backup
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)
```

#### Code Backup
- GitHub repository (automatic)
- Local backups before major changes
- Tagged releases for stable versions

### Monitoring

#### Application Monitoring
- Vercel Analytics (built-in)
- MongoDB Atlas monitoring
- Cloudinary usage dashboard

#### Error Tracking (Recommended)
- Sentry integration
- LogRocket for session replay
- Custom error logging

---

## License & Credits

### Technologies Used
- React.js by Facebook
- DaisyUI by Pouya Saadeghi
- Tailwind CSS by Adam Wathan
- MongoDB by MongoDB Inc.
- Express.js by TJ Holowaychuk
- Node.js by OpenJS Foundation

### Third-Party Services
- Vercel for hosting
- MongoDB Atlas for database
- Cloudinary for image management
- OpenAI for AI features

### Contributing
Contributions are welcome! Please follow the established code style and submit pull requests for review.

---

## Contact & Support

For questions, issues, or feature requests:
1. Check this documentation
2. Review closed GitHub issues
3. Create a new issue with detailed information
4. Contact the maintainer

---

*Last Updated: November 15, 2026*
*Version: 2.0.0*
