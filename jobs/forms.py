from django import forms
from .models import User, Job, Application
from allauth.account.forms import SignupForm
from django_cap.forms import CapField

class UserRegistrationForm(SignupForm):
    is_employer = forms.BooleanField(required=False, label="I am an Employer")
    company_name = forms.CharField(max_length=100, required=False, help_text="Required if you are an employer")
    captcha = CapField()

    def save(self, request):
        user = super(UserRegistrationForm, self).save(request)
        user.is_employer = self.cleaned_data.get('is_employer')
        user.company_name = self.cleaned_data.get('company_name')
        
        # If not employer, assume seeker (or can be explicit)
        if not user.is_employer:
            user.is_seeker = True
        
        user.save()
        return user

class JobForm(forms.ModelForm):
    class Meta:
        model = Job
        exclude = ['employer', 'slug', 'created_at', 'updated_at', 'is_active']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
        }

class ApplicationForm(forms.ModelForm):
    captcha = CapField()
    class Meta:
        model = Application
        fields = ['resume', 'cover_letter']
        widgets = {
            'cover_letter': forms.Textarea(attrs={'rows': 4}),
        }

class JobFilterForm(forms.Form):
    query = forms.CharField(required=False, label='Search', widget=forms.TextInput(attrs={'placeholder': 'Job title, keywords...'}))
    location = forms.CharField(required=False, widget=forms.TextInput(attrs={'placeholder': 'Location'}))
    # Category will be dynamically populated in view or use ModelChoiceField if possible
