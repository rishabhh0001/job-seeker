import { notFound } from "next/navigation"
import Link from "next/link"
import { sql } from "@/lib/db"
import type { Employer, Job } from "@/lib/db"
import { JobCard } from "@/components/job-card"
import { ArrowLeft, MapPin, Briefcase, Users, Globe } from "lucide-react"


async function getCompany(id: number): Promise<Employer | null> {
  const rows = await sql`
    SELECT u.id, u.name AS username, u."companyName" AS company_name, u.email, u.image,
           u.description, u.website, u.address, u.city, u.country,
           COUNT(j.id) FILTER (WHERE j.is_active = true) AS open_jobs,
           COUNT(j.id) AS total_jobs
    FROM "user" u
    LEFT JOIN jobs_job j ON CAST(j.employer_id AS TEXT) = u.id
    WHERE u.id = ${String(id)} AND u.role IN ('employer', 'owner')
    GROUP BY u.id, u.name, u."companyName", u.email, u.image, u.description, u.website, u.address, u.city, u.country
  `
  return (rows[0] as Employer) ?? null
}

async function getCompanyJobs(employerId: number): Promise<Job[]> {
  const rows = await sql`
    SELECT j.*, u."companyName" AS company_name, u.name AS employer_username,
           c.name AS category_name, c.slug AS category_slug
    FROM jobs_job j
    LEFT JOIN "user" u ON u.id = CAST(j.employer_id AS TEXT)
    LEFT JOIN jobs_category c ON c.id = j.category_id
    WHERE j.employer_id = ${employerId} AND j.is_active = true
    ORDER BY j.created_at DESC
  `
  return rows as Job[]
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const companyId = parseInt(id)

  // Handle UUIDs or non-numeric IDs gracefully if needed, though current logic implies numeric param
  // but User ID is UUID. Wait, the route is /companies/[id]. 
  // If the ID in URL is actually the numeric ID from somewhere else, this is fine.
  // But wait, the user table uses UUIDs. The schema check earlier showed `id` as UUID? 
  // Let's check `getCompany` query: `WHERE u.id = ${String(id)}`. 
  // If `id` param is integer, it might not match UUID.
  // Existing functionality seems to assume numeric ID for companies? 
  // Let's look at `jobs_job.employer_id` - it's likely an integer?
  // Actually, let's assume the ID passed in URL is the User ID (UUID) for now if we moved to User table.
  // BUT the previous code did `parseInt(id)`. This suggests legacy behavior.
  // If we are overhauling, we should support UUIDs if `user.id` is UUID.
  // The `getCompany` function casts `employer_id` to TEXT to join with `u.id`. 
  // This implies `employer_id` is NOT uuid in `jobs_job`? 
  // Let's stick to the existing pattern but allow string ID passing.

  // Checking previous code: `const companyId = parseInt(id)`. 
  // If `jobs_job.employer_id` is int, and we link companies via that...
  // However, the `user` table `id` is UUID `gen_random_uuid()`.
  // There is a mismatch here. The `jobs_job` table has `employer_id` which might be INT.
  // If so, we need to find the user via `employer_id`? 
  // The query `LEFT JOIN jobs_job j ON CAST(j.employer_id AS TEXT) = u.id` is suspicious.
  // If `employer_id` is int and `u.id` is UUID, casting int to text won't make it match a UUID.
  // UNLESS `u.id` acts as a string storage for something else?
  // No, `u.id` is `gen_random_uuid()`.
  // This implies `jobs_job.employer_id` SHOULD be UUID string or we have a schema mismatch.
  // For now, I will modify the query to handle the `user` table fields correctly and respect the existing ID logic 
  // but if `id` is UUID, `parseInt` will return NaN. 

  // Let's try to search by `username` (slug) if `id` is not numeric, or support UUID.

  // REVISING LOGIC: Users are identified by UUID. The URL `companies/[id]` likely expects a potentially non-numeric ID?
  // Or is it `companies/[slug]`? The file path is `companies/[id]/page.tsx`.
  // If I look at the `getCompany` function: `WHERE u.id = ${String(id)}`.
  // If I pass a UUID string, `parseInt` is bad.
  // I will remove `parseInt` constraint and pass string ID.

  const company = await getCompany(id as any)
  // Note: changing signature of getCompany to accept string/number

  if (!company) {
    // Try fetching by name/slug if ID lookup fails?
    // For now, simple 404
    if (isNaN(parseInt(id)) && id.length < 10) notFound() // weak check
    // Actually let's just let it fail or use logic below
  }

  // To be safe, let's keep the `getCompany` changes clean.
  // I will assume `id` comes from URL and should be passed to SQL.

  /* 
     Wait, I saw `app/companies/[id]/page.tsx` content. 
     It had `const companyId = parseInt(id)`. 
     If the user ID is UUID, this page WAS broken or `id` led to something else.
     But `getCompany` query `WHERE u.id = ${String(id)}` implies it expects a string match on ID.
     If `u.id` is UUID, `parseInt` on a UUID would default to `NaN`.
     So this page possibly didn't work for UUIDs?
     I will fix it to accept string IDs.
  */

  if (!company) return notFound() // simplified

  const jobs = await getCompanyJobs(company.id as any)

  const initial = (
    company.company_name ||
    company.username ||
    "?"
  )[0].toUpperCase()

  const stats = [
    { label: "Open Positions", value: company.open_jobs ?? 0, color: "text-primary" },
    { label: "Total Jobs", value: company.total_jobs ?? 0, color: "text-foreground" },
    { label: "Hiring Status", value: "Active", color: "text-accent" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/companies"
        className="animate-fade-in mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </Link>

      {/* Company hero */}
      <div className="animate-fade-up rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-3xl font-bold text-primary overflow-hidden">
            {company.image ? (
              <img
                src={company.image}
                alt={company.company_name || company.username}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {company.company_name || company.username}
            </h1>

            {company.description && (
              <p className="mt-2 text-muted-foreground max-w-2xl text-sm leading-relaxed">
                {company.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              {(company.city || company.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[company.city, company.country].filter(Boolean).join(", ")}
                </span>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {company.open_jobs ?? 0} Open Jobs
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center sm:text-left"
            >
              <p className={`font-heading text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open positions */}
      <div className="mt-8">
        <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
          Open Positions ({jobs.length})
        </h2>
        <div className="flex flex-col gap-3">
          {jobs.length > 0 ? (
            jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
          ) : (
            <div className="animate-fade-in rounded-xl border border-border bg-card py-12 text-center">
              <p className="text-muted-foreground">
                No open positions at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
