"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith("/admin")

    if (isAdmin) {
        return <>{children}</>
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
        </>
    )
}
