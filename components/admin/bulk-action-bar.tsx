"use client"

import { X } from "lucide-react"

interface BulkActionBarProps {
    selectedCount: number
    onClearSelection: () => void
    actions: {
        label: string
        onClick: () => void
        variant?: "default" | "destructive" | "success"
    }[]
}

export function BulkActionBar({
    selectedCount,
    onClearSelection,
    actions,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null

    return (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
            <span className="text-sm font-medium text-foreground">
                {selectedCount} selected
            </span>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-2">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${action.variant === "destructive"
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : action.variant === "success"
                                    ? "bg-accent/10 text-accent hover:bg-accent/20"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
            <button
                onClick={onClearSelection}
                className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
