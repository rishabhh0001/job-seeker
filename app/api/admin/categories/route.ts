import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - List all categories
export async function GET() {
    try {
        const categories = await sql`
      SELECT c.id, c.name, c.slug, c.description,
             COUNT(j.id) FILTER (WHERE j.is_active = true) AS job_count
      FROM jobs_category c
      LEFT JOIN jobs_job j ON j.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.description
      ORDER BY c.name
    `

        return NextResponse.json({ categories })
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        )
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        const { name, slug, description } = await request.json()

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Name and slug are required" },
                { status: 400 }
            )
        }

        const result = await sql`
      INSERT INTO jobs_category (name, slug, description)
      VALUES (${name}, ${slug}, ${description || ""})
      RETURNING id, name, slug, description
    `

        return NextResponse.json({ category: result[0] }, { status: 201 })
    } catch (error) {
        console.error("Error creating category:", error)
        if (error instanceof Error && error.message.includes("duplicate")) {
            return NextResponse.json(
                { error: "A category with this slug already exists" },
                { status: 409 }
            )
        }
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        )
    }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
    try {
        const { id, name, slug, description } = await request.json()

        if (!id || !name || !slug) {
            return NextResponse.json(
                { error: "ID, name, and slug are required" },
                { status: 400 }
            )
        }

        const result = await sql`
      UPDATE jobs_category
      SET name = ${name}, slug = ${slug}, description = ${description || ""}
      WHERE id = ${id}
      RETURNING id, name, slug, description
    `

        if (result.length === 0) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }

        return NextResponse.json({ category: result[0] })
    } catch (error) {
        console.error("Error updating category:", error)
        if (error instanceof Error && error.message.includes("duplicate")) {
            return NextResponse.json(
                { error: "A category with this slug already exists" },
                { status: 409 }
            )
        }
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        )
    }
}

// DELETE - Delete categories
export async function DELETE(request: NextRequest) {
    try {
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "Category IDs are required" },
                { status: 400 }
            )
        }

        // Check if any categories have jobs
        const jobCheck = await sql`
      SELECT category_id, COUNT(*) as count
      FROM jobs_job
      WHERE category_id = ANY(${ids})
      GROUP BY category_id
    `

        if (jobCheck.length > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete categories that have jobs associated with them",
                    categoriesWithJobs: jobCheck,
                },
                { status: 409 }
            )
        }

        await sql`
      DELETE FROM jobs_category
      WHERE id = ANY(${ids})
    `

        return NextResponse.json({ success: true, deletedCount: ids.length })
    } catch (error) {
        console.error("Error deleting categories:", error)
        return NextResponse.json(
            { error: "Failed to delete categories" },
            { status: 500 }
        )
    }
}
