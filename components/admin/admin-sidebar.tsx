"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    Briefcase,
    Users,
    Building2,
    FolderKanban,
    LayoutDashboard,
    ArrowLeft,
    Settings,
    Menu,
    X,
} from "lucide-react"

export function AdminSidebar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

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
        {
            href: "/admin/settings",
            label: "Settings",
            icon: Settings,
        },
    ]

    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-border p-6 flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">
                        Admin Panel
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">Job Portal</p>
                </div>
                {/* Close button (mobile only) */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
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
    )

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-card p-2 text-foreground shadow-lg lg:hidden"
                aria-label="Open sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar - mobile: slide in/out, desktop: fixed */}
            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-300
                    lg:translate-x-0 lg:z-40
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {sidebarContent}
            </aside>
        </>
    )
}
