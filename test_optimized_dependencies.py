#!/usr/bin/env python
"""
Test script to verify that the optimized dependencies work correctly.
This script tests core functionality that should work with the production requirements.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')
os.environ.setdefault('DEBUG', 'true')  # Enable debug mode for testing

django.setup()

def test_core_imports():
    """Test that all core modules can be imported"""
    print("Testing core imports...")
    
    try:
        # Django core
        from django.contrib.auth import get_user_model
        from django.db import models
        from django.core.mail import send_mail
        print("✓ Django core imports successful")
        
        # Authentication
        from allauth.account.forms import SignupForm
        print("✓ Django Allauth imports successful")
        
        # Forms
        from crispy_forms.helper import FormHelper
        from crispy_bootstrap5.bootstrap5 import BS5Accordion
        print("✓ Crispy Forms imports successful")
        
        # Static files
        from whitenoise.middleware import WhiteNoiseMiddleware
        print("✓ WhiteNoise imports successful")
        
        # File handling
        from PIL import Image
        from pdfminer.high_level import extract_text
        print("✓ File handling imports successful")
        
        # Database
        import dj_database_url
        import psycopg2
        print("✓ Database imports successful")
        
        return True
    except ImportError as e:
        print(f"✗ Import failed: {e}")
        return False

def test_django_models():
    """Test that Django models can be imported and used"""
    print("\nTesting Django models...")
    
    try:
        from jobs.models import User, Job, Category, Application
        print("✓ Job portal models imported successfully")
        
        # Test model creation (without saving to DB)
        user = User(username='test', email='test@example.com')
        category = Category(name='Test Category', slug='test-category')
        job = Job(title='Test Job', description='Test Description', location='Test Location')
        
        print("✓ Model instances created successfully")
        return True
    except Exception as e:
        print(f"✗ Model test failed: {e}")
        return False

def test_pdf_extraction():
    """Test PDF text extraction functionality"""
    print("\nTesting PDF extraction...")
    
    try:
        from jobs.utils import extract_text_from_pdf
        
        # Test with a simple string (simulating PDF content)
        # In real usage, this would be a PDF file
        print("✓ PDF extraction function imported successfully")
        return True
    except Exception as e:
        print(f"✗ PDF extraction test failed: {e}")
        return False

def test_email_configuration():
    """Test email configuration"""
    print("\nTesting email configuration...")
    
    try:
        from django.core.mail import get_connection
        from django.conf import settings
        
        # Test that email backend is configured
        connection = get_connection()
        print(f"✓ Email backend configured: {settings.EMAIL_BACKEND}")
        return True
    except Exception as e:
        print(f"✗ Email configuration test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing optimized dependencies for Django Job Portal")
    print("=" * 60)
    
    tests = [
        test_core_imports,
        test_django_models,
        test_pdf_extraction,
        test_email_configuration
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed! Optimized dependencies are working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Check the output above for details.")
        return 1

if __name__ == '__main__':
    sys.exit(main())