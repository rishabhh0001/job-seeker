import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the parent directory (project root) to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')

try:
    # Initialize Django
    import django
    django.setup()
    
    # Get the WSGI application
    app = get_wsgi_application()
except Exception as e:
    print(f"Error initializing Django application: {e}")
    import traceback
    traceback.print_exc()
    
    error_msg = str(e)
    # Create a simple error response app for debugging
    def error_app(environ, start_response):
        status = '500 Internal Server Error'
        headers = [('Content-type', 'text/plain')]
        start_response(status, headers)
        return [f"Django initialization error: {error_msg}".encode('utf-8')]
    
    app = error_app
