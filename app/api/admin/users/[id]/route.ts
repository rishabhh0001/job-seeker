import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const OWNER_EMAIL = "rishabh.joshi260905@gmail.com"

async function requireOwnerOrSuperadmin() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return null
    const role = (session.user as any).role
    if (!["owner", "superadmin"].includes(role)) return null
    return session
}

// GET - Fetch full user profile by ID (owner/superadmin only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireOwnerOrSuperadmin()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = await params

        const users = await sql`
            SELECT id, name, email, role, "firstName", "lastName", "companyName",
                   "emailVerified", image, "createdAt", "updatedAt",
                   phone, "dateOfBirth", address, city, state, country, "postalCode",
                   "highestQualification", "collegeName", major, "graduationYear", gpa,
                   "yearsOfExperience", "currentJobTitle", linkedin, portfolio, skills,
                   description, website
            FROM "user"
            WHERE id = ${id}
        `

        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user: users[0] })
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }
}

// PUT - Update user profile (owner/superadmin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireOwnerOrSuperadmin()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()

        // Check target user exists
        const targetUser = await sql`SELECT id, email FROM "user" WHERE id = ${id}`
        if (targetUser.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Prevent editing the owner account by non-owners
        const target = targetUser[0] as any
        if (target.email === OWNER_EMAIL && session.user.email !== OWNER_EMAIL) {
            return NextResponse.json({ error: "Cannot modify the owner account" }, { status: 403 })
        }

        const {
            name, firstName, lastName, companyName,
            phone, dateOfBirth, address, city, state, country, postalCode,
            highestQualification, collegeName, major, graduationYear, gpa,
            yearsOfExperience, currentJobTitle, linkedin, portfolio, skills,
            description, website
        } = body

        const result = await sql`
            UPDATE "user"
            SET
                name = COALESCE(${name || null}, name),
                "firstName" = COALESCE(${firstName || null}, "firstName"),
                "lastName" = COALESCE(${lastName || null}, "lastName"),
                "companyName" = COALESCE(${companyName || null}, "companyName"),
                phone = COALESCE(${phone || null}, phone),
                "dateOfBirth" = COALESCE(${dateOfBirth || null}, "dateOfBirth"),
                address = COALESCE(${address || null}, address),
                city = COALESCE(${city || null}, city),
                state = COALESCE(${state || null}, state),
                country = COALESCE(${country || null}, country),
                "postalCode" = COALESCE(${postalCode || null}, "postalCode"),
                "highestQualification" = COALESCE(${highestQualification || null}, "highestQualification"),
                "collegeName" = COALESCE(${collegeName || null}, "collegeName"),
                major = COALESCE(${major || null}, major),
                "graduationYear" = COALESCE(${graduationYear || null}, "graduationYear"),
                gpa = COALESCE(${gpa || null}, gpa),
                "yearsOfExperience" = COALESCE(${yearsOfExperience || null}, "yearsOfExperience"),
                "currentJobTitle" = COALESCE(${currentJobTitle || null}, "currentJobTitle"),
                linkedin = COALESCE(${linkedin || null}, linkedin),
                portfolio = COALESCE(${portfolio || null}, portfolio),
                skills = COALESCE(${skills || null}, skills),
                description = COALESCE(${description || null}, description),
                website = COALESCE(${website || null}, website),
                "updatedAt" = NOW()
            WHERE id = ${id}
            RETURNING *
        `

        if (result.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user: result[0] })
    } catch (error) {
        console.error("Error updating user profile:", error)
        return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }
}
