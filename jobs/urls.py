from django.urls import path
from .views import (
    HomeView, JobDetailView, ApplyJobView, 
    EmployerDashboardView, PostJobView, UpdateJobView, JobApplicationsView,
    job_autocomplete
)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('job/<slug:slug>/', JobDetailView.as_view(), name='job_detail'),
    path('job/<slug:slug>/apply/', ApplyJobView.as_view(), name='apply_job'),
    
    # Employer URLs
    path('employer/dashboard/', EmployerDashboardView.as_view(), name='employer_dashboard'),
    path('employer/post-job/', PostJobView.as_view(), name='post_job'),
    path('employer/job/<slug:slug>/edit/', UpdateJobView.as_view(), name='update_job'),
    path('employer/job/<slug:slug>/applications/', JobApplicationsView.as_view(), name='job_applications'),
    
    # API
    path('api/autocomplete/', job_autocomplete, name='job_autocomplete'),
]
