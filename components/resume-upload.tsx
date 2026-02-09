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

      if (fileExt === "pdf") {
        const text = await file.text()
        const data: ResumeData = {
          type: "pdf",
          text: text.substring(0, 5000),
          fileName: file.name,
        }
        setResumeData(data)
        onResumeLoad(data)
        onResumeParsed?.(text)
      } else if (fileExt === "json") {
        const text = await file.text()
        const jsonData = JSON.parse(text)
        const data: ResumeData = {
          type: "json",
          data: jsonData,
          text: JSON.stringify(jsonData, null, 2),
          fileName: file.name,
        }
        setResumeData(data)
        onResumeLoad(data)
        onResumeParsed?.(JSON.stringify(jsonData, null, 2))
      } else {
        const text = await file.text()
        const data: ResumeData = {
          type: "text",
          text,
          fileName: file.name,
        }
        setResumeData(data)
        onResumeLoad(data)
        onResumeParsed?.(text)
      }
    } catch {
      setError("Failed to process file. Please check the format and try again.")
    } finally {
      setLoading(false)
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
      const data: ResumeData = {
        type: "json",
        data: jsonData,
        text: JSON.stringify(jsonData, null, 2),
      }
      setResumeData(data)
      onResumeLoad(data)
      onResumeParsed?.(jsonText)
      setError(null)
    } catch {
      setError("Invalid JSON format")
    }
  }

  const handleManualInput = () => {
    const manualText = manualInputRef.current?.value
    if (!manualText) {
      setError("Please enter resume content")
      return
    }
    const data: ResumeData = { type: "manual", text: manualText }
    setResumeData(data)
    onResumeLoad(data)
    onResumeParsed?.(manualText)
    setError(null)
  }

  const tabs = [
    { key: "file" as const, label: "Upload File", icon: Upload },
    { key: "json" as const, label: "JSON Resume", icon: FileJson },
    { key: "manual" as const, label: "Manual Input", icon: FileText },
  ]

  return (
    <div className="w-full rounded-xl border border-border bg-secondary/30 p-5">
      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setUploadTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              uploadTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* File Upload */}
      {uploadTab === "file" && (
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
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
            {loading ? "Processing..." : "Click to upload or drag and drop"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, JSON, or TXT files (max 10MB)
          </p>
        </div>
      )}

      {/* JSON Input */}
      {uploadTab === "json" && (
        <div className="space-y-3">
          <textarea
            ref={jsonInputRef}
            placeholder={`{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "experience": [...]\n}`}
            className="min-h-48 w-full rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleJsonInput}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            Parse JSON Resume
          </button>
        </div>
      )}

      {/* Manual Input */}
      {uploadTab === "manual" && (
        <div className="space-y-3">
          <textarea
            ref={manualInputRef}
            placeholder="Paste your resume content here. Include experience, skills, education, etc."
            className="min-h-48 w-full rounded-lg border border-border bg-input p-3 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleManualInput}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            Submit Resume
          </button>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <div className="animate-scale-in mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {resumeData && !error && (
        <div className="animate-scale-in mt-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-accent">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Resume loaded{resumeData.fileName ? ` (${resumeData.fileName})` : ""}
        </div>
      )}

      {resumeData && (
        <div className="animate-fade-in mt-4 rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Preview
          </h4>
          <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-input p-3 font-mono text-xs text-muted-foreground">
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
