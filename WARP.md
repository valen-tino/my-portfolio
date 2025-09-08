# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack portfolio website with an integrated Content Management System (CMS). It features a React/TypeScript frontend, Express.js backend, and MongoDB database, all deployed on Vercel with serverless functions.

**Key Components:**
- **Public Portfolio**: React SPA showcasing projects, experience, education, and skills
- **CMS System**: Protected admin interface for content management at `/cms/*`
- **API Layer**: Express.js serverless functions handling all backend logic
- **AI Integration**: OpenAI-powered content generation for portfolio items

## Development Commands

### Start Development Environment
```bash
# Start both frontend and backend concurrently
npm run dev

# Start individually (if needed)
npm run client    # Frontend only (Vite dev server)
npm run server    # Backend only (Express with nodemon)
```

### Build and Preview
```bash
# Build for production
npm run build

# Preview production build locally  
npm run preview
```

### Database Setup
```bash
# Initialize database (creates admin user if configured in .env)
npm run init-db
```

### Testing Individual Components
```bash
# Test backend API independently
npm run server
# Then visit http://localhost:5000/api/health

# Test frontend independently  
npm run client
# Then visit http://localhost:5173
```

## Architecture Overview

### Frontend Structure (src/)
- **`/pages`**: Main page components (Home, Portfolio pages)
- **`/sections`**: Page sections (hero, about, experience, contact, etc.)
- **`/cms`**: Complete CMS system with protected routes
  - **`/cms/pages`**: CMS page components (Dashboard, Management pages)
  - **`/cms/components`**: CMS-specific components (Layout, Modals)
  - **`apiStorage.ts`**: Client-side API service layer
  - **`auth.ts`**: Authentication utilities
- **`/components`**: Reusable components including CursorInverter effect
- **`/hook`**: Custom React hooks

### Backend Structure (server/)
- **`index.js`**: Main Express server with CORS and middleware setup
- **`/models`**: MongoDB schemas (User, Portfolio, Experience, Education, etc.)
- **`/routes`**: API endpoints organized by feature
- **`/middleware`**: JWT authentication middleware
- **`/config`**: Cloudinary and database configuration

### API Deployment (api/)
- **`[...path].js`**: Vercel catch-all serverless function that forwards to Express
- **`serverless.js`**: Express app wrapper for serverless deployment

### Key Technologies
- **Frontend**: React 19.1, TypeScript, React Router, DaisyUI/Tailwind CSS
- **Backend**: Express.js, MongoDB/Mongoose, JWT authentication
- **Images**: Cloudinary integration for uploads and optimization
- **AI**: OpenAI API for content generation
- **Deployment**: Vercel with serverless functions

## Important Development Patterns

### API Client Pattern
The CMS uses a centralized API service (`cms/apiStorage.ts`) that handles authentication headers and error handling. When working with API calls:

```typescript
// Use the existing API service
import apiStorage from '../apiStorage';

// API calls automatically include auth headers
const portfolios = await apiStorage.getPortfolios();
```

### Authentication Flow
- JWT tokens stored in localStorage
- `ProtectedRoute` component wraps CMS routes
- Admin user auto-created from environment variables on server start
- CMS routes: `/cms/*` (protected), Public routes: everything else

### File Upload Pattern
Images are handled through Cloudinary with specific endpoints:
- Profile images: `/api/upload/profile-image`
- Portfolio images: `/api/upload/portfolio-image`  
- Tech tool icons: `/api/upload/tech-tool-image`
- Experience logos: `/api/upload/experience-logo`

### Database Collections
- **portfolios**: Project showcases with tech tags and roles
- **experiences**: Work history with company logos and dates
- **education**: Academic credentials and certifications
- **techtools**: Technology skills with icons
- **roles**: Professional roles with color coding
- **contacts**: Contact form submissions
- **abouts**: Profile information and image
- **users**: Admin authentication

## Common Development Tasks

### Adding New CMS Section
1. Create MongoDB model in `server/models/NewSection.js`
2. Create API routes in `server/routes/newSection.js`
3. Add routes to `server/index.js`
4. Create CMS page component in `src/cms/pages/NewSectionManagement.tsx`
5. Add route to `src/App.tsx`
6. Add navigation link in `src/cms/components/CMSLayout.tsx`

### Working with Images
All images go through Cloudinary. The upload flow:
1. Frontend uploads via specific upload endpoints
2. Server processes with Multer and Cloudinary storage
3. Returns both `imageURL` and `imageCloudinaryId`
4. Always store both fields for proper cleanup

### Environment Configuration
Critical environment variables (see `.env.example`):
- **MONGODB_URI**: Database connection string
- **JWT_SECRET**: Token signing secret (min 32 chars)
- **ADMIN_EMAIL/ADMIN_PASSWORD**: Auto-created admin user
- **CLOUDINARY_***: Image storage credentials
- **OPENAI_API_KEY**: AI content generation

### Serverless Deployment Notes
- Backend runs as Vercel serverless functions
- API routes available at `/api/*`
- CORS configured for multiple origins
- Express app wrapped in `api/serverless.js`
- Database connection pooled across function calls

## Special Features

### Cursor Inverter Effect
A unique cursor effect on the public site (disabled in CMS):
- Toggle component in top-right corner
- Uses CSS `mix-blend-mode: difference`
- Performance monitoring built-in
- Preference saved to localStorage

### AI Content Generation
OpenAI integration for portfolio content creation:
- Available in Portfolio Management CMS section
- Generates project descriptions and tech suggestions
- Matches generated tech with existing TechTools
- Content editable before saving

### Date Handling
Experience and Education use month/year format:
- Frontend: Month/year pickers
- Backend: Stored as Date objects
- Display: Formatted as "MMM YYYY" or "MMM YYYY - Present"

## Troubleshooting

### Common Issues
- **CORS errors**: Check allowed origins in `server/index.js`
- **JWT issues**: Verify JWT_SECRET consistency across deployments
- **Image uploads failing**: Check Cloudinary credentials and file size limits
- **Database connection**: Ensure MongoDB Atlas IP whitelist includes deployment IPs

### Development URLs
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:5000 (Express server)
- CMS Login: http://localhost:5173/cms/login
- API Health: http://localhost:5000/api/health

### Build Issues
- TypeScript errors must be resolved before build
- Tailwind classes are purged in production
- Environment variables must be set in Vercel dashboard for deployment

## Key Files for Quick Reference

- **Main App**: `src/App.tsx` - Routing and global state
- **CMS Layout**: `src/cms/components/CMSLayout.tsx` - Admin navigation
- **API Service**: `src/cms/apiStorage.ts` - Centralized API calls
- **Server Entry**: `server/index.js` - Express app and middleware
- **Serverless Wrapper**: `api/[...path].js` - Vercel function entry
- **Deployment Config**: `vercel.json` - Vercel configuration
- **Environment Template**: `.env.example` - Required variables
