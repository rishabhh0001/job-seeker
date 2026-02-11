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
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Calendar,
    Link as LinkIcon,
} from "lucide-react"
import { useSession, authClient } from "@/lib/auth-client"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

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

    // Basic Info
    const [name, setName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [role, setRole] = useState("")

    // Contact Info
    const [phone, setPhone] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [country, setCountry] = useState("")
    const [postalCode, setPostalCode] = useState("")

    // Education
    const [highestQualification, setHighestQualification] = useState("")
    const [collegeName, setCollegeName] = useState("")
    const [major, setMajor] = useState("")
    const [graduationYear, setGraduationYear] = useState("")
    const [gpa, setGpa] = useState("")

    // Professional
    const [yearsOfExperience, setYearsOfExperience] = useState("")
    const [currentJobTitle, setCurrentJobTitle] = useState("")
    const [linkedin, setLinkedin] = useState("")
    const [portfolio, setPortfolio] = useState("")
    const [skills, setSkills] = useState("")

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
                const u = data.user
                setName(u.name || "")
                setFirstName(u.firstName || "")
                setLastName(u.lastName || "")
                setCompanyName(u.companyName || "")
                setRole(u.role || "applicant")
                // Contact
                setPhone(u.phone || "")
                setDateOfBirth(u.dateOfBirth || "")
                setAddress(u.address || "")
                setCity(u.city || "")
                setState(u.state || "")
                setCountry(u.country || "")
                setPostalCode(u.postalCode || "")
                // Education
                setHighestQualification(u.highestQualification || "")
                setCollegeName(u.collegeName || "")
                setMajor(u.major || "")
                setGraduationYear(u.graduationYear ? u.graduationYear.toString() : "")
                setGpa(u.gpa ? u.gpa.toString() : "")
                // Professional
                setYearsOfExperience(u.yearsOfExperience ? u.yearsOfExperience.toString() : "")
                setCurrentJobTitle(u.currentJobTitle || "")
                setLinkedin(u.linkedin || "")
                setPortfolio(u.portfolio || "")
                setSkills(u.skills || "")
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

    async function handleSaveContact(e: React.FormEvent) {
        e.preventDefault()
        setSaving("contact")
        setError(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, dateOfBirth, address, city, state, country, postalCode }),
            })
            if (!res.ok) throw new Error("Failed to save")
            flash("Contact info saved!")
        } catch {
            setError("Failed to save contact info")
        } finally {
            setSaving(null)
        }
    }

    async function handleSaveEducation(e: React.FormEvent) {
        e.preventDefault()
        setSaving("education")
        setError(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    highestQualification,
                    collegeName,
                    major,
                    graduationYear: graduationYear ? parseInt(graduationYear) : null,
                    gpa: gpa ? parseFloat(gpa) : null, // max 10.0 scale
                }),
            })
            if (!res.ok) throw new Error("Failed to save")
            flash("Education info saved!")
        } catch {
            setError("Failed to save education info")
        } finally {
            setSaving(null)
        }
    }

    async function handleSaveProfessional(e: React.FormEvent) {
        e.preventDefault()
        setSaving("professional")
        setError(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
                    currentJobTitle,
                    linkedin,
                    portfolio,
                    skills,
                }),
            })
            if (!res.ok) throw new Error("Failed to save")
            flash("Professional info saved!")
        } catch {
            setError("Failed to save professional info")
        } finally {
            setSaving(null)
        }
    }

    async function handleSaveCompany(e: React.FormEvent) {
        e.preventDefault()
        setSaving("company")
        setError(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName }),
            })
            if (!res.ok) throw new Error("Failed to save")
            flash("Company info saved!")
        } catch {
            setError("Failed to save company info")
        } finally {
            setSaving(null)
        }
    }

    async function handleSaveAll() {
        setSaving("all")
        setError(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, firstName, lastName, companyName,
                    phone, dateOfBirth, address, city, state, country, postalCode,
                    highestQualification, collegeName, major,
                    graduationYear: graduationYear ? parseInt(graduationYear) : null,
                    gpa: gpa ? parseFloat(gpa) : null,
                    yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
                    currentJobTitle, linkedin, portfolio, skills,
                }),
            })
            if (!res.ok) throw new Error("Failed to save")
            flash("All settings saved successfully!")
        } catch {
            setError("Failed to save all settings")
        } finally {
            setSaving(null)
        }
    }

    async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving("password")
        setError(null)
        const formData = new FormData(e.currentTarget)
        const newPwd = formData.get("newPassword") as string
        const confirmPwd = formData.get("confirmPassword") as string

        if (newPwd !== confirmPwd) {
            setError("Passwords do not match")
            setSaving(null)
            return
        }

        try {
            await authClient.changePassword({
                newPassword: newPwd,
                currentPassword: formData.get("currentPassword") as string,
                revokeOtherSessions: false,
            })
            flash("Password changed successfully!")
            e.currentTarget.reset()
        } catch (err: any) {
            setError(err.message || "Failed to change password")
        } finally {
            setSaving(null)
        }
    }

    async function handleRegisterPasskey() {
        setSaving("passkey-register")
        setError(null)
        try {
            await authClient.passkey.addPasskey()
            flash("Passkey registered!")
            await fetchProfile()
        } catch (err: any) {
            setError(err.message || "Failed to register passkey")
        } finally {
            setSaving(null)
        }
    }

    async function handleDeletePasskey(id: string) {
        setSaving(`passkey-delete-${id}`)
        setError(null)
        try {
            const passkeyToDelete = passkeys.find((pk) => pk.id === id)
            if (passkeyToDelete) {
                await authClient.passkey.deletePasskey({
                    id: passkeyToDelete.id,
                })
                flash("Passkey deleted!")
                await fetchProfile()
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete passkey")
        } finally {
            setSaving(null)
        }
    }

    if (loading || isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const calculateAge = (dob: string) => {
        if (!dob) return null
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const age = dateOfBirth ? calculateAge(dateOfBirth) : null

    const isCollegeLevelQualification = ["Bachelor's", "Master's", "PhD", "Doctorate"].includes(highestQualification)

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
            <div className="animate-fade-in">
                <h1 className="font-heading text-3xl font-bold text-foreground">Profile Settings</h1>
                <p className="mt-1 text-muted-foreground">
                    Manage your personal information. This data will be shared with employers when you apply for jobs.
                </p>
            </div>

            {success && (
                <div className="animate-scale-in flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                </div>
            )}
            {error && (
                <div className="animate-scale-in rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Personal Info */}
            <AnimateOnScroll animation="fade-up" delay={100}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:border-primary/30">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
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
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Last Name</label>
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
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
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "personal"}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving === "personal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                    </form>
                </section>
            </AnimateOnScroll>

            {/* Contact Info */}
            <AnimateOnScroll animation="fade-up" delay={150}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-blue-500/5 hover:border-blue-500/30">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                            <Phone className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-foreground">Contact Information</h2>
                            {age && <p className="text-sm text-muted-foreground">Age: {age} years old</p>}
                        </div>
                    </div>
                    <form onSubmit={handleSaveContact} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Date of Birth</label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Street Address</label>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main St"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">City</label>
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="New York"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">State/Province</label>
                                <input
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="NY"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Country</label>
                                <input
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="USA"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Postal Code</label>
                                <input
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="10001"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "contact"}
                            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving === "contact" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Contact Info
                        </button>
                    </form>
                </section>
            </AnimateOnScroll>

            {/* Education */}
            <AnimateOnScroll animation="fade-up" delay={200}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-purple-500/5 hover:border-purple-500/30">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                            <GraduationCap className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-foreground">Education</h2>
                            <p className="text-sm text-muted-foreground">Your academic background</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveEducation} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Highest Qualification</label>
                            <select
                                value={highestQualification}
                                onChange={(e) => setHighestQualification(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 cursor-pointer"
                            >
                                <option value="">Select qualification</option>
                                <option value="High School">High School</option>
                                <option value="Associate's">Associate's Degree</option>
                                <option value="Bachelor's">Bachelor's Degree</option>
                                <option value="Master's">Master's Degree</option>
                                <option value="PhD">PhD</option>
                                <option value="Doctorate">Doctorate</option>
                            </select>
                        </div>

                        {isCollegeLevelQualification && (
                            <>
                                <div className="space-y-1.5 animate-fade-in">
                                    <label className="text-sm font-medium text-foreground">College/University Name</label>
                                    <input
                                        value={collegeName}
                                        onChange={(e) => setCollegeName(e.target.value)}
                                        placeholder="e.g., Stanford University"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50"
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5 animate-fade-in">
                                        <label className="text-sm font-medium text-foreground">Major/Field of Study</label>
                                        <input
                                            value={major}
                                            onChange={(e) => setMajor(e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5 animate-fade-in">
                                        <label className="text-sm font-medium text-foreground">GPA (out of 10.0)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            value={gpa}
                                            onChange={(e) => setGpa(e.target.value)}
                                            placeholder="8.50"
                                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Graduation Year</label>
                            <input
                                type="number"
                                min="1950"
                                max="2050"
                                value={graduationYear}
                                onChange={(e) => setGraduationYear(e.target.value)}
                                placeholder="2024"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "education"}
                            className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving === "education" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Education
                        </button>
                    </form>
                </section>
            </AnimateOnScroll>

            {/* Professional */}
            <AnimateOnScroll animation="fade-up" delay={250}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-green-500/5 hover:border-green-500/30">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500/20">
                            <Briefcase className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-foreground">Professional Experience</h2>
                            <p className="text-sm text-muted-foreground">Your work history and skills</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveProfessional} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Years of Experience</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={yearsOfExperience}
                                    onChange={(e) => setYearsOfExperience(e.target.value)}
                                    placeholder="5"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Current Job Title</label>
                                <input
                                    value={currentJobTitle}
                                    onChange={(e) => setCurrentJobTitle(e.target.value)}
                                    placeholder="e.g., Senior Software Engineer"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-500/50"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">LinkedIn Profile</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-500/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Portfolio/Website</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        value={portfolio}
                                        onChange={(e) => setPortfolio(e.target.value)}
                                        placeholder="https://yourportfolio.com"
                                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Skills</label>
                            <textarea
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="React, TypeScript, Node.js, Python, AWS, Docker..."
                                rows={3}
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-green-500/50 resize-none"
                            />
                            <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "professional"}
                            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving === "professional" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Professional Info
                        </button>
                    </form>
                </section>
            </AnimateOnScroll>

            {/* Company */}
            <AnimateOnScroll animation="fade-up" delay={300}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-amber-500/5 hover:border-amber-500/30">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
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
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-amber-500/50"
                            />
                            <p className="text-xs text-muted-foreground">Setting a company name will switch your role to Employer</p>
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "company"}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving === "company" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Company
                        </button>
                    </form>
                </section>
            </AnimateOnScroll>

            {/* Security */}
            <AnimateOnScroll animation="fade-up" delay={350}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-red-500/5 hover:border-red-500/30">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500/20">
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
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 hover:border-red-500/50"
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
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 hover:border-red-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    placeholder="Re-enter password"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 hover:border-red-500/50"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "password"}
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                            Change Password
                        </button>
                    </form>
                </section>
            </AnimateOnScroll>

            {/* Passkeys */}
            <AnimateOnScroll animation="fade-up" delay={400}>
                <section className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-violet-500/5 hover:border-violet-500/30">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-500/20">
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
                            className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                    className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 transition-all duration-200 hover:border-violet-500/50 hover:shadow-sm"
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
                                        className="text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
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
            </AnimateOnScroll>

            {/* Save All Settings */}
            <AnimateOnScroll animation="fade-up" delay={450}>
                <section className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                    <h2 className="font-heading text-lg font-bold text-foreground mb-2">Save All Settings</h2>
                    <p className="text-sm text-muted-foreground mb-4">Save all your profile sections at once</p>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving === "all"}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {saving === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save All Settings
                    </button>
                </section>
            </AnimateOnScroll>
        </div>
    )
}
