"use client"

import { useEffect, useState } from "react"
import { FileText, Mail, User, Calendar } from "lucide-react"

export interface Application {
  id: number
  applicant_id: number
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected"
  applied_at: string
  parsed_text: string
}

interface ApplicationsListProps {
  jobSlug: string
}

export function ApplicationsList({ jobSlug }: ApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/applications?jobSlug=${jobSlug}`)
        if (!response.ok) throw new Error("Failed to fetch applications")

        const data = await response.json()
        setApplications(data.applications || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [jobSlug])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "Rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "Reviewed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-2 text-sm text-muted-foreground">No applications yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="rounded-lg border border-border bg-card transition-all hover:border-primary/50"
        >
          <button
            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
            className="w-full px-4 py-4 text-left hover:bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    Applicant #{app.applicant_id}
                  </span>
                  <span className={`rounded border px-2 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(app.applied_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <span className="text-muted-foreground">
                {expandedId === app.id ? "−" : "+"}
              </span>
            </div>
          </button>

          {expandedId === app.id && (
            <div className="border-t border-border px-4 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4" />
                    Resume Content
                  </h4>
                  <div className="max-h-64 overflow-y-auto rounded bg-muted p-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {app.parsed_text.substring(0, 2000)}
                    {app.parsed_text.length > 2000 && "\n..."}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                    Accept
                  </button>
                  <button className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20">
                    Reject
                  </button>
                  <button className="rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80">
                    Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
