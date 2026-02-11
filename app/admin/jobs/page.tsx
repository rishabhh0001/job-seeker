"use client"

import { useEffect, useState } from "react"
import { Plus, Filter, Trash2 } from "lucide-react"
import { DataTable, Column } from "@/components/admin/data-table"
import { SearchBar } from "@/components/admin/search-bar"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { FormModal } from "@/components/admin/form-modal"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"

type Job = {
    id: number
    title: string
    slug: string
    description: string
    job_type: string
    location: string
    salary_min: number
    salary_max: number
    is_active: boolean
    created_at: string
    company_name: string
    employer_username: string
    employer_id: number
    category_name: string
    category_id: number
    application_count: number
}

type Category = {
    id: number
    name: string
}

type Employer = {
    id: number
    company_name: string
    username: string
}

export default function JobsAdminPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [employers, setEmployers] = useState<Employer[]>([])
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isSingleDeleteOpen, setIsSingleDeleteOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
    const [editingJob, setEditingJob] = useState<Job | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        let filtered = jobs

        // Apply filters
        if (statusFilter !== "all") {
            filtered = filtered.filter((job) =>
                statusFilter === "active" ? job.is_active : !job.is_active
            )
        }
        if (typeFilter !== "all") {
            filtered = filtered.filter((job) => job.job_type === typeFilter)
        }
        if (categoryFilter !== "all") {
            filtered = filtered.filter((job) => job.category_id === parseInt(categoryFilter))
        }

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(
                (job) =>
                    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredJobs(filtered)
    }, [jobs, searchQuery, statusFilter, typeFilter, categoryFilter])

    const fetchData = async () => {
        try {
            const [jobsRes, categoriesRes, employersRes] = await Promise.all([
                fetch("/api/admin/jobs"),
                fetch("/api/admin/categories"),
                fetch("/api/admin/users?type=employer"),
            ])

            const [jobsData, categoriesData, employersData] = await Promise.all([
                jobsRes.json(),
                categoriesRes.json(),
                employersRes.json(),
            ])

            setJobs(jobsData.jobs || [])
            setCategories(categoriesData.categories || [])
            setEmployers(employersData.users || [])
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingJob(null)
        setIsFormOpen(true)
    }

    const handleEdit = (job: Job) => {
        setEditingJob(job)
        setIsFormOpen(true)
    }

    const handleSubmit = async (data: Record<string, any>) => {
        const method = editingJob ? "PUT" : "POST"
        const payload = {
            ...data,
            ...(editingJob && { id: editingJob.id }),
            salaryMin: parseInt(data.salaryMin) || 0,
            salaryMax: parseInt(data.salaryMax) || 0,
            categoryId: parseInt(data.categoryId),
            employerId: parseInt(data.employerId),
            isActive: data.isActive === "true",
        }

        const res = await fetch("/api/admin/jobs", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to save job")
        }

        await fetchData()
        setSelectedIds(new Set())
    }

    const handleDelete = async () => {
        const ids = Array.from(selectedIds)
        const res = await fetch("/api/admin/jobs", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to delete jobs")
        }

        await fetchData()
        setSelectedIds(new Set())
    }

    const handleBulkActivate = async () => {
        const ids = Array.from(selectedIds)
        await Promise.all(
            ids.map((id) => {
                const job = jobs.find((j) => j.id === id)
                if (!job) return Promise.resolve()
                return fetch("/api/admin/jobs", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...job, id, isActive: true }),
                })
            })
        )
        await fetchData()
        setSelectedIds(new Set())
    }

    const handleBulkDeactivate = async () => {
        const ids = Array.from(selectedIds)
        await Promise.all(
            ids.map((id) => {
                const job = jobs.find((j) => j.id === id)
                if (!job) return Promise.resolve()
                return fetch("/api/admin/jobs", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...job, id, isActive: false }),
                })
            })
        )
        await fetchData()
        setSelectedIds(new Set())
    }

    const handleStatusToggle = async (job: Job) => {
        try {
            const res = await fetch(`/api/admin/jobs/${job.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !job.is_active }),
            })

            if (!res.ok) throw new Error("Failed to update status")
            await fetchData()
        } catch (error) {
            console.error("Error updating status:", error)
        }
    }

    const handleSingleDelete = async () => {
        if (!jobToDelete) return
        try {
            const res = await fetch(`/api/admin/jobs/${jobToDelete.id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete job")
            await fetchData()
            setIsSingleDeleteOpen(false)
            setJobToDelete(null)
        } catch (error) {
            console.error("Error deleting job:", error)
        }
    }

    const columns: Column<Job>[] = [
        {
            key: "title",
            label: "Job Title",
            sortable: true,
            render: (job) => (
                <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company_name || job.employer_username}</p>
                </div>
            ),
        },
        {
            key: "category_name",
            label: "Category",
            sortable: true,
        },
        {
            key: "job_type",
            label: "Type",
            sortable: true,
        },
        {
            key: "location",
            label: "Location",
        },
        {
            key: "is_active",
            label: "Status",
            sortable: true,
            render: (job) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleStatusToggle(job)
                    }}
                    className={`rounded-md px-2 py-1 text-xs font-semibold hover:opacity-80 transition-opacity ${job.is_active
                        ? "bg-accent/10 text-accent"
                        : "bg-muted text-muted-foreground"
                        }`}
                >
                    {job.is_active ? "Active" : "Inactive"}
                </button>
            ),
        },
        {
            key: "application_count",
            label: "Applications",
            sortable: true,
            render: (job) => (
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {job.application_count}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            sortable: true,
            render: (job) => new Date(job.created_at).toLocaleDateString(),
        },
        {
            key: "actions",
            label: "Actions",
            render: (job) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setJobToDelete(job)
                            setIsSingleDeleteOpen(true)
                        }}
                        className="rounded-md p-1 hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete Job"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )
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
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-foreground">Jobs</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage job listings
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Job
                </button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search jobs..."
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <DataTable
                data={filteredJobs}
                columns={columns}
                onRowClick={handleEdit}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />

            <BulkActionBar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
                actions={[
                    {
                        label: "Activate",
                        onClick: handleBulkActivate,
                        variant: "success",
                    },
                    {
                        label: "Deactivate",
                        onClick: handleBulkDeactivate,
                    },
                    {
                        label: "Delete",
                        onClick: () => setIsDeleteOpen(true),
                        variant: "destructive",
                    },
                ]}
            />

            <FormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingJob ? "Edit Job" : "Create Job"}
                onSubmit={handleSubmit}
                initialData={editingJob || undefined}
                fields={[
                    { name: "title", label: "Title", type: "text", required: true },
                    { name: "slug", label: "Slug", type: "text", required: true },
                    { name: "description", label: "Description", type: "textarea", required: true },
                    {
                        name: "jobType",
                        label: "Job Type",
                        type: "select",
                        required: true,
                        options: [
                            { value: "Full-time", label: "Full-time" },
                            { value: "Part-time", label: "Part-time" },
                            { value: "Contract", label: "Contract" },
                            { value: "Internship", label: "Internship" },
                        ],
                    },
                    { name: "location", label: "Location", type: "text" },
                    { name: "salaryMin", label: "Minimum Salary", type: "number" },
                    { name: "salaryMax", label: "Maximum Salary", type: "number" },
                    {
                        name: "categoryId",
                        label: "Category",
                        type: "select",
                        required: true,
                        options: categories.map((cat) => ({
                            value: cat.id.toString(),
                            label: cat.name,
                        })),
                    },
                    {
                        name: "employerId",
                        label: "Employer",
                        type: "select",
                        required: true,
                        options: employers.map((emp) => ({
                            value: emp.id.toString(),
                            label: emp.company_name || emp.username,
                        })),
                    },
                    {
                        name: "isActive",
                        label: "Status",
                        type: "select",
                        required: true,
                        options: [
                            { value: "true", label: "Active" },
                            { value: "false", label: "Inactive" },
                        ],
                        defaultValue: "true",
                    },
                ]}
            />

            <DeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Jobs"
                message="Are you sure you want to delete the selected jobs? This will also delete all associated applications."
                itemCount={selectedIds.size}
            />

            <DeleteConfirmation
                isOpen={isSingleDeleteOpen}
                onClose={() => setIsSingleDeleteOpen(false)}
                onConfirm={handleSingleDelete}
                title="Delete Job"
                message={`Are you sure you want to delete "${jobToDelete?.title}"? This will also delete all associated applications.`}
            />
        </div>
    )
}
