import { sql } from "@/lib/db"
import Link from "next/link"
import { Briefcase, Users, Building2, FolderKanban, ArrowLeft } from "lucide-react"

type AdminStats = {
    totalJobs: number
    totalApplications: number
    totalUsers: number
    totalCategories: number
}

async function getAdminStats(): Promise<AdminStats> {
    const [jobs, applications, users, categories] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM jobs_job`,
        sql`SELECT COUNT(*) as count FROM jobs_application`,
        sql`SELECT COUNT(*) as count FROM jobs_user`,
        sql`SELECT COUNT(*) as count FROM jobs_category`,
    ])

    return {
        totalJobs: Number((jobs[0] as { count: number }).count),
        totalApplications: Number((applications[0] as { count: number }).count),
        totalUsers: Number((users[0] as { count: number }).count),
        totalCategories: Number((categories[0] as { count: number }).count),
    }
}

export default async function AdminPage() {
    const stats = await getAdminStats()

    const adminSections = [
        {
            title: "Jobs",
            description: "Manage job listings",
            icon: Briefcase,
            count: stats.totalJobs,
            href: "/admin/jobs",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Applications",
            description: "Review job applications",
            icon: Users,
            count: stats.totalApplications,
            href: "/admin/applications",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Users",
            description: "Manage users and employers",
            icon: Building2,
            count: stats.totalUsers,
            href: "/admin/users",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Categories",
            description: "Manage job categories",
            icon: FolderKanban,
            count: stats.totalCategories,
            href: "/admin/categories",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ]

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <Link
                    href="/"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    Admin{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Panel
                    </span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your job portal content and users
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {adminSections.map((section) => (
                    <Link
                        key={section.title}
                        href={section.href}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className={`rounded-lg ${section.bgColor} p-3 ${section.color}`}>
                                <section.icon className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-bold text-foreground">
                                {section.count}
                            </span>
                        </div>
                        <h2 className="mb-1 font-heading text-lg font-bold text-foreground">
                            {section.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                ))}
            </div>

            <div className="mt-12 rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
                    Quick Actions
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/dashboard"
                        className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        View Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        Browse Jobs
                    </Link>
                    <Link
                        href="/companies"
                        className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        View Companies
                    </Link>
                </div>
            </div>
        </div>
    )
}
