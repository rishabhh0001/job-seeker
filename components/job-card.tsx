import Link from "next/link"
import Image from "next/image"
import { Building2, MapPin } from "lucide-react"
import type { Job } from "@/lib/db"
import { JOB_TYPE_LABELS, formatSalary, timeAgo } from "@/lib/db"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  return (
    <AnimateOnScroll
      animation="fade-up"
      delay={Math.min(index * 50, 400)}
      className="glass-card group flex flex-col gap-4 rounded-xl p-5 md:flex-row md:items-center"
    >
      {/* Icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden">
        {job.employer_logo ? (
          <Image
            src={job.employer_logo || ""}
            alt={job.company_name || "Company Logo"}
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        ) : (
          <Building2 className="h-5 w-5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <Link
          href={`/jobs/${job.slug}`}
          className="font-heading text-base font-bold text-foreground transition-colors hover:text-primary"
        >
          {job.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <Link
            href={`/companies/${job.employer_id}`}
            className="font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            {job.company_name || "Confidential"}
          </Link>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
          </span>
          {job.category_name && (
            <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {job.category_name}
            </span>
          )}
          {(job.salary_min || job.salary_max) && (
            <span className="text-xs font-bold text-accent">
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-xs text-muted-foreground">
          {timeAgo(job.created_at)}
        </span>
        <Link
          href={`/jobs/${job.slug}`}
          className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          View Job
        </Link>
      </div>
    </AnimateOnScroll>
  )
}
