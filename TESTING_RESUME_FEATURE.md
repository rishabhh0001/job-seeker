# Testing the Resume Upload Feature

## Quick Start Guide

### 1. Access the Apply Page

1. Go to the homepage `/`
2. Click on any job listing
3. Click the "Apply Now" button in the sidebar
4. You should see the apply form

### 2. Test Resume Upload

#### Method A: Manual Input
1. Go to the apply page for any job
2. Click on the "Manual Input" tab
3. Paste or type your resume content
4. Click "Submit Resume"

#### Method B: JSON Resume
1. Download the sample resume from `/public/sample-resume.json`
2. Go to the apply page
3. Click on "JSON Resume" tab
4. Paste the JSON content
5. Click "Parse JSON Resume"

#### Method C: File Upload
1. Go to the apply page
2. Click on "Upload File" tab
3. Drag and drop a file OR click to select
4. Supported formats: PDF, JSON, TXT

### 3. Submit Application

1. After loading a resume, fill in:
   - Full Name (required)
   - Email Address (required)
   - Cover Letter (optional)
2. Click "Submit Application"
3. You should see a success message
4. You'll be redirected to the job posting

### 4. View Applications (Employer Dashboard)

1. Go to `/dashboard`
2. Scroll down to "Recent Applications" section
3. Click on a job to expand and see applications
4. Click the "+" button next to an application to see:
   - Resume content preview
   - Applicant information
   - Action buttons (Accept/Reject/Review)

## Testing Scenarios

### Scenario 1: Valid JSON Resume
```json
{
  "name": "John Developer",
  "email": "john@dev.com",
  "phone": "+1-234-567-8900",
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "duration": "2020-2024"
    }
  ]
}
```
**Expected Result**: Application accepted, resume parsed successfully

### Scenario 2: Invalid JSON
```
{invalid json content
```
**Expected Result**: Error message "Invalid JSON format"

### Scenario 3: Missing Required Fields
**Steps**:
1. Don't fill in name or email
2. Click Submit
**Expected Result**: Form validation error

### Scenario 4: No Resume Provided
**Steps**:
1. Fill name and email
2. Don't upload or enter resume
3. Click Submit
**Expected Result**: Error "Please upload or enter your resume"

### Scenario 5: Text File Upload
**Steps**:
1. Create a `.txt` file with resume content
2. Upload via "Upload File" tab
**Expected Result**: File processed, resume preview shown

## Debugging

### Application Not Showing in Dashboard
- Check browser console for errors (F12)
- Verify DATABASE_URL is set correctly
- Check that the job exists in the database

### Resume Not Loading
- Check file size (max 10MB)
- Verify file format (for uploads)
- Ensure JSON is valid (for JSON input)

### API Errors
Check the console for:
```
[v0] Application submission error:
[v0] Resume parsing error:
```

## Database Queries

### Check Recent Applications
```sql
SELECT a.*, j.title, j.slug FROM jobs_application a
JOIN jobs_job j ON j.id = a.job_id
ORDER BY a.applied_at DESC
LIMIT 10;
```

### Check Applications for Specific Job
```sql
SELECT * FROM jobs_application 
WHERE job_id = (SELECT id FROM jobs_job WHERE slug = 'your-job-slug');
```

### View Application Details
```sql
SELECT 
  a.id,
  a.applicant_id,
  a.status,
  a.applied_at,
  LENGTH(a.parsed_text) as resume_length,
  j.title as job_title
FROM jobs_application a
JOIN jobs_job j ON j.id = a.job_id
ORDER BY a.applied_at DESC;
```

## Expected Behavior Checklist

- [ ] Can navigate to apply page
- [ ] Can upload file (PDF/JSON/TXT)
- [ ] Can paste JSON resume
- [ ] Can manually type resume
- [ ] Resume preview works
- [ ] Can submit application with all required fields
- [ ] Success message appears on submit
- [ ] Application appears in dashboard
- [ ] Can expand application to see resume
- [ ] Error messages display correctly for invalid input
- [ ] Form validation prevents missing fields

## Performance Notes

- Resumed are limited to 10MB per file
- JSON parsing happens on client-side
- Application submission is immediate
- Dashboard loading may take a moment if there are many applications

## Known Limitations

1. **PDF Extraction**: Current implementation uses basic text extraction. For production, consider using:
   - `pdfjs-dist` for more robust extraction
   - `pdf.js` library
   - Server-side PDF processing

2. **Resume Parsing**: Currently only stores raw text. For production, consider:
   - AI-powered resume parsing
   - Structured data extraction
   - Resume validation against job requirements

3. **User Authentication**: Applications currently use placeholder user ID. Implement proper authentication to:
   - Track actual applicants
   - Prevent duplicate applications
   - Send email notifications

## Next Steps

To enhance the feature:

1. **Add Authentication**: Implement user login for applicants
2. **Email Notifications**: Send confirmation emails to applicants
3. **Resume Parsing**: Use AI to extract structured data
4. **File Storage**: Store actual resume files in cloud storage (AWS S3, Vercel Blob, etc.)
5. **Advanced Search**: Allow employers to search/filter applications
6. **Status Updates**: Let applicants track their application status
7. **Scoring**: Automatically score applications based on keywords

## Support

For issues or questions:
1. Check the debug logs (console)
2. Review the error messages
3. Check the RESUME_UPLOAD_FEATURE.md documentation
4. Verify database connections
