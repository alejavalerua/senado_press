"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Newspaper, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      router.push(data.redirectTo);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-header mb-4">
            <Newspaper className="w-8 h-8 text-senate-200" />
          </div>
          <h1 className="font-display text-3xl font-bold text-senate-900">Senado Press</h1>
          <p className="text-gray-500 mt-2">Sala de Prensa del Modelo de Senado</p>
          <p className="text-senate-600 text-sm mt-1 font-medium">BIMUN 2026</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-6">
          <h2 className="font-display text-lg font-bold text-senate-900 mb-4">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo institucional o usuario
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senate-400 focus:ring-2 focus:ring-senate-200 outline-none"
                placeholder="tu@colegio.edu.co"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senate-400 focus:ring-2 focus:ring-senate-200 outline-none"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-header text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Eres periodista y no tienes cuenta?{" "}
            <Link href="/register" className="text-senate-700 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
          <p>Presidencia: Sophia Hamburguer · Vicepresidencia: Valeria Gómez</p>
          <p>Secretaría General: Samuel Lugo</p>
          <p className="text-gray-300 mt-3">Desarrollado por Alejandra Valencia</p>
        </div>
      </div>
    </div>
  );
}