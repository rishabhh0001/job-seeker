"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface AnimateOnScrollProps {
    children: ReactNode
    /** Animation class applied when element enters viewport */
    animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-in" | "fade-in" | "blur-in"
    /** Extra delay in ms */
    delay?: number
    /** Extra CSS classNames */
    className?: string
    /** IntersectionObserver threshold (0–1) */
    threshold?: number
    /** Only animate once */
    once?: boolean
}

export function AnimateOnScroll({
    children,
    animation = "fade-up",
    delay = 0,
    className = "",
    threshold = 0.15,
    once = true,
}: AnimateOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    if (once) observer.unobserve(el)
                } else if (!once) {
                    setVisible(false)
                }
            },
            { threshold, rootMargin: "0px 0px -40px 0px" }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold, once])

    return (
        <div
            ref={ref}
            className={`scroll-animate ${animation} ${visible ? "is-visible" : ""} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}
