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
        const {
            name, firstName, lastName, companyName, role,
            // Contact Info
            phone, dateOfBirth, address, city, state, country, postalCode,
            // Education
            highestQualification, collegeName, major, graduationYear, gpa,
            // Professional
            yearsOfExperience, currentJobTitle, linkedin, portfolio, skills
        } = body

        // Build the update
        const result = await sql`
      UPDATE "user"
      SET
        name = COALESCE(${name || null}, name),
        "firstName" = COALESCE(${firstName || null}, "firstName"),
        "lastName" = COALESCE(${lastName || null}, "lastName"),
        "companyName" = COALESCE(${companyName || null}, "companyName"),
        role = COALESCE(${role || null}, role),
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
        "updatedAt" = NOW()
      WHERE id = ${userId}
      RETURNING *
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
