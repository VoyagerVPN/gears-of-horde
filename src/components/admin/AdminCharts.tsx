"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts"
import { format, parseISO } from "date-fns"
import { enUS, ru } from "date-fns/locale"
import { useTranslations, useLocale } from "next-intl"

interface AdminChartsProps {
    data: Array<{
        date: string
        registrations: number
        views: number
    }>
}

export default function AdminCharts({ data }: AdminChartsProps) {
    const t = useTranslations('Admin')
    const locale = useLocale()
    const dateLocale = locale === 'ru' ? ru : enUS

    const formatDate = (dateValue: unknown): string => {
        if (!dateValue) return "";
        const dateStr = String(dateValue);
        try {
            return format(parseISO(dateStr), "MMM dd", { locale: dateLocale })
        } catch {
            return dateStr;
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {/* Registrations Chart */}
            <div className="bg-surface border border-white/5 rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-4 font-exo2">
                    {t('userRegistrationsLast30Days')}
                </h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#ffffff30"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#ffffff30"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#09090b",
                                    border: "1px solid #ffffff10",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#fff",
                                }}
                                labelFormatter={formatDate}
                            />
                            <Area
                                type="monotone"
                                dataKey="registrations"
                                name={t('registrations')}
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorReg)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Views Chart */}
            <div className="bg-surface border border-white/5 rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-4 font-exo2">
                    {t('modViewsLast30Days')}
                </h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#ffffff30"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#ffffff30"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#09090b",
                                    border: "1px solid #ffffff10",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#fff",
                                }}
                                labelFormatter={formatDate}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                name={t('views')}
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
