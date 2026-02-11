
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const Session = await auth.api.getSession({
            headers: await headers()
        })

        // Allow owner/superadmin to seed
        if (!Session || !["owner", "superadmin"].includes((Session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // 1. Create Table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS "settings" (
                id SERIAL PRIMARY KEY,
                key VARCHAR(255) UNIQUE NOT NULL,
                value TEXT,
                type VARCHAR(50) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                "updatedAt" TIMESTAMP DEFAULT NOW(),
                "updatedBy" VARCHAR(255)
            );
        `

        // 2. Define Defaults
        const defaults = [
            { key: 'site_name', value: 'Job Portal', type: 'text', category: 'general', description: 'The name of the website' },
            { key: 'site_description', value: 'Find your dream job', type: 'text', category: 'general', description: 'Meta description for SEO' },
            { key: 'contact_email', value: 'support@example.com', type: 'text', category: 'general', description: 'Public contact email' },

            { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', description: 'Enable maintenance mode' },

            { key: 'enable_registrations', value: 'true', type: 'boolean', category: 'features', description: 'Allow new users to sign up' },
            { key: 'require_email_verification', value: 'false', type: 'boolean', category: 'features', description: 'Require email verification' },

            { key: 'job_approval_required', value: 'false', type: 'boolean', category: 'jobs', description: 'Require admin approval for new jobs' },
            { key: 'max_jobs_per_employer', value: '10', type: 'number', category: 'jobs', description: 'Max active jobs per employer' },
        ]

        // 3. Insert Defaults (On Conflict Do Nothing)
        let insertedCount = 0;
        for (const setting of defaults) {
            const existing = await sql`SELECT id FROM "settings" WHERE key = ${setting.key}`
            if (existing.length === 0) {
                await sql`
                    INSERT INTO "settings" (key, value, type, category, description)
                    VALUES (${setting.key}, ${setting.value}, ${setting.type}, ${setting.category}, ${setting.description})
                 `
                insertedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Settings table initialized. inserted ${insertedCount} new settings.`
        })

    } catch (error) {
        console.error("Seeding error:", error)
        return NextResponse.json({ error: "Failed to seed settings", details: String(error) }, { status: 500 })
    }
}
