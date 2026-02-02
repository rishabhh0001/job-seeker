#!/usr/bin/env python
"""
Simple test script to verify Django setup works correctly
"""
import os
import sys
import django

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')

try:
    django.setup()
    print("✅ Django setup successful")
    
    # Test database connection
    from django.db import connection
    cursor = connection.cursor()
    print("✅ Database connection successful")
    
    # Test models import
    from jobs.models import User, Job, Category, Application
    print("✅ Models import successful")
    
    # Test forms import
    from jobs.forms import UserRegistrationForm, JobForm, ApplicationForm
    print("✅ Forms import successful")
    
    # Test views import
    from jobs import views
    print("✅ Views import successful")
    
    print("\n🎉 All tests passed! Deployment should work.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)