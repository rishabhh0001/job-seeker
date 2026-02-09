import Link from "next/link"
import { Briefcase } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
              <Briefcase className="h-5 w-5 text-primary" />
              Job<span className="text-primary">Portal</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Connecting talent with opportunity. Discover your next role with confidence.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">For Seekers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="transition-colors hover:text-foreground">Browse Jobs</Link></li>
              <li><Link href="/companies" className="transition-colors hover:text-foreground">Companies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">For Employers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="transition-colors hover:text-foreground">Post a Job</Link></li>
              <li><Link href="/" className="transition-colors hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-foreground">Newsletter</h3>
            <p className="mb-3 text-sm text-muted-foreground">Get the latest jobs in your inbox.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
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
