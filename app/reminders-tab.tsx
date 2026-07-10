"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSchedule } from "@/hooks/use-schedule"
import { buildScheduleSpec } from "@/lib/schedule-api"
import type { ScheduleKind } from "@/lib/schedule-types"

const KIND_LABELS: Record<ScheduleKind, string> = {
  once: "Uma vez",
  interval: "Repetido",
  daily: "Diário",
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const INPUT_CLASSES = "bg-gray-800/50 border border-gray-700/50 rounded px-2 py-1 text-xs text-white"

export default function RemindersTab() {
  const { data, loading, error, refresh, create, remove } = useSchedule(true)
  const { toast } = useToast()

  const [text, setText] = useState("")
  const [kind, setKind] = useState<ScheduleKind>("once")
  const [fireAt, setFireAt] = useState("")
  const [everyMinutes, setEveryMinutes] = useState(5)
  const [time, setTime] = useState("")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [contextual, setContextual] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const toggleWeekday = (idx: number) => {
    setWeekdays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]))
  }

  const resetForm = () => {
    setText("")
    setKind("once")
    setFireAt("")
    setEveryMinutes(5)
    setTime("")
    setWeekdays([])
    setContextual(false)
  }

  const handleCreate = async () => {
    const trimmed = text.trim()
    const kindValid =
      kind === "once" ? Boolean(fireAt) : kind === "interval" ? everyMinutes >= 1 : kind === "daily" ? Boolean(time) : false

    if (!trimmed || !kindValid) {
      toast({ title: "Preencha os campos do lembrete", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const spec = buildScheduleSpec(kind, { fireAt, everyMinutes, time, weekdays })
      await create({
        text: trimmed,
        kind,
        spec,
        contextual,
        prompt: contextual ? trimmed : undefined,
      })
      resetForm()
      toast({ title: "Lembrete criado" })
    } catch {
      toast({ title: "Falha ao criar lembrete", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: number) => {
    setRemovingId(id)
    try {
      await remove(id)
      toast({ title: "Lembrete cancelado" })
    } catch {
      toast({ title: "Falha ao cancelar lembrete", variant: "destructive" })
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
        <div className="flex items-center mb-3">
          <Bell className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="text-sm font-medium text-white">Novo lembrete</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Mensagem</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex.: beber água"
              className={`${INPUT_CLASSES} w-full`}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Tipo</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ScheduleKind)}
              className={INPUT_CLASSES}
            >
              <option value="once">Uma vez</option>
              <option value="interval">Repetido</option>
              <option value="daily">Diário</option>
            </select>
          </div>

          {kind === "once" && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">Data e hora</label>
              <input
                type="datetime-local"
                value={fireAt}
                onChange={(e) => setFireAt(e.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
          )}

          {kind === "interval" && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">A cada quantos minutos</label>
              <input
                type="number"
                min="1"
                value={everyMinutes}
                onChange={(e) => setEveryMinutes(Number(e.target.value))}
                className={INPUT_CLASSES}
              />
            </div>
          )}

          {kind === "daily" && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Horário</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={INPUT_CLASSES}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Dias da semana</label>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAY_LABELS.map((label, idx) => (
                    <label key={idx} className="flex items-center gap-1 text-xs text-gray-400">
                      <input
                        type="checkbox"
                        checked={weekdays.includes(idx)}
                        onChange={() => toggleWeekday(idx)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={contextual}
              onChange={(e) => setContextual(e.target.checked)}
            />
            Gerar a mensagem via IA no disparo
          </label>

          <Button
            onClick={() => void handleCreate()}
            disabled={submitting}
            className="h-8 rounded-full text-xs bg-purple-700 hover:bg-purple-600 text-white px-4"
          >
            {submitting ? "Criando..." : "Criar lembrete"}
          </Button>
        </div>
      </div>

      <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Meus lembretes</h3>
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
          {error && !loading ? (
            <div className="text-yellow-500 text-xs">Falha ao carregar (backend indisponível).</div>
          ) : data && data.schedules.length === 0 && !loading ? (
            <div className="text-gray-500 text-xs">Nenhum lembrete.</div>
          ) : (
            (data?.schedules ?? []).map((s) => (
              <div key={s.id} className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm text-white">{s.text}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                      s.enabled ? "bg-green-900/30 text-green-400" : "bg-gray-800/50 text-gray-500"
                    }`}
                  >
                    {s.enabled ? "ativo" : "pausado"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] bg-gray-800/50 rounded px-2 py-0.5 text-gray-400">
                    {KIND_LABELS[s.kind]}
                  </span>
                  <span className="text-[10px] bg-gray-800/50 rounded px-2 py-0.5 text-gray-400">{s.channel}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  próximo: {s.next_fire_at ? new Date(s.next_fire_at * 1000).toLocaleString("pt-BR") : "—"}
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={removingId === s.id}
                    onClick={() => void handleRemove(s.id)}
                    className="h-6 rounded-full text-xs border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 px-2.5"
                  >
                    {removingId === s.id ? "..." : "Cancelar"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
