from django.core.management.base import BaseCommand
from jobs.models import User, Job, Category, Application
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seeds database with dummy data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Create Categories
        categories = ['Development', 'Design', 'Marketing', 'Sales', 'Finance', 'HR']
        cat_objs = []
        for cat_name in categories:
            cat, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'slug': cat_name.lower()}
            )
            cat_objs.append(cat)
        
        self.stdout.write(f'Created {len(cat_objs)} categories.')

        # 2. Create Employers
        employers = [
            {'username': 'techcorp', 'company': 'TechCorp Inc.', 'email': 'hr@techcorp.com'},
            {'username': 'designstudio', 'company': 'Creative Studio', 'email': 'jobs@designstudio.com'},
            {'username': 'fintech_solutions', 'company': 'FinPath', 'email': 'careers@finpath.com'},
            {'username': 'startuphub', 'company': 'Startup Hub', 'email': 'hello@startuphub.io'},
        ]
        
        employer_objs = []
        for emp_data in employers:
            user, created = User.objects.get_or_create(
                username=emp_data['username'],
                defaults={
                    'email': emp_data['email'],
                    'is_employer': True,
                    'company_name': emp_data['company'],
                    # 'location': 'Remote' # User model has no location field
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            employer_objs.append(user)

        self.stdout.write(f'Created {len(employer_objs)} employers.')

        # 3. Create Seekers (Applicants)
        seekers = [
            {'username': 'john_doe', 'email': 'john@example.com'},
            {'username': 'jane_smith', 'email': 'jane@example.com'},
            {'username': 'mike_dev', 'email': 'mike@dev.com'},
        ]
        
        seeker_objs = []
        for seek_data in seekers:
            user, created = User.objects.get_or_create(
                username=seek_data['username'],
                defaults={
                    'email': seek_data['email'],
                    'is_employer': False, # Default is seeker per model logic usually, or implicit
                    'is_seeker': True
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            seeker_objs.append(user)
            
        self.stdout.write(f'Created {len(seeker_objs)} seekers.')

        # 4. Create Jobs
        job_titles = [
            'Senior Python Developer', 'Frontend Engineer (React)', 'UI/UX Designer',
            'Product Manager', 'Marketing Specialist', 'Data Scientist',
            'DevOps Engineer', 'Sales Representative'
        ]
        
        job_types = ['FT', 'PT', 'CT', 'RM', 'IN'] # Full-time, Part-time, Contract, Remote, Internship
        
        created_jobs = []
        for title in job_titles:
            employer = random.choice(employer_objs)
            category = random.choice(cat_objs)
            
            job, created = Job.objects.get_or_create(
                title=title,
                employer=employer,
                defaults={
                    'description': f'We are looking for a talented {title} to join our team usually...',
                    'location': employer.location,
                    'job_type': random.choice(job_types),
                    'category': category,
                    'salary_min': random.randint(50000, 80000),
                    'salary_max': random.randint(90000, 150000),
                    'is_active': True,
                    'slug': title.lower().replace(' ', '-') + '-' + str(random.randint(1000, 9999))
                }
            )
            created_jobs.append(job)
            
        self.stdout.write(f'Created {len(created_jobs)} jobs.')
        
        # 5. Create Applications
        for job in created_jobs:
            # Randomly assign 0 to 3 applicants per job
            applicants = random.sample(seeker_objs, k=random.randint(0, len(seeker_objs)))
            for applicant in applicants:
                Application.objects.get_or_create(
                    job=job,
                    applicant=applicant,
                    defaults={
                        'cover_letter': 'I am very interested in this role.',
                        'status': random.choice(['pending', 'reviewed', 'accepted', 'rejected'])
                    }
                )
                
        self.stdout.write('Seeding complete!')
