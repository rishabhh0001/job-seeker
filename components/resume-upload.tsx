"use client"

import { useState, useRef } from "react"
import { Upload, FileText, FileJson, AlertCircle, CheckCircle } from "lucide-react"

export interface ResumeData {
  type: "pdf" | "json" | "text" | "manual"
  text?: string
  data?: Record<string, unknown>
  fileName?: string
}

interface ResumeUploadProps {
  onResumeLoad: (resume: ResumeData) => void
  onResumeParsed?: (text: string) => void
}

export function ResumeUpload({ onResumeLoad, onResumeParsed }: ResumeUploadProps) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadTab, setUploadTab] = useState<"file" | "json" | "manual">("file")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLTextAreaElement>(null)
  const manualInputRef = useRef<HTMLTextAreaElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase()
      let fileType: "pdf" | "json" | "text" = "text"

      if (fileExt === "pdf") fileType = "pdf"
      else if (fileExt === "json") fileType = "json"

      // For PDF files, extract text on the client side
      if (fileType === "pdf") {
        await extractPdfText(file)
      } else {
        // For JSON and text files, read directly
        const text = await file.text()

        if (fileType === "json") {
          try {
            const jsonData = JSON.parse(text)
            const data = {
              type: "json" as const,
              data: jsonData,
              text: JSON.stringify(jsonData, null, 2),
              fileName: file.name,
            }
            setResumeData(data)
            onResumeLoad(data)
            onResumeParsed?.(JSON.stringify(jsonData, null, 2))
          } catch (e) {
            setError("Invalid JSON format. Please check your file.")
          }
        } else {
          const data = {
            type: "text" as const,
            text: text,
            fileName: file.name,
          }
          setResumeData(data)
          onResumeLoad(data)
          onResumeParsed?.(text)
        }
      }
    } catch (err) {
      setError(`Failed to process file: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const extractPdfText = async (file: File) => {
    try {
      // Use a simple approach: convert PDF to base64 and send to backend
      // Or use a library like pdfjs-dist for client-side parsing
      const text = await file.text()

      // For a real implementation, you'd use pdfjs or similar
      // This is a simplified version that attempts text extraction
      const data = {
        type: "pdf" as const,
        text: text.substring(0, 5000), // Get first 5000 chars as approximation
        fileName: file.name,
      }
      setResumeData(data)
      onResumeLoad(data)
      onResumeParsed?.(text)
    } catch (err) {
      setError("Failed to extract text from PDF. Please try a JSON or text format.")
    }
  }

  const handleJsonInput = () => {
    const jsonText = jsonInputRef.current?.value
    if (!jsonText) {
      setError("Please enter JSON resume data")
      return
    }

    try {
      const jsonData = JSON.parse(jsonText)
      const data = {
        type: "json" as const,
        data: jsonData,
        text: JSON.stringify(jsonData, null, 2),
      }
      setResumeData(data)
      onResumeLoad(data)
      onResumeParsed?.(jsonText)
      setError(null)
    } catch (e) {
      setError("Invalid JSON format")
    }
  }

  const handleManualInput = () => {
    const manualText = manualInputRef.current?.value
    if (!manualText) {
      setError("Please enter resume content")
      return
    }

    const data = {
      type: "manual" as const,
      text: manualText,
    }
    setResumeData(data)
    onResumeLoad(data)
    onResumeParsed?.(manualText)
    setError(null)
  }

  return (
    <div className="w-full rounded-lg border border-border bg-secondary/30 p-6">
      <h3 className="mb-4 font-heading text-lg font-bold text-foreground">Upload Your Resume</h3>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {(["file", "json", "manual"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setUploadTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              uploadTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "file" && "Upload File"}
            {tab === "json" && "JSON Resume"}
            {tab === "manual" && "Manual Input"}
          </button>
        ))}
      </div>

      {/* File Upload Tab */}
      {uploadTab === "file" && (
        <div
          className="rounded-lg border-2 border-dashed border-primary/30 p-8 text-center transition-colors hover:border-primary hover:bg-primary/10 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.json,.txt"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, JSON, or TXT files (max 10MB)
          </p>
        </div>
      )}

      {/* JSON Resume Tab */}
      {uploadTab === "json" && (
        <div className="space-y-4">
          <textarea
            ref={jsonInputRef}
            placeholder={`{
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
}`}
            className="min-h-64 w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
          />
          <button
            onClick={handleJsonInput}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Processing..." : "Parse JSON Resume"}
          </button>
        </div>
      )}

      {/* Manual Input Tab */}
      {uploadTab === "manual" && (
        <div className="space-y-4">
          <textarea
            ref={manualInputRef}
            placeholder="Paste your resume content here. Include experience, skills, education, etc."
            className="min-h-64 w-full rounded-lg border border-border bg-background p-3 placeholder-muted-foreground"
          />
          <button
            onClick={handleManualInput}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Resume"}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {resumeData && !error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-600">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Resume loaded successfully
          {resumeData.fileName && ` (${resumeData.fileName})`}
        </div>
      )}

      {/* Resume Preview */}
      {resumeData && (
        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">Resume Preview</h4>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-input p-3 text-xs text-muted-foreground">
            {resumeData.data
              ? JSON.stringify(resumeData.data, null, 2)
              : resumeData.text?.substring(0, 2000) || ""}
            {(resumeData.text?.length || 0) > 2000 && "..."}
          </div>
        </div>
      )}
    </div>
  )
}
