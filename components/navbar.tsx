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
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const links = [
    { href: "/", label: "Jobs" },
    { href: "/companies", label: "Companies" },
  ]

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border/50 backdrop-blur-xl transition-all",
        scrolled ? "bg-card/95 py-2 shadow-sm" : "bg-card/80 py-3"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <Briefcase className="h-5 w-5 text-primary" />
          Job<span className="text-primary">Portal</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-semibold transition-colors",
                pathname === l.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-muted-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "block py-2 text-sm font-semibold",
                pathname === l.href ? "text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
