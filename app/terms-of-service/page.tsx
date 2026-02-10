"use client"

import { FileText, CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export default function TermsOfServicePage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-16">
            <AnimateOnScroll animation="fade-up">
                <div className="mb-12 text-center">
                    <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Please read these terms carefully before using our platform.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </AnimateOnScroll>

            <div className="space-y-12">
                <AnimateOnScroll animation="fade-up" delay={100}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                1. Acceptance of Terms
                            </h2>
                        </div>
                        <div className="pl-13 ml-13 prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                By accessing or using the JobPortal website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                            </p>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-up" delay={200}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                2. User Accounts
                            </h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                To access certain features, you must register for an account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Provide accurate and complete information.</li>
                                <li>Maintain the security of your account credentials.</li>
                                <li>Promptly update your information if it changes.</li>
                                <li>Accept responsibility for all activities that occur under your account.</li>
                            </ul>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-up" delay={300}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                3. Job Postings and Applications
                            </h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                <strong>For Employers:</strong> You agree not to post false, misleading, or discriminatory job listings.
                            </p>
                            <p className="mt-2">
                                <strong>For Job Seekers:</strong> You agree that all information provided in your profile and applications is accurate and truthful.
                            </p>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-up" delay={400}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                4. Limitation of Liability
                            </h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                JobPortal is not responsible for the content of job postings or the actions of any employer or job seeker. We do not guarantee the accuracy or validity of any job listing or application.
                            </p>
                        </div>
                    </section>
                </AnimateOnScroll>
            </div>
        </div>
    )
}
