from django.core.management.base import BaseCommand
from django.utils.text import slugify
from jobs.models import Job, Category, User
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seeds the database with dummy job listings'

    def handle(self, *args, **kwargs):
        fake = Faker()
        
        # 1. Create/Get Employer User
        employer, created = User.objects.get_or_create(
            username='meta_employer',
            email='employer@meta.com',
            defaults={
                'is_employer': True,
                'company_name': 'Meta Inc.',
                'is_staff': False
            }
        )
        if created:
            employer.set_password('testpass123')
            employer.save()
            self.stdout.write(self.style.SUCCESS('Created employer user: meta_employer'))

        # 2. Create Categories
        categories = ['Development', 'Design', 'Marketing', 'Sales', 'Finance']
        cat_objects = []
        for cat_name in categories:
            cat, _ = Category.objects.get_or_create(name=cat_name, slug=slugify(cat_name))
            cat_objects.append(cat)
        
        # 3. Create Dummy Jobs
        titles = ['Senior Python Developer', 'UX/UI Designer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Frontend React Dev', 'Marketing Lead']
        locations = ['New York, NY', 'San Francisco, CA', 'Remote', 'London, UK', 'Berlin, DE']
        
        self.stdout.write('Generating 20 dummy jobs...')
        
        for _ in range(20):
            title = random.choice(titles)
            salary_min = random.randint(60000, 120000)
            salary_max = salary_min + random.randint(10000, 50000)
            
            job = Job.objects.create(
                employer=employer,
                title=f"{title} - {fake.word().capitalize()}",
                description=fake.paragraph(nb_sentences=10),
                location=random.choice(locations),
                salary_min=salary_min,
                salary_max=salary_max,
                category=random.choice(cat_objects),
                job_type=random.choice(['FT', 'PT', 'CT', 'FL', 'IN']),
                slug=slugify(f"{title} {fake.uuid4()[:8]}")
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {Job.objects.count()} jobs!'))
