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
    <section className="relative overflow-hidden bg-gradient-to-br from-card via-blue-50/30 to-card px-4 pb-16 pt-24">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-60 w-60 rounded-full bg-[hsl(184,100%,35%)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Find Your{" "}
          <span className="bg-gradient-to-r from-primary to-[hsl(184,100%,35%)] bg-clip-text text-transparent">
            Next Role
          </span>{" "}
          With Confidence
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Discover opportunities from fast-growing teams and enterprise leaders. A clean search experience without the noise.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-2xl flex-col items-stretch gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg sm:flex-row sm:rounded-full"
        >
          <div className="flex flex-1 items-center gap-2 border-b border-border px-3 py-2 sm:border-b-0 sm:border-r">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex flex-1 items-center gap-2 px-3 py-2">
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
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md sm:rounded-full"
          >
            Search
          </button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          Popular:{" "}
          {popular.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                router.push(`/?query=${term}`)
              }}
              className="mx-1 underline underline-offset-2 transition-colors hover:text-foreground"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
