#!/usr/bin/env python3
"""
Build Validation Script for Django Job Portal
Validates that the build process completed successfully and all components are working.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def print_status(message, status="INFO"):
    """Print formatted status message"""
    icons = {
        "INFO": "ℹ️",
        "SUCCESS": "✅",
        "ERROR": "❌",
        "WARNING": "⚠️"
    }
    print(f"{icons.get(status, 'ℹ️')} {message}")

def check_file_exists(filepath, description):
    """Check if a file exists and report status"""
    if Path(filepath).exists():
        print_status(f"{description} exists: {filepath}", "SUCCESS")
        return True
    else:
        print_status(f"{description} missing: {filepath}", "ERROR")
        return False

def check_directory_exists(dirpath, description):
    """Check if a directory exists and report status"""
    if Path(dirpath).exists() and Path(dirpath).is_dir():
        file_count = len(list(Path(dirpath).rglob('*')))
        print_status(f"{description} exists with {file_count} files: {dirpath}", "SUCCESS")
        return True
    else:
        print_status(f"{description} missing: {dirpath}", "ERROR")
        return False

def run_django_check():
    """Run Django system checks"""
    try:
        import os
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')
        
        print_status("Running Django system checks...")
        result = subprocess.run([
            sys.executable, "manage.py", "check", "--deploy"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print_status("Django system checks passed", "SUCCESS")
            return True
        else:
            print_status(f"Django system checks failed: {result.stderr}", "ERROR")
            return False
    except subprocess.TimeoutExpired:
        print_status("Django system checks timed out", "ERROR")
        return False
    except Exception as e:
        print_status(f"Error running Django checks: {e}", "ERROR")
        return False

def check_static_files():
    """Check static files collection"""
    staticfiles_dir = Path("staticfiles")
    if not staticfiles_dir.exists():
        print_status("Static files directory not found", "ERROR")
        return False
    
    # Count static files
    static_files = list(staticfiles_dir.rglob('*'))
    file_count = len([f for f in static_files if f.is_file()])
    
    if file_count == 0:
        print_status("No static files found", "ERROR")
        return False
    
    print_status(f"Found {file_count} static files", "SUCCESS")
    
    # Check for critical static files
    critical_files = [
        "admin/css/base.css",
        "admin/js/core.js"
    ]
    
    missing_files = []
    for file_path in critical_files:
        if not (staticfiles_dir / file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print_status(f"Missing critical static files: {missing_files}", "WARNING")
    else:
        print_status("All critical static files present", "SUCCESS")
    
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        ("django", "django"),
        ("whitenoise", "whitenoise"),
        ("psycopg2", "psycopg2"),
        ("pillow", "PIL"),  # Pillow imports as PIL
        ("pdfminer.six", "pdfminer")  # pdfminer.six imports as pdfminer
    ]
    
    missing_packages = []
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
            print_status(f"Package {package_name} is available", "SUCCESS")
        except ImportError:
            missing_packages.append(package_name)
            print_status(f"Package {package_name} is missing", "WARNING")
    
    if missing_packages:
        print_status(f"Missing packages: {missing_packages}", "WARNING")
        print_status("Some packages may not be needed for basic functionality", "INFO")
    
    return len(missing_packages) == 0

def check_django_import():
    """Test Django import and setup"""
    try:
        import os
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')
        
        import django
        from django.conf import settings
        django.setup()
        print_status(f"Django {django.get_version()} imported successfully", "SUCCESS")
        print_status(f"Settings module: {settings.SETTINGS_MODULE}", "INFO")
        return True
    except Exception as e:
        print_status(f"Django import failed: {e}", "ERROR")
        return False

def main():
    """Main validation function"""
    print_status("Starting build validation...")
    print("=" * 50)
    
    validation_results = []
    
    # Check critical files
    print_status("Checking critical files...")
    validation_results.append(check_file_exists("manage.py", "Django management script"))
    validation_results.append(check_file_exists("api/index.py", "Vercel WSGI entry point"))
    validation_results.append(check_file_exists("job_portal/settings.py", "Django settings"))
    validation_results.append(check_file_exists("vercel.json", "Vercel configuration"))
    
    # Check directories
    print_status("Checking directories...")
    validation_results.append(check_directory_exists("staticfiles", "Static files directory"))
    
    # Check dependencies
    print_status("Checking dependencies...")
    validation_results.append(check_dependencies())
    
    # Check Django setup
    print_status("Checking Django setup...")
    validation_results.append(check_django_import())
    validation_results.append(run_django_check())
    
    # Check static files
    print_status("Checking static files...")
    validation_results.append(check_static_files())
    
    # Summary
    print("=" * 50)
    passed_checks = sum(validation_results)
    total_checks = len(validation_results)
    
    if passed_checks == total_checks:
        print_status(f"All {total_checks} validation checks passed!", "SUCCESS")
        print_status("Build is ready for deployment", "SUCCESS")
        return 0
    else:
        failed_checks = total_checks - passed_checks
        print_status(f"{failed_checks} out of {total_checks} checks failed", "ERROR")
        print_status("Build validation failed", "ERROR")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)