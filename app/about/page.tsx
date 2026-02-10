"use client"

import { Building2, Users, Rocket, Target } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export default function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="bg-muted/30 px-4 py-20 text-center">
                <AnimateOnScroll animation="fade-up">
                    <h1 className="font-heading text-4xl font-bold text-foreground md:text-6xl">
                        About JobPortal
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
                        Connecting talent with opportunity. We're building the future of recruitment.
                    </p>
                </AnimateOnScroll>
            </section>

            {/* Mission Section */}
            <section className="mx-auto max-w-6xl px-4 py-20">
                <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
                    <AnimateOnScroll animation="fade-right">
                        <div className="flex h-full flex-col justify-center">
                            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                                Our Mission
                            </h2>
                            <p className="mt-6 text-lg text-muted-foreground">
                                We believe that everyone deserves a job they love. Our mission is to democratize access to career opportunities and help companies build diverse, high-performing teams.
                            </p>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Founded in 2026, JobPortal has helped thousands of job seekers find their dream roles and employers find their ideal candidates.
                            </p>
                        </div>
                    </AnimateOnScroll>
                    <AnimateOnScroll animation="fade-left" delay={200}>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                                <Rocket className="mb-4 h-10 w-10 text-primary" />
                                <h3 className="font-heading text-xl font-bold text-foreground">Innovation</h3>
                                <p className="mt-2 text-muted-foreground">Using AI to match candidates with the right roles.</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                                <Users className="mb-4 h-10 w-10 text-blue-500" />
                                <h3 className="font-heading text-xl font-bold text-foreground">Community</h3>
                                <p className="mt-2 text-muted-foreground">Building a supportive network for career growth.</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                                <Target className="mb-4 h-10 w-10 text-green-500" />
                                <h3 className="font-heading text-xl font-bold text-foreground">Precision</h3>
                                <p className="mt-2 text-muted-foreground">Targeted opportunities that match your skills.</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                                <Building2 className="mb-4 h-10 w-10 text-purple-500" />
                                <h3 className="font-heading text-xl font-bold text-foreground">Trust</h3>
                                <p className="mt-2 text-muted-foreground">Verified employers and authentic job listings.</p>
                            </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            </section>
        </div>
    )
}
