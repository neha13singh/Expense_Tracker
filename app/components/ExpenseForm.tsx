"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
    const [amount, setAmount] = useState("");
    const [tagName, setTagName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, tagName, date, description }),
            });

            if (res.ok) {
                setAmount("");
                setTagName("");
                setDescription("");
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to add expense", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 bg-white pl-7 pr-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Tag (Category)</label>
                <input
                    type="text"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                    placeholder="e.g. Food, Travel, Rent"
                    list="preset-tags"
                />
                <datalist id="preset-tags">
                    <option value="Food" />
                    <option value="Transport" />
                    <option value="Utilities" />
                    <option value="Entertainment" />
                    <option value="Shopping" />
                </datalist>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Description (Optional)</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                    placeholder="e.g. Lunch with team"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Add Expense"}
            </button>
        </form>
    );
}
