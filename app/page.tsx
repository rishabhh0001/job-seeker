import { Suspense } from "react"
import { sql } from "@/lib/db"
import type { Job, Category } from "@/lib/db"
import { HeroSection } from "@/components/hero-section"
import { CategoryCards } from "@/components/category-cards"
import { JobCard } from "@/components/job-card"

async function getCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT c.id, c.name, c.slug, c.description,
           COUNT(j.id) FILTER (WHERE j.is_active = true) AS job_count
    FROM jobs_category c
    LEFT JOIN jobs_job j ON j.category_id = c.id
    GROUP BY c.id, c.name, c.slug, c.description
    ORDER BY c.name
  `
  return rows as Category[]
}

async function getJobs(query?: string, location?: string, category?: string): Promise<Job[]> {
  let baseQuery = `
    SELECT j.*, u.company_name, u.username AS employer_username,
           c.name AS category_name, c.slug AS category_slug
    FROM jobs_job j
    LEFT JOIN jobs_user u ON u.id = j.employer_id
    LEFT JOIN jobs_category c ON c.id = j.category_id
    WHERE j.is_active = true
  `
  const conditions: string[] = []
  const params: string[] = []

  if (query) {
    params.push(`%${query}%`)
    const i = params.length
    conditions.push(`(j.title ILIKE $${i} OR j.description ILIKE $${i} OR u.company_name ILIKE $${i})`)
  }
  if (location) {
    params.push(`%${location}%`)
    conditions.push(`j.location ILIKE $${params.length}`)
  }
  if (category) {
    params.push(category)
    conditions.push(`c.slug = $${params.length}`)
  }

  if (conditions.length) {
    baseQuery += ` AND ${conditions.join(" AND ")}`
  }

  baseQuery += " ORDER BY j.created_at DESC LIMIT 20"

  const rows = await sql(baseQuery, params)
  return rows as Job[]
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; location?: string; category?: string }>
}) {
  const params = await searchParams
  const [categories, jobs] = await Promise.all([
    getCategories(),
    getJobs(params.query, params.location, params.category),
  ])

  return (
    <>
      <Suspense fallback={null}>
        <HeroSection />
      </Suspense>

      <CategoryCards categories={categories} />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Latest <span className="bg-gradient-to-r from-primary to-[hsl(184,100%,35%)] bg-clip-text text-transparent">Jobs</span>
          </h2>
          <span className="text-sm text-muted-foreground">{jobs.length} jobs found</span>
        </div>

        <div className="flex flex-col gap-3">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
