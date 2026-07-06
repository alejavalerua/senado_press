"use client";

import {
  FileText,
  Send,
  HelpCircle,
  MessageSquare,
  Calendar,
  Gavel,
} from "lucide-react";
import { SenateState } from "@/domain/entities/SenateState";

interface SenatePanelProps {
  state: SenateState;
}

const stats = [
  { key: "activeProjects" as const, label: "Proyectos activos", icon: FileText, color: "text-blue-600 bg-blue-50" },
  { key: "activeDispatches" as const, label: "Despachos", icon: Send, color: "text-emerald-600 bg-emerald-50" },
  { key: "openQuestions" as const, label: "Preguntas abiertas", icon: HelpCircle, color: "text-amber-600 bg-amber-50" },
  { key: "activeDebates" as const, label: "Debates activos", icon: MessageSquare, color: "text-rose-600 bg-rose-50" },
];

export function SenatePanel({ state }: SenatePanelProps) {
  const nextSession = state.nextSessionAt
    ? new Date(state.nextSessionAt).toLocaleString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Por definir";

  return (
    <aside className="bg-white rounded-2xl card-shadow p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Gavel className="w-5 h-5 text-senate-700" />
        <h2 className="font-display font-bold text-senate-900 text-lg">Estado del Senado</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="rounded-xl p-3 border border-gray-100 card-hover">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{state[key]}</p>
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-senate-50 border border-senate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-senate-700" />
          <p className="text-sm font-semibold text-senate-800">Próxima sesión</p>
        </div>
        <p className="text-sm text-senate-700 capitalize">{nextSession}</p>
        <p className="text-xs text-senate-500 mt-1">
          Duración estimada: {state.sessionDurationMinutes} minutos
        </p>
      </div>
    </aside>
  );
}