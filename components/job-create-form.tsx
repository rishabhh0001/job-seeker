"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { JOB_PRESETS } from "@/lib/job-presets"
import Link from "next/link"
import { ArrowLeft, Loader2, Wand2 } from "lucide-react"

type Category = {
    id: number
    name: string
}

export function JobCreateForm({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        jobType: "FT",
        location: "",
        salaryMin: "",
        salaryMax: "",
        categoryId: "",
    })

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "")
            setFormData((prev) => ({ ...prev, slug }))
        }
    }, [formData.title])

    const handleApplyPreset = (type: string) => {
        const preset = JOB_PRESETS[Object.keys(JOB_PRESETS).find(k => JOB_PRESETS[k].value === type) || ""]
        if (preset) {
            setFormData((prev) => ({
                ...prev,
                jobType: preset.value,
                description: prev.description
                    ? prev.description
                    : preset.descriptionTemplate + "\n\n**Requirements:**\n" + preset.requirements.map(r => `- ${r}`).join("\n"),
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/jobs/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
                    salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
                    categoryId: Number(formData.categoryId),
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to create job")
            }

            const data = await res.json()
            router.push(`/jobs/${data.job.slug}`)
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

            {/* Basic Info */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <div>
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    <p className="text-sm text-muted-foreground">
                        The core details of the position.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                            Job Title <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="title"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="slug" className="text-sm font-medium">
                            URL Slug <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="slug"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.slug}
                            onChange={(e) =>
                                setFormData({ ...formData, slug: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">
                            Category <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="category"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.categoryId}
                            onChange={(e) =>
                                setFormData({ ...formData, categoryId: e.target.value })
                            }
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">
                            Location <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="location"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="e.g. Remote, San Francisco, CA"
                        />
                    </div>
                </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <div>
                    <h2 className="text-lg font-semibold">Job Details</h2>
                    <p className="text-sm text-muted-foreground">
                        Specifics about the role and compensation.
                    </p>
                </div>

                <div className="md:grid md:grid-cols-3 md:gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Employment Type</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(JOB_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleApplyPreset(preset.value)}
                                    className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${formData.jobType === preset.value
                                        ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="salaryMin" className="text-sm font-medium">Min Salary (₹)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                            <input
                                id="salaryMin"
                                type="number"
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.salaryMin}
                                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="salaryMax" className="text-sm font-medium">Max Salary (₹)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                            <input
                                id="salaryMax"
                                type="number"
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.salaryMax}
                                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-destructive">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => handleApplyPreset(formData.jobType)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <Wand2 className="h-3 w-3" />
                            Fill with template
                        </button>
                    </div>
                    <textarea
                        id="description"
                        required
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe responsibilities, requirements, and benefits..."
                    />
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
                    Create Job
                </button>
            </div>
        </form>
    )
}
