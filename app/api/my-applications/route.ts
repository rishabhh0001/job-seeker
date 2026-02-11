import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email

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
      WHERE a.user_id IN (
        SELECT id FROM "user" WHERE email = ${userEmail}
      )
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
