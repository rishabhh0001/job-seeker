"use client"

import { useEffect, useState } from "react"
import { Settings as SettingsIcon, Save, Loader2, CheckCircle2, RotateCcw } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

interface Setting {
    id: number
    key: string
    value: string
    type: string
    description: string
    category: string
}

type SettingsByCategory = Record<string, Setting[]>

export default function SettingsAdminPage() {
    const [settings, setSettings] = useState<SettingsByCategory>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [editedValues, setEditedValues] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const res = await fetch("/api/admin/settings")
            const data = await res.json()

            // Group settings by category
            const grouped: SettingsByCategory = {}
            for (const setting of data.settings || []) {
                if (!grouped[setting.category]) {
                    grouped[setting.category] = []
                }
                grouped[setting.category].push(setting)
            }

            setSettings(grouped)
        } catch {
            setError("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    function handleValueChange(key: string, value: string) {
        setEditedValues(prev => ({ ...prev, [key]: value }))
    }

    function getCurrentValue(setting: Setting): string {
        return editedValues[setting.key] !== undefined ? editedValues[setting.key] : setting.value
    }

    async function handleSave() {
        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const updates = Object.entries(editedValues).map(([key, value]) => ({
                key,
                value,
            }))

            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: updates }),
            })

            if (!res.ok) throw new Error("Failed to save settings")

            setSuccess("Settings saved successfully!")
            setEditedValues({})
            await fetchSettings()

            setTimeout(() => setSuccess(null), 3000)
        } catch {
            setError("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    function handleReset() {
        setEditedValues({})
    }

    const hasChanges = Object.keys(editedValues).length > 0

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const categoryColors: Record<string, string> = {
        general: "blue",
        applications: "purple",
        email: "green",
    }

    const getCategoryColor = (category: string) => categoryColors[category] || "gray"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure admin panel settings
                    </p>
                </div>

                {hasChanges && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:scale-105 active:scale-95"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {success && (
                <div className="animate-scale-in flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                </div>
            )}

            {error && (
                <div className="animate-scale-in rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {Object.entries(settings).map(([category, categorySettings], index) => {
                    const color = getCategoryColor(category)
                    const colorClasses = {
                        blue: "bg-blue-500/10 text-blue-500 border-blue-500/30 hover:border-blue-500/50 hover:shadow-blue-500/5",
                        purple: "bg-purple-500/10 text-purple-500 border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/5",
                        green: "bg-green-500/10 text-green-500 border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/5",
                        gray: "bg-gray-500/10 text-gray-500 border-gray-500/30 hover:border-gray-500/50 hover:shadow-gray-500/5",
                    }[color]

                    const iconColorClasses = {
                        blue: "bg-blue-500/10 group-hover:bg-blue-500/20",
                        purple: "bg-purple-500/10 group-hover:bg-purple-500/20",
                        green: "bg-green-500/10 group-hover:bg-green-500/20",
                        gray: "bg-gray-500/10 group-hover:bg-gray-500/20",
                    }[color]

                    return (
                        <AnimateOnScroll key={category} animation="fade-up" delay={index * 50}>
                            <section className={`group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md ${colorClasses}`}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${iconColorClasses}`}>
                                        <SettingsIcon className={`h-5 w-5 ${color === 'blue' ? 'text-blue-500' : color === 'purple' ? 'text-purple-500' : color === 'green' ? 'text-green-500' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h2 className="font-heading text-lg font-bold text-foreground capitalize">{category}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {categorySettings.length} setting{categorySettings.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {categorySettings.map((setting) => (
                                        <div key={setting.id} className="space-y-1.5">
                                            <label className="text-sm font-medium text-foreground">
                                                {setting.key.replace(/_/g, ' ')}
                                            </label>
                                            {setting.description && (
                                                <p className="text-xs text-muted-foreground">{setting.description}</p>
                                            )}

                                            {setting.type === 'boolean' ? (
                                                <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={getCurrentValue(setting) === 'true'}
                                                            onChange={(e) => handleValueChange(setting.key, e.target.checked ? 'true' : 'false')}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary transition-all duration-200 peer-checked:shadow-lg peer-checked:shadow-primary/20"></div>
                                                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 peer-checked:translate-x-5 peer-checked:shadow-md"></div>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground group-hover/toggle:text-foreground transition-colors">
                                                        {getCurrentValue(setting) === 'true' ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </label>
                                            ) : setting.type === 'number' ? (
                                                <input
                                                    type="number"
                                                    value={getCurrentValue(setting)}
                                                    onChange={(e) => handleValueChange(setting.key, e.target.value)}
                                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={getCurrentValue(setting)}
                                                    onChange={(e) => handleValueChange(setting.key, e.target.value)}
                                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </AnimateOnScroll>
                    )
                })}
            </div>
        </div>
    )
}
