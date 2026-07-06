"use client";

import { LogOut, Shield, Newspaper } from "lucide-react";
import { useRouter } from "next/navigation";
import { SessionPayload } from "@/infrastructure/auth/session";

interface HeaderProps {
  user: SessionPayload;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="gradient-header text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-senate-400/30 flex items-center justify-center border border-senate-300/40">
            <Newspaper className="w-5 h-5 text-senate-200" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Senado Press</h1>
            <p className="text-senate-200 text-xs">Sala de Prensa — BIMUN 2026</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-senate-200">
          <div className="text-center">
            <p className="text-senate-300 text-xs uppercase tracking-wider">Presidente</p>
            <p className="font-medium text-white">Sophia Hamburguer</p>
          </div>
          <div className="w-px h-8 bg-senate-600" />
          <div className="text-center">
            <p className="text-senate-300 text-xs uppercase tracking-wider">Vicepresidenta</p>
            <p className="font-medium text-white">Valeria Gómez</p>
          </div>
          <div className="w-px h-8 bg-senate-600" />
          <div className="text-center">
            <p className="text-senate-300 text-xs uppercase tracking-wider">Secretario General</p>
            <p className="font-medium text-white">Samuel Lugo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-senate-300">
              {user.role === "admin" ? (
                <span className="flex items-center gap-1 justify-end">
                  <Shield className="w-3 h-3" /> Administrador
                </span>
              ) : (
                user.mediaOutlet ?? "Periodista"
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}