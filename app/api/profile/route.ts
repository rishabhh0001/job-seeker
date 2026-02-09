import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    return session
}

// GET - fetch current user profile
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Get passkeys for this user
        const passkeys = await sql`
      SELECT id, name, "deviceType", "backedUp", "createdAt"
      FROM passkey
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `

        return NextResponse.json({
            user: session.user,
            passkeys,
        })
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

// PUT - update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id
        const body = await request.json()
        const { name, firstName, lastName, companyName, role } = body

        // Build the update
        const result = await sql`
      UPDATE "user"
      SET
        name = COALESCE(${name || null}, name),
        "firstName" = COALESCE(${firstName || null}, "firstName"),
        "lastName" = COALESCE(${lastName || null}, "lastName"),
        "companyName" = COALESCE(${companyName || null}, "companyName"),
        role = COALESCE(${role || null}, role),
        "updatedAt" = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, role, "firstName", "lastName", "companyName", image, "createdAt"
    `

        if (result.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user: result[0] })
    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
