import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - List all applications with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get("status")
        const categoryId = searchParams.get("categoryId")

        let query = `
      SELECT a.id, a.status, a.applied_at, a.resume, a.cover_letter, a.parsed_text,
             u.id AS applicant_id, u.email AS applicant_email, u.name AS applicant_name,
             j.id AS job_id, j.title AS job_title, j.slug AS job_slug,
             c.name AS category_name
      FROM jobs_application a
      LEFT JOIN "user" u ON u.id = a.user_id
      LEFT JOIN jobs_job j ON j.id = a.job_id
      LEFT JOIN jobs_category c ON c.id = j.category_id
    `

        const conditions: string[] = []
        const params: any[] = []

        if (status) {
            params.push(status)
            conditions.push(`a.status = $${params.length}`)
        }

        if (categoryId) {
            params.push(parseInt(categoryId))
            conditions.push(`j.category_id = $${params.length}`)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`
        }

        query += ` ORDER BY a.applied_at DESC`

        const applications = await sql(query, params)

        return NextResponse.json({ applications })
    } catch (error) {
        console.error("Error fetching applications:", error)
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        )
    }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
    try {
        const { id, status } = await request.json()

        if (!id || !status) {
            return NextResponse.json(
                { error: "ID and status are required" },
                { status: 400 }
            )
        }

        const validStatuses = ["Pending", "Review", "Reviewed", "Accepted", "Rejected"]
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const result = await sql`
      UPDATE jobs_application
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            )
        }

        if (result.length > 0) {
            // Fetch applicant details for email
            const applicationDetails = await sql`
                SELECT a.status, u.email, u."firstName" AS first_name, u.name AS username, j.title as job_title
                FROM jobs_application a
                JOIN "user" u ON u.id = a.user_id
                JOIN jobs_job j ON j.id = a.job_id
                WHERE a.id = ${id}
            `

            if (applicationDetails.length > 0) {
                const { email, username, job_title, status: newStatus } = applicationDetails[0] as any
                // Dynamic import to avoid circular dependencies if any, though likely safe to import at top
                const { sendStatusUpdateEmail } = await import("@/lib/email")
                await sendStatusUpdateEmail(email, username || "Applicant", job_title, newStatus)
            }
        }

        return NextResponse.json({ application: result[0] })
    } catch (error) {
        console.error("Error updating application:", error)
        return NextResponse.json(
            { error: "Failed to update application" },
            { status: 500 }
        )
    }
}

// DELETE - Delete applications
export async function DELETE(request: NextRequest) {
    try {
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "Application IDs are required" },
                { status: 400 }
            )
        }

        await sql`
      DELETE FROM jobs_application
      WHERE id = ANY(${ids})
    `

        return NextResponse.json({ success: true, deletedCount: ids.length })
    } catch (error) {
        console.error("Error deleting applications:", error)
        return NextResponse.json(
            { error: "Failed to delete applications" },
            { status: 500 }
        )
    }
}
