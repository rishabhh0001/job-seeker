import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 1. Applications over last 30 days
    const applicationsTrend = await sql`
      SELECT TO_CHAR(applied_at, 'YYYY-MM-DD') as date, COUNT(*) as count
      FROM jobs_application
      WHERE applied_at >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date
    `

    // 2. Jobs by Category
    const jobsByCategory = await sql`
      SELECT c.name, COUNT(j.id) as count
      FROM jobs_category c
      LEFT JOIN jobs_job j ON j.category_id = c.id
      WHERE j.is_active = true
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    `

    // 3. Recent Activity (Latest Applications)
    const recentActivity = await sql`
      SELECT 
        'application' as type,
        a.id,
        u.name as user,
        j.title as target,
        a.applied_at as time
      FROM jobs_application a
      JOIN "user" u ON u.id = a.user_id
      JOIN jobs_job j ON j.id = a.job_id
      ORDER BY a.applied_at DESC
      LIMIT 10
    `

    // 4. Quick Stats
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM jobs_job WHERE is_active = true) as active_jobs,
        (SELECT COUNT(*) FROM jobs_application) as total_applications,
        (SELECT COUNT(*) FROM "user" WHERE role IN ('employer', 'owner')) as total_employers,
        (SELECT COUNT(*) FROM "user" WHERE role = 'applicant') as total_seekers
    `

    return NextResponse.json({
      trend: applicationsTrend,
      distribution: jobsByCategory,
      activity: recentActivity,
      stats: stats[0]
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    )
  }
}
