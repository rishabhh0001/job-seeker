import Link from "next/link"
import { Layers, Code, Palette, Megaphone, TrendingUp, DollarSign, Users } from "lucide-react"
import type { Category } from "@/lib/db"

const ICONS: Record<string, React.ReactNode> = {
  development: <Code className="h-7 w-7" />,
  design: <Palette className="h-7 w-7" />,
  marketing: <Megaphone className="h-7 w-7" />,
  sales: <TrendingUp className="h-7 w-7" />,
  finance: <DollarSign className="h-7 w-7" />,
  hr: <Users className="h-7 w-7" />,
}

export function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
          >
            <div className="text-primary transition-transform group-hover:scale-110">
              {ICONS[cat.slug] ?? <Layers className="h-7 w-7" />}
            </div>
            <h3 className="font-heading text-sm font-bold text-foreground">{cat.name}</h3>
            <p className="text-xs text-muted-foreground">{cat.job_count ?? 0} Openings</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
