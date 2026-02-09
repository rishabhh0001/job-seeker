"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { DataTable, Column } from "@/components/admin/data-table"
import { SearchBar } from "@/components/admin/search-bar"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { FormModal } from "@/components/admin/form-modal"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"

type Category = {
    id: number
    name: string
    slug: string
    description: string
    job_count: number
}

export default function CategoriesAdminPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        const filtered = categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cat.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredCategories(filtered)
    }, [categories, searchQuery])

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories")
            const data = await res.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingCategory(null)
        setIsFormOpen(true)
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setIsFormOpen(true)
    }

    const handleSubmit = async (data: Record<string, any>) => {
        const method = editingCategory ? "PUT" : "POST"
        const payload = editingCategory
            ? { ...data, id: editingCategory.id }
            : data

        const res = await fetch("/api/admin/categories", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to save category")
        }

        await fetchCategories()
        setSelectedIds(new Set())
    }

    const handleDelete = async () => {
        const ids = Array.from(selectedIds)
        const res = await fetch("/api/admin/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Failed to delete categories")
        }

        await fetchCategories()
        setSelectedIds(new Set())
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
    }

    const columns: Column<Category>[] = [
        {
            key: "name",
            label: "Name",
            sortable: true,
            render: (cat) => (
                <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.slug}</p>
                </div>
            ),
        },
        {
            key: "description",
            label: "Description",
            render: (cat) => (
                <p className="max-w-md truncate text-muted-foreground">
                    {cat.description || "—"}
                </p>
            ),
        },
        {
            key: "job_count",
            label: "Jobs",
            sortable: true,
            render: (cat) => (
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {cat.job_count}
                </span>
            ),
        },
    ]

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-foreground">
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage job categories
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            <div className="mb-4">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search categories..."
                />
            </div>

            <DataTable
                data={filteredCategories}
                columns={columns}
                onRowClick={handleEdit}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />

            <BulkActionBar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
                actions={[
                    {
                        label: "Delete",
                        onClick: () => setIsDeleteOpen(true),
                        variant: "destructive",
                    },
                ]}
            />

            <FormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCategory ? "Edit Category" : "Create Category"}
                onSubmit={handleSubmit}
                initialData={editingCategory || undefined}
                fields={[
                    {
                        name: "name",
                        label: "Name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "slug",
                        label: "Slug",
                        type: "text",
                        required: true,
                        defaultValue: editingCategory?.slug || "",
                    },
                    {
                        name: "description",
                        label: "Description",
                        type: "textarea",
                    },
                ]}
            />

            <DeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Categories"
                message="Are you sure you want to delete the selected categories? This action cannot be undone."
                itemCount={selectedIds.size}
            />
        </div>
    )
}
