"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function CompanyCreateForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        companyName: "",
        username: "",
        description: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/companies/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to create company")
            }

            router.push("/companies")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <div>
                    <h2 className="text-lg font-semibold">Company Information</h2>
                    <p className="text-sm text-muted-foreground">
                        Basic details about the company.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium">
                            Company Name <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="companyName"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.companyName}
                            onChange={(e) =>
                                setFormData({ ...formData, companyName: e.target.value })
                            }
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">
                            Username (Slug) <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="username"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            placeholder="e.g. acme-corp"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Company
                </button>
            </div>
        </form>
    )
}
