# Deploying to Vercel

This project is configured for seamless deployment on Vercel.

## 1. Prerequisites
- A Vercel Account
- Optional: A PostgreSQL Database (e.g., Neon, Supabase) if you want persistent data. (The default config uses SQLite which resets on every deployment, suitable only for demos).

## 2. Configuration Files (Already Created)
- `vercel.json`: Defines the build process and Python runtime.
- `requirements.txt`: Lists all dependencies including `whitenoise` (static files) and `gunicorn`.
- `job_portal/settings.py`: Configured to read from environment variables.

## 3. Deployment Steps

### Method A: Using Vercel CLI (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run command:
   ```bash
   vercel
   ```
3. Follow the prompts.

### Method B: Git Integration
1. Push this project to GitHub/GitLab.
2. Import the project in Vercel Dashboard.
3. Vercel should auto-detect Django.

## 4. Environment Variables
Go to **Settings > Environment Variables** in your Vercel project and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DEBUG` | `False` | Turn off debug mode in production |
| `SECRET_KEY` | `<your-secret-key>` | Generate a strong random string |
| `DATABASE_URL` | `postgres://...` | (Optional) Connection string for real DB |

## 5. Build Command
In Vercel **Project Settings > General > Build & Development Settings**:
- **Build Command**: `python manage.py collectstatic --noinput && python manage.py migrate`
- **Output Directory**: `staticfiles` (or leave default if Vercel handles it)

## 6. Static Files
We use **Whitenoise** to serve static files directly from the application, ensuring CSS/JS works perfectly even on serverless platforms.
