import { sql } from "@/lib/db"
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

    console.log("Application submission attempt:", { jobSlug, applicantEmail, applicantName })

    if (!jobSlug || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!resumeText && !resumeJson) {
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
      console.error("Job not found:", jobSlug)
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const jobId = (jobRows[0] as { id: number }).id

    // Find or create user by email
    let applicantId: number
    const userRows = await sql`
      SELECT id FROM jobs_user WHERE email = ${applicantEmail}
    `

    if (userRows.length > 0) {
      applicantId = (userRows[0] as { id: number }).id
      console.log("Found existing user:", applicantId)
    } else {
      // Create a new user for the applicant
      const username = applicantEmail.split('@')[0] + '_' + Date.now()
      const newUserRows = await sql`
        INSERT INTO jobs_user (
          username, email, is_seeker, is_active, password, first_name, last_name, date_joined
        ) VALUES (
          ${username}, ${applicantEmail}, true, true, '', '', '', NOW()
        )
        RETURNING id
      `
      applicantId = (newUserRows[0] as { id: number }).id
      console.log("Created new user:", applicantId)
    }

    const parsedText =
      resumeText ||
      JSON.stringify(JSON.parse(resumeJson || "{}"), null, 2)

    // Store resume as empty string for now (file upload will be handled separately)
    // The resume field in Django expects a file path, not the content
    const resumePath = ""

    const result = await sql`
      INSERT INTO jobs_application (
        job_id, applicant_id, resume, cover_letter, parsed_text, status, applied_at
      ) VALUES (
        ${jobId}, ${applicantId}, ${resumePath}, ${coverLetter || ""}, ${parsedText}, 'Pending', NOW()
      )
      RETURNING id
    `

    console.log("Application created successfully:", result[0])

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

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("DATABASE_URL")) {
        return NextResponse.json(
          { error: "Database configuration error. Please contact support." },
          { status: 500 }
        )
      }
      if (error.message.includes("connect") || error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Unable to connect to database. Please try again later." },
          { status: 503 }
        )
      }
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        return NextResponse.json(
          { error: "You have already applied to this job." },
          { status: 409 }
        )
      }
      if (error.message.includes("foreign key") || error.message.includes("violates")) {
        return NextResponse.json(
          { error: "Invalid job or user reference. Please try again." },
          { status: 400 }
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
      return NextResponse.json(
        { error: "Job slug required" },
        { status: 400 }
      )
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

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("DATABASE_URL")) {
        return NextResponse.json(
          { error: "Database configuration error. Please contact support." },
          { status: 500 }
        )
      }
      if (error.message.includes("connect") || error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Unable to connect to database. Please try again later." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}
