import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            )
        }

        // Ensure table exists (Lazy migration)
        await sql`
      CREATE TABLE IF NOT EXISTS jobs_newsletter (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

        // Insert email, ignore if duplicate
        await sql`
      INSERT INTO jobs_newsletter (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `

        return NextResponse.json(
            { message: "Saved successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Newsletter subscription error:", error)
        return NextResponse.json(
            { error: "Failed to subscribe" },
            { status: 500 }
        )
    }
}
