"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Layers, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        setError(res.error.message || "Email atau kata sandi tidak valid");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan saat masuk");
      setLoading(false);
    }
  };

  const autofillDemo = (type: "admin" | "operator") => {
    if (type === "admin") {
      setEmail("admin@vectra.local");
      setPassword("admin123456");
    } else {
      setEmail("operator@vectra.local");
      setPassword("operator123456");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 p-4 sm:p-6">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Header & Logo */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="size-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20 mb-1">
            <Layers className="size-7" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
              VECTRA
            </h1>
            <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[11px] font-mono">
              v2.0
            </Badge>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Sistem Administrasi Dokumen Kependudukan & Pemetaan Presisi 11 Kolom Baku
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-200 text-xs">
            <ShieldAlert className="size-4 shrink-0 mt-0.5 text-red-400" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-slate-300">
              Alamat Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@vectra.local"
                className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/30 text-sm h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                Kata Sandi
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/30 text-sm h-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/30 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memverifikasi...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Masuk ke Dashboard
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-medium text-slate-400 text-center mb-3">
            Kredensial Cepat (Demo Testing):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => autofillDemo("admin")}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300 transition-all text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-blue-400 text-[11px]">
                <UserCheck className="size-3.5" />
                Admin
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 font-mono">admin@vectra.local</span>
            </button>

            <button
              type="button"
              onClick={() => autofillDemo("operator")}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300 transition-all text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-[11px]">
                <CheckCircle2 className="size-3.5" />
                Operator
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 font-mono">operator@vectra.local</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-5 text-center">
          <p className="text-[10px] text-slate-500">
            Registrasi publik dinonaktifkan. Akses sistem terproteksi RBAC dan sesi HttpOnly.
          </p>
        </div>
      </div>
    </div>
  );
}
