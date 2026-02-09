"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    Briefcase,
    FileText,
    Users,
    Building2,
    TrendingUp,
    Activity
} from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts"

type DashboardStats = {
    active_jobs: number
    total_applications: number
    total_employers: number
    total_seekers: number
}

type TrendData = {
    date: string
    count: number
}

type DistributionData = {
    name: string
    count: number
}

type ActivityItem = {
    type: string
    id: number
    user: string
    target: string
    time: string
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [trend, setTrend] = useState<TrendData[]>([])
    const [distribution, setDistribution] = useState<DistributionData[]>([])
    const [activity, setActivity] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats")
                const data = await res.json()
                setStats(data.stats)
                setTrend(data.trend)
                setDistribution(data.distribution)
                setActivity(data.activity)
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading dashboard...</div>
            </div>
        )
    }

    const statCards = [
        {
            title: "Active Jobs",
            value: stats?.active_jobs || 0,
            icon: Briefcase,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            href: "/admin/jobs",
        },
        {
            title: "Total Applications",
            value: stats?.total_applications || 0,
            icon: FileText,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            href: "/admin/applications",
        },
        {
            title: "Employers",
            value: stats?.total_employers || 0,
            icon: Building2,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            href: "/admin/users?type=employer",
        },
        {
            title: "Job Seekers",
            value: stats?.total_seekers || 0,
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            href: "/admin/users?type=seeker",
        },
    ]

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    Dashboard
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Overview of your job portal's performance
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-foreground">
                                        {stat.value}
                                    </span>
                                </div>
                            </div>
                            <div className={`rounded-full p-3 ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Application Trend Chart */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-foreground">
                            Application Trends
                        </h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Jobs by Category Chart */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <div className="rounded-lg bg-orange-500/10 p-2">
                            <Briefcase className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-foreground">
                            Jobs by Category
                        </h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                    <div className="rounded-lg bg-green-500/10 p-2">
                        <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                        Recent Activity
                    </h3>
                </div>
                <div className="space-y-4">
                    {activity.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        <span className="font-bold">{item.user}</span> applied for{" "}
                                        <span className="font-bold text-primary">{item.target}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(item.time).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activity.length === 0 && (
                        <p className="text-center text-muted-foreground">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    )
}
