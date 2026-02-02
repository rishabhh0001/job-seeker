
# Vercel Deployment Guide

Your Django Job Portal is optimized for Vercel. Follow these steps to deploy successfully.

## 1. Environment Variables
You MUST set these environment variables in your Vercel Project Settings:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SECRET_KEY` | Django Secret Key | `django-insecure-...` (Generate a new reliable one) |
| `DEBUG` | Debug Mode | `False` |
| `ALLOWED_HOSTS` | Allowed Domains | `.vercel.app,.now.sh,your-custom-domain.com` |
| `DATABASE_URL` | Postgres Connection String | `postgres://user:pass@host:port/dbname` |
| `CSRF_TRUSTED_ORIGINS` | Trusted Origins for CSRF | `https://your-project.vercel.app` |
| `EMAIL_HOST` | SMTP Host | `smtp.gmail.com` |
| `EMAIL_HOST_USER` | SMTP User | `your-email@gmail.com` |
| `EMAIL_HOST_PASSWORD` | SMTP Password | `your-app-password` |

## 2. Database
- Use a cloud Postgres database (e.g. Neon, Supabase, Railway).
- The application will **fallback to SQLite** if no `DATABASE_URL` is provided, but SQLite data is **ephemeral** on Vercel (it resets on every deployment).
- **CRITICAL**: For persistent data (Users, Jobs), you MUST use a Postgres database.

## 3. File Uploads (Resumes)
- By default, uploaded files are processed in-memory for text extraction.
- **WARNING**: Resume files themselves are **NOT SAVED PERMANENTLY** on Vercel's file system.
- The AI Text Extraction will works and save the *text* to the database.
- To save the actual files, you must configure AWS S3 or Cloudinary and update `settings.py`.

## 4. Deployment
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Vercel should automatically detect the configuration.
4. Add the Environment Variables properly.
5. Deploy!

## 5. Verification
- Visit `/health/` to check database connection.
- Visit `/api/autocomplete/?term=dev` to check API functionality.
- Try searching on the homepage to verify Autocomplete.
