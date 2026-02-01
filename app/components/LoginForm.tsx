"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2 } from "lucide-react";

export function LoginForm() {
    const { login } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            login(data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                        {isRegister ? "Create an account" : "Welcome back"}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        {isRegister ? "Start tracking your expenses today" : "Sign in to continue to your workspace"}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm"
                                placeholder="johndoe"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : isRegister ? "Sign up" : "Sign in"}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
