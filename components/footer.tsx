import Link from "next/link"
import { Briefcase } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 font-heading text-lg font-bold text-foreground"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              Job<span className="text-primary">Portal</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Connecting talent with opportunity. Discover your next role with
              confidence.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
              For Seekers
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-foreground"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="transition-colors hover:text-foreground"
                >
                  Companies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
              For Employers
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="transition-colors hover:text-foreground"
                >
                  Company Profiles
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
              Newsletter
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Get the latest jobs in your inbox.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          2026 JobPortal. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
