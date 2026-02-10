"use client"

import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"

interface ApplyButtonProps {
    jobSlug: string
}

export function ApplyButton({ jobSlug }: ApplyButtonProps) {
    const router = useRouter()
    const { data: session, isPending } = useSession()

    const handleApply = () => {
        if (!session) {
            // Redirect to login with callback to the apply page
            router.push(`/login?callbackUrl=/jobs/${jobSlug}/apply`)
        } else {
            // User is logged in, go to apply page
            router.push(`/jobs/${jobSlug}/apply`)
        }
    }

    return (
        <button
            onClick={handleApply}
            disabled={isPending}
            className="block w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
        >
            {isPending ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
                "Apply Now"
            )}
        </button>
    )
}
