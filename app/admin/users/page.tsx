"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { DataTable, Column } from "@/components/admin/data-table"
import { SearchBar } from "@/components/admin/search-bar"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { FormModal } from "@/components/admin/form-modal"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"

type User = {
    id: number
    username: string
    email: string
    company_name: string
    is_employer: boolean
    is_seeker: boolean
    is_active: boolean
    date_joined: string
}

export default function UsersAdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        let filtered = users

        if (typeFilter === "employer") {
            filtered = filtered.filter((user) => user.is_employer)
        } else if (typeFilter === "seeker") {
            filtered = filtered.filter((user) => user.is_seeker)
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((user) =>
                statusFilter === "active" ? user.is_active : !user.is_active
            )
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredUsers(filtered)
    }, [users, searchQuery, typeFilter, statusFilter])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }

    const handleSubmit = async (data: Record<string, any>) => {
        const method = editingUser ? "PUT" : "POST"
        const payload = {
            ...data,
            ...(editingUser && { id: editingUser.id }),
            isEmployer: data.isEmployer === "true",
            isSeeker: data.isSeeker === "true",
            isActive: data.isActive === "true",
        }

        const res = await fetch("/api/admin/users", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to save user")
        }

        await fetchUsers()
        setSelectedIds(new Set())
    }

    const handleDelete = async () => {
        const ids = Array.from(selectedIds)
        const res = await fetch("/api/admin/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to delete users")
        }

        await fetchUsers()
        setSelectedIds(new Set())
    }

    const handleBulkActivate = async () => {
        const ids = Array.from(selectedIds)
        await Promise.all(
            ids.map((id) => {
                const user = users.find((u) => u.id === id)
                if (!user) return Promise.resolve()
                return fetch("/api/admin/users", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...user, id, isActive: true }),
                })
            })
        )
        await fetchUsers()
        setSelectedIds(new Set())
    }

    const handleBulkDeactivate = async () => {
        const ids = Array.from(selectedIds)
        await Promise.all(
            ids.map((id) => {
                const user = users.find((u) => u.id === id)
                if (!user) return Promise.resolve()
                return fetch("/api/admin/users", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...user, id, isActive: false }),
                })
            })
        )
        await fetchUsers()
        setSelectedIds(new Set())
    }

    const columns: Column<User>[] = [
        {
            key: "username",
            label: "User",
            sortable: true,
            render: (user) => (
                <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
            ),
        },
        {
            key: "company_name",
            label: "Company",
            render: (user) => user.company_name || "—",
        },
        {
            key: "is_employer",
            label: "Type",
            render: (user) => (
                <div className="flex gap-1">
                    {user.is_employer && (
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            Employer
                        </span>
                    )}
                    {user.is_seeker && (
                        <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                            Seeker
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "is_active",
            label: "Status",
            sortable: true,
            render: (user) => (
                <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${user.is_active
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                >
                    {user.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "date_joined",
            label: "Joined",
            sortable: true,
            render: (user) => new Date(user.date_joined).toLocaleDateString(),
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
                    <h1 className="font-heading text-2xl font-bold text-foreground">Users</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage users and employers
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search users..."
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Types</option>
                    <option value="employer">Employers</option>
                    <option value="seeker">Job Seekers</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <DataTable
                data={filteredUsers}
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
                title={editingUser ? "Edit User" : "Create User"}
                onSubmit={handleSubmit}
                initialData={editingUser || undefined}
                fields={[
                    { name: "username", label: "Username", type: "text", required: true },
                    { name: "email", label: "Email", type: "email", required: true },
                    { name: "companyName", label: "Company Name", type: "text" },
                    {
                        name: "isEmployer",
                        label: "Is Employer",
                        type: "select",
                        required: true,
                        options: [
                            { value: "true", label: "Yes" },
                            { value: "false", label: "No" },
                        ],
                        defaultValue: "false",
                    },
                    {
                        name: "isSeeker",
                        label: "Is Job Seeker",
                        type: "select",
                        required: true,
                        options: [
                            { value: "true", label: "Yes" },
                            { value: "false", label: "No" },
                        ],
                        defaultValue: "true",
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
                title="Delete Users"
                message="Are you sure you want to delete the selected users? This will also delete all their jobs and applications."
                itemCount={selectedIds.size}
            />
        </div>
    )
}
