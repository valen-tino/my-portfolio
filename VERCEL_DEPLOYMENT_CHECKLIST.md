# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. GitHub Repository
- [ ] Push all latest changes to GitHub
- [ ] Ensure `.gitignore` includes:
  - `.env`
  - `node_modules/`
  - `build/`
  - `.DS_Store`

### 2. Environment Variables Preparation
Prepare these values before deployment:

```
MONGODB_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
NODE_ENV=production
```

### 3. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster (free tier available)
- [ ] Create database user with read/write permissions
- [ ] Add IP whitelist: `0.0.0.0/0` (allows all IPs)
- [ ] Get connection string (mongodb+srv://...)
- [ ] Test connection locally

### 4. Cloudinary Setup
- [ ] Create Cloudinary account
- [ ] Note down:
  - Cloud Name
  - API Key
  - API Secret
- [ ] Configure upload presets (optional)

### 5. OpenAI Setup (Optional)
- [ ] Create OpenAI account
- [ ] Generate API key
- [ ] Set usage limits

## Deployment Steps

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository

### Step 2: Configure Build Settings
Vercel should auto-detect Create React App. Verify:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string | Production |
| `JWT_SECRET` | Random 32+ character string | Production |
| `ADMIN_EMAIL` | Your admin email | Production |
| `ADMIN_PASSWORD` | Your admin password | Production |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary name | Production |
| `CLOUDINARY_API_KEY` | Your Cloudinary key | Production |
| `CLOUDINARY_API_SECRET` | Your Cloudinary secret | Production |
| `OPENAI_API_KEY` | Your OpenAI key (optional) | Production |
| `NODE_ENV` | `production` | Production |

### Step 4: Update Frontend API URL
Update `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://YOUR-PROJECT-NAME.vercel.app/api'  // Update this!
  : 'http://localhost:5000/api';
```

### Step 5: Update CORS Origins
Update `api/serverless.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://YOUR-PROJECT-NAME.vercel.app']  // Update this!
    : ['http://localhost:3000'],
  // ...
}));
```

### Step 6: Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete (3-5 minutes)
3. Note your deployment URL

## Post-Deployment Verification

### Testing Checklist

#### Public Site
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Images display correctly
- [ ] Portfolio items load
- [ ] Contact form submits
- [ ] Responsive on mobile

#### CMS Access
- [ ] Navigate to `/cms/login`
- [ ] Login with admin credentials
- [ ] Dashboard loads

#### CMS Operations
- [ ] Create test portfolio item
- [ ] Upload image
- [ ] Edit item
- [ ] Delete item
- [ ] Check all sections

#### API Health
- [ ] Visit `/api/health`
- [ ] Should return success message

### Common Issues

#### Issue: API calls failing
**Solution**: Check API_BASE_URL in frontend matches your Vercel URL

#### Issue: Cannot login to CMS
**Solution**: Verify ADMIN_EMAIL and ADMIN_PASSWORD environment variables

#### Issue: Images not uploading
**Solution**: Check Cloudinary credentials are correct

#### Issue: MongoDB connection error
**Solution**: Verify MongoDB URI and IP whitelist includes `0.0.0.0/0`

## Custom Domain Setup (Optional)

### Adding Custom Domain
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `portfolio.yourdomain.com`)
3. Update DNS records:
   - **A Record**: Point to Vercel's IP
   - **CNAME**: Point to `cname.vercel-dns.com`

### Update After Domain Setup
1. Update CORS origins in `api/serverless.js`
2. Update API_BASE_URL in frontend
3. Redeploy

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable 2FA on GitHub account
- [ ] Enable 2FA on Vercel account
- [ ] Monitor MongoDB Atlas security alerts
- [ ] Review Cloudinary security settings
- [ ] Set OpenAI usage limits

## Monitoring & Maintenance

### Weekly Tasks
- [ ] Check contact form submissions
- [ ] Review Vercel Analytics
- [ ] Monitor MongoDB Atlas metrics

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review error logs
- [ ] Check Cloudinary usage
- [ ] Backup database

## Useful Commands

```bash
# View deployment logs
vercel logs

# List environment variables
vercel env ls

# Add environment variable
vercel env add

# Redeploy
vercel --prod

# Rollback to previous deployment
vercel rollback
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

---

**Remember**: Never commit `.env` files to GitHub. Always use Vercel's environment variables for sensitive data.
