import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - List all users with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userType = searchParams.get("type")
        const isActive = searchParams.get("isActive")

        let query = `
      SELECT id, username, email, company_name, is_employer, is_seeker,
             is_active, date_joined
      FROM jobs_user
    `

        const conditions: string[] = []
        const params: any[] = []

        if (userType === "employer") {
            conditions.push("is_employer = true")
        } else if (userType === "seeker") {
            conditions.push("is_seeker = true")
        }

        if (isActive !== null && isActive !== undefined) {
            conditions.push(`is_active = ${isActive === "true"}`)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`
        }

        query += ` ORDER BY date_joined DESC`

        const users = await sql(query, params)

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

// POST - Create new user
export async function POST(request: NextRequest) {
    try {
        const { username, email, companyName, isEmployer, isSeeker, isActive } =
            await request.json()

        if (!username || !email) {
            return NextResponse.json(
                { error: "Username and email are required" },
                { status: 400 }
            )
        }

        const result = await sql`
      INSERT INTO jobs_user (
        username, email, company_name, is_employer, is_seeker,
        is_active, password, date_joined
      ) VALUES (
        ${username}, ${email}, ${companyName || ""},
        ${isEmployer || false}, ${isSeeker || false},
        ${isActive !== false}, '', NOW()
      )
      RETURNING id, username, email, company_name, is_employer, is_seeker, is_active, date_joined
    `

        return NextResponse.json({ user: result[0] }, { status: 201 })
    } catch (error) {
        console.error("Error creating user:", error)
        if (error instanceof Error && error.message.includes("duplicate")) {
            return NextResponse.json(
                { error: "A user with this email or username already exists" },
                { status: 409 }
            )
        }
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
    try {
        const { id, username, email, companyName, isEmployer, isSeeker, isActive } =
            await request.json()

        if (!id || !username || !email) {
            return NextResponse.json(
                { error: "ID, username, and email are required" },
                { status: 400 }
            )
        }

        const result = await sql`
      UPDATE jobs_user
      SET username = ${username}, email = ${email},
          company_name = ${companyName || ""},
          is_employer = ${isEmployer || false},
          is_seeker = ${isSeeker || false},
          is_active = ${isActive !== false}
      WHERE id = ${id}
      RETURNING id, username, email, company_name, is_employer, is_seeker, is_active, date_joined
    `

        if (result.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user: result[0] })
    } catch (error) {
        console.error("Error updating user:", error)
        if (error instanceof Error && error.message.includes("duplicate")) {
            return NextResponse.json(
                { error: "A user with this email or username already exists" },
                { status: 409 }
            )
        }
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

// DELETE - Delete users
export async function DELETE(request: NextRequest) {
    try {
        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "User IDs are required" }, { status: 400 })
        }

        // Delete associated data first
        await sql`
      DELETE FROM jobs_application
      WHERE applicant_id = ANY(${ids})
    `

        await sql`
      DELETE FROM jobs_job
      WHERE employer_id = ANY(${ids})
    `

        await sql`
      DELETE FROM jobs_user
      WHERE id = ANY(${ids})
    `

        return NextResponse.json({ success: true, deletedCount: ids.length })
    } catch (error) {
        console.error("Error deleting users:", error)
        return NextResponse.json({ error: "Failed to delete users" }, { status: 500 })
    }
}
