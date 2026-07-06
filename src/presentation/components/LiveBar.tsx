"use client";

import { Radio } from "lucide-react";
import { SenateState } from "@/domain/entities/SenateState";

interface LiveBarProps {
  state: SenateState;
}

export function LiveBar({ state }: LiveBarProps) {
  return (
    <div className="live-bar text-white px-4 py-2.5 flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2 shrink-0">
        {state.isLive && (
          <span className="flex items-center gap-1.5 bg-red-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3 live-pulse" />
            En Vivo
          </span>
        )}
        {!state.isLive && (
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
            Fuera de sesión
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">
          <span className="opacity-80 mr-2">Tema actual:</span>
          {state.liveTopic}
        </p>
      </div>
    </div>
  );
}