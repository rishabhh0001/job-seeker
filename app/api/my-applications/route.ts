import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // In a real app, we would get the user ID from the session/token.
        // For now, we'll fetch applications for a "demo" user or just latest ones for visualization
        // assuming the logged-in user context.
        // Since we don't have full auth context in API yet, we'll mock it by fetching
        // applications for a specific user ID or just returning a sample set for the UI.

        // Logic: Get applications where applicant_id = current_user_id
        // Mocking user 1 for demonstration if no session extraction is implemented
        const userId = 1

        console.log("Fetching applications for user:", userId)

        const applications = await sql`
      SELECT 
        a.id, 
        a.status, 
        a.applied_at, 
        j.title as job_title, 
        j.slug as job_slug,
        c.name as category_name,
        co.name as company_name
      FROM jobs_application a
      JOIN jobs_job j ON j.id = a.job_id
      LEFT JOIN jobs_category c ON c.id = j.category_id
      LEFT JOIN jobs_company co ON co.id = j.company_id
      WHERE a.applicant_id = ${userId}
      ORDER BY a.applied_at DESC
    `

        return NextResponse.json({ applications })
    } catch (error) {
        console.error("Error fetching my applications:", error)
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        )
    }
}
