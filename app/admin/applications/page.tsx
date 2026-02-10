"use client"

import { useEffect, useState } from "react"
import { Eye, X } from "lucide-react"
import { DataTable, Column } from "@/components/admin/data-table"
import { SearchBar } from "@/components/admin/search-bar"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"

type Application = {
    id: number
    status: string
    applied_at: string
    resume: string
    cover_letter: string
    parsed_text: string
    applicant_id: number
    applicant_email: string
    applicant_name: string
    job_id: number
    job_title: string
    job_slug: string
    profile_snapshot: any
    category_name: string
}

type Category = {
    id: number
    name: string
}

export default function ApplicationsAdminPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [viewingApplication, setViewingApplication] = useState<Application | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        let filtered = applications

        if (statusFilter !== "all") {
            filtered = filtered.filter((app) => app.status === statusFilter)
        }
        if (categoryFilter !== "all") {
            filtered = filtered.filter((app) => app.category_name === categoryFilter)
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (app) =>
                    app.applicant_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.job_title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredApplications(filtered)
    }, [applications, searchQuery, statusFilter, categoryFilter])

    const fetchData = async () => {
        try {
            const [appsRes, categoriesRes] = await Promise.all([
                fetch("/api/admin/applications"),
                fetch("/api/admin/categories"),
            ])

            const [appsData, categoriesData] = await Promise.all([
                appsRes.json(),
                categoriesRes.json(),
            ])

            setApplications(appsData.applications || [])
            setCategories(categoriesData.categories || [])
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        const res = await fetch("/api/admin/applications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        })

        if (!res.ok) {
            const error = await res.json()
            console.error("Failed to update status:", error)
            return
        }

        await fetchData()
    }

    const handleBulkStatusUpdate = async (status: string) => {
        const ids = Array.from(selectedIds)
        await Promise.all(ids.map((id) => handleUpdateStatus(id, status)))
        setSelectedIds(new Set())
    }

    const handleDelete = async () => {
        const ids = Array.from(selectedIds)
        const res = await fetch("/api/admin/applications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to delete applications")
        }

        await fetchData()
        setSelectedIds(new Set())
    }

    const statusStyles: Record<string, string> = {
        Accepted: "bg-accent/10 text-accent",
        Rejected: "bg-destructive/10 text-destructive",
        Review: "bg-primary/10 text-primary",
        Pending: "bg-muted text-muted-foreground",
    }

    const columns: Column<Application>[] = [
        {
            key: "applicant_email",
            label: "Applicant",
            sortable: true,
            render: (app) => (
                <div>
                    <p className="font-medium">{app.applicant_name}</p>
                    <p className="text-xs text-muted-foreground">{app.applicant_email}</p>
                </div>
            ),
        },
        {
            key: "job_title",
            label: "Job",
            sortable: true,
        },
        {
            key: "category_name",
            label: "Category",
            sortable: true,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (app) => (
                <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyles[app.status] || statusStyles.Pending}`}
                >
                    {app.status}
                </span>
            ),
        },
        {
            key: "resume",
            label: "Resume",
            render: (app) => (
                <span className={app.parsed_text ? "text-accent" : "text-muted-foreground"}>
                    {app.parsed_text ? "✓" : "—"}
                </span>
            ),
        },
        {
            key: "applied_at",
            label: "Applied",
            sortable: true,
            render: (app) => new Date(app.applied_at).toLocaleDateString(),
        },
        {
            key: "id",
            label: "Actions",
            render: (app) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setViewingApplication(app)
                    }}
                    className="rounded-md bg-primary/10 p-1 text-primary hover:bg-primary/20"
                >
                    <Eye className="h-4 w-4" />
                </button>
            ),
        },
    ]

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                    Applications
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review job applications
                </p>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search applications..."
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <DataTable
                data={filteredApplications}
                columns={columns}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />

            <BulkActionBar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
                actions={[
                    {
                        label: "Accept",
                        onClick: () => handleBulkStatusUpdate("Accepted"),
                        variant: "success",
                    },
                    {
                        label: "Reject",
                        onClick: () => handleBulkStatusUpdate("Rejected"),
                        variant: "destructive",
                    },
                    {
                        label: "Under Review",
                        onClick: () => handleBulkStatusUpdate("Review"),
                    },
                    {
                        label: "Delete",
                        onClick: () => setIsDeleteOpen(true),
                        variant: "destructive",
                    },
                ]}
            />

            <DeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Applications"
                message="Are you sure you want to delete the selected applications?"
                itemCount={selectedIds.size}
            />

            {/* Application Detail Modal - Enhanced */}
            {viewingApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border p-6 bg-muted/20">
                            <div>
                                <h2 className="font-heading text-xl font-bold text-foreground">
                                    Application Details
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Applied on {new Date(viewingApplication.applied_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingApplication(null)}
                                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Summary Card */}
                            <div className="flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-foreground mb-1">{viewingApplication.applicant_name}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">{viewingApplication.applicant_email}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusStyles[viewingApplication.status]}`}>
                                            {viewingApplication.status}
                                        </span>
                                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
                                            {viewingApplication.job_title}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(viewingApplication.id, "Accepted")
                                            setViewingApplication(null)
                                        }}
                                        className="rounded-md bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(viewingApplication.id, "Review")
                                            setViewingApplication(null)
                                        }}
                                        className="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        Under Review
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(viewingApplication.id, "Rejected")
                                            setViewingApplication(null)
                                        }}
                                        className="rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Profile Snapshot Section */}
                            {viewingApplication.profile_snapshot && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Personal Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground border-b border-border pb-2">Personal Info</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div className="text-muted-foreground">Phone</div>
                                            <div>{viewingApplication.profile_snapshot.phone || "N/A"}</div>

                                            <div className="text-muted-foreground">Location</div>
                                            <div>
                                                {[
                                                    viewingApplication.profile_snapshot.city,
                                                    viewingApplication.profile_snapshot.state,
                                                    viewingApplication.profile_snapshot.country
                                                ].filter(Boolean).join(", ") || "N/A"}
                                            </div>

                                            <div className="text-muted-foreground">Date of Birth</div>
                                            <div>{viewingApplication.profile_snapshot.dateOfBirth ? new Date(viewingApplication.profile_snapshot.dateOfBirth).toLocaleDateString() : "N/A"}</div>
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-foreground border-b border-border pb-2">Education</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div className="text-muted-foreground">Qualification</div>
                                            <div>{viewingApplication.profile_snapshot.highestQualification || "N/A"}</div>

                                            <div className="text-muted-foreground">Institute</div>
                                            <div>{viewingApplication.profile_snapshot.collegeName || "N/A"}</div>

                                            <div className="text-muted-foreground">Major</div>
                                            <div>{viewingApplication.profile_snapshot.major || "N/A"}</div>

                                            <div className="text-muted-foreground">Graduation</div>
                                            <div>{viewingApplication.profile_snapshot.graduationYear || "N/A"}</div>

                                            {viewingApplication.profile_snapshot.gpa && (
                                                <>
                                                    <div className="text-muted-foreground">GPA</div>
                                                    <div>{viewingApplication.profile_snapshot.gpa}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Professional */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h4 className="font-semibold text-foreground border-b border-border pb-2">Professional Experience</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <div className="text-muted-foreground">Experience</div>
                                                <div>{viewingApplication.profile_snapshot.yearsOfExperience ? `${viewingApplication.profile_snapshot.yearsOfExperience} years` : "N/A"}</div>

                                                <div className="text-muted-foreground">Current Title</div>
                                                <div>{viewingApplication.profile_snapshot.currentJobTitle || "N/A"}</div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm text-muted-foreground">Links</div>
                                                <div className="flex gap-4">
                                                    {viewingApplication.profile_snapshot.linkedin && (
                                                        <a href={viewingApplication.profile_snapshot.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                                            LinkedIn Profile
                                                        </a>
                                                    )}
                                                    {viewingApplication.profile_snapshot.portfolio && (
                                                        <a href={viewingApplication.profile_snapshot.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                                            Portfolio
                                                        </a>
                                                    )}
                                                    {!viewingApplication.profile_snapshot.linkedin && !viewingApplication.profile_snapshot.portfolio && (
                                                        <span className="text-sm text-muted-foreground">No links provided</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {viewingApplication.profile_snapshot.skills && (
                                            <div className="mt-4">
                                                <div className="text-sm text-muted-foreground mb-2">Skills</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewingApplication.profile_snapshot.skills.split(',').map((skill: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 rounded-md bg-muted text-foreground text-xs font-mono">
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Cover Letter */}
                            {viewingApplication.cover_letter && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-foreground border-b border-border pb-2">Cover Letter</h4>
                                    <div className="rounded-lg bg-muted/30 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                        {viewingApplication.cover_letter}
                                    </div>
                                </div>
                            )}

                            {/* Resume */}
                            {viewingApplication.parsed_text && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-foreground border-b border-border pb-2">Resume Transcript</h4>
                                    <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/30 p-4 font-mono text-xs text-foreground whitespace-pre-wrap">
                                        {viewingApplication.parsed_text}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
