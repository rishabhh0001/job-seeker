import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isAdminOrAbove } from "@/lib/role-utils"
import { NextRequest, NextResponse } from "next/server"

// PATCH - Update company/user
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user || !isAdminOrAbove((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const params = await props.params
        const { id } = params
        const body = await request.json()
        const { companyName, username, email } = body

        if (!id) {
            return NextResponse.json({ error: "Company ID required" }, { status: 400 })
        }

        // Update company/user
        await sql`
            UPDATE "user"
            SET
                "companyName" = COALESCE(${companyName || null}, "companyName"),
                name = COALESCE(${username || null}, name),
                email = COALESCE(${email || null}, email),
                "updatedAt" = NOW()
            WHERE id = ${id}
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating company:", error)
        return NextResponse.json(
            { error: "Failed to update company" },
            { status: 500 }
        )
    }
}

// DELETE - Delete company and all associated data
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user || !isAdminOrAbove((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const params = await props.params
        const { id } = params

        if (!id) {
            return NextResponse.json({ error: "Company ID required" }, { status: 400 })
        }

        // Delete associated applications first
        await sql`DELETE FROM jobs_application WHERE job_id IN (SELECT id FROM jobs_job WHERE employer_id = ${id})`

        // Delete associated jobs
        await sql`DELETE FROM jobs_job WHERE employer_id = ${id}`

        // Delete user sessions and auth data
        await sql`DELETE FROM passkey WHERE "userId" = ${id}`
        await sql`DELETE FROM session WHERE "userId" = ${id}`
        await sql`DELETE FROM account WHERE "userId" = ${id}`

        // Delete the user/company
        await sql`DELETE FROM "user" WHERE id = ${id}`

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting company:", error)
        return NextResponse.json(
            { error: "Failed to delete company" },
            { status: 500 }
        )
    }
}
