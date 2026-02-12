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
    Eye,
    X,
    Save,
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Link as LinkIcon,
    Globe,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"

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

interface UserProfile extends User {
    phone: string
    dateOfBirth: string
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    highestQualification: string
    collegeName: string
    major: string
    graduationYear: number | null
    gpa: number | null
    yearsOfExperience: number | null
    currentJobTitle: string
    linkedin: string
    portfolio: string
    description: string
    website: string
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
    const { data: session } = useSession()
    const currentUserRole = (session?.user as any)?.role || ""
    const canViewProfiles = ["owner", "superadmin"].includes(currentUserRole)

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

    // User profile detail modal state
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileForm, setProfileForm] = useState<Record<string, any>>({})
    const [profileSaving, setProfileSaving] = useState(false)

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

    async function openProfile(userId: string) {
        setProfileLoading(true)
        setViewingProfile(null)
        try {
            const res = await fetch(`/api/admin/users/${userId}`)
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to load profile")
            }
            const data = await res.json()
            const u = data.user
            setViewingProfile(u)
            setProfileForm({
                name: u.name || "",
                firstName: u.firstName || "",
                lastName: u.lastName || "",
                companyName: u.companyName || "",
                description: u.description || "",
                website: u.website || "",
                phone: u.phone || "",
                dateOfBirth: u.dateOfBirth || "",
                address: u.address || "",
                city: u.city || "",
                state: u.state || "",
                country: u.country || "",
                postalCode: u.postalCode || "",
                highestQualification: u.highestQualification || "",
                collegeName: u.collegeName || "",
                major: u.major || "",
                graduationYear: u.graduationYear ? u.graduationYear.toString() : "",
                gpa: u.gpa ? u.gpa.toString() : "",
                yearsOfExperience: u.yearsOfExperience ? u.yearsOfExperience.toString() : "",
                currentJobTitle: u.currentJobTitle || "",
                linkedin: u.linkedin || "",
                portfolio: u.portfolio || "",
                skills: u.skills || "",
            })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setProfileLoading(false)
        }
    }

    async function handleSaveProfile() {
        if (!viewingProfile) return
        setProfileSaving(true)
        setError(null)
        try {
            const payload = {
                ...profileForm,
                graduationYear: profileForm.graduationYear ? parseInt(profileForm.graduationYear) : null,
                gpa: profileForm.gpa ? parseFloat(profileForm.gpa) : null,
                yearsOfExperience: profileForm.yearsOfExperience ? parseInt(profileForm.yearsOfExperience) : null,
            }
            const res = await fetch(`/api/admin/users/${viewingProfile.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to save profile")
            }
            flash("Profile saved!")
            setViewingProfile(null)
            fetchUsers()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setProfileSaving(false)
        }
    }

    function updateProfileField(key: string, value: any) {
        setProfileForm((prev) => ({ ...prev, [key]: value }))
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

    const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"

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
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Company</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Joined</th>
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
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                                    {(user.name || "?")[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground truncate">
                                                        {user.name || "—"}
                                                        {isOwner && (
                                                            <Crown className="inline ml-1.5 h-3.5 w-3.5 text-amber-400" />
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate sm:hidden">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px] hidden sm:block">
                                                        ID: {user.id.slice(0, 12)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground hidden sm:table-cell">
                                            <span className="truncate block max-w-[200px]">{user.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingId === user.id && !isOwner ? (
                                                <div className="flex flex-wrap items-center gap-2">
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
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                            {user.companyName || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canViewProfiles && (
                                                    <button
                                                        onClick={() => openProfile(user.id)}
                                                        className="rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors"
                                                        title="View Profile"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
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
                                            </div>
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

            {/* Profile Loading Overlay */}
            {profileLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* User Profile Detail/Edit Modal */}
            {viewingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border p-4 sm:p-6 bg-muted/20 shrink-0">
                            <div>
                                <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                                    User Profile
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {viewingProfile.email} · <span className="capitalize">{viewingProfile.role}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingProfile(null)}
                                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                            {/* Personal Info */}
                            <section className="rounded-xl border border-border bg-muted/10 p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <UserIcon className="h-4 w-4 text-primary" />
                                    <h3 className="font-heading text-base font-bold text-foreground">Personal Information</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">First Name</label>
                                        <input
                                            value={profileForm.firstName || ""}
                                            onChange={(e) => updateProfileField("firstName", e.target.value)}
                                            className={inputClass}
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                                        <input
                                            value={profileForm.lastName || ""}
                                            onChange={(e) => updateProfileField("lastName", e.target.value)}
                                            className={inputClass}
                                            placeholder="Last name"
                                        />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                                        <input
                                            value={profileForm.name || ""}
                                            onChange={(e) => updateProfileField("name", e.target.value)}
                                            className={inputClass}
                                            placeholder="Display name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                                        <input
                                            value={profileForm.companyName || ""}
                                            onChange={(e) => updateProfileField("companyName", e.target.value)}
                                            className={inputClass}
                                            placeholder="Company name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={profileForm.website || ""}
                                                onChange={(e) => updateProfileField("website", e.target.value)}
                                                className={`${inputClass} pl-10`}
                                                placeholder="https://company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                                        <textarea
                                            value={profileForm.description || ""}
                                            onChange={(e) => updateProfileField("description", e.target.value)}
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                            placeholder="Company description or user bio..."
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Contact Info */}
                            <section className="rounded-xl border border-border bg-muted/10 p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Phone className="h-4 w-4 text-blue-500" />
                                    <h3 className="font-heading text-base font-bold text-foreground">Contact Information</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Phone</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone || ""}
                                            onChange={(e) => updateProfileField("phone", e.target.value)}
                                            className={inputClass}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={profileForm.dateOfBirth || ""}
                                            onChange={(e) => updateProfileField("dateOfBirth", e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground">Street Address</label>
                                        <input
                                            value={profileForm.address || ""}
                                            onChange={(e) => updateProfileField("address", e.target.value)}
                                            className={inputClass}
                                            placeholder="123 Main St"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">City</label>
                                        <input
                                            value={profileForm.city || ""}
                                            onChange={(e) => updateProfileField("city", e.target.value)}
                                            className={inputClass}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">State/Province</label>
                                        <input
                                            value={profileForm.state || ""}
                                            onChange={(e) => updateProfileField("state", e.target.value)}
                                            className={inputClass}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Country</label>
                                        <input
                                            value={profileForm.country || ""}
                                            onChange={(e) => updateProfileField("country", e.target.value)}
                                            className={inputClass}
                                            placeholder="Country"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Postal Code</label>
                                        <input
                                            value={profileForm.postalCode || ""}
                                            onChange={(e) => updateProfileField("postalCode", e.target.value)}
                                            className={inputClass}
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Education */}
                            <section className="rounded-xl border border-border bg-muted/10 p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <GraduationCap className="h-4 w-4 text-purple-500" />
                                    <h3 className="font-heading text-base font-bold text-foreground">Education</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Highest Qualification</label>
                                        <select
                                            value={profileForm.highestQualification || ""}
                                            onChange={(e) => updateProfileField("highestQualification", e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">Select qualification</option>
                                            <option value="High School">High School</option>
                                            <option value="Associate's">Associate&apos;s Degree</option>
                                            <option value="Bachelor's">Bachelor&apos;s Degree</option>
                                            <option value="Master's">Master&apos;s Degree</option>
                                            <option value="PhD">PhD</option>
                                            <option value="Doctorate">Doctorate</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">College/University</label>
                                        <input
                                            value={profileForm.collegeName || ""}
                                            onChange={(e) => updateProfileField("collegeName", e.target.value)}
                                            className={inputClass}
                                            placeholder="Stanford University"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Major</label>
                                        <input
                                            value={profileForm.major || ""}
                                            onChange={(e) => updateProfileField("major", e.target.value)}
                                            className={inputClass}
                                            placeholder="Computer Science"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Graduation Year</label>
                                        <input
                                            type="number"
                                            min="1950"
                                            max="2050"
                                            value={profileForm.graduationYear || ""}
                                            onChange={(e) => updateProfileField("graduationYear", e.target.value)}
                                            className={inputClass}
                                            placeholder="2024"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">GPA</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            value={profileForm.gpa || ""}
                                            onChange={(e) => updateProfileField("gpa", e.target.value)}
                                            className={inputClass}
                                            placeholder="3.75"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Professional */}
                            <section className="rounded-xl border border-border bg-muted/10 p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Briefcase className="h-4 w-4 text-green-500" />
                                    <h3 className="font-heading text-base font-bold text-foreground">Professional Experience</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Years of Experience</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={profileForm.yearsOfExperience || ""}
                                            onChange={(e) => updateProfileField("yearsOfExperience", e.target.value)}
                                            className={inputClass}
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Current Job Title</label>
                                        <input
                                            value={profileForm.currentJobTitle || ""}
                                            onChange={(e) => updateProfileField("currentJobTitle", e.target.value)}
                                            className={inputClass}
                                            placeholder="Senior Software Engineer"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={profileForm.linkedin || ""}
                                                onChange={(e) => updateProfileField("linkedin", e.target.value)}
                                                className={`${inputClass} pl-10`}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Portfolio</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={profileForm.portfolio || ""}
                                                onChange={(e) => updateProfileField("portfolio", e.target.value)}
                                                className={`${inputClass} pl-10`}
                                                placeholder="https://yourportfolio.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground">Skills</label>
                                        <textarea
                                            value={profileForm.skills || ""}
                                            onChange={(e) => updateProfileField("skills", e.target.value)}
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                            placeholder="React, TypeScript, Node.js..."
                                        />
                                        <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer - Save/Cancel */}
                        <div className="border-t border-border p-4 sm:p-6 bg-muted/20 flex flex-col sm:flex-row gap-2 sm:justify-end shrink-0">
                            <button
                                onClick={() => setViewingProfile(null)}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={profileSaving}
                                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                            >
                                {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
