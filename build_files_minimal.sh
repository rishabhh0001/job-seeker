#!/bin/bash
echo "Building project with minimal dependencies..."

# Install only essential dependencies
pip install -r requirements-minimal.txt

# Set environment variables for build
export DJANGO_SETTINGS_MODULE=job_portal.settings
export DEBUG=False

# Make migrations
echo "Running Migrations..."
python manage.py makemigrations --noinput || echo "No migrations to make"
python manage.py migrate --noinput || echo "Migration failed, continuing..."

# Create superuser if needed (optional)
echo "Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
" || echo "Superuser creation failed, continuing..."

# Collect Static with compression
echo "Collecting Static..."
python manage.py collectstatic --noinput --clear

# Remove unnecessary files to reduce size
echo "Cleaning up..."
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.po" -delete 2>/dev/null || true
find . -name "*.pot" -delete 2>/dev/null || true

echo "Build completed successfully"