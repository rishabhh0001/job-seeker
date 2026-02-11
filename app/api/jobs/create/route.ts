import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isEmployerOrAbove, isAdminOrAbove } from "@/lib/role-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user || !isEmployerOrAbove((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()
        const {
            title,
            slug,
            description,
            jobType,
            location,
            salaryMin,
            salaryMax,
            categoryId,
            employerId, // Optional admin override
        } = body

        if (!title || !slug || !description || !categoryId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Ensure slug is unique
        let finalSlug = slug
        let counter = 1
        while (true) {
            const existing = await sql`
        SELECT id FROM jobs_job WHERE slug = ${finalSlug}
      `
            if (existing.length === 0) break
            finalSlug = `${slug}-${counter}`
            counter++
        }

        // Admin override for employer ID
        let targetEmployerId = session.user.id
        if (employerId && isAdminOrAbove((session.user as any).role)) {
            targetEmployerId = employerId
        }

        const result = await sql`
      INSERT INTO jobs_job (
        title, slug, description, job_type, location,
        salary_min, salary_max, category_id, employer_id,
        is_active, created_at, updated_at
      ) VALUES (
        ${title}, ${finalSlug}, ${description}, ${jobType || "FT"},
        ${location || ""}, ${salaryMin || 0}, ${salaryMax || 0},
        ${categoryId}, ${targetEmployerId}, true, NOW(), NOW()
      )
      RETURNING *
    `

        return NextResponse.json({ job: result[0] }, { status: 201 })
    } catch (error) {
        console.error("Error creating job:", error)
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        )
    }
}
