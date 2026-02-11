import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isAdminOrAbove } from "@/lib/role-utils"
import { redirect } from "next/navigation"
import { CompanyCreateForm } from "../../../../components/company-create-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CreateCompanyPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user || !isAdminOrAbove((session.user as any).role)) {
        redirect("/dashboard")
    }

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
                    Create Company Profile
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Set up a new company profile to verify and manage employer accounts.
                </p>
            </div>

            <CompanyCreateForm />
        </div>
    )
}
