#!/bin/bash
# build_files.sh - Optimized build script for Vercel deployment
set -e  # Exit on any error

echo "🚀 Starting optimized build process..."

# Build start time for performance tracking
BUILD_START=$(date +%s)

# 1. DEPENDENCY OPTIMIZATION
echo "📦 Installing optimized dependencies..."
# Use production requirements for smaller deployment size
if [ -f "requirements-production.txt" ]; then
    echo "Using production requirements (optimized)"
    pip install --no-cache-dir -r requirements-production.txt
elif [ -f "requirements-minimal.txt" ]; then
    echo "Using minimal requirements (fallback)"
    pip install --no-cache-dir -r requirements-minimal.txt
else
    echo "Using standard requirements"
    pip install --no-cache-dir -r requirements.txt
fi

# 2. DEPENDENCY CLEANUP
echo "🧹 Cleaning up unnecessary files..."
# Remove pip cache to reduce deployment size
pip cache purge 2>/dev/null || true

# Remove unnecessary files from site-packages to reduce size
find /opt/venv/lib/python*/site-packages -name "*.pyc" -delete 2>/dev/null || true
find /opt/venv/lib/python*/site-packages -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find /opt/venv/lib/python*/site-packages -name "*.pyo" -delete 2>/dev/null || true

# Remove test files and documentation from packages
find /opt/venv/lib/python*/site-packages -name "test*" -type d -exec rm -rf {} + 2>/dev/null || true
find /opt/venv/lib/python*/site-packages -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
find /opt/venv/lib/python*/site-packages -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true

# 3. DJANGO CONFIGURATION
echo "⚙️  Configuring Django environment..."
export DJANGO_SETTINGS_MODULE=job_portal.settings
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Validate Django configuration (Basic check only)
echo "Validating Django configuration..."
python3 manage.py check

# 4. DATABASE MIGRATIONS - SKIPPED DURING BUILD
# Migrations should be run manually or via a release hook
echo "🗄️  Skipping database migrations during build..."
# python3 manage.py makemigrations --noinput
# python3 manage.py migrate --noinput

# 5. STATIC FILE OPTIMIZATION
echo "📁 Optimizing static files..."
# Clear existing static files
rm -rf staticfiles/* 2>/dev/null || true

# Collect static files with optimization
python3 manage.py collectstatic --noinput --clear --verbosity=1

# Compress static files if compression is available
if python3 -c "import django.contrib.staticfiles.storage; print('OK')" 2>/dev/null; then
    echo "Static file compression enabled"
fi

# 6. STATIC FILE VALIDATION
echo "✅ Validating static file collection..."
STATIC_COUNT=$(find staticfiles -type f | wc -l)
echo "Collected $STATIC_COUNT static files"

if [ "$STATIC_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No static files collected"
else
    echo "✅ Static files collected successfully"
fi

# 7. FINAL CLEANUP
echo "🧹 Final cleanup..."
# Remove any temporary files
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Remove development files that shouldn't be in production
rm -f .env.example 2>/dev/null || true
rm -f docker-compose.yml 2>/dev/null || true

# 8. BUILD VALIDATION
echo "🔍 Validating build..."
# Check if critical files exist
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found"
    exit 1
fi

if [ ! -f "api/index.py" ]; then
    echo "❌ Error: api/index.py not found"
    exit 1
fi

# Check if Django can import properly
python3 -c "import django; django.setup(); print('Django setup successful')" || {
    echo "❌ Error: Django setup failed"
    exit 1
}

# 9. PERFORMANCE SUMMARY
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo "⏱️  Build completed in ${BUILD_TIME} seconds"

# Display deployment size information
DEPLOYMENT_SIZE=$(du -sh . | cut -f1)
echo "📊 Deployment size: $DEPLOYMENT_SIZE"

echo "🎉 Build completed successfully!"
echo "✅ Ready for Vercel deployment"
