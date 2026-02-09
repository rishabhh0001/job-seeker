"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Briefcase, Menu, X, LogOut, User, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "@/lib/auth-client"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const user = session?.user as any
  const role = user?.role || "applicant"
  const isLoggedIn = !!session
  const isEmployer = ["employer", "admin", "superadmin", "owner"].includes(role)
  const isAdmin = ["admin", "superadmin", "owner"].includes(role)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        },
      },
    })
  }

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

        {/* Desktop nav */}
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
          {isLoggedIn && isEmployer && (
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
          )}
          {isLoggedIn && !isEmployer && (
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
          )}
          {isLoggedIn && isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Admin
            </Link>
          )}
          {isLoggedIn && (
            <Link
              href="/profile"
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                pathname === "/profile"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Settings className="inline h-3.5 w-3.5 mr-1" />
              Profile
            </Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          ) : isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 px-2">
                <User className="h-3.5 w-3.5" />
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
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
          {isLoggedIn && isEmployer && (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
          {isLoggedIn && !isEmployer && (
            <Link
              href="/my-applications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              My Applications
            </Link>
          )}
          {isLoggedIn && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              Admin
            </Link>
          )}
          {isLoggedIn && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              Profile
            </Link>
          )}

          <div className="pt-3 mt-2 border-t border-border">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setOpen(false)
                  handleSignOut()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-border text-foreground hover:bg-muted/50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-border text-foreground hover:bg-muted/50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
