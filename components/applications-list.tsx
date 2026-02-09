"use client"

import { useEffect, useState } from "react"
import { FileText, User, Calendar, ChevronDown, ChevronUp } from "lucide-react"

export interface Application {
  id: number
  applicant_id: number
  status: string
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
    async function fetchApplications() {
      try {
        const response = await fetch(`/api/applications?jobSlug=${jobSlug}`)
        if (!response.ok) throw new Error("Failed to fetch applications")
        const data = await response.json()
        setApplications(data.applications || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load applications"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [jobSlug])

  const statusStyles: Record<string, string> = {
    Accepted: "bg-accent/10 text-accent",
    Rejected: "bg-destructive/10 text-destructive",
    Reviewed: "bg-primary/10 text-primary",
    Pending: "bg-muted text-muted-foreground",
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-muted/50"
          />
        ))}
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
      <div className="rounded-lg border border-border bg-secondary/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">No applications yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {applications.map((app) => (
        <div
          key={app.id}
          className="overflow-hidden rounded-lg border border-border bg-secondary/30 transition-all hover:border-primary/20"
        >
          <button
            onClick={() =>
              setExpandedId(expandedId === app.id ? null : app.id)
            }
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  Applicant #{app.applicant_id}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(app.applied_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyles[app.status] || statusStyles.Pending}`}
              >
                {app.status}
              </span>
              {expandedId === app.id ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {expandedId === app.id && (
            <div className="animate-fade-down border-t border-border px-4 py-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Resume Content
              </div>
              <div className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-md bg-input p-3 font-mono text-xs text-muted-foreground">
                {app.parsed_text?.substring(0, 2000) || "No resume content"}
                {(app.parsed_text?.length || 0) > 2000 && "\n..."}
              </div>

              <div className="mt-3 flex gap-2">
                <button className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20">
                  Accept
                </button>
                <button className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20">
                  Reject
                </button>
                <button className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                  Mark Reviewed
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
