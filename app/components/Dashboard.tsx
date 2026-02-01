"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseSummary } from "./ExpenseSummary";

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Expense {
    id: string;
    amount: number;
    date: string;
    tag: Tag;
}

export function Dashboard() {
    const { user, logout } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const res = await fetch(`/api/expenses?year=${year}&month=${month}`);
            if (res.ok) {
                const data = await res.json();
                setExpenses(data.expenses);
            }
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
            <header className="bg-white/80 border-b border-zinc-200 sticky top-0 z-10 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {user?.username}'s Expenses
                    </h1>
                    <button
                        onClick={logout}
                        className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Date Navigation & Total */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
                            className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-semibold min-w-[140px] text-center text-zinc-900">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                        <button
                            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
                            className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Total Spent</p>
                        <p className="text-3xl font-bold text-zinc-900">
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-zinc-700">Add New Expense</h3>
                        <ExpenseForm onSuccess={fetchExpenses} />

                        <div className="pt-6">
                            <h3 className="text-lg font-medium text-zinc-700 mb-4">Recent Transactions</h3>
                            <div className="space-y-3">
                                {expenses.length === 0 ? (
                                    <p className="text-zinc-400 text-sm">No expenses for this month.</p>
                                ) : (
                                    expenses.slice(0, 5).map((expense) => (
                                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full shadow-[0_0_10px]"
                                                    style={{ backgroundColor: expense.tag.color, boxShadow: `0 0 5px ${expense.tag.color}40` }}
                                                />
                                                <div>
                                                    <p className="font-medium text-zinc-900">{expense.tag.name}</p>
                                                    <p className="text-xs text-zinc-500">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                            <span className="font-mono font-medium text-zinc-700">
                                                ${expense.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                )}
                                {expenses.length > 5 && (
                                    <p className="text-xs text-center text-zinc-400 mt-2">
                                        + {expenses.length - 5} more transactions
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-zinc-700">Detailed Breakdown</h3>
                        <ExpenseSummary expenses={expenses} />
                    </div>
                </div>
            </main>
        </div>
    );
}
