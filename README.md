<div align="center">

# 🚀 JobPortal

### A Modern, Full-Stack Job Board Built with Next.js

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon_Postgres-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Better Auth](https://img.shields.io/badge/Auth-Better_Auth-7C3AED?style=for-the-badge)](https://better-auth.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Connect talent with opportunity.** A premium job portal featuring a dark glassmorphism UI, role-based access control, passkey authentication, and a complete admin dashboard.

[🌐 Live Demo](https://job.rishabhj.in) · [🐛 Report Bug](https://github.com/rishabhh0001/job-seeker/issues) · [✨ Request Feature](https://github.com/rishabhh0001/job-seeker/issues)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Role Hierarchy](#-role-hierarchy)
- [Usage Guide](#-usage-guide)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🔍 Overview

**JobPortal** is a production-grade job board web application designed for both **job seekers** and **employers**. It provides a seamless experience for browsing, filtering, and applying to job listings — and a powerful dashboard for employers to post jobs and manage applications.

The entire application is wrapped in a sleek **dark-themed UI** with glassmorphism elements, smooth animations, and responsive design powered by **Tailwind CSS** and **Radix UI** primitives.

---

## ✨ Key Features

### For Job Seekers
- 🔎 **Smart Job Search** — Filter by keyword, location, and category in real time
- 📄 **One-Click Apply** — Upload your resume (PDF) and apply instantly
- 📋 **Application Tracker** — Monitor the status of all your submissions
- 🔐 **Secure Auth** — Email/password, Google, GitHub, and Passkey login

### For Employers
- 📝 **Job Posting** — Create detailed listings with salary, type, and category
- 📊 **Employer Dashboard** — View applications, download resumes, and manage listings
- 🏢 **Company Profiles** — Public-facing company pages showcasing all active jobs

### Admin Panel
- 👥 **User Management** — Full CRUD with role assignment and bulk actions
- 💼 **Job Moderation** — Activate, deactivate, or delete job listings
- 📋 **Application Review** — Filter, search, and manage all applications
- 🏷️ **Category Management** — Create and organize job categories

### Security & Authentication
- 🔑 **Better Auth** — Modern auth framework with session management
- 🛡️ **Passkey / WebAuthn** — Passwordless login via device biometrics
- 🌐 **OAuth Providers** — Google and GitHub single sign-on
- 🔒 **Role-Based Access** — Five-tier permission hierarchy

### UI / UX
- 🌙 **Dark Theme** — Premium dark UI with carefully tuned HSL color palette
- 💎 **Glassmorphism** — Frosted glass effects with backdrop blur
- ✨ **Micro-Animations** — Scroll-triggered fade/slide/scale transitions
- 📱 **Fully Responsive** — Mobile-first layout with collapsible nav

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **Language** | [TypeScript 5.7](https://typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| **Component Primitives** | [Radix UI](https://radix-ui.com/) (Dialog, Select, Toast, Tabs, etc.) |
| **Authentication** | [Better Auth](https://better-auth.com/) + [@better-auth/passkey](https://better-auth.com/docs/plugins/passkey) |
| **Database** | [Neon Postgres](https://neon.tech/) (Serverless) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Client (Browser)                 │
│  React 19 · Tailwind CSS · Radix UI · Lucide Icons   │
└──────────────────────┬───────────────────────────────┘
                       │  HTTPS
┌──────────────────────▼───────────────────────────────┐
│               Next.js 16 (App Router)                │
│                                                      │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Server       │  │ API Routes │  │ Better Auth  │  │
│  │ Components   │  │ /api/*     │  │ /api/auth/*  │  │
│  └──────────────┘  └─────┬──────┘  └──────┬───────┘  │
│                          │                │          │
└──────────────────────────┼────────────────┼──────────┘
                           │                │
┌──────────────────────────▼────────────────▼──────────┐
│              Neon Postgres (Serverless)               │
│                                                      │
│  user · session · account · passkey · verification   │
│  jobs_job · jobs_category · jobs_user · jobs_app...   │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- A **Neon** Postgres database ([free tier available](https://neon.tech/))


## 📂 Project Structure

```
job-seeker/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard pages
│   │   ├── applications/         # Application management
│   │   ├── categories/           # Category management
│   │   ├── jobs/                 # Job moderation
│   │   └── users/                # User management
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin CRUD endpoints
│   │   ├── auth/[...all]/        # Better Auth catch-all
│   │   ├── newsletter/           # Newsletter subscription
│   │   └── profile/              # Profile update endpoints
│   ├── companies/                # Company listing & detail
│   ├── dashboard/                # Employer dashboard
│   ├── jobs/                     # Job detail pages
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── my-applications/          # Seeker application tracker
│   ├── profile/                  # User profile & settings
│   ├── layout.tsx                # Root layout (fonts, nav, footer)
│   ├── page.tsx                  # Homepage (hero, categories, jobs)
│   └── globals.css               # Design tokens & animations
├── components/                   # Shared UI components
│   ├── admin/                    # Admin-specific components
│   ├── navbar.tsx                # Global navigation bar
│   ├── footer.tsx                # Footer with newsletter
│   ├── hero-section.tsx          # Animated hero with search
│   ├── job-card.tsx              # Job listing card
│   ├── category-cards.tsx        # Category grid
│   └── resume-upload.tsx         # PDF resume uploader
├── lib/                          # Shared utilities
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client config
│   ├── db.ts                     # Database connection & types
│   └── utils.ts                  # Utility helpers
├── scripts/
│   └── migrate-auth.js           # Database migration script
├── tailwind.config.ts            # Tailwind theme configuration
└── next.config.mjs               # Next.js configuration
```

---

## 🔐 Role Hierarchy

JobPortal uses a five-tier role system to control access across the platform:

```
owner ← superadmin ← admin ← employer ← applicant
  │         │          │         │           │
  │         │          │         │           └── Browse & apply to jobs
  │         │          │         └────────────── Post jobs, manage listings
  │         │          └──────────────────────── Manage employers & applicants
  │         └─────────────────────────────────── Manage all users except owner
  └────────────────────────────────────────────── Full system access
```

| Role | Capabilities |
|---|---|
| **Applicant** | Browse jobs, apply with resume, track applications |
| **Employer** | Post/manage jobs, view applications, download resumes |
| **Admin** | Manage employers and applicants |
| **Superadmin** | Manage all users except the owner |
| **Owner** | Full system access — cannot be modified or deleted |

---

## 📖 Usage Guide

### 🔍 For Job Seekers

1. **Sign Up** — Create an account or sign in with Google/GitHub
2. **Browse Jobs** — Use the search bar and category filters on the homepage
3. **View Details** — Click any job card to see the full description and requirements
4. **Apply** — Upload your resume (PDF) and submit your application
5. **Track** — Visit **My Applications** to monitor your submission statuses


### 🏢 For Employers

1. **Register** — Sign up and have an admin assign you the "employer" role
2. **Dashboard** — Access your employer dashboard to manage everything
3. **Post a Job** — Fill in the title, description, salary range, location, and category
4. **Review Applicants** — View incoming applications and download resumes


### ⚙️ For Admins

1. Navigate to `/admin` after logging in with an admin-level account
2. Use the sidebar to switch between **Jobs**, **Applications**, **Users**, and **Categories**
3. Perform bulk actions: activate, deactivate, or delete items
4. Manage user roles through inline dropdowns

---


## 🌐 Deployment

This project is optimized for **Vercel** with zero configuration:

```bash
# Build for production
pnpm build

# Or deploy directly
vercel --prod
```

Key deployment notes:
- The `vercel.json` handles routing configuration
- Environment variables must be configured in the Vercel dashboard
- The Neon Postgres database is serverless and works seamlessly with Vercel's edge runtime

---


## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">


**Built with ❤️ by [Rishabh Joshi](https://rishabhj.in)**


[![Portfolio](https://img.shields.io/badge/Portfolio-rishabhj.in-0ea5e9?style=flat-square&logo=safari&logoColor=white)](https://rishabhj.in)
[![GitHub](https://img.shields.io/badge/GitHub-rishabhh0001-181717?style=flat-square&logo=github)](https://github.com/rishabhh0001)

</div>