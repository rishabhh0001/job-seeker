"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Loader2, Eye, EyeOff } from "lucide-react"
import { signUp, signIn } from "@/lib/auth-client"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

function GithubIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    )
}

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState<"applicant" | "employer">("applicant")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [socialLoading, setSocialLoading] = useState<string | null>(null)

    const redirectUrl = role === "employer" ? "/dashboard" : "/"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        await signUp.email(
            { email, password, name, role, callbackURL: redirectUrl } as any,
            {
                onError: (ctx) => {
                    setError(ctx.error.message)
                    setLoading(false)
                },
                onSuccess: () => router.push(redirectUrl),
            }
        )
        setLoading(false)
    }

    const handleSocial = async (provider: "google" | "github") => {
        setSocialLoading(provider)
        await signIn.social({ provider, callbackURL: redirectUrl })
        setSocialLoading(null)
    }

    const isDisabled = loading || !!socialLoading

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <AnimateOnScroll animation="scale-in" className="w-full max-w-md space-y-8">
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
                    <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">Create your account</h1>
                    <p className="mt-2 text-muted-foreground">Start your job search journey today</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
                    {/* Social buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocial("google")}
                            disabled={isDisabled}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/50 disabled:opacity-50"
                        >
                            {socialLoading === "google" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <GoogleIcon className="h-5 w-5" />
                            )}
                            Continue with Google
                        </button>
                        <button
                            onClick={() => handleSocial("github")}
                            disabled={isDisabled}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/50 disabled:opacity-50"
                        >
                            {socialLoading === "github" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <GithubIcon className="h-5 w-5" />
                            )}
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs font-medium text-muted-foreground">OR</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Role selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("applicant")}
                                    disabled={isDisabled}
                                    className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${role === "applicant"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                        } disabled:opacity-50`}
                                >
                                    Job Seeker
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("employer")}
                                    disabled={isDisabled}
                                    className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${role === "employer"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                        } disabled:opacity-50`}
                                >
                                    Employer
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                            <input
                                id="name" type="text" value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe" required disabled={isDisabled}
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                            <input
                                id="email" type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com" required disabled={isDisabled}
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters" required disabled={isDisabled}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors disabled:opacity-50"
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

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
                            <input
                                id="confirmPassword" type="password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password" required disabled={isDisabled}
                                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors disabled:opacity-50"
                            />
                        </div>

                        <button
                            type="submit" disabled={isDisabled}
                            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Create Account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                </p>
            </AnimateOnScroll>
        </div>
    )
}
