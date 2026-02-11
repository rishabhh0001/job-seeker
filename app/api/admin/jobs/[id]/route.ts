
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

// DELETE - Delete a job
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = session.user as any
        if (user.role !== "owner" && user.role !== "superadmin" && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { id } = await params

        // Delete associated applications first (cascade should handle this, but being safe)
        await sql`DELETE FROM jobs_application WHERE job_id = ${id}`

        // Delete the job
        await sql`DELETE FROM jobs_job WHERE id = ${id}`

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting job:", error)
        return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
    }
}

// PATCH - Update job status or details
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = session.user as any
        if (user.role !== "owner" && user.role !== "superadmin" && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()

        // Check what fields are being updated
        if (typeof body.is_active !== 'undefined') {
            await sql`
                UPDATE jobs_job 
                SET is_active = ${body.is_active}, updated_at = NOW()
                WHERE id = ${id}
            `
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating job:", error)
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
    }
}
