import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const OWNER_EMAIL = "rishabh.joshi260905@gmail.com"
const VALID_ROLES = ["owner", "superadmin", "admin", "employer", "applicant"]

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return null
    const role = (session.user as any).role
    if (!["owner", "superadmin", "admin"].includes(role)) return null
    return session
}

// GET - List all users from Better Auth user table
export async function GET(request: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const roleFilter = request.nextUrl.searchParams.get("role")

        let users
        if (roleFilter && VALID_ROLES.includes(roleFilter)) {
            users = await sql`
        SELECT id, name, email, role, "firstName", "lastName", "companyName",
               "emailVerified", image, "createdAt", "updatedAt",
               phone, "dateOfBirth", address, city, state, country, "postalCode",
               "highestQualification", "collegeName", major, "graduationYear", gpa,
               "yearsOfExperience", "currentJobTitle", linkedin, portfolio, skills
        FROM "user"
        WHERE role = ${roleFilter}
        ORDER BY "createdAt" DESC
      `
        } else {
            users = await sql`
        SELECT id, name, email, role, "firstName", "lastName", "companyName",
               "emailVerified", image, "createdAt", "updatedAt",
               phone, "dateOfBirth", address, city, state, country, "postalCode",
               "highestQualification", "collegeName", major, "graduationYear", gpa,
               "yearsOfExperience", "currentJobTitle", linkedin, portfolio, skills
        FROM "user"
        ORDER BY "createdAt" DESC
      `
        }

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

// PUT - Update user role (admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id, role, firstName, lastName, companyName } = await request.json()
        const currentUserRole = (session.user as any).role

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // Get target user
        const targetUser = await sql`SELECT id, email, role FROM "user" WHERE id = ${id}`
        if (targetUser.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const target = targetUser[0] as any

        // Prevent editing the owner
        if (target.email === OWNER_EMAIL && session.user.email !== OWNER_EMAIL) {
            return NextResponse.json({ error: "Cannot modify the owner account" }, { status: 403 })
        }

        // Validate role
        if (role && !VALID_ROLES.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        // Only owner can set owner/superadmin roles
        if (role && ["owner", "superadmin"].includes(role) && currentUserRole !== "owner") {
            return NextResponse.json({ error: "Only the owner can assign owner/superadmin roles" }, { status: 403 })
        }

        // Only one owner allowed
        if (role === "owner" && target.email !== OWNER_EMAIL) {
            return NextResponse.json({ error: "Only one owner account is allowed" }, { status: 403 })
        }

        const result = await sql`
      UPDATE "user"
      SET
        role = COALESCE(${role || null}, role),
        "firstName" = COALESCE(${firstName || null}, "firstName"),
        "lastName" = COALESCE(${lastName || null}, "lastName"),
        "companyName" = COALESCE(${companyName || null}, "companyName"),
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, name, email, role, "firstName", "lastName", "companyName", "createdAt"
    `

        return NextResponse.json({ user: result[0] })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

// DELETE - Delete user (admin only, cannot delete owner)
export async function DELETE(request: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "User IDs are required" }, { status: 400 })
        }

        // Make sure owner is not in the list
        const ownerCheck = await sql`SELECT id FROM "user" WHERE email = ${OWNER_EMAIL} AND id = ANY(${ids})`
        if (ownerCheck.length > 0) {
            return NextResponse.json({ error: "Cannot delete the owner account" }, { status: 403 })
        }

        // Delete associated data
        await sql`DELETE FROM passkey WHERE "userId" = ANY(${ids})`
        await sql`DELETE FROM session WHERE "userId" = ANY(${ids})`
        await sql`DELETE FROM account WHERE "userId" = ANY(${ids})`
        await sql`DELETE FROM "user" WHERE id = ANY(${ids})`

        return NextResponse.json({ success: true, deletedCount: ids.length })
    } catch (error) {
        console.error("Error deleting users:", error)
        return NextResponse.json({ error: "Failed to delete users" }, { status: 500 })
    }
}
