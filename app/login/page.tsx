"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Briefcase, Loader2, Eye, EyeOff } from "lucide-react"
import { signIn } from "@/lib/auth-client"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        await signIn.email(
            {
                email,
                password,
                callbackURL: callbackUrl,
            },
            {
                onError: (ctx) => {
                    setError(ctx.error.message || "Invalid email or password")
                    setLoading(false)
                },
                onSuccess: () => {
                    router.push(callbackUrl)
                },
            }
        )

        setLoading(false)
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2.5 font-heading text-2xl font-bold text-foreground"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    Job<span className="text-primary">Portal</span>
                </Link>
                <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">
                    Welcome back
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Sign in to your account to continue
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
