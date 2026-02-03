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
    
    # Run migrations automatically on startup (for Vercel)
    # Only run once per deployment using a module-level flag
    from django.core.management import call_command
    from django.db import connection
    from django.db.utils import OperationalError
    
    # Module-level flag to ensure migrations run only once
    if not hasattr(sys.modules[__name__], '_migrations_run'):
        try:
            # Check if database is accessible
            connection.ensure_connection()
            
            # Run migrations
            print("Running database migrations...")
            call_command('migrate', '--noinput', verbosity=0)
            print("Migrations completed successfully")
            
            # Set flag to prevent re-running
            setattr(sys.modules[__name__], '_migrations_run', True)
        except OperationalError as db_error:
            print(f"Database connection error: {db_error}")
            # Continue anyway - let Django handle the error
        except Exception as migration_error:
            print(f"Migration error (non-fatal): {migration_error}")
            # Continue anyway - migrations might already be applied
    
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
