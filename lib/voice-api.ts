import { API_BASE, WS_BASE, apiFetch } from "./api-base"

export const VOICE_WS_URL = `${WS_BASE}/ws`

export type VoiceState = "idle" | "listening" | "transcribing" | "thinking" | "speaking"

const VOICE_STATES: readonly VoiceState[] = ["idle", "listening", "transcribing", "thinking", "speaking"]

export interface VoiceTurnResult {
  transcript: string
  message: string
  session_id: string
  tool_calls: string[]
  degraded: boolean
  no_speech: boolean
  spoken: boolean
}

export function parseVoiceEvent(data: string): VoiceState | null {
  try {
    const o = JSON.parse(data) as unknown
    if (typeof o !== "object" || o === null) return null
    const ev = (o as Record<string, unknown>).event
    return VOICE_STATES.includes(ev as VoiceState) ? (ev as VoiceState) : null
  } catch {
    return null
  }
}

export async function runVoiceTurn(sessionId?: string): Promise<VoiceTurnResult> {
  const r = await apiFetch(`${API_BASE}/voice/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId ?? null }),
  })
  if (!r.ok) throw new Error(`voice turn falhou: ${r.status}`)
  const d = await r.json()
  return {
    transcript: d.transcript ?? "",
    message: d.message ?? "",
    session_id: d.session_id ?? "",
    tool_calls: (d.tool_calls ?? []) as string[],
    degraded: Boolean(d.degraded),
    no_speech: Boolean(d.no_speech),
    spoken: Boolean(d.spoken),
  }
}
