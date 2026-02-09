"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const links = [
    { href: "/", label: "Jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 py-2 shadow-lg shadow-background/20 backdrop-blur-xl"
          : "bg-transparent py-3"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-xl font-bold text-foreground transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          Job<span className="text-primary">Portal</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            Jobs
          </Link>
          <Link
            href="/companies"
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              pathname === "/companies"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            Companies
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              pathname === "/dashboard"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/my-applications"
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              pathname === "/my-applications"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            My Applications
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="/accounts/login/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
          >
            Login
          </a>
          <a
            href="/accounts/signup/"
            className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-down border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl md:hidden space-y-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            Jobs
          </Link>
          <Link
            href="/companies"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            Companies
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/my-applications"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            My Applications
          </Link>

          <div className="pt-3 mt-2 border-t border-border grid grid-cols-2 gap-3">
            <a
              href="/accounts/login/"
              className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-border text-foreground hover:bg-muted/50"
            >
              Login
            </a>
            <a
              href="/accounts/signup/"
              className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
