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

// GET - fetch all settings
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = session.user as any
        if (user.role !== "owner" && user.role !== "superadmin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const settings = await sql`
            SELECT * FROM "settings"
            ORDER BY category, key
        `

        return NextResponse.json({ settings })
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}

// PUT - update settings
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = session.user as any
        if (user.role !== "owner" && user.role !== "superadmin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { settings } = body

        if (!Array.isArray(settings)) {
            return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
        }

        // Update each setting
        for (const setting of settings) {
            await sql`
                UPDATE "settings"
                SET
                    value = ${setting.value},
                    "updatedAt" = NOW(),
                    "updatedBy" = ${user.id}
                WHERE key = ${setting.key}
            `
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }
}
