from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django_cap import views as cap_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    
    # Fix for Cap.js: Allow endpoints without trailing slash to prevent 301 Redirect (POST -> GET)
    path('cap/v1/challenge', cap_views.create_challenge, name="cap_create_challenge_no_slash"),
    path('cap/v1/redeem', cap_views.redeem_challenge, name="cap_redeem_challenge_no_slash"),
    path('cap/v1/validate', cap_views.validate_token, name="cap_validate_token_no_slash"),
    path('cap/', include('django_cap.urls')),
    
    path('', include('jobs.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
