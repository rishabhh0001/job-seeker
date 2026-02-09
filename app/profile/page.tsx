"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    User,
    Shield,
    Building2,
    Fingerprint,
    Loader2,
    Save,
    Trash2,
    Plus,
    KeyRound,
    CheckCircle2,
} from "lucide-react"
import { useSession, authClient } from "@/lib/auth-client"

interface PasskeyInfo {
    id: string
    name: string | null
    deviceType: string
    backedUp: boolean
    createdAt: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { data: session, isPending } = useSession()
    const user = session?.user as any

    const [name, setName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [role, setRole] = useState("")
    const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login?callbackUrl=/profile")
            return
        }
        if (session) {
            fetchProfile()
        }
    }, [session, isPending])

    async function fetchProfile() {
        try {
            const res = await fetch("/api/profile")
            const data = await res.json()
            if (data.user) {
                setName(data.user.name || "")
                setFirstName(data.user.firstName || "")
                setLastName(data.user.lastName || "")
                setCompanyName(data.user.companyName || "")
                setRole(data.user.role || "applicant")
            }
            if (data.passkeys) {
                setPasskeys(data.passkeys)
            }
        } catch {
            setError("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    function flash(msg: string) {
        setSuccess(msg)
        setTimeout(() => setSuccess(null), 3000)
    }

    async function handleSavePersonal(e: React.FormEvent) {
        e.preventDefault()
        setSaving("personal")
        setError(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, firstName, lastName }),
            })
            if (!res.ok) throw new Error("Failed to save")
            flash("Personal info saved!")
        } catch {
            setError("Failed to save personal info")
        } finally {
            setSaving(null)
        }
    }

    async function handleSaveCompany(e: React.FormEvent) {
        e.preventDefault()
        setSaving("company")
        setError(null)
        const newRole = companyName ? "employer" : role
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName, role: newRole }),
            })
            if (!res.ok) throw new Error("Failed to save")
            setRole(newRole)
            flash("Company info saved!")
        } catch {
            setError("Failed to save company info")
        } finally {
            setSaving(null)
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        setSaving("password")
        setError(null)
        const form = e.target as HTMLFormElement
        const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value
        const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value
        const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            setSaving(null)
            return
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters")
            setSaving(null)
            return
        }

        try {
            await authClient.changePassword({
                currentPassword,
                newPassword,
            })
            flash("Password changed!")
            form.reset()
        } catch {
            setError("Failed to change password. Check your current password.")
        } finally {
            setSaving(null)
        }
    }

    async function handleRegisterPasskey() {
        setSaving("passkey-register")
        setError(null)
        try {
            await authClient.passkey.addPasskey({
                name: `Passkey ${passkeys.length + 1}`,
            })
            flash("Passkey registered!")
            fetchProfile()
        } catch {
            setError("Failed to register passkey. Try again.")
        } finally {
            setSaving(null)
        }
    }

    async function handleDeletePasskey(id: string) {
        setSaving(`passkey-delete-${id}`)
        setError(null)
        try {
            await authClient.passkey.deletePasskey({ id })
            setPasskeys(passkeys.filter((p) => p.id !== id))
            flash("Passkey removed!")
        } catch {
            setError("Failed to remove passkey")
        } finally {
            setSaving(null)
        }
    }

    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
            <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Account Settings</h1>
                <p className="mt-1 text-muted-foreground">Manage your profile, security, and preferences</p>
            </div>

            {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                </div>
            )}
            {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Personal Info */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-heading text-lg font-bold text-foreground">Personal Information</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <form onSubmit={handleSavePersonal} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">First Name</label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Last Name</label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Display Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Display name"
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving === "personal"}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving === "personal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </form>
            </section>

            {/* Company */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                        <Building2 className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="font-heading text-lg font-bold text-foreground">Company & Role</h2>
                        <p className="text-sm text-muted-foreground">
                            Current role: <span className="font-semibold capitalize text-foreground">{role}</span>
                        </p>
                    </div>
                </div>
                <form onSubmit={handleSaveCompany} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Company Name</label>
                        <input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Your company name (set to become employer)"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                        />
                        <p className="text-xs text-muted-foreground">Setting a company name will switch your role to Employer</p>
                    </div>
                    <button
                        type="submit"
                        disabled={saving === "company"}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                        {saving === "company" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Company
                    </button>
                </form>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                        <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Security</h2>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Current Password</label>
                        <input
                            name="currentPassword"
                            type="password"
                            required
                            placeholder="Enter current password"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">New Password</label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                placeholder="Min 8 characters"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="Re-enter password"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving === "password"}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                        {saving === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                        Change Password
                    </button>
                </form>
            </section>

            {/* Passkeys */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Fingerprint className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-foreground">Passkeys</h2>
                            <p className="text-sm text-muted-foreground">Sign in without a password</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRegisterPasskey}
                        disabled={saving === "passkey-register"}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-sm font-bold text-white hover:bg-violet-600 disabled:opacity-50"
                    >
                        {saving === "passkey-register" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Add
                    </button>
                </div>

                {passkeys.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-6">No passkeys registered yet</p>
                ) : (
                    <div className="space-y-3">
                        {passkeys.map((pk) => (
                            <div
                                key={pk.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Fingerprint className="h-5 w-5 text-violet-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {pk.name || "Unnamed Passkey"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {pk.deviceType} · Added{" "}
                                            {new Date(pk.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePasskey(pk.id)}
                                    disabled={saving === `passkey-delete-${pk.id}`}
                                    className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                >
                                    {saving === `passkey-delete-${pk.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
