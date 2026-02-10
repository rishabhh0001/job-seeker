"use client"

import { Shield, Lock, Eye, FileText } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-16">
            <AnimateOnScroll animation="fade-up">
                <div className="mb-12 text-center">
                    <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your privacy is important to us. This policy explains how we handle your data.
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
                                <Shield className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                1. Information We Collect
                            </h2>
                        </div>
                        <div className="pl-13 ml-13 prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, and address.</li>
                                <li><strong>Professional Information:</strong> Resume, cover letter, employment history, education details, and skills.</li>
                                <li><strong>Account Information:</strong> Login credentials (processed securely) and profile preferences.</li>
                            </ul>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-up" delay={200}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                <Eye className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                2. How We Use Your Information
                            </h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Provide, maintain, and improve our services.</li>
                                <li>Process your job applications and share your profile with employers you apply to.</li>
                                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                                <li>Respond to your comments, questions, and customer service requests.</li>
                            </ul>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-up" delay={300}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                                <Lock className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                3. Data Sharing & Security
                            </h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                            </p>
                            <p className="mt-2">
                                <strong>Sharing with Employers:</strong> When you apply for a job, your complete profile (including contact info, education, and experience) is shared with the employer posting that job.
                            </p>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-up" delay={400}>
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                4. Your Rights
                            </h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground">
                            <p>
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Access and update your personal information via your profile settings.</li>
                                <li>Request deletion of your account and personal data.</li>
                                <li>Opt-out of promotional communications.</li>
                            </ul>
                        </div>
                    </section>
                </AnimateOnScroll>
            </div>
        </div>
    )
}
