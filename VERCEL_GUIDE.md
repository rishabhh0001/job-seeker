# Deploying to Vercel (Modern Zero-Config)

This project uses the modern Vercel Zero Config setup with a custom build script.

## 1. Prerequisites
- A Vercel Account
- GitHub Repository with this code pushed.

## 2. Configuration Files (Already Created)
- `vercel.json`: Handles routing to `api/index.py`.
- `build_files.sh`: Automates dependency installation, migrations, and static file collection.
- `api/index.py`: The WSGI entry point for Vercel.

## 3. Deployment Steps

1. **Import Project**: Go to Vercel Dashboard -> Add New Project -> Import from GitHub.
2. **Configure Project Settings** (Important!):
   - **Framework Preset**: select "Other" (or Django if available, but manual settings below are key).
   - **Build Command**: `sh build_files.sh`
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

## 4. Troubleshooting
- If the build fails, check the "Build Logs" in Vercel.
- ensure `build_files.sh` is executable (usually fine on Vercel Linux environment).
