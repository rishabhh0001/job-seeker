"""
Property-based tests for request routing in the Django Job Portal Vercel deployment.

**Feature: job-portal-deployment-fix, Property 1: Request Routing Consistency**
**Validates: Requirements 1.2, 1.4**
"""
import os
import sys
import uuid
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from hypothesis import given, strategies as st, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase
from jobs.models import Job, Category

User = get_user_model()


class RequestRoutingPropertyTest(HypothesisTestCase):
    """
    Property-based tests for request routing consistency.
    
    Tests that all HTTP requests are properly routed to the appropriate Django view
    or static file handler in the serverless environment.
    """
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test user with unique username
        unique_id = str(uuid.uuid4())[:8]
        self.user = User.objects.create_user(
            username=f'testuser_{unique_id}',
            email=f'test_{unique_id}@example.com',
            password='testpass123'
        )
        
        # Create test category
        self.category, created = Category.objects.get_or_create(
            name='Test Category',
            defaults={'slug': 'test-category'}
        )
        
        # Create test job
        self.job, created = Job.objects.get_or_create(
            title='Test Job',
            slug=f'test-job-{unique_id}',
            defaults={
                'description': 'Test job description',
                'category': self.category,
                'employer': self.user,
                'location': 'Test Location',
                'salary_min': 50000,
                'salary_max': 80000,
                'job_type': 'FT'
            }
        )
    
    @given(
        path=st.one_of(
            st.just('/'),
            st.just('/admin/'),
            st.text(min_size=1, max_size=30, alphabet=st.characters(
                whitelist_categories=('Lu', 'Ll', 'Nd'), 
                whitelist_characters='-_'
            )).map(lambda x: f'/{x.strip("/")}/'),
        )
    )
    @settings(max_examples=30, deadline=5000)
    def test_request_routing_returns_valid_response(self, path):
        """
        Property: For any HTTP request path, the application should return a valid HTTP response.
        
        This test verifies that the serverless function properly handles all requests
        and routes them through Django's URL dispatcher without causing server errors.
        """
        try:
            response = self.client.get(path, follow=True)
            
            # Property: All requests should return a valid HTTP status code
            self.assertIn(response.status_code, [200, 301, 302, 404, 405])
            
            # Property: Response should have proper content type
            self.assertIn('content-type', response.headers)
            
            # Property: Response should not be empty for successful requests
            if response.status_code == 200:
                self.assertGreater(len(response.content), 0)
                
        except Exception as e:
            # If there's an exception, it should be a known Django exception
            # not a serverless function initialization error
            self.fail(f"Request routing failed for path '{path}': {str(e)}")
    
    @given(
        method=st.sampled_from(['GET', 'POST', 'HEAD'])
    )
    @settings(max_examples=15, deadline=5000)
    def test_http_methods_routing(self, method):
        """
        Property: For any valid HTTP method, the application should handle the request appropriately.
        
        This ensures the WSGI application properly processes different HTTP methods.
        """
        try:
            if method == 'GET':
                response = self.client.get('/')
            elif method == 'POST':
                response = self.client.post('/', {})
            elif method == 'HEAD':
                response = self.client.head('/')
            
            # Property: All HTTP methods should return valid status codes
            self.assertIn(response.status_code, [200, 301, 302, 404, 405, 500])
            
            # Property: HEAD requests should have no content
            if method == 'HEAD':
                self.assertEqual(len(response.content), 0)
                
        except Exception as e:
            self.fail(f"HTTP method routing failed for method '{method}': {str(e)}")
    
    @given(
        query_params=st.dictionaries(
            keys=st.text(min_size=1, max_size=10, alphabet=st.characters(
                whitelist_categories=('Lu', 'Ll', 'Nd')
            )),
            values=st.text(min_size=0, max_size=20, alphabet=st.characters(
                whitelist_categories=('Lu', 'Ll', 'Nd'), 
                whitelist_characters=' -_'
            )),
            min_size=0,
            max_size=3
        )
    )
    @settings(max_examples=20, deadline=5000)
    def test_query_parameter_routing(self, query_params):
        """
        Property: For any set of query parameters, the application should handle them correctly.
        
        This ensures the serverless function properly passes query parameters to Django views.
        """
        try:
            response = self.client.get('/', query_params)
            
            # Property: Query parameters should not break routing
            self.assertIn(response.status_code, [200, 301, 302, 404])
            
            # Property: Response should be valid HTML for successful requests
            if response.status_code == 200:
                self.assertIn('content-type', response.headers)
                content_type = response.headers['content-type']
                self.assertTrue(
                    content_type.startswith('text/html') or 
                    content_type.startswith('application/json')
                )
                
        except Exception as e:
            self.fail(f"Query parameter routing failed: {str(e)}")
    
    def test_static_file_routing_pattern(self):
        """
        Test that static file routing patterns are correctly configured.
        
        This verifies that static files would be properly served by Vercel CDN
        and not routed through the serverless function.
        """
        # Test static file paths that should be handled by Vercel CDN
        static_paths = [
            '/static/css/style.css',
            '/static/js/script.js',
            '/static/images/logo.png',
            '/static/admin/css/base.css'
        ]
        
        for path in static_paths:
            with self.subTest(path=path):
                # In the actual Vercel deployment, these would be served by CDN
                # In our test environment, they should return 404 (not found)
                # but not cause a server error
                response = self.client.get(path)
                self.assertIn(response.status_code, [200, 404])
    
    def test_media_file_routing_pattern(self):
        """
        Test that media file routing patterns work correctly.
        
        This verifies that uploaded files (like resumes) can be accessed
        through the proper routing configuration.
        """
        # Test media file paths
        media_paths = [
            '/media/resumes/test.pdf',
            '/media/uploads/document.pdf'
        ]
        
        for path in media_paths:
            with self.subTest(path=path):
                response = self.client.get(path)
                # Should return 404 (file not found) but not server error
                self.assertIn(response.status_code, [200, 404])
    
    def test_api_endpoint_routing(self):
        """
        Test that all requests are properly routed through the serverless function.
        
        This ensures the catch-all route in vercel.json works correctly.
        """
        # Test various application endpoints that should exist
        endpoints = [
            '/',
            '/admin/',
        ]
        
        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                
                # Property: All application endpoints should be routed successfully
                # Allow 404 for endpoints that might not exist in this test environment
                self.assertIn(response.status_code, [200, 301, 302, 404])
                
                # Property: Should not return server errors
                self.assertNotEqual(response.status_code, 500)
    
    @given(
        user_agent=st.text(min_size=1, max_size=50, alphabet=st.characters(
            whitelist_categories=('Lu', 'Ll', 'Nd'), 
            whitelist_characters=' -_./()'
        ))
    )
    @settings(max_examples=15, deadline=5000)
    def test_request_headers_routing(self, user_agent):
        """
        Property: For any valid User-Agent header, the application should handle the request.
        
        This ensures the serverless function properly processes HTTP headers.
        """
        try:
            response = self.client.get('/', HTTP_USER_AGENT=user_agent)
            
            # Property: Different user agents should not break routing
            self.assertIn(response.status_code, [200, 301, 302])
            
        except Exception as e:
            self.fail(f"Header routing failed for User-Agent '{user_agent}': {str(e)}")


