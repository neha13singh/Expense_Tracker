"use client";

import { Expense } from "@/app/types";

interface SummaryItem {
    tagName: string;
    color: string;
    total: number;
    percentage: number;
}

export function ExpenseSummary({ expenses, onTagClick }: { expenses: Expense[], onTagClick?: (tagName: string) => void }) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const summary = expenses.reduce((acc, expense) => {
        const existing = acc.find((item) => item.tagName === expense.tag.name);
        if (existing) {
            existing.total += expense.amount;
        } else {
            acc.push({
                tagName: expense.tag.name,
                color: expense.tag.color,
                total: expense.amount,
                percentage: 0,
            });
        }
        return acc;
    }, [] as SummaryItem[]);

    summary.forEach((item) => {
        item.percentage = total === 0 ? 0 : (item.total / total) * 100;
    });

    summary.sort((a, b) => b.total - a.total);

    if (expenses.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50">
                <p className="text-zinc-400">No data to display</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {summary.map((item) => (
                <div
                    key={item.tagName}
                    className={`group ${onTagClick ? 'cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-lg transition-colors' : ''}`}
                    onClick={() => onTagClick?.(item.tagName)}
                >
                    <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-900 group-hover:text-indigo-600 transition-colors">{item.tagName}</span>
                            <span className="text-zinc-500 text-xs">({item.percentage.toFixed(1)}%)</span>
                        </div>
                        <span className="font-mono text-zinc-700">₹{item.total.toFixed(2)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-100">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                                boxShadow: `0 0 5px ${item.color}40`
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
