import { notFound } from "next/navigation"
import Link from "next/link"
import { sql, JOB_TYPE_LABELS, formatSalary } from "@/lib/db"
import type { Job } from "@/lib/db"
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Briefcase,
  ExternalLink,
} from "lucide-react"

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

  const sidebarItems = [
    { icon: Calendar, label: "Posted Date", value: postedDate },
    { icon: MapPin, label: "Location", value: job.location },
    {
      icon: DollarSign,
      label: "Salary",
      value: formatSalary(job.salary_min, job.salary_max),
    },
    {
      icon: Briefcase,
      label: "Job Type",
      value: JOB_TYPE_LABELS[job.job_type] ?? job.job_type,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/"
        className="animate-fade-in mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="animate-fade-up lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {job.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <Link
                    href={`/companies/${job.employer_id}`}
                    className="flex items-center gap-1 font-medium text-foreground/80 transition-colors hover:text-primary"
                  >
                    {job.company_name || "Confidential"}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
              </span>
              {job.category_name && (
                <span className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {job.category_name}
                </span>
              )}
              {(job.salary_min || job.salary_max) && (
                <span className="rounded-md bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                  {formatSalary(job.salary_min, job.salary_max)} / yr
                </span>
              )}
            </div>

            <hr className="my-6 border-border" />

            <div>
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed text-muted-foreground">
                {job.description}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="animate-fade-up stagger-2 lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-heading text-base font-bold text-foreground">
              Job Overview
            </h3>

            <ul className="space-y-4">
              {sidebarItems.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href={`/jobs/${slug}/apply`}
                className="block w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
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
