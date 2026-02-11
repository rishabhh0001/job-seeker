import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isEmployerOrAbove } from "@/lib/role-utils"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { JobCreateForm } from "@/components/job-create-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CreateJobPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user || !isEmployerOrAbove((session.user as any).role)) {
        redirect("/dashboard")
    }

    const categories = await sql`SELECT id, name FROM jobs_category ORDER BY name ASC`

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <Link
                href="/dashboard"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    Post a New Job
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Create a compelling job listing to attract the best talent.
                </p>
            </div>

            <JobCreateForm categories={categories as any[]} />
        </div>
    )
}
