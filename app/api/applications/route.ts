import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const jobSlug = formData.get("jobSlug") as string
    const applicantName = formData.get("applicantName") as string
    const applicantEmail = formData.get("applicantEmail") as string
    const coverLetter = formData.get("coverLetter") as string
    const resumeText = formData.get("resumeText") as string
    const resumeJson = formData.get("resumeJson") as string
    const resumeFile = formData.get("resumeFile") as File | null

    let userId: string | null = null
    let userEmail = applicantEmail
    let userName = applicantName
    let profileSnapshot: any = {}

    // 1. Get Session & Profile Data
    try {
      const session = await auth.api.getSession({ headers: await headers() })
      if (session) {
        userId = session.user.id
        userEmail = session.user.email
        userName = session.user.name

        // Fetch complete profile for snapshot
        const userProfile = await sql`
          SELECT * FROM "user" WHERE id = ${userId}
        `
        if (userProfile.length > 0) {
          profileSnapshot = userProfile[0]
        }
      }
    } catch {
      // No session - treat as guest application if we allowed them, but for now we require auth for profile tracking
      // But preserving existing logic: if no session, we can't get rich profile data
    }

    if (!jobSlug || !userName || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: job, name, and email are required" },
        { status: 400 }
      )
    }

    if (!resumeText && !resumeJson && !resumeFile) {
      return NextResponse.json(
        { error: "Resume is required" },
        { status: 400 }
      )
    }

    // Find the job
    const jobRows = await sql`
      SELECT id FROM jobs_job WHERE slug = ${jobSlug}
    `

    if (jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const jobId = (jobRows[0] as { id: number }).id

    // Check for duplicate application
    if (userId) {
      const existingApp = await sql`
            SELECT id FROM jobs_application 
            WHERE job_id = ${jobId} AND user_id = ${userId}
        `
      if (existingApp.length > 0) {
        return NextResponse.json(
          { error: "You have already applied to this job." },
          { status: 409 }
        )
      }
    }

    let parsedText = ""

    // Handle PDF file upload
    if (resumeFile && resumeFile.name.toLowerCase().endsWith(".pdf")) {
      try {
        const arrayBuffer = await resumeFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfParse = (await import("pdf-parse")).default
        const data = await pdfParse(buffer)
        parsedText = data.text
      } catch (error) {
        console.error("Error parsing PDF:", error)
        parsedText = "Error parsing PDF resume."
      }
    } else {
      parsedText =
        resumeText || JSON.stringify(JSON.parse(resumeJson || "{}"), null, 2)
    }

    const resumePath = ""

    // Insert Application
    // Note: We are using user_id (text) now, not applicant_id (int)
    // We still keep applicant_id nullable if needed for backward compat but we are moving to user_id

    const result = await sql`
      INSERT INTO jobs_application (
        job_id, user_id, resume, cover_letter, parsed_text, status, applied_at, profile_snapshot
      ) VALUES (
        ${jobId}, ${userId}, ${resumePath}, ${coverLetter || ""}, ${parsedText}, 'Pending', NOW(), ${profileSnapshot}
      )
      RETURNING id
    `

    return NextResponse.json(
      {
        success: true,
        applicationId: result[0],
        message: "Application submitted successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit application. Please try again later." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobSlug = request.nextUrl.searchParams.get("jobSlug")

    if (!jobSlug) {
      return NextResponse.json({ error: "Job slug required" }, { status: 400 })
    }

    // Join with new user table
    const applications = await sql`
      SELECT
        a.id,
        a.user_id,
        a.status,
        a.applied_at,
        a.parsed_text,
        a.profile_snapshot,
        u.name as applicant_name,
        u.email as applicant_email,
        j.title as job_title
      FROM jobs_application a
      JOIN jobs_job j ON j.id = a.job_id
      LEFT JOIN "user" u ON u.id = a.user_id
      WHERE j.slug = ${jobSlug}
      ORDER BY a.applied_at DESC
    `

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}
