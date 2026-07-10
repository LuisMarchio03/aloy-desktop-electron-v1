import { describe, it, expect, vi, afterEach } from "vitest"
import { parseVoiceEvent, runVoiceTurn, VOICE_WS_URL } from "./voice-api"
import { API_BASE } from "./api-base"

afterEach(() => vi.restoreAllMocks())

describe("voice-api", () => {
  it("VOICE_WS_URL aponta pro /ws", () => {
    expect(VOICE_WS_URL).toBe("ws://localhost:8080/ws")
  })
  it("parseVoiceEvent aceita os 5 estados", () => {
    for (const s of ["listening", "transcribing", "thinking", "speaking", "idle"]) {
      expect(parseVoiceEvent(JSON.stringify({ event: s }))).toBe(s)
    }
  })
  it("parseVoiceEvent rejeita notification/echo/malformado/estado inválido", () => {
    expect(parseVoiceEvent(JSON.stringify({ event: "notification", text: "x" }))).toBeNull()
    expect(parseVoiceEvent("echo: oi")).toBeNull()
    expect(parseVoiceEvent("{nao json")).toBeNull()
    expect(parseVoiceEvent(JSON.stringify({ event: "dancing" }))).toBeNull()
  })
  it("runVoiceTurn faz POST em /voice/turn e normaliza", async () => {
    const spy = vi.fn(async () => ({ ok: true, json: async () => ({ transcript: "oi", message: "olá", session_id: "s1", tool_calls: [], degraded: false, no_speech: false, spoken: true }) }))
    vi.stubGlobal("fetch", spy as unknown as typeof fetch)
    const r = await runVoiceTurn("s1")
    expect(r.message).toBe("olá")
    expect(r.transcript).toBe("oi")
    expect(spy).toHaveBeenCalledWith(`${API_BASE}/voice/turn`, expect.objectContaining({ method: "POST" }))
  })
  it("runVoiceTurn lança em !ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 })) as unknown as typeof fetch)
    await expect(runVoiceTurn()).rejects.toThrow()
  })
})
