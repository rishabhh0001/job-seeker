# Deployment Guide

## Vercel Deployment

This application is deployed on Vercel and requires specific environment variables to function correctly.

### Required Environment Variables

#### `DATABASE_URL`

**Required**: Yes  
**Type**: PostgreSQL Connection String  
**Format**: `postgres://user:password@host/database?sslmode=require`

This application uses [Neon Database](https://neon.tech) (PostgreSQL) for data storage. The Next.js API routes in `app/api/` connect to the database using the `@neondatabase/serverless` package.

**How to configure in Vercel:**

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon database connection string
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**
7. Redeploy your application (Vercel will automatically trigger a new deployment)

### Getting Your Database URL

If you're using Neon Database:

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Navigate to **Dashboard**
4. Copy the connection string from the **Connection Details** section
5. Make sure to select **Pooled connection** for better performance

The connection string should look like:
```
postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### Verifying the Deployment

After configuring the environment variables:

1. **Check Deployment Logs**: Go to your Vercel project → **Deployments** → Click on the latest deployment → View **Function Logs**
2. **Test API Endpoints**: Visit your deployed site and check the browser console for any API errors
3. **Database Connection**: The `/api/applications` endpoint should return data without 500 errors

### Common Issues

#### 500 Error on API Routes

**Cause**: Missing or invalid `DATABASE_URL`  
**Solution**: Verify the environment variable is set correctly in Vercel and redeploy

#### Database Connection Timeout

**Cause**: Database is sleeping (Neon free tier)  
**Solution**: Wait a few seconds and retry. Consider upgrading to a paid plan for always-on databases.

#### CORS Errors

**Cause**: API routes being called from unauthorized domains  
**Solution**: Check your Vercel project settings and ensure the domain is configured correctly

### Local Development

To run the application locally:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your database URL to `.env.local`:
   ```
   DATABASE_URL=your_neon_database_url_here
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Build Commands

Vercel automatically detects Next.js and uses these commands:

- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

No custom configuration needed.

### Static Files

- Favicon is located at `app/favicon.ico` and automatically served by Next.js
- Other static assets should be placed in the `public/` directory
