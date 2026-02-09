"use client"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react"
import { ResumeUpload, type ResumeData } from "@/components/resume-upload"

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const slugParam = params.slug

  const [jobSlug] = useState(() => {
    if (Array.isArray(slugParam)) return slugParam[0]
    return slugParam || ""
  })

  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    coverLetter: "",
  })

  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleResumeLoad = (resume: ResumeData) => {
    setResumeData(resume)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.applicantName.trim()) throw new Error("Please enter your name")
      if (!formData.applicantEmail.trim()) throw new Error("Please enter your email")
      if (!resumeData) throw new Error("Please upload or enter your resume")

      const submitData = new FormData()
      submitData.append("jobSlug", jobSlug)
      submitData.append("applicantName", formData.applicantName)
      submitData.append("applicantEmail", formData.applicantEmail)
      submitData.append("coverLetter", formData.coverLetter)

      if (resumeData.type === "json" && resumeData.data) {
        submitData.append("resumeJson", JSON.stringify(resumeData.data))
      } else if (resumeData.text) {
        submitData.append("resumeText", resumeData.text)
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }

      setSuccess(true)
      setFormData({ applicantName: "", applicantEmail: "", coverLetter: "" })
      setResumeData(null)

      setTimeout(() => {
        router.push(`/jobs/${jobSlug}?applied=true`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/jobs/${jobSlug}`}
        className="animate-fade-in mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to job
      </Link>

      <div className="animate-fade-up rounded-xl border border-border bg-card p-8">
        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">
          Apply for this Position
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Complete the form below. Your resume and cover letter help employers
          understand your qualifications.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Your Information
            </h2>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="applicantEmail"
                value={formData.applicantEmail}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
                className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Resume */}
          <div className="space-y-4">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Your Resume
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload a file (PDF, JSON, TXT) or paste your resume content.
            </p>
            <ResumeUpload onResumeLoad={handleResumeLoad} />
          </div>

          {/* Cover Letter */}
          <div className="space-y-4">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Cover Letter{" "}
              <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </h2>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Write a brief cover letter explaining your interest and qualifications..."
              rows={5}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="animate-scale-in flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="animate-scale-in flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-accent">Application submitted!</p>
                <p className="mt-0.5 text-xs text-accent/80">
                  Redirecting you back to the job posting...
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit Application"}
            </button>
            <Link
              href={`/jobs/${jobSlug}`}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
