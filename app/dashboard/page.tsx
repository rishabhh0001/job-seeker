import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isAdminOrAbove, isEmployerOrAbove } from "@/lib/role-utils"
import { sql } from "@/lib/db"
import {
  Building2,
  Eye,
  Users,
  Briefcase,
  Plus,
  ArrowUpRight,
} from "lucide-react"
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
  employerCount: number
}> {
  const [jobs, employers] = await Promise.all([
    sql`
      SELECT j.id, j.title, j.slug, j.location, j.is_active, j.created_at,
             COUNT(a.id) AS application_count
      FROM jobs_job j
      LEFT JOIN jobs_application a ON a.job_id = j.id
      GROUP BY j.id, j.title, j.slug, j.location, j.is_active, j.created_at
      ORDER BY j.created_at DESC
    `,
    sql`
      SELECT COUNT(*) AS count
      FROM "user"
      WHERE role IN ('employer', 'owner')
    `,
  ])

  return {
    jobs: jobs as DashboardJob[],
    employerCount: Number((employers[0] as { count: number }).count),
  }
}



export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const { jobs, employerCount } = await getDashboardData()

  const activeJobs = jobs.filter((j) => j.is_active).length
  const totalApps = jobs.reduce((sum, j) => sum + Number(j.application_count), 0)

  const stats = [
    {
      icon: Briefcase,
      label: "Total Jobs",
      value: jobs.length,
    },
    {
      icon: Eye,
      label: "Active Jobs",
      value: activeJobs,
    },
    {
      icon: Users,
      label: "Applications",
      value: totalApps,
    },
    {
      icon: Building2,
      label: "Companies",
      value: employerCount,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
          {session?.user && isAdminOrAbove((session.user as any).role) && (
            <Link
              href="/dashboard/companies/create"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              <Building2 className="h-4 w-4" />
              Create Company
            </Link>
          )}
          <Link
            href="/companies"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted"
          >
            <Building2 className="h-4 w-4" />
            Companies
          </Link>
          {session?.user && isEmployerOrAbove((session.user as any).role) ? (
            <Link
              href="/dashboard/jobs/create"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Job
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Browse Jobs
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-up stagger-1 mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Jobs table */}
      <div className="animate-fade-up stagger-2 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            Job Listings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Posted
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
                  <tr
                    key={job.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.location}
                      </p>
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
                        <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-foreground">
                          {job.application_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                      >
                        View
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-muted-foreground">
                      No jobs posted yet.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications */}
      <div className="animate-fade-up stagger-3 mt-10">
        <h2 className="mb-5 font-heading text-xl font-bold text-foreground">
          Recent Applications
        </h2>
        <div className="space-y-4">
          {jobs.filter((j) => j.application_count > 0).length > 0 ? (
            jobs
              .filter((j) => j.application_count > 0)
              .slice(0, 5)
              .map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-heading text-base font-bold text-foreground">
                      {job.title}
                    </h3>
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {job.application_count}{" "}
                      {job.application_count === 1
                        ? "application"
                        : "applications"}
                    </span>
                  </div>
                  <ApplicationsList jobSlug={job.slug} />
                </div>
              ))
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No applications yet. Post a job to start receiving applications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
