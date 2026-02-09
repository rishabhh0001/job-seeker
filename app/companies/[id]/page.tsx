import { notFound } from "next/navigation"
import Link from "next/link"
import { sql } from "@/lib/db"
import type { Employer, Job } from "@/lib/db"
import { JobCard } from "@/components/job-card"
import { ArrowLeft, MapPin, Briefcase, Users } from "lucide-react"

async function getCompany(id: number): Promise<Employer | null> {
  const rows = await sql`
    SELECT u.id, u.username, u.company_name, u.email,
           COUNT(j.id) FILTER (WHERE j.is_active = true) AS open_jobs,
           COUNT(j.id) AS total_jobs
    FROM jobs_user u
    LEFT JOIN jobs_job j ON j.employer_id = u.id
    WHERE u.id = ${id} AND u.is_employer = true
    GROUP BY u.id, u.username, u.company_name, u.email
  `
  return (rows[0] as Employer) ?? null
}

async function getCompanyJobs(employerId: number): Promise<Job[]> {
  const rows = await sql`
    SELECT j.*, u.company_name, u.username AS employer_username,
           c.name AS category_name, c.slug AS category_slug
    FROM jobs_job j
    LEFT JOIN jobs_user u ON u.id = j.employer_id
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
  if (isNaN(companyId)) notFound()

  const [company, jobs] = await Promise.all([
    getCompany(companyId),
    getCompanyJobs(companyId),
  ])

  if (!company) notFound()

  const initial = (company.company_name || company.username || "?")[0].toUpperCase()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/companies"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </Link>

      {/* Company hero */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
            {initial}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {company.company_name || company.username}
            </h1>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Remote
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {company.open_jobs ?? 0} Open Jobs
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {company.total_jobs ?? 0} Total Jobs
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
            <p className="font-heading text-2xl font-bold text-primary">{company.open_jobs ?? 0}</p>
            <p className="text-xs text-muted-foreground">Open Positions</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
            <p className="font-heading text-2xl font-bold text-primary">{company.total_jobs ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border bg-muted/50 p-4 text-center sm:col-span-1">
            <p className="font-heading text-2xl font-bold text-accent">Active</p>
            <p className="text-xs text-muted-foreground">Hiring Status</p>
          </div>
        </div>
      </div>

      {/* Open positions */}
      <div className="mt-8">
        <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
          Open Positions ({jobs.length})
        </h2>
        <div className="flex flex-col gap-3">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No open positions at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
