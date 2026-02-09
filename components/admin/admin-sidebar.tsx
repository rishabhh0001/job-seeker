"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Briefcase,
    Users,
    Building2,
    FolderKanban,
    LayoutDashboard,
    ArrowLeft,
} from "lucide-react"

export function AdminSidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/admin/jobs",
            label: "Jobs",
            icon: Briefcase,
        },
        {
            href: "/admin/applications",
            label: "Applications",
            icon: Users,
        },
        {
            href: "/admin/users",
            label: "Users",
            icon: Building2,
        },
        {
            href: "/admin/categories",
            label: "Categories",
            icon: FolderKanban,
        },
    ]

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="border-b border-border p-6">
                    <h2 className="font-heading text-xl font-bold text-foreground">
                        Admin Panel
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">Job Portal</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-border p-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Site
                    </Link>
                </div>
            </div>
        </aside>
    )
}
