import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - List all jobs with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get("status")
        const jobType = searchParams.get("jobType")
        const categoryId = searchParams.get("categoryId")

        let query = `
      SELECT j.id, j.title, j.slug, j.description, j.job_type, j.location,
             j.salary_min, j.salary_max, j.is_active, j.created_at, j.updated_at,
             u."companyName" AS company_name, u.name AS employer_username, u.id AS employer_id,
             c.name AS category_name, c.id AS category_id,
             COUNT(a.id) AS application_count
      FROM jobs_job j
      LEFT JOIN "user" u ON u.id = CAST(j.employer_id AS TEXT)
      LEFT JOIN jobs_category c ON c.id = j.category_id
      LEFT JOIN jobs_application a ON a.job_id = j.id
    `

        const conditions: string[] = []
        const params: any[] = []

        if (status === "active") {
            conditions.push("j.is_active = true")
        } else if (status === "inactive") {
            conditions.push("j.is_active = false")
        }

        if (jobType) {
            params.push(jobType)
            conditions.push(`j.job_type = $${params.length}`)
        }

        if (categoryId) {
            params.push(parseInt(categoryId))
            conditions.push(`j.category_id = $${params.length}`)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`
        }

        query += `
      GROUP BY j.id, j.title, j.slug, j.description, j.job_type, j.location,
               j.salary_min, j.salary_max, j.is_active, j.created_at, j.updated_at,
               u."companyName", u.name, u.id, c.name, c.id
      ORDER BY j.created_at DESC
    `

        const jobs = await sql(query, params)

        return NextResponse.json({ jobs })
    } catch (error) {
        console.error("Error fetching jobs:", error)
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }
}

// POST - Create new job
export async function POST(request: NextRequest) {
    try {
        const {
            title,
            slug,
            description,
            jobType,
            location,
            salaryMin,
            salaryMax,
            categoryId,
            employerId,
            isActive,
        } = await request.json()

        if (!title || !slug || !description || !employerId || !categoryId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const result = await sql`
      INSERT INTO jobs_job (
        title, slug, description, job_type, location,
        salary_min, salary_max, category_id, employer_id,
        is_active, created_at, updated_at
      ) VALUES (
        ${title}, ${slug}, ${description}, ${jobType || "Full-time"},
        ${location || ""}, ${salaryMin || 0}, ${salaryMax || 0},
        ${categoryId}, ${employerId}, ${isActive !== false}, NOW(), NOW()
      )
      RETURNING *
    `

        return NextResponse.json({ job: result[0] }, { status: 201 })
    } catch (error) {
        console.error("Error creating job:", error)
        if (error instanceof Error && error.message.includes("duplicate")) {
            return NextResponse.json(
                { error: "A job with this slug already exists" },
                { status: 409 }
            )
        }
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }
}

// PUT - Update job
export async function PUT(request: NextRequest) {
    try {
        const {
            id,
            title,
            slug,
            description,
            jobType,
            location,
            salaryMin,
            salaryMax,
            categoryId,
            isActive,
        } = await request.json()

        if (!id || !title || !slug || !description || !categoryId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const result = await sql`
      UPDATE jobs_job
      SET title = ${title}, slug = ${slug}, description = ${description},
          job_type = ${jobType || "Full-time"}, location = ${location || ""},
          salary_min = ${salaryMin || 0}, salary_max = ${salaryMax || 0},
          category_id = ${categoryId}, is_active = ${isActive !== false},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

        if (result.length === 0) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        return NextResponse.json({ job: result[0] })
    } catch (error) {
        console.error("Error updating job:", error)
        if (error instanceof Error && error.message.includes("duplicate")) {
            return NextResponse.json(
                { error: "A job with this slug already exists" },
                { status: 409 }
            )
        }
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
    }
}

// DELETE - Delete jobs
export async function DELETE(request: NextRequest) {
    try {
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Job IDs are required" }, { status: 400 })
        }

        // Delete associated applications first
        await sql`
      DELETE FROM jobs_application
      WHERE job_id = ANY(${ids})
    `

        // Then delete jobs
        await sql`
      DELETE FROM jobs_job
      WHERE id = ANY(${ids})
    `

        return NextResponse.json({ success: true, deletedCount: ids.length })
    } catch (error) {
        console.error("Error deleting jobs:", error)
        return NextResponse.json({ error: "Failed to delete jobs" }, { status: 500 })
    }
}
