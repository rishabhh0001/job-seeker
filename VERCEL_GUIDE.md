# Deploying to Vercel (Optimized for Size Limits)

This project uses an optimized Vercel setup to stay under the 250MB serverless function limit.

## 1. Prerequisites
- A Vercel Account
- GitHub Repository with this code pushed.

## 2. Configuration Files (Already Created)
- `vercel.json`: Handles routing and function configuration.
- `build_files_minimal.sh`: Optimized build script with minimal dependencies.
- `requirements-minimal.txt`: Essential dependencies only.
- `.vercelignore`: Excludes unnecessary files from deployment.
- `api/index.py`: The WSGI entry point for Vercel.

## 3. Deployment Steps

1. **Import Project**: Go to Vercel Dashboard -> Add New Project -> Import from GitHub.
2. **Configure Project Settings** (Important!):
   - **Framework Preset**: select "Other"
   - **Build Command**: `sh build_files_minimal.sh`
   - **Output Directory**: `staticfiles`
   - **Install Command**: (Leave Empty / Default)

3. **Environment Variables**:
   Add these in Settings > Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DEBUG` | `False` | Turn off debug mode in production |
| `SECRET_KEY` | `<your-secret-key>` | Generate a strong random string |
| `DATABASE_URL` | `postgres://...` | (Optional) Connection string for real DB |

4. **Deploy**: Click Deploy.

## 4. Size Optimization Features
- **Minimal Dependencies**: Only essential packages in `requirements-minimal.txt`
- **Excluded Heavy Packages**: Removed matplotlib, seaborn, numpy, pandas
- **Build Cleanup**: Removes .pyc files, __pycache__, and other unnecessary files
- **Vercel Ignore**: Excludes development files, media, and documentation
- **Simplified Admin**: Removed Jazzmin theme to reduce size

## 5. Troubleshooting
- If the build fails, check the "Build Logs" in Vercel.
- For size issues, ensure you're using `requirements-minimal.txt`
- If you need the removed packages, consider using them in separate API endpoints or microservices
