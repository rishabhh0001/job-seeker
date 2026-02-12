
import { sql } from "@/lib/db"
import { Metadata } from "next"
import Link from "next/link"
import { Plus, Building2, Globe, MapPin, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
    title: "Companies | Admin",
    description: "Manage companies and employers",
}

async function getCompanies() {
    const rows = await sql`
    SELECT u.id, u.name, u.email, u.role, u."companyName", u.image, u."createdAt", u.website, u.city, u.country,
           COUNT(j.id) as job_count
    FROM "user" u
    LEFT JOIN jobs_job j ON CAST(j.employer_id AS TEXT) = u.id
    WHERE u.role = 'employer'
    GROUP BY u.id
    ORDER BY u."createdAt" DESC
  `
    return rows
}

export default async function AdminCompaniesPage() {
    const companies = await getCompanies()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                    <p className="text-muted-foreground">
                        Manage registered companies and employers.
                    </p>
                </div>
                <Link
                    href="/admin/companies/create"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company
                </Link>
            </div>

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Company</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Location</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Website</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Jobs</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Joined</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        No companies found.
                                    </td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr
                                        key={company.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold overflow-hidden">
                                                    {company.image ? (
                                                        <img src={company.image} alt={company.companyName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Building2 className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{company.companyName}</div>
                                                    <div className="text-xs text-muted-foreground">@{company.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {(company.city || company.country) ? (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{[company.city, company.country].filter(Boolean).join(", ")}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {company.website ? (
                                                <a
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    Visit <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                {company.job_count}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(company.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Link
                                                href={`/admin/users?search=${company.name}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
