# Resume Upload and Processing Feature

## Overview

The Job Portal now includes a comprehensive resume upload system that allows applicants to submit their resumes in multiple formats and provides employers with tools to review applications.

## Features

### 1. Multiple Resume Format Support

The application supports three ways to submit a resume:

#### File Upload
- **PDF files**: Uploaded PDF documents (text extraction)
- **JSON files**: Structured JSON resume format
- **Text files**: Plain text resumes

#### JSON Resume Format
Applicants can paste JSON data directly. Example structure:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-234-567-8900",
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "duration": "2020-2024"
    }
  ]
}
```

See `/public/sample-resume.json` for a complete example.

#### Manual Input
Applicants can type or paste their resume content directly into a text area.

### 2. Resume Upload Component

**Location**: `/components/resume-upload.tsx`

A reusable component that handles:
- File drag-and-drop
- File type validation
- JSON parsing and validation
- Resume preview
- Error handling

### 3. Application Submission

**Route**: `/jobs/[slug]/apply`

The apply page includes:
- Personal information fields (name, email)
- Resume upload with multiple input methods
- Optional cover letter
- Form validation
- Success/error feedback
- Redirect on successful submission

### 4. Application Management

**Dashboard**: `/app/dashboard/page.tsx`

Employers can:
- View all applications for their jobs
- See application count per job
- Expand applications to view:
  - Resume content
  - Submission date
  - Application status
  - Action buttons (Accept, Reject, Review)

**Component**: `/components/applications-list.tsx`

### 5. API Endpoints

#### POST /api/applications
Submit a new job application
- Body: FormData with applicantName, applicantEmail, coverLetter, jobSlug, resumeText or resumeJson
- Returns: { success: true, applicationId, message }

#### GET /api/applications
Fetch applications for a specific job
- Query: jobSlug
- Returns: { applications: Application[] }

#### POST /api/parse-resume
Parse uploaded resume files
- Body: FormData with file and fileType
- Returns: { success: true, type, data or text }

## Database Schema

The Application model stores:
- `job` (ForeignKey to Job)
- `applicant` (ForeignKey to User)
- `resume` (FileField - path to resume file)
- `cover_letter` (TextField - optional)
- `parsed_text` (TextField - extracted text from resume)
- `status` (CharField - Pending, Reviewed, Accepted, Rejected)
- `applied_at` (DateTimeField - submission timestamp)

## Usage Examples

### For Job Seekers

1. Navigate to any job posting
2. Click "Apply Now"
3. Enter your name and email
4. Choose one method to submit your resume:
   - Upload a file (PDF, JSON, or TXT)
   - Paste JSON resume data
   - Type resume directly
5. (Optional) Write a cover letter
6. Submit your application

### For Employers

1. Go to the Employer Dashboard (`/dashboard`)
2. View all posted jobs and application counts
3. Scroll to "Recent Applications" section
4. Click on a job to expand application details
5. View applicant resume content
6. Accept, Reject, or Mark as Reviewed

## Files Added/Modified

### New Files
- `/app/jobs/[slug]/apply/page.tsx` - Apply form page
- `/app/api/applications/route.ts` - Application submission API
- `/app/api/parse-resume/route.ts` - Resume parsing API
- `/components/resume-upload.tsx` - Resume upload component
- `/components/applications-list.tsx` - Applications display component
- `/public/sample-resume.json` - Sample JSON resume

### Modified Files
- `/app/jobs/[slug]/page.tsx` - Added apply button link
- `/app/dashboard/page.tsx` - Added applications section
- `/package.json` - Added `pdf-parse` dependency

## Technical Details

### Resume Text Extraction
- **PDF**: Uses file text extraction (simplified approach)
- **JSON**: Automatically stringified and stored
- **Text**: Stored as-is

For production PDF extraction, consider using:
- `pdf.js` for client-side parsing
- `pdf-parse` for server-side parsing
- `pdfjs-dist` for more robust extraction

### Form Validation
- Required fields: name, email, resume
- Email format validation
- Resume format validation
- Cover letter is optional

### Error Handling
- User-friendly error messages
- Form validation feedback
- API error responses
- File upload size limits (10MB)

## Future Enhancements

1. **Advanced Resume Parsing**: Use AI to extract structured data from resumes
2. **Resume Scoring**: Score applications based on job requirements
3. **Bulk Resume Import**: Allow employers to upload multiple resumes
4. **Resume Templates**: Provide standard resume templates
5. **Export Functionality**: Export applications as CSV/PDF
6. **Advanced Search**: Search and filter applications
7. **Integration with ATS**: Connect with Applicant Tracking Systems
8. **Email Notifications**: Notify applicants and employers of application status

## Testing

### Sample Resume
A sample JSON resume is provided at `/public/sample-resume.json`. You can:
1. Download and upload it
2. Copy its contents and paste in the JSON Resume tab
3. Use it as a reference for JSON structure

### Testing Checklist
- [ ] Upload PDF resume
- [ ] Upload JSON resume
- [ ] Paste JSON resume data
- [ ] Type resume manually
- [ ] Submit with cover letter
- [ ] Submit without cover letter
- [ ] View application in dashboard
- [ ] Expand application to see resume
- [ ] Test error cases (missing fields, invalid JSON)

## Troubleshooting

### "Invalid JSON format" error
- Ensure your JSON is valid using a JSON validator
- Check for missing quotes or commas

### "File upload failed"
- Check file size (max 10MB)
- Verify file format (PDF, JSON, TXT)
- Check internet connection

### Application not appearing in dashboard
- Refresh the dashboard page
- Check if the application was submitted successfully
- Verify the job slug matches

## Environment Variables

No additional environment variables required. Uses existing:
- `DATABASE_URL` - Neon PostgreSQL connection

## Dependencies

Added:
- `pdf-parse` - ^1.1.1 (for PDF text extraction)

Existing dependencies used:
- `next` - React framework
- `react-hook-form` - Form handling
- `zod` - Data validation
- `lucide-react` - Icons
