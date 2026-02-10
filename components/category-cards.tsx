import Link from "next/link"
import {
  Layers,
  Code,
  Palette,
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react"
import type { Category } from "@/lib/db"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

const ICONS: Record<string, React.ReactNode> = {
  development: <Code className="h-5 w-5" />,
  design: <Palette className="h-5 w-5" />,
  marketing: <Megaphone className="h-5 w-5" />,
  sales: <TrendingUp className="h-5 w-5" />,
  finance: <DollarSign className="h-5 w-5" />,
  hr: <Users className="h-5 w-5" />,
}

export function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat, i) => (
          <AnimateOnScroll
            key={cat.id}
            animation="scale-in"
            delay={i * 50}
            className="h-full"
          >
            <Link
              href={`/?category=${cat.slug}`}
              className="group flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                {ICONS[cat.slug] ?? <Layers className="h-5 w-5" />}
              </div>
              <h3 className="font-heading text-sm font-bold text-foreground">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cat.job_count ?? 0} Openings
              </p>
            </Link>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
