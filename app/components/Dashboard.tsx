"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, LogOut, Trash2 } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseSummary } from "./ExpenseSummary";

import { Expense, Tag } from "@/app/types";

export function Dashboard() {
    const { user, logout } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports'>('dashboard');

    const fetchExpenses = useCallback(async () => {
        // ... same fetch logic ...
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

    const deleteExpense = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchExpenses();
            }
        } catch (error) {
            console.error("Failed to delete expense", error);
        }
    };

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
            <header className="bg-white/80 border-b border-zinc-200 sticky top-0 z-10 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-4 relative flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                            {user?.username ? user.username.split(' ')[0] : 'User'}'s Space
                        </h1>
                    </div>

                    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center bg-zinc-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            User
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'transactions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Report
                        </button>
                    </nav>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 z-20 relative"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Date Navigation & Total - Always visible or maybe just for Dashboard/Reports? Keeping it always visible for context */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
                            className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-semibold min-w-[180px] text-center text-zinc-900">
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
                            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-zinc-700">Add New Expense</h3>
                            <ExpenseForm onSuccess={fetchExpenses} />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-zinc-700">Quick Summary</h3>
                            <ExpenseSummary expenses={expenses} />
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-zinc-700">All Transactions</h3>
                            <p className="text-sm text-zinc-500">{expenses.length} records</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                            {expenses.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">No transactions found for this month.</div>
                            ) : (
                                <div className="divide-y divide-zinc-100">
                                    {expenses.map((expense) => (
                                        <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                                    style={{ backgroundColor: expense.tag.color }}
                                                >
                                                    {expense.tag.name[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-zinc-900">{expense.tag.name}</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                            {format(new Date(expense.date), "MMM d")}
                                                        </span>
                                                    </div>
                                                    {expense.description && (
                                                        <p className="text-sm text-zinc-500 italic mt-0.5">{expense.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono font-medium text-zinc-900">
                                                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                <button
                                                    onClick={() => deleteExpense(expense.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-zinc-700">Monthly Details Report</h3>
                        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                            <ExpenseSummary expenses={expenses} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
