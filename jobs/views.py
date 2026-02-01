from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from .models import Job, Application, Category
from .forms import JobForm, ApplicationForm, JobFilterForm

# Mixins for Role Access
class EmployerRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_employer

class SeekerRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and (self.request.user.is_seeker or not self.request.user.is_employer)

# Generic Views

class HomeView(ListView):
    model = Job
    template_name = 'jobs/home.html'
    context_object_name = 'jobs'
    paginate_by = 10

    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True).order_by('-created_at')
        
        # Simple search logic
        query = self.request.GET.get('query')
        location = self.request.GET.get('location')
        category = self.request.GET.get('category')

        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(employer__company_name__icontains=query))
        if location:
            queryset = queryset.filter(location__icontains=location)
        if category:
            queryset = queryset.filter(category__slug=category)
            
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        # Keep filter values in search bar
        context['current_query'] = self.request.GET.get('query', '')
        context['current_location'] = self.request.GET.get('location', '')
        context['current_category'] = self.request.GET.get('category', '')
        return context

class JobDetailView(DetailView):
    model = Job
    template_name = 'jobs/job_detail.html'
    context_object_name = 'job'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context['has_applied'] = Application.objects.filter(job=self.object, applicant=self.request.user).exists()
        return context

from .utils import extract_text_from_pdf

class ApplyJobView(LoginRequiredMixin, CreateView):
    model = Application
    form_class = ApplicationForm
    template_name = 'jobs/apply_job.html'

    def form_valid(self, form):
        job = get_object_or_404(Job, slug=self.kwargs['slug'])
        
        # Prevent duplicates
        if Application.objects.filter(job=job, applicant=self.request.user).exists():
            messages.warning(self.request, "You have already applied for this job.")
            return redirect('job_detail', slug=job.slug)

        form.instance.job = job
        form.instance.applicant = self.request.user
        
        if 'resume' in self.request.FILES:
            resume_file = self.request.FILES['resume']
            if resume_file.name.endswith('.pdf'):
                parsed_text = extract_text_from_pdf(resume_file)
                form.instance.parsed_text = parsed_text
        
        # Save first to get the ID/object
        response = super().form_valid(form)
        
        # Send Email Notifications
        try:
            # 1. To Applicant
            send_mail(
                subject=f'Application Received: {job.title}',
                message=f'Hi {self.request.user.username},\n\nWe have received your application for {job.title} at {job.employer.company_name}.\n\nGood luck!',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.request.user.email],
                fail_silently=True,
            )
            
            # 2. To Employer
            send_mail(
                subject=f'New Applicant for {job.title}',
                message=f'Hello {job.employer.username},\n\n{self.request.user.username} has just applied for {job.title}. Check your dashboard to review their resume.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[job.employer.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email Error: {e}")

        messages.success(self.request, "Application submitted successfully!")
        return response

    def get_success_url(self):
        return reverse_lazy('job_detail', kwargs={'slug': self.kwargs['slug']})

# Employer Views

class EmployerDashboardView(EmployerRequiredMixin, ListView):
    model = Job
    template_name = 'jobs/employer_dashboard.html'
    context_object_name = 'jobs'

    def get_queryset(self):
        return Job.objects.filter(employer=self.request.user).order_by('-created_at')

class PostJobView(EmployerRequiredMixin, CreateView):
    model = Job
    form_class = JobForm
    template_name = 'jobs/post_job.html'
    success_url = reverse_lazy('employer_dashboard')

    def form_valid(self, form):
        form.instance.employer = self.request.user
        messages.success(self.request, "Job posted successfully!")
        return super().form_valid(form)

class UpdateJobView(EmployerRequiredMixin, UpdateView):
    model = Job
    form_class = JobForm
    template_name = 'jobs/post_job.html'
    success_url = reverse_lazy('employer_dashboard')
    
    def get_queryset(self):
        # Ensure user owns the job
        return super().get_queryset().filter(employer=self.request.user)

class JobApplicationsView(EmployerRequiredMixin, ListView):
    model = Application
    template_name = 'jobs/job_applications.html'
    context_object_name = 'applications'

    def get_queryset(self):
        job = get_object_or_404(Job, start_user=self.request.user, slug=self.kwargs['slug'])
        return Application.objects.filter(job=job).order_by('-applied_at')

from django.http import JsonResponse

def job_autocomplete(request):
    term = request.GET.get('term', '')
    results = {'titles': [], 'locations': []}
    if term:
        # Search distinct titles
        titles = Job.objects.filter(title__icontains=term).values_list('title', flat=True).distinct()[:5]
        # Search distinct locations
        locations = Job.objects.filter(location__icontains=term).values_list('location', flat=True).distinct()[:5]
        
        results['titles'] = list(titles)
        results['locations'] = list(locations)
    
    return JsonResponse(results)
