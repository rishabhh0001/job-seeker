"use client"

import { useEffect, useState } from "react"
import {
    RefreshCw,
    Loader2,
    ChevronDown,
    Trash2,
    Shield,
    Crown,
    User as UserIcon,
    Building2,
    Search,
} from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    role: string
    firstName: string
    lastName: string
    companyName: string
    emailVerified: boolean
    createdAt: string
}

const ROLES = ["owner", "superadmin", "admin", "employer", "applicant"]

const ROLE_COLORS: Record<string, string> = {
    owner: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    superadmin: "bg-red-500/15 text-red-400 border-red-500/30",
    admin: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    employer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    applicant: "bg-slate-500/15 text-slate-400 border-slate-500/30",
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
    owner: <Crown className="h-3.5 w-3.5" />,
    superadmin: <Shield className="h-3.5 w-3.5" />,
    admin: <Shield className="h-3.5 w-3.5" />,
    employer: <Building2 className="h-3.5 w-3.5" />,
    applicant: <UserIcon className="h-3.5 w-3.5" />,
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editRole, setEditRole] = useState("")
    const [saving, setSaving] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("")

    const OWNER_EMAIL = "rishabh.joshi260905@gmail.com"

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            setRefreshing(true)
            const url = roleFilter
                ? `/api/admin/users?role=${roleFilter}`
                : "/api/admin/users"
            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setUsers(data.users || [])
        } catch {
            setError("Failed to load users")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    function flash(msg: string) {
        setSuccess(msg)
        setTimeout(() => setSuccess(null), 3000)
    }

    async function handleRoleChange(userId: string, newRole: string) {
        setSaving(userId)
        setError(null)
        try {
            const res = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, role: newRole }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to update")
            }
            setUsers(
                users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            )
            setEditingId(null)
            flash("Role updated!")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(null)
        }
    }

    async function handleDelete(userId: string) {
        setDeletingId(userId)
        setError(null)
        try {
            const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [userId] }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to delete")
            }
            setUsers(users.filter((u) => u.id !== userId))
            flash("User deleted!")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeletingId(null)
        }
    }

    const filtered = users.filter((u) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
    })

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-foreground">
                        User Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {users.length} total users
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            {success && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    {success}
                </div>
            )}
            {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or role..."
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value)
                        setTimeout(fetchUsers, 0)
                    }}
                    className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                    <option value="">All Roles</option>
                    {ROLES.map((r) => (
                        <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* User List */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Company</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
                                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user) => {
                                const isOwner = user.email === OWNER_EMAIL
                                return (
                                    <tr
                                        key={user.id}
                                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {(user.name || "?")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {user.name || "—"}
                                                        {isOwner && (
                                                            <Crown className="inline ml-1.5 h-3.5 w-3.5 text-amber-400" />
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                        ID: {user.id.slice(0, 12)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">{user.email}</td>
                                        <td className="px-4 py-3">
                                            {editingId === user.id && !isOwner ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value)}
                                                        className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                                                    >
                                                        {ROLES.map((r) => (
                                                            <option key={r} value={r}>
                                                                {r}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() =>
                                                            handleRoleChange(user.id, editRole)
                                                        }
                                                        disabled={saving === user.id}
                                                        className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                                    >
                                                        {saving === user.id ? "..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        if (!isOwner) {
                                                            setEditingId(user.id)
                                                            setEditRole(user.role)
                                                        }
                                                    }}
                                                    disabled={isOwner}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[user.role] || ROLE_COLORS.applicant
                                                        } ${isOwner ? "cursor-default" : "cursor-pointer hover:opacity-80"}`}
                                                >
                                                    {ROLE_ICONS[user.role]}
                                                    {user.role || "applicant"}
                                                    {!isOwner && (
                                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.companyName || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!isOwner && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete user ${user.name || user.email}?`)) {
                                                            handleDelete(user.id)
                                                        }
                                                    }}
                                                    disabled={deletingId === user.id}
                                                    className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === user.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
