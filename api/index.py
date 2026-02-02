import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')

try:
    app = get_wsgi_application()
except Exception as e:
    print(f"Error initializing Django application: {e}")
    import traceback
    traceback.print_exc()
    raise
