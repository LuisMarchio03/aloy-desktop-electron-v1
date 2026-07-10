import type { SessionStatus, TranscriptItem } from "./sessions-types"

/**
 * Deriva uma descrição curta da atividade corrente de uma sessão, a partir do
 * seu estado e do último item da transcrição. Pura — alimenta a statusline.
 */
export function describeActivity(status: SessionStatus, items: TranscriptItem[]): string {
  const last = items[items.length - 1]
  if (status === "working") {
    if (last?.kind === "tool") return `ferramenta: ${last.name}`
    if (last?.kind === "assistant" && last.streaming) return "gerando resposta…"
    if (last?.kind === "files") return `${last.paths.length} arquivo(s) tocados`
    return "trabalhando…"
  }
  if (status === "failed") return "falhou"
  if (status === "stopped") return "parada"
  // idle
  if (last?.kind === "turn") return "turno concluído"
  return "ociosa"
}
