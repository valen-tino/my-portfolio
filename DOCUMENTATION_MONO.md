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
   - [MongoDB Atlas Troubleshooting](#mongodb-atlas-troubleshooting)
   - [Vercel Environment Variables & Debug Steps](#vercel-environment-variables--debug-steps)
   - [Emergency Minimal Test Endpoint](#emergency-minimal-test-endpoint)

---

# Part I: Project Overview & Readme

### Original source: `README.md`

# portfolio-react
My Actual Portfolio (Updated)

Full-stack portfolio Content Management System with AI integration, React frontend, Express.js backend, and MongoDB database.

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
                    │         MongoDB Atlas               │
                    │      (Cloud Database)               │
                    │                                     │
                    │  Collections:                       │
                    │  - users                            │
                    │  - portfolios                       │
                    │  - blogs                            │
                    │  - experiences                      │
                    │  - education                        │
                    │  - techtools                        │
                    │  - roles                            │
                    │  - contacts                         │
                    │  - about                            │
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
5. MongoDB Atlas stores/retrieves data
6. Response sent back through the stack

---

## Technology Stack

### Frontend
- **React 19.1.1**: Component-based UI framework
- **TypeScript 5.9.2**: Type-safe development
- **React Router v7**: Client-side routing
- **DaisyUI 5.1.7**: Component library built on Tailwind CSS
- **Tailwind CSS 3.4.4**: Utility-first CSS framework
- **Axios 1.11.0**: HTTP client for API communication
- **Vite 7.1.4**: Next-generation frontend build tooling

### Backend
- **Node.js 22.19.0+**: JavaScript runtime
- **Express.js 5.1.0**: Web application framework
- **MongoDB / Mongoose 8.18.0**: NoSQL database and ODM
- **JWT (jsonwebtoken 9.0.2)**: JSON Web Tokens for authentication
- **Bcrypt (bcryptjs 3.0.2)**: Password hashing
- **Multer 2.0.2 & Multer-Storage-Cloudinary 2.2.1**: File upload handling
- **Cloudinary 2.11.0**: Cloud-based image management

### AI Integration
- **OpenAI SDK / Deepseek API**: AI-powered content generation and rewriting

---

## Project Structure

```
my-portfolio/
├── public/                     # Static assets
│   ├── images/                # Portfolio images & logos
│   ├── favicon.ico            # Site icon
│   └── tinologo.svg           # Logo asset
│
├── src/                       # React application source
│   ├── App.tsx               # Main application component & routes
│   ├── main.tsx              # Application entry point
│   │
│   ├── pages/                # Page components
│   │   ├── Home.tsx          # Landing page
│   │   ├── PortfolioPage.tsx # Portfolio archive listing
│   │   ├── PortfolioDetail.tsx # Individual portfolio view
│   │   ├── BlogPage.tsx      # Public blog archive (/blogs)
│   │   └── BlogDetail.tsx    # Single blog article view
│   │
│   ├── sections/             # Major page sections
│   │   ├── hero/             # Hero section
│   │   ├── aboutme/          # About section
│   │   ├── education/        # Education display
│   │   ├── experience/       # Work experience
│   │   ├── portfolios/       # Portfolio showcase & multi-filter
│   │   ├── blog/             # Blog & News showcase
│   │   ├── skills/           # Tech tools & skills
│   │   ├── nav/              # Navigation bar
│   │   └── footer/           # Site footer
│   │
│   ├── cms/                  # Complete CMS system
│   │   ├── components/       # CMS-specific components (CMSLayout, WYSIWYGEditor, etc.)
│   │   ├── pages/            # CMS pages (Dashboard, Portfolios, Blogs, TechTools, etc.)
│   │   ├── apiStorage.ts     # Client-side API storage helper
│   │   └── auth.ts           # Authentication utilities
│   │
│   ├── components/           # Reusable UI components
│   │   ├── ScrollProgressBar.tsx       # Case study reading progress bar
│   │   ├── ImageLightboxModal.tsx      # Gallery image viewer
│   │   └── PasswordProtectionModal.tsx # Password modal
│   │
│   ├── services/             # API services
│   │   ├── api.ts            # Core Axios client
│   │   └── ai.ts             # AI client service
│   │
│   └── utils/                # Utility helpers
│       └── aiHelpers.ts      # AI data formatting & validation
│
├── server/                   # Express backend
│   ├── config/               # Configuration (Cloudinary, Database)
│   ├── middleware/           # Auth middlewares
│   ├── models/               # Mongoose schemas (Portfolio, Blog, TechTool, etc.)
│   ├── routes/               # Express route handlers
│   ├── utils/                # Utility modules (skillMigration.js)
│   ├── scripts/              # Seed & maintenance scripts (syncExistingPortfolioSkills.js)
│   ├── services/             # Server services (aiService.js)
│   └── index.js              # Server entry point (port 5001)
│
├── api/                      # Vercel serverless integration
│   ├── [...path].js          # Catch-all serverless handler
│   └── serverless.js         # Express app serverless wrapper
│
├── vercel.json               # Vercel deployment configuration
└── package.json              # Project dependencies & scripts
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

### About Collection
```javascript
{
  description: { type: String, required: true },
  imageURL: { type: String, required: true },
  imageCloudinaryId: { type: String },
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
- **Tech Tools**: `GET /api/tech-tools` (supports `?published=true`), `POST /api/tech-tools`, `POST /api/tech-tools/sync-from-portfolios` (auto-sync), `PUT /api/tech-tools/:id`, `DELETE /api/tech-tools/:id`
- **Roles**: `GET /api/roles`, `POST /api/roles`, `PUT /api/roles/:id`, `DELETE /api/roles/:id`
- **Education**: `GET /api/education`, `POST /api/education`, `PUT /api/education/:id`, `DELETE /api/education/:id`
- **Portfolios**: `GET /api/portfolio` (supports `?published=true`), `POST /api/portfolio`, `PUT /api/portfolio/:id`, `DELETE /api/portfolio/:id`
- **Experiences**: `GET /api/experiences`, `POST /api/experiences`, `PUT /api/experiences/:id`, `DELETE /api/experiences/:id`
- **Contacts**: `GET /api/contact`, `POST /api/contact`, `DELETE /api/contact/:id`

### File Upload Endpoints (Cloudinary)
- **POST `/api/upload/portfolio-image`**: Upload portfolio hero media
- **POST `/api/upload/profile-image`**: Upload about section portrait
- **POST `/api/upload/tech-tool-image`**: Upload tech tool logo/icon
- **POST `/api/upload/experience-logo`**: Upload company logo

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

### API Client Pattern
Centralized through `src/cms/apiStorage.ts` and `src/services/api.ts`:
- Automatic injection of JWT token (`Authorization: Bearer <token>`)
- Centralized error and authentication expiration handling

### File Upload Pattern (Images & Videos)
All media uploads go through Cloudinary via custom Multer storage engine:
- Server returns `{ imageURL, imageCloudinaryId }` or `{ videoURL, videoCloudinaryId }`
- Always store both fields in database to enable cleanup when replacing or deleting items
- Video files are stream-validated via Multer fileFilter and delivered with web-optimization flags (`q_auto,f_auto,w_1920,c_limit`)

### TipTap WYSIWYG Editor & Case Study Structure
- `src/cms/components/WYSIWYGEditor.tsx` powers project editing with single media and multi-media gallery nodes
- Case studies are organized around 5 standard chapters:
  1. `1. Project Background & Context`
  2. `2. Development Process`
  3. `3. Implementation Details`
  4. `4. Team Structure & Roles`
  5. `5. Outcomes & Impact`
- Public view features full-screen `ImageLightboxModal` and sticky `ScrollProgressBar`

> For full architectural details of recent enhancements, see [CHANGES_SUMMARY.md](file:///Users/valentinojehaut/Documents/GitHub/my-portfolio/CHANGES_SUMMARY.md).

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
1. **MongoDB Atlas IP Whitelist**: Ensure `0.0.0.0/0` is added to Network Access whitelist.
2. **Database Name in URI**: Ensure the connection string includes `/portfolio`:
   `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority`
3. **Vercel Environment Variables**: Ensure environment variables are assigned to Production and Redeploy.
4. **Vercel Function Logs**: Run `vercel logs --follow` to inspect function runtime errors.
5. **Emergency Minimal Test Endpoint**: Use `api/test.js` to isolate connection issues between Vercel and MongoDB.

---

*Mono-Documentation consolidated on November 7, 2026.*

