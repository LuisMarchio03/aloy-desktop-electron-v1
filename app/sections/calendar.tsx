"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatEventRange } from "@/lib/calendar-api"
import type { CalendarData } from "@/lib/calendar-types"

export default function CalendarSection({
  calendar,
  loading,
  error,
  refresh,
}: {
  calendar: CalendarData | null
  loading: boolean
  error: boolean
  refresh: () => void | Promise<void>
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black">
      <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="text-sm font-medium text-white">Integrações de Calendário</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-900/30 border border-blue-900/50 flex items-center justify-center mr-2">
                  <span className="text-xs text-blue-400">G</span>
                </div>
                <span className="text-sm text-gray-300">Google Calendar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${error ? "bg-yellow-500" : calendar?.configured ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs text-gray-400">{error ? "ERRO" : calendar?.configured ? "CONECTADO" : "NÃO CONECTADO"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-white">Próximos Eventos</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            className="h-7 rounded-full text-xs border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 px-2.5"
          >
            {loading ? "..." : "Atualizar"}
          </Button>
        </div>

        <div className="space-y-3">
          {error && !loading && (
            <div className="text-xs text-yellow-500">Falha ao carregar eventos (backend indisponível).</div>
          )}
          {!error && !calendar?.configured && !loading && (
            <div className="text-xs text-gray-500">Google Calendar não conectado no backend.</div>
          )}
          {calendar?.configured && calendar.events.length === 0 && !loading && (
            <div className="text-xs text-gray-500">Nenhum evento próximo.</div>
          )}
          {(calendar?.events ?? []).map((ev) => (
            <div key={ev.id} className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">{ev.summary}</span>
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">Google</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">{formatEventRange(ev.start, ev.end, ev.all_day)}</div>
              {ev.location && <div className="mt-2 text-xs text-gray-500">{ev.location}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
