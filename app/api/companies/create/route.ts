import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isAdminOrAbove } from "@/lib/role-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user || !isAdminOrAbove((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const body = await request.json()

        const { companyName, username, description, website, address, city, country, logo } = body

        if (!companyName || !username) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Check if username/email already exists
        const existing = await sql`
      SELECT id FROM "user" WHERE email = ${username} OR name = ${username}
    `
        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Username already taken" },
                { status: 409 }
            )
        }

        // Create new user with employer role
        // Note: We're creating a user that represents the company
        // For now, setting a placeholder email since it's required
        const email = `${username}@placeholder.com`

        const result = await sql`
            INSERT INTO "user" (
                id, name, email, "emailVerified", "createdAt", "updatedAt",
                role, "companyName", description, website, address, city, country, image
            ) VALUES (
                gen_random_uuid(), ${username}, ${email}, false, NOW(), NOW(),
                'employer', ${companyName}, ${description || null}, ${website || null}, 
                ${address || null}, ${city || null}, ${country || null}, ${logo || null}
            )
            RETURNING *
        `

        return NextResponse.json({ company: result[0] }, { status: 201 })
    } catch (error) {
        console.error("Error creating company:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create company" },
            { status: 500 }
        )
    }
}
