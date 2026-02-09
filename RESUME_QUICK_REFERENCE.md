# Resume Feature - Quick Reference Guide

## 🚀 Quick Start

### For Job Seekers
1. Go to any job posting
2. Click **"Apply Now"**
3. Fill in name & email
4. Upload/enter resume:
   - Upload file (PDF/JSON/TXT)
   - Paste JSON data
   - Type resume text
5. (Optional) Add cover letter
6. Click **"Submit Application"**

### For Employers
1. Click **"Dashboard"** in navbar
2. Scroll to **"Recent Applications"**
3. Click job to expand
4. Click **"+"** to expand application
5. View resume content
6. Click Accept/Reject/Review

## 📁 Key Files

```
Resume Upload Feature:
├── /app/jobs/[slug]/apply/page.tsx        ← Apply form page
├── /components/resume-upload.tsx          ← Upload component
├── /components/applications-list.tsx      ← Applications display
├── /app/api/applications/route.ts         ← Submit/fetch applications
├── /app/api/parse-resume/route.ts         ← Parse resume file
└── /app/dashboard/page.tsx               ← Employer dashboard

Configuration:
├── /package.json                          ← Added pdf-parse
└── /public/sample-resume.json            ← Sample for testing

Documentation:
├── RESUME_UPLOAD_FEATURE.md              ← Full documentation
├── TESTING_RESUME_FEATURE.md             ← Testing guide
├── IMPLEMENTATION_SUMMARY.md             ← Architecture overview
└── RESUME_QUICK_REFERENCE.md            ← This file
```

## 🔧 API Endpoints

### Submit Application
```
POST /api/applications
Content-Type: multipart/form-data

Fields:
- jobSlug (required)
- applicantName (required)
- applicantEmail (required)
- resumeText or resumeJson (required)
- coverLetter (optional)

Response: { success: true, applicationId, message }
```

### Get Applications
```
GET /api/applications?jobSlug=job-slug

Response: { applications: [...] }
```

### Parse Resume
```
POST /api/parse-resume
Content-Type: multipart/form-data

Fields:
- file (required)
- fileType: 'pdf' | 'json' | 'text' (required)

Response: { success: true, type, data/text }
```

## 🛠 Component Usage

### ResumeUpload Component
```tsx
import { ResumeUpload, type ResumeData } from "@/components/resume-upload"

function MyForm() {
  const handleResumeLoad = (resume: ResumeData) => {
    console.log(resume.text || resume.data)
  }

  return <ResumeUpload onResumeLoad={handleResumeLoad} />
}
```

### ApplicationsList Component
```tsx
import { ApplicationsList } from "@/components/applications-list"

function Dashboard() {
  return <ApplicationsList jobSlug="senior-engineer" />
}
```

## 📊 Database Queries

### View Recent Applications
```sql
SELECT a.*, j.title 
FROM jobs_application a
JOIN jobs_job j ON j.id = a.job_id
ORDER BY a.applied_at DESC
LIMIT 10;
```

### Count Applications per Job
```sql
SELECT j.title, COUNT(a.id) as count
FROM jobs_job j
LEFT JOIN jobs_application a ON j.id = a.job_id
GROUP BY j.id, j.title;
```

### Find Applications by Status
```sql
SELECT * FROM jobs_application 
WHERE status = 'Pending' 
ORDER BY applied_at DESC;
```

## 🧪 Testing

### Sample JSON Resume
Located at `/public/sample-resume.json`

**Structure**:
```json
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "experience": [...],
  "education": [...],
  "skills": [...]
}
```

### Test Scenarios

**Valid Application**:
1. Fill name, email
2. Upload any resume
3. Submit → Success ✓

**Missing Fields**:
1. Skip name field
2. Try submit → Error ✓

**Invalid JSON**:
1. Paste `{invalid}`
2. Click "Parse JSON"
3. See error message ✓

## 🔐 Security Notes

Current Implementation:
- ✓ Input validation
- ✓ File size limits (10MB)
- ✓ JSON validation
- ✗ User authentication (TODO)
- ✗ Rate limiting (TODO)

## ⚠️ Known Issues

1. **PDF Extraction**: Basic only. Use `pdfjs-dist` for production
2. **No Auth**: Uses placeholder user ID. Add authentication
3. **File Storage**: Stores text only. Add cloud storage
4. **Duplicates**: No prevention of duplicate applications

## 🔄 Resume Processing Flow

```
File Upload
    ↓
File Validation (type, size)
    ↓
Text Extraction
    ├─ PDF → Extract text
    ├─ JSON → Stringify
    └─ Text → Use as-is
    ↓
Store in Database (parsed_text field)
    ↓
Display in Dashboard
```

## 📱 User Interface

### Apply Page Layout
```
Back Link
↓
Title: "Apply for this Position"
↓
Section 1: Your Information
  ├─ Full Name (required)
  └─ Email (required)
↓
Section 2: Your Resume
  └─ ResumeUpload Component
       ├─ File Upload tab
       ├─ JSON Resume tab
       └─ Manual Input tab
↓
Section 3: Cover Letter
  └─ Textarea (optional)
↓
Buttons: [Submit] [Cancel]
```

### Dashboard Application Card
```
Job Title (x applications)
↓
[Expandable] Application List
  ├─ Applicant #ID | Status Badge | Date
  ├─ Expand to show:
  │   ├─ Resume Preview
  │   ├─ [Accept] [Reject] [Review]
```

## 🚨 Debug Tips

### Check Application Submission
```javascript
// In browser console
const response = await fetch('/api/applications', {
  method: 'POST',
  body: formData
});
console.log(await response.json());
```

### View Database Data
```sql
-- Check all applications
SELECT * FROM jobs_application ORDER BY applied_at DESC;

-- Check specific job
SELECT a.* FROM jobs_application a
WHERE a.job_id = (SELECT id FROM jobs_job WHERE slug = 'YOUR_SLUG');
```

### Check Browser Logs
- Press `F12` to open DevTools
- Check Console for errors
- Check Network tab for API requests

## 📝 Common Code Snippets

### Submit Application (JavaScript)
```javascript
const formData = new FormData();
formData.append('jobSlug', 'job-slug');
formData.append('applicantName', 'John Doe');
formData.append('applicantEmail', 'john@example.com');
formData.append('resumeText', resumeContent);

const response = await fetch('/api/applications', {
  method: 'POST',
  body: formData
});
const result = await response.json();
```

### Parse JSON Resume
```javascript
const jsonResume = { name: "...", email: "..." };
const resume = {
  type: 'json',
  data: jsonResume,
  text: JSON.stringify(jsonResume, null, 2)
};
```

### Fetch Applications
```javascript
const response = await fetch(`/api/applications?jobSlug=${slug}`);
const { applications } = await response.json();
applications.forEach(app => console.log(app));
```

## 🎯 Next Steps

1. **Add Authentication**: Implement user login
2. **Improve PDF**: Use `pdfjs-dist` for better extraction
3. **Add Notifications**: Send emails on application
4. **Store Files**: Use Vercel Blob or AWS S3
5. **Add Search**: Filter applications by keywords
6. **Implement Scoring**: Auto-score based on skills

## 📖 Full Documentation

- **Feature Docs**: See [RESUME_UPLOAD_FEATURE.md](./RESUME_UPLOAD_FEATURE.md)
- **Testing Guide**: See [TESTING_RESUME_FEATURE.md](./TESTING_RESUME_FEATURE.md)
- **Architecture**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 💬 Support

For issues:
1. Check browser console (F12)
2. Review error messages
3. Check database with SQL queries
4. See documentation files above

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Status**: Ready for Testing
