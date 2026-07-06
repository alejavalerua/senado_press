import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-senate-800">404</h1>
        <p className="text-gray-600 mt-2 text-lg">Página no encontrada</p>
        <Link
          href="/login"
          className="inline-block mt-6 px-6 py-3 rounded-xl gradient-header text-white font-semibold hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}