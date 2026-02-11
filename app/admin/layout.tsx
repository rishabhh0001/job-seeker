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
            <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto">
                <div className="p-4 pt-16 lg:p-8 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

