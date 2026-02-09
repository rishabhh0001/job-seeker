"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    title: string
    message: string
    itemCount?: number
}

export function DeleteConfirmation({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemCount = 1,
}: DeleteConfirmationProps) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error("Delete failed:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
                </div>

                <p className="mb-6 text-sm text-muted-foreground">{message}</p>

                {itemCount > 1 && (
                    <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                        You are about to delete {itemCount} items. This action cannot be undone.
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
