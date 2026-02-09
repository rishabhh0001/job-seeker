"use client"

import { Search, MapPin } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function HeroSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("query") ?? "")
  const [location, setLocation] = useState(searchParams.get("location") ?? "")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (location) params.set("location", location)
    router.push(`/?${params.toString()}`)
  }

  const popular = ["Designer", "Developer", "Marketing"]

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="animate-fade-up mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
          Thousands of jobs from top companies
        </p>

        <h1 className="animate-fade-up stagger-1 font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Find Your{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Perfect Job
          </span>{" "}
          Today
        </h1>

        <p className="animate-fade-up stagger-2 mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Discover opportunities from fast-growing teams and enterprise leaders.
          A clean search experience without the noise.
        </p>

        <form
          onSubmit={handleSearch}
          className="animate-fade-up stagger-3 mx-auto mt-8 flex max-w-2xl flex-col items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-background/50 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2.5 border-b border-border px-4 py-3 sm:border-b-0 sm:border-r">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex flex-1 items-center gap-2.5 px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 sm:px-8"
          >
            Search
          </button>
        </form>

        <div className="animate-fade-up stagger-4 mt-5 text-sm text-muted-foreground">
          Popular:{" "}
          {popular.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                router.push(`/?query=${term}`)
              }}
              className="mx-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
