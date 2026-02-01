# build_files.sh
echo "Building project..."
pip install -r requirements.txt

# Make migrations
echo "Running Migrations..."
python manage.py makemigrations
python manage.py migrate

# Collect Static
echo "Collecting Static..."
python manage.py collectstatic --noinput --clear

echo "Build End"
