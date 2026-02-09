"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="ml-64 flex-1 p-8">{children}</main>
        </div>
    )
}
