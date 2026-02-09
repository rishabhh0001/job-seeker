"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Briefcase, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"

type Application = {
    id: number
    status: string
    applied_at: string
    job_title: string
    job_slug: string
    category_name: string
    company_name: string
}

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchApplications() {
            try {
                const res = await fetch("/api/my-applications")
                const data = await res.json()
                setApplications(data.applications || [])
            } catch (error) {
                console.error("Failed to fetch applications:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchApplications()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Accepted":
                return "text-green-500 bg-green-500/10"
            case "Rejected":
                return "text-destructive bg-destructive/10"
            case "Review":
            case "Reviewed":
                return "text-blue-500 bg-blue-500/10"
            default:
                return "text-muted-foreground bg-muted"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Accepted":
                return <CheckCircle className="h-4 w-4" />
            case "Rejected":
                return <XCircle className="h-4 w-4" />
            case "Review":
            case "Reviewed":
                return <Clock className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    My Applications
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Track the status of your job applications
                </p>
            </div>

            <div className="space-y-4">
                {applications.length > 0 ? (
                    applications.map((app) => (
                        <div
                            key={app.id}
                            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-heading text-lg font-bold text-foreground">
                                        {app.job_title}
                                    </h3>
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                        {app.company_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        {app.category_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(app.applied_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                                        app.status
                                    )}`}
                                >
                                    {getStatusIcon(app.status)}
                                    {app.status === "Review" ? "Under Review" : app.status}
                                </div>
                                <Link
                                    href={`/jobs/${app.job_slug}`}
                                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                                >
                                    View Job
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-heading text-xl font-bold text-foreground">
                            No applications yet
                        </h3>
                        <p className="mt-2 max-w-sm text-muted-foreground">
                            You haven't applied to any jobs yet. Browse our job listings and find your next opportunity!
                        </p>
                        <Link
                            href="/"
                            className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
