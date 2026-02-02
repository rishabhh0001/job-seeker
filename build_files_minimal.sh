#!/bin/bash
echo "Building project with minimal dependencies..."

# Install only essential dependencies
pip install -r requirements-minimal.txt

# Make migrations
echo "Running Migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

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