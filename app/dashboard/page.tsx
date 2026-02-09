import Link from "next/link"
import { sql } from "@/lib/db"
import { Building2, Eye, Edit, Users, Briefcase, Plus } from "lucide-react"
import { ApplicationsList } from "@/components/applications-list"

type DashboardJob = {
  id: number
  title: string
  slug: string
  location: string
  is_active: boolean
  created_at: string
  application_count: number
}

async function getDashboardData(): Promise<{
  jobs: DashboardJob[]
  employers: { id: number; username: string; company_name: string }[]
}> {
  const jobs = await sql`
    SELECT j.id, j.title, j.slug, j.location, j.is_active, j.created_at,
           COUNT(a.id) AS application_count
    FROM jobs_job j
    LEFT JOIN jobs_application a ON a.job_id = j.id
    GROUP BY j.id, j.title, j.slug, j.location, j.is_active, j.created_at
    ORDER BY j.created_at DESC
  `

  const employers = await sql`
    SELECT id, username, company_name
    FROM jobs_user
    WHERE is_employer = true
    ORDER BY company_name
    LIMIT 10
  `

  return {
    jobs: jobs as DashboardJob[],
    employers: employers as { id: number; username: string; company_name: string }[],
  }
}

export default async function DashboardPage() {
  const { jobs, employers } = await getDashboardData()

  const activeJobs = jobs.filter((j) => j.is_active).length
  const totalApps = jobs.reduce((sum, j) => sum + Number(j.application_count), 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Employer{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage job listings and applications
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/companies"
            className="flex items-center gap-2 rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/5"
          >
            <Building2 className="h-4 w-4" />
            Companies
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">{jobs.length}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-accent">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">{activeJobs}</p>
              <p className="text-xs text-muted-foreground">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">{totalApps}</p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(184,100%,35%)]/10 text-[hsl(184,100%,35%)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">{employers.length}</p>
              <p className="text-xs text-muted-foreground">Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        <div className="px-4 py-2 border-b-2 border-primary text-sm font-medium text-primary">
          Job Listings
        </div>
      </div>

      {/* Jobs table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Posted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Applicants
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.location}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {job.is_active ? (
                        <span className="rounded-full border border-[hsl(184,100%,35%)]/20 bg-[hsl(184,100%,35%)]/10 px-2.5 py-1 text-xs font-semibold text-[hsl(184,100%,35%)]">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-foreground">{job.application_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 text-primary transition-colors hover:bg-primary/5"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-muted-foreground">No jobs posted yet.</p>
                    <Link
                      href="/"
                      className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Browse Jobs
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications Section */}
      <div className="mt-12">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Recent Applications</h2>
        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs
              .filter((j) => j.application_count > 0)
              .slice(0, 3)
              .map((job) => (
                <div key={job.id} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-heading text-lg font-bold text-foreground">
                    {job.title}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({job.application_count} {job.application_count === 1 ? "application" : "applications"})
                    </span>
                  </h3>
                  <ApplicationsList jobSlug={job.slug} />
                </div>
              ))
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-muted-foreground">No applications yet. Post a job to start receiving applications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
