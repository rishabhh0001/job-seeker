from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Job, Application, Category

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('User Type', {'fields': ('is_employer', 'is_seeker')}),
        ('Additional Info', {'fields': ('phone', 'company_name')}),
    )
    list_display = ('username', 'email', 'is_employer', 'is_seeker', 'company_name', 'is_active', 'date_joined')
    list_filter = ('is_employer', 'is_seeker', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'company_name', 'first_name', 'last_name')
    ordering = ('-date_joined',)

admin.site.register(User, CustomUserAdmin)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'job_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    ordering = ('name',)
    
    def job_count(self, obj):
        return obj.jobs.count()
    job_count.short_description = 'Number of Jobs'

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer_name', 'category', 'job_type', 'location', 'is_active', 'created_at', 'application_count')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('is_active', 'job_type', 'category', 'created_at')
    search_fields = ('title', 'description', 'employer__username', 'employer__company_name', 'location')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'slug')
    
    fieldsets = (
        ('Job Information', {
            'fields': ('title', 'slug', 'employer', 'category', 'description')
        }),
        ('Job Details', {
            'fields': ('job_type', 'location', 'salary_min', 'salary_max')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def employer_name(self, obj):
        return obj.employer.company_name or obj.employer.username
    employer_name.short_description = 'Employer'
    employer_name.admin_order_field = 'employer__company_name'
    
    def application_count(self, obj):
        count = obj.applications.count()
        if count > 0:
            return format_html('<strong>{}</strong>', count)
        return count
    application_count.short_description = 'Applications'

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant_name', 'job_title', 'status', 'applied_at', 'has_resume')
    list_filter = ('status', 'applied_at', 'job__category')
    search_fields = ('applicant__username', 'applicant__email', 'job__title', 'cover_letter')
    date_hierarchy = 'applied_at'
    ordering = ('-applied_at',)
    readonly_fields = ('applied_at', 'parsed_text_preview')
    
    fieldsets = (
        ('Application Info', {
            'fields': ('job', 'applicant', 'status')
        }),
        ('Documents', {
            'fields': ('resume', 'cover_letter')
        }),
        ('Parsed Resume', {
            'fields': ('parsed_text_preview',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('applied_at',),
            'classes': ('collapse',)
        }),
    )
    
    def applicant_name(self, obj):
        return obj.applicant.get_full_name() or obj.applicant.username
    applicant_name.short_description = 'Applicant'
    applicant_name.admin_order_field = 'applicant__username'
    
    def job_title(self, obj):
        return obj.job.title
    job_title.short_description = 'Job'
    job_title.admin_order_field = 'job__title'
    
    def has_resume(self, obj):
        if obj.resume:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    has_resume.short_description = 'Resume'
    
    def parsed_text_preview(self, obj):
        if obj.parsed_text:
            preview = obj.parsed_text[:500]
            if len(obj.parsed_text) > 500:
                preview += '...'
            return format_html('<pre>{}</pre>', preview)
        return 'No parsed text available'
    parsed_text_preview.short_description = 'Parsed Resume Text'

# Customize admin site header and title
admin.site.site_header = "Job Portal Administration"
admin.site.site_title = "Job Portal Admin"
admin.site.index_title = "Welcome to Job Portal Admin"
