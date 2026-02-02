import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    try {
        // 1. Fetch expenses for the entire year for monthly stats
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);

        const yearlyExpenses = await prisma.expense.findMany({
            where: {
                userId: session.userId,
                date: {
                    gte: yearStart,
                    lte: yearEnd,
                },
            },
            select: {
                amount: true,
                date: true,
            },
        });

        const monthlyStats = Array.from({ length: 12 }, (_, i) => {
            const shortMonth = new Date(year, i).toLocaleString('default', { month: 'short' });
            return {
                month: shortMonth,
                total: 0,
                monthIndex: i + 1
            };
        });

        yearlyExpenses.forEach(expense => {
            const monthIndex = expense.date.getMonth();
            monthlyStats[monthIndex].total += expense.amount;
        });

        // 2. Fetch expenses for the specific month for daily stats and tag distribution
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        const monthlyExpenses = await prisma.expense.findMany({
            where: {
                userId: session.userId,
                date: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
            include: {
                tag: true,
            },
        });

        // Daily Stats
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyStats = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            total: 0
        }));

        monthlyExpenses.forEach(expense => {
            const dayIndex = expense.date.getDate() - 1;
            dailyStats[dayIndex].total += expense.amount;
        });

        // Tag Stats
        const tagMap = new Map<string, { total: number; color: string }>();

        monthlyExpenses.forEach(expense => {
            const tagName = expense.tag.name;
            const current = tagMap.get(tagName) || { total: 0, color: expense.tag.color };
            tagMap.set(tagName, { ...current, total: current.total + expense.amount });
        });

        const tagStats = Array.from(tagMap.entries()).map(([name, data]) => ({
            name,
            value: data.total,
            color: data.color
        })).sort((a, b) => b.value - a.value);

        return NextResponse.json({
            monthlyStats,
            dailyStats,
            tagStats
        });

    } catch (error) {
        console.error("Failed to fetch report data", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
