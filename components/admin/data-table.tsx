"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

export interface Column<T> {
    key: keyof T | string
    label: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    onRowClick?: (item: T) => void
    selectedIds?: Set<number>
    onSelectionChange?: (ids: Set<number>) => void
    idKey?: keyof T
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    onRowClick,
    selectedIds = new Set(),
    onSelectionChange,
    idKey = "id" as keyof T,
}: DataTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(columnKey)
            setSortDirection("asc")
        }
    }

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        if (aVal === bVal) return 0
        const comparison = aVal > bVal ? 1 : -1
        return sortDirection === "asc" ? comparison : -comparison
    })

    const toggleSelectAll = () => {
        if (selectedIds.size === data.length) {
            onSelectionChange?.(new Set())
        } else {
            onSelectionChange?.(new Set(data.map((item) => item[idKey] as number)))
        }
    }

    const toggleSelect = (id: number) => {
        const newSelection = new Set(selectedIds)
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        onSelectionChange?.(newSelection)
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-secondary/50">
                            {onSelectionChange && (
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === data.length && data.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-border"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                >
                                    {column.sortable ? (
                                        <button
                                            onClick={() => handleSort(String(column.key))}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            {column.label}
                                            {sortColumn === column.key ? (
                                                sortDirection === "asc" ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )
                                            ) : (
                                                <ChevronsUpDown className="h-3 w-3 opacity-40" />
                                            )}
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedData.length > 0 ? (
                            sortedData.map((item, index) => (
                                <tr
                                    key={index}
                                    onClick={() => onRowClick?.(item)}
                                    className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-muted/30" : ""
                                        }`}
                                >
                                    {onSelectionChange && (
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(item[idKey] as number)}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    toggleSelect(item[idKey] as number)
                                                }}
                                                className="h-4 w-4 rounded border-border"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={String(column.key)} className="px-6 py-4 text-foreground">
                                            {column.render
                                                ? column.render(item)
                                                : String(item[column.key] ?? "")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                                    className="px-6 py-16 text-center text-muted-foreground"
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