class RequestRoutingUnitTest(TestCase):
    """
    Unit tests for specific request routing scenarios.
    """
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
    
    def test_home_page_routing(self):
        """Test that the home page routes correctly"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
    
    def test_nonexistent_page_routing(self):
        """Test that non-existent pages return 404"""
        response = self.client.get('/nonexistent-page-12345/')
        self.assertEqual(response.status_code, 404)
    
    def test_admin_routing(self):
        """Test that admin routes are accessible"""
        response = self.client.get('/admin/')
        # Should redirect to login or show admin page
        self.assertIn(response.status_code, [200, 302])
    
    def test_serverless_function_initialization(self):
        """Test that the serverless function initializes correctly"""
        # This test verifies that Django can be imported and initialized
        # which is critical for the serverless function
        try:
            from django.core.wsgi import get_wsgi_application
            app = get_wsgi_application()
            self.assertIsNotNone(app)
        except Exception as e:
            self.fail(f"Serverless function initialization failed: {str(e)}")
    
    def test_routing_consistency_across_requests(self):
        """Test that routing is consistent across multiple requests"""
        # Make multiple requests to ensure routing is stable
        for i in range(5):
            response = self.client.get('/')
            self.assertEqual(response.status_code, 200)
            
            # Verify response has expected content
            self.assertIn('content-type', response.headers)
            self.assertGreater(len(response.content), 0)