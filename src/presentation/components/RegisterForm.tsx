"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { PasswordField } from "./PasswordField";

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [mediaOutlet, setMediaOutlet] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          mediaOutlet,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
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
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/images/logo-senado.png"
              alt="Logo del Senado"
              width={96}
              height={96}
              className="h-20 w-20 md:h-24 md:w-24 object-contain"
              priority
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-senate-900">Senado Press</h1>
          <p className="text-gray-500 mt-2">Registro de periodistas</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-6">
          <h2 className="font-display text-lg font-bold text-senate-900 mb-1">Crear cuenta</h2>
          <p className="text-sm text-gray-500 mb-5">
            Usa el correo de tu institución educativa
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senate-400 outline-none"
                placeholder="María González"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senate-400 outline-none"
                placeholder="nombre@tucolegio.edu.co"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Medio de comunicación <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={mediaOutlet}
                onChange={(e) => setMediaOutlet(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-senate-400 outline-none"
                placeholder="El Espectador Júnior"
              />
            </div>

            <PasswordField
              label="Contraseña"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              autoComplete="new-password"
              required
            />

            <PasswordField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />

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
              Crear cuenta
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-senate-700 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}