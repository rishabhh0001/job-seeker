import { notFound } from "next/navigation"
import Link from "next/link"
import { sql, JOB_TYPE_LABELS, formatSalary } from "@/lib/db"
import type { Job } from "@/lib/db"
import { Building2, MapPin, Calendar, DollarSign, ArrowLeft, Briefcase } from "lucide-react"

async function getJob(slug: string): Promise<Job | null> {
  const rows = await sql`
    SELECT j.*, u.company_name, u.username AS employer_username,
           c.name AS category_name, c.slug AS category_slug
    FROM jobs_job j
    LEFT JOIN jobs_user u ON u.id = j.employer_id
    LEFT JOIN jobs_category c ON c.id = j.category_id
    WHERE j.slug = ${slug}
  `
  return (rows[0] as Job) ?? null
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = await getJob(slug)

  if (!job) notFound()

  const postedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">{job.title}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <Link
                    href={`/companies/${job.employer_id}`}
                    className="font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {job.company_name || "Confidential"}
                  </Link>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
              </span>
              {job.category_name && (
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                  {job.category_name}
                </span>
              )}
              {(job.salary_min || job.salary_max) && (
                <span className="rounded-full border border-[hsl(184,100%,35%)]/20 bg-[hsl(184,100%,35%)]/10 px-3 py-1 text-xs font-bold text-[hsl(184,100%,35%)]">
                  {formatSalary(job.salary_min, job.salary_max)} / yr
                </span>
              )}
            </div>

            <hr className="my-6 border-border" />

            <div>
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Job Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-base font-bold text-foreground">Job Overview</h3>

            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Posted Date</p>
                  <p className="text-sm font-medium text-foreground">{postedDate}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">{job.location}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Job Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href={`/jobs/${slug}/apply`}
                className="block w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
