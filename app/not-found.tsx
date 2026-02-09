import Link from "next/link"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 rounded-full bg-muted/50 p-6">
                <FileQuestion className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="font-heading text-6xl font-black text-foreground sm:text-8xl">
                404
            </h1>
            <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">
                Page not found
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
                Sorry, we couldn't find the page you're looking for. It might have been
                removed, renamed, or doesn't exist.
            </p>
            <div className="mt-8 flex gap-4">
                <Link
                    href="/"
                    className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
