import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type Job = {
  id: number
  title: string
  slug: string
  description: string
  location: string
  salary_min: number | null
  salary_max: number | null
  job_type: string
  is_active: boolean
  created_at: string
  updated_at: string
  employer_id: number
  category_id: number | null
  // joined fields
  company_name?: string
  employer_username?: string
  category_name?: string
  category_slug?: string
  application_count?: number
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string
  job_count?: number
}

export type Employer = {
  id: number
  username: string
  company_name: string
  email: string
  open_jobs?: number
  total_jobs?: number
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  FT: "Full-time",
  PT: "Part-time",
  CT: "Contract",
  FL: "Freelance",
  IN: "Internship",
  RM: "Remote",
}

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Negotiable"
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
