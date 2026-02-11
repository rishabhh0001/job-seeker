import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default async function SettingsSeedPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        redirect("/login")
    }

    const user = session.user as any
    if (user.role !== "owner" && user.role !== "superadmin") {
        redirect("/admin")
    }

    // Seed endpoint will be called via fetch on mount
    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <Link
                href="/admin/settings"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
            </Link>

            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                    Settings Seeded Successfully!
                </h1>
                <p className="text-muted-foreground mb-6">
                    Default settings have been added to the database.
                </p>
                <Link
                    href="/admin/settings"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
                >
                    View Settings
                </Link>
            </div>
        </div>
    )
}
