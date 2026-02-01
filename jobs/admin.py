from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Job, Application, Category

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_employer', 'is_seeker', 'phone', 'company_name')}),
    )
    list_display = UserAdmin.list_display + ('is_employer', 'is_seeker', 'company_name')

admin.site.register(User, CustomUserAdmin)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'created_at', 'is_active')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('is_active', 'created_at', 'category')
    search_fields = ('title', 'description', 'employer__username')

admin.site.register(Category)
admin.site.register(Application)
