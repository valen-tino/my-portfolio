# Vercel Deployment Troubleshooting Guide

## NS_BINDING_ABORTED Errors Fix

### Problem
API requests are being cancelled with NS_BINDING_ABORTED errors for:
- Portfolio data
- About data  
- Roles
- Tech tools
- Education

### Solutions

## 1. MongoDB Connection Issues

### Check MongoDB Atlas Settings:

1. **IP Whitelist**
   - Go to MongoDB Atlas > Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` to allow access from anywhere
   - Click "Confirm"

2. **Connection String**
   - Ensure your connection string includes the correct database name:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
   - Note the `/portfolio` part - this specifies the database name

3. **User Permissions**
   - Go to Database Access
   - Ensure your database user has "Read and write to any database" permissions

## 2. Vercel Environment Variables

### Verify in Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to Settings > Environment Variables
3. Ensure these are set correctly:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   ADMIN_EMAIL=your-email@example.com
   ADMIN_PASSWORD=your-password
   NODE_ENV=production
   ```

4. **IMPORTANT**: After adding/updating environment variables, you MUST redeploy:
   - Click on "Deployments" tab
   - Click the three dots menu on the latest deployment
   - Select "Redeploy"

## 3. Test Your API

### Quick Health Check:
Visit: `https://your-app.vercel.app/api/health`

You should see:
```json
{
  "success": true,
  "message": "API is running",
  "database": {
    "status": "connected",
    "mongoUri": "Set"
  },
  "env": {
    "hasMongoUri": true,
    "hasJwtSecret": true,
    "hasAdminEmail": true
  }
}
```

## 4. Debug Steps

### Step 1: Check Vercel Function Logs
```bash
vercel logs --follow
```

### Step 2: Check Browser Console
1. Open your deployed site
2. Open Developer Tools (F12)
3. Go to Network tab
4. Reload the page
5. Look for failed API calls and check:
   - Status code
   - Response headers
   - Error messages

### Step 3: Test Individual Endpoints
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test about endpoint
curl https://your-app.vercel.app/api/about

# Test portfolios endpoint  
curl https://your-app.vercel.app/api/portfolios
```

## 5. Common Fixes

### Fix 1: Redeploy with Clean Build
```bash
# From your local project
vercel --prod --force
```

### Fix 2: Clear Vercel Cache
1. In Vercel Dashboard
2. Settings > Advanced > Clear Cache
3. Redeploy

### Fix 3: Update API Base URL
If using a custom domain, update your frontend:

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://your-app.vercel.app/api' : 'http://localhost:5000/api');
```

## 6. MongoDB Atlas Specific Issues

### Network Access Configuration:
1. Sign in to MongoDB Atlas
2. Select your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Ensure the database name is included: `/portfolio`

### Common MongoDB Errors:

**Error**: "MongoNetworkError"
- **Fix**: Add `0.0.0.0/0` to IP whitelist

**Error**: "Authentication failed"
- **Fix**: Check username/password in connection string

**Error**: "MONGODB_URI environment variable is not set"
- **Fix**: Add MONGODB_URI to Vercel environment variables

## 7. Emergency Fallback

If nothing works, try this minimal test:

1. Create `api/test.js`:
```javascript
module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'API is working',
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    }
  });
};
```

2. Deploy and visit: `https://your-app.vercel.app/api/test`

If this works but other endpoints don't, the issue is likely MongoDB connection.

## Need More Help?

1. Check Vercel Status: https://vercel.com/status
2. MongoDB Atlas Status: https://status.mongodb.com/
3. Review deployment logs in Vercel Dashboard
4. Contact support with specific error messages
