
import { CompanyCreateForm } from "@/components/company-create-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Create Company | Admin",
    description: "Add a new company to the system",
}

export default function AdminCompanyCreatePage() {
    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create Company</h1>
                <p className="text-muted-foreground">
                    Add a new company to the platform.
                </p>
            </div>
            <CompanyCreateForm />
        </div>
    )
}
