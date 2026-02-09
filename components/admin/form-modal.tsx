"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface FormModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    onSubmit: (data: Record<string, any>) => Promise<void>
    fields: {
        name: string
        label: string
        type: "text" | "textarea" | "select" | "number" | "email"
        required?: boolean
        options?: { value: string; label: string }[]
        defaultValue?: any
    }[]
    initialData?: Record<string, any>
}

export function FormModal({
    isOpen,
    onClose,
    title,
    onSubmit,
    fields,
    initialData,
}: FormModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            const initial: Record<string, any> = {}
            fields.forEach((field) => {
                initial[field.name] = initialData?.[field.name] ?? field.defaultValue ?? ""
            })
            setFormData(initial)
            setError(null)
        }
    }, [isOpen, fields, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await onSubmit(formData)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="mb-1 block text-sm font-medium text-foreground">
                                {field.label}
                                {field.required && <span className="text-destructive"> *</span>}
                            </label>
                            {field.type === "textarea" ? (
                                <textarea
                                    value={formData[field.name] || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [field.name]: e.target.value })
                                    }
                                    required={field.required}
                                    rows={4}
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            ) : field.type === "select" ? (
                                <select
                                    value={formData[field.name] || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [field.name]: e.target.value })
                                    }
                                    required={field.required}
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Select...</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    value={formData[field.name] || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [field.name]: e.target.value })
                                    }
                                    required={field.required}
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
