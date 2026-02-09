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

    // Try to get session, but allow unauthenticated submissions too
    let email = applicantEmail
    let name = applicantName
    try {
      const session = await auth.api.getSession({ headers: await headers() })
      if (session) {
        email = email || session.user.email
        name = name || session.user.name
      }
    } catch {
      // No session - that's ok for public applications
    }

    if (!jobSlug || !name || !email) {
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

    // Find or create user by email in jobs_user (for backward compat)
    let applicantId: number
    const userRows = await sql`
      SELECT id FROM jobs_user WHERE email = ${email}
    `

    if (userRows.length > 0) {
      applicantId = (userRows[0] as { id: number }).id
    } else {
      const username = email.split("@")[0] + "_" + Date.now()
      const newUserRows = await sql`
        INSERT INTO jobs_user (
          username, email, is_seeker, is_active, password, first_name, last_name, date_joined
        ) VALUES (
          ${username}, ${email}, true, true, '', ${name}, '', NOW()
        )
        RETURNING id
      `
      applicantId = (newUserRows[0] as { id: number }).id
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

    const result = await sql`
      INSERT INTO jobs_application (
        job_id, applicant_id, resume, cover_letter, parsed_text, status, applied_at
      ) VALUES (
        ${jobId}, ${applicantId}, ${resumePath}, ${coverLetter || ""}, ${parsedText}, 'Pending', NOW()
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

    if (error instanceof Error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        return NextResponse.json(
          { error: "You have already applied to this job." },
          { status: 409 }
        )
      }
    }

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

    const applications = await sql`
      SELECT
        a.id,
        a.applicant_id,
        a.status,
        a.applied_at,
        a.parsed_text,
        j.title as job_title
      FROM jobs_application a
      JOIN jobs_job j ON j.id = a.job_id
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
