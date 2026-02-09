import Link from "next/link"
import { sql } from "@/lib/db"
import type { Employer } from "@/lib/db"
import { Building2, MapPin, Briefcase } from "lucide-react"

async function getEmployers(): Promise<Employer[]> {
  const rows = await sql`
    SELECT u.id, u.username, u.company_name, u.email,
           COUNT(j.id) FILTER (WHERE j.is_active = true) AS open_jobs,
           COUNT(j.id) AS total_jobs
    FROM jobs_user u
    LEFT JOIN jobs_job j ON j.employer_id = u.id
    WHERE u.is_employer = true
    GROUP BY u.id, u.username, u.company_name, u.email
    ORDER BY u.company_name, u.username
  `
  return rows as Employer[]
}

export default async function CompaniesPage() {
  const employers = await getEmployers()

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="animate-fade-up mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          Top{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Companies
          </span>{" "}
          Hiring Now
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover employer pages and explore open opportunities.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employers.length > 0 ? (
          employers.map((emp, i) => {
            const initial = (
              emp.company_name ||
              emp.username ||
              "?"
            )[0].toUpperCase()
            return (
              <Link
                key={emp.id}
                href={`/companies/${emp.id}`}
                className="animate-fade-up group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary transition-transform duration-200 group-hover:scale-105">
                  {initial}
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                  {emp.company_name || emp.username}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Remote
                </div>
                <hr className="my-4 w-full border-border" />
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary">
                    {emp.open_jobs ?? 0}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Open Jobs
                  </span>
                </div>
                <div className="mt-4 w-full rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  View Company
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full animate-fade-in py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg text-muted-foreground">
              No companies found.
            </h3>
          </div>
        )}
      </div>
    </section>
  )
}
