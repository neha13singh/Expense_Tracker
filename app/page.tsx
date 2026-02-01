"use client";

import { useAuth } from "@/app/context/AuthContext";
import { LoginForm } from "@/app/components/LoginForm";
import { Dashboard } from "@/app/components/Dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
