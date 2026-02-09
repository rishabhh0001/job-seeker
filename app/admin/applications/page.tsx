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

            {/* Application Detail Modal */}
            {viewingApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-heading text-xl font-bold text-foreground">
                                Application Details
                            </h2>
                            <button
                                onClick={() => setViewingApplication(null)}
                                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Applicant</p>
                                <p className="text-foreground">{viewingApplication.applicant_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {viewingApplication.applicant_email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Job</p>
                                <p className="text-foreground">{viewingApplication.job_title}</p>
                            </div>

                            {viewingApplication.cover_letter && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Cover Letter
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm text-foreground">
                                        {viewingApplication.cover_letter}
                                    </p>
                                </div>
                            )}

                            {viewingApplication.parsed_text && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Resume</p>
                                    <div className="max-h-64 overflow-y-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">
                                        {viewingApplication.parsed_text}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(viewingApplication.id, "Accepted")
                                        setViewingApplication(null)
                                    }}
                                    className="rounded-md bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(viewingApplication.id, "Rejected")
                                        setViewingApplication(null)
                                    }}
                                    className="rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(viewingApplication.id, "Review")
                                        setViewingApplication(null)
                                    }}
                                    className="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                                >
                                    Under Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
