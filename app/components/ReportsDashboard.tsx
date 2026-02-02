"use client";

import { format, addMonths, subMonths, isSameDay } from 'date-fns';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';
import { ExpenseCalendar } from './ExpenseCalendar';
import { ExpenseSummary } from './ExpenseSummary';
import { Expense } from '@/app/types';

interface ReportsDashboardProps {
    currentDate: Date;
    expenses: Expense[];
    onDayClick?: (day: number) => void;
    onTagClick?: (tag: string) => void;
    onDateChange: (date: Date) => void;
}

export function ReportsDashboard({ currentDate, expenses, onDayClick, onTagClick, onDateChange }: ReportsDashboardProps) {
    const [monthlyStats, setMonthlyStats] = useState<{ month: string; total: number }[]>([]);

    useEffect(() => {
        const fetchMonthlyStats = async () => {
            try {
                const year = currentDate.getFullYear();
                // We only need the year for monthly stats, month param is arbitrary but API might expect it
                const res = await fetch(`/api/reports?year=${year}&month=1`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.monthlyStats) {
                        setMonthlyStats(data.monthlyStats);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch monthly stats", error);
            }
        };

        fetchMonthlyStats();
    }, [currentDate]); // Re-fetch only when year changes? Ideally yes. currentDate includes full date, so it changes on month change too. That's fine.

    const metrics = useMemo(() => {
        // --- 1. Total Spend This Month ---
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

        // --- 2. Today's Statistics ---
        const today = new Date();
        const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

        const todayExpenses = isCurrentMonth
            ? expenses.filter(e => isSameDay(new Date(e.date), today))
            : [];

        const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Calculate Top Category for TODAY
        const todayCategoryStats: Record<string, number> = {};
        todayExpenses.forEach(e => {
            todayCategoryStats[e.tag.name] = (todayCategoryStats[e.tag.name] || 0) + e.amount;
        });

        let todayTopCategoryName = "None";
        let todayTopCategoryAmount = 0;

        Object.entries(todayCategoryStats).forEach(([name, amount]) => {
            if (amount > todayTopCategoryAmount) {
                todayTopCategoryAmount = amount;
                todayTopCategoryName = name;
            }
        });

        // --- 3. Day of Month ---
        const dayOfMonth = isCurrentMonth ? today.getDate() : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // --- Data for Charts (derived from expenses) ---
        // 1. Tag Stats for Pie Chart
        const tagStatsMap: Record<string, { value: number; color: string }> = {};
        expenses.forEach(e => {
            if (!tagStatsMap[e.tag.name]) {
                tagStatsMap[e.tag.name] = { value: 0, color: e.tag.color };
            }
            tagStatsMap[e.tag.name].value += e.amount;
        });
        const tagStats = Object.keys(tagStatsMap).map(name => ({ name, ...tagStatsMap[name] }));

        // 2. Daily Stats for Calendar
        const dailyStatsMap: Record<number, number> = {};
        expenses.forEach(e => {
            const day = new Date(e.date).getDate();
            dailyStatsMap[day] = (dailyStatsMap[day] || 0) + e.amount;
        });
        // Fill all days
        const dailyStats = [];
        for (let i = 1; i <= totalDaysInMonth; i++) {
            dailyStats.push({ day: i, total: dailyStatsMap[i] || 0 });
        }

        // 3. Monthly Stats (This actually requires fetching data for ALL months, which passing just 'expenses' for current month doesn't provide.
        // However, the previous implementation fetched `monthlyStats` from API.
        // For now, I will OMIT the Monthly Bar Chart or mock it, OR I should keep the API call JUST for the accumulated monthly history?
        // Actually, the user asked for "Today" stats. I can keep the API call for "monthlyStats" or just drop the bar chart if not requested.
        // The user didn't ask to remove the Monthly Chart.
        // I will keep the fetch ONLY for monthlyStats if needed, or better:
        // Let's stick to the user Request: "add total mount spend for today".
        // I will try to preserve the monthly chart if I can, but passing `expenses` only gives current month.
        // I will Temporarily HIDE the Monthly Bar Chart or just show current month bar?
        // To properly support Monthly Bar Chart, I'd need to fetch year data.
        // Let's assume for this step I focus on the requested Cards.
        // I'll leave the monthly stats empty or mock for now to avoid breaking types.

        return { totalSpent, todaySpent, todayTopCategoryName, dayOfMonth, totalDaysInMonth, tagStats, dailyStats, isCurrentMonth };
    }, [expenses, currentDate]);

    const { totalSpent, todaySpent, todayTopCategoryName, dayOfMonth, totalDaysInMonth, tagStats, dailyStats, isCurrentMonth } = metrics;

    return (
        <div className="space-y-8">
            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Today's Spend */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">{isCurrentMonth ? "Spent Today" : "Selected Month Total"}</p>
                            <h4 className="text-2xl font-bold text-zinc-900 mt-1">
                                {isCurrentMonth ? `₹${todaySpent.toLocaleString()}` : `₹${totalSpent.toLocaleString()}`}
                            </h4>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 2: Today's Category */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">{isCurrentMonth ? "Today's Top Category" : "Top Category"}</p>
                            <h4 className="text-xl font-bold text-zinc-900 mt-1 truncate max-w-[140px]" title={todayTopCategoryName}>
                                {todayTopCategoryName}
                            </h4>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Tag className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Day of Month */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Day in Month</p>
                            <h4 className="text-2xl font-bold text-zinc-900 mt-1">{dayOfMonth} <span className="text-sm text-zinc-400 font-normal">/ {totalDaysInMonth}</span></h4>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 4: Total Month Spend */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Monthly Total</p>
                            <h4 className="text-2xl font-bold text-zinc-900 mt-1">₹{totalSpent.toLocaleString()}</h4>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Row: Pie Chart & Daily Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart - Expenses by Tag */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-zinc-700 mb-6">Expenses by Category</h3>
                    <div className="h-[300px] w-full">
                        {tagStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={tagStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        onClick={(data) => {
                                            if (data && data.name) {
                                                onTagClick?.(data.name);
                                            }
                                        }}
                                        className={onTagClick ? "cursor-pointer" : ""}
                                    >
                                        {tagStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number | undefined) => `₹${(value || 0).toLocaleString()}`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#374151', fontWeight: 500 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        onClick={(data) => {
                                            // Recharts Legend payload value is the name
                                            if (data && data.value) {
                                                onTagClick?.(data.value);
                                            }
                                        }}
                                        wrapperStyle={{ cursor: onTagClick ? 'pointer' : 'default' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-400">
                                No expenses this month
                            </div>
                        )}
                    </div>
                </div>

                {/* Area Chart - Daily Activity */}
                {/* Daily Activity Calendar */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-zinc-700">Daily Spending - {format(currentDate, "MMMM yyyy")}</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onDateChange(subMonths(currentDate, 1))}
                                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onDateChange(addMonths(currentDate, 1))}
                                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <ExpenseCalendar
                        currentDate={currentDate}
                        dailyStats={dailyStats}
                        onDayClick={onDayClick}
                    />
                </div>
            </div>

            {/* Monthly Category Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-700 mb-6">Monthly Category Summary</h3>
                <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                    <ExpenseSummary expenses={expenses} />
                </div>
            </div>

            {/* Bottom Row: Bar Chart - Monthly Comparison */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-700 mb-6">Monthly Overview ({currentDate.getFullYear()})</h3>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyStats} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                                width={45}
                            />
                            <RechartsTooltip
                                cursor={{ fill: '#f9fafb' }}
                                formatter={(value: number | undefined) => `₹${(value || 0).toLocaleString()}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#6366f1"
                                radius={[6, 6, 0, 0]}
                                activeBar={{ fill: '#4f46e5' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
