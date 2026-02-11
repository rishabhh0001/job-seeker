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

// GET - fetch current user profile from DB
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch user from DB to get ALL fields including profile data
        const users = await sql`
            SELECT id, name, email, role, "firstName", "lastName", "companyName",
                   "emailVerified", image, "createdAt", "updatedAt",
                   phone, "dateOfBirth", address, city, state, country, "postalCode",
                   "highestQualification", "collegeName", major, "graduationYear", gpa,
                   "yearsOfExperience", "currentJobTitle", linkedin, portfolio, skills
            FROM "user"
            WHERE id = ${userId}
        `

        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Get passkeys for this user
        const passkeys = await sql`
            SELECT id, name, "deviceType", "backedUp", "createdAt"
            FROM passkey
            WHERE "userId" = ${userId}
            ORDER BY "createdAt" DESC
        `

        return NextResponse.json({
            user: users[0],
            passkeys,
        })
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

// Helper: convert value for DB — empty string becomes null (to allow clearing fields)
function toDbValue(val: any): any {
    if (val === "" || val === undefined) return null
    return val
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

        // Build the update — use explicit null for empty strings so fields can be cleared
        const result = await sql`
            UPDATE "user"
            SET
                name = COALESCE(${toDbValue(name)}, name),
                "firstName" = ${toDbValue(firstName)},
                "lastName" = ${toDbValue(lastName)},
                "companyName" = ${toDbValue(companyName)},
                role = COALESCE(${toDbValue(role)}, role),
                phone = ${toDbValue(phone)},
                "dateOfBirth" = ${toDbValue(dateOfBirth)},
                address = ${toDbValue(address)},
                city = ${toDbValue(city)},
                state = ${toDbValue(state)},
                country = ${toDbValue(country)},
                "postalCode" = ${toDbValue(postalCode)},
                "highestQualification" = ${toDbValue(highestQualification)},
                "collegeName" = ${toDbValue(collegeName)},
                major = ${toDbValue(major)},
                "graduationYear" = ${toDbValue(graduationYear)},
                gpa = ${toDbValue(gpa)},
                "yearsOfExperience" = ${toDbValue(yearsOfExperience)},
                "currentJobTitle" = ${toDbValue(currentJobTitle)},
                linkedin = ${toDbValue(linkedin)},
                portfolio = ${toDbValue(portfolio)},
                skills = ${toDbValue(skills)},
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
