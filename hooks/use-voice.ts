"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { VOICE_WS_URL, parseVoiceEvent, runVoiceTurn } from "@/lib/voice-api"
import type { VoiceState, VoiceTurnResult } from "@/lib/voice-api"
import { wsUrl } from "@/lib/api-base"

export function useVoice() {
  const [state, setState] = useState<VoiceState>("idle")
  const [active, setActive] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const retry = useRef(0)
  const closed = useRef(false)

  useEffect(() => {
    closed.current = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const scheduleRetry = () => {
      const delay = Math.min(1000 * 2 ** retry.current, 15000)
      retry.current += 1
      timer = setTimeout(connect, delay)
    }

    function connect() {
      let ws: WebSocket
      try {
        ws = new WebSocket(wsUrl(VOICE_WS_URL))
      } catch {
        scheduleRetry()
        return
      }
      wsRef.current = ws
      ws.onopen = () => { retry.current = 0 }
      ws.onmessage = (e) => {
        const s = parseVoiceEvent(typeof e.data === "string" ? e.data : "")
        if (s) setState(s)
      }
      ws.onclose = () => { if (!closed.current) scheduleRetry() }
      ws.onerror = () => { try { ws.close() } catch { /* noop */ } }
    }

    connect()
    return () => {
      closed.current = true
      if (timer) clearTimeout(timer)
      try { wsRef.current?.close() } catch { /* noop */ }
    }
  }, [])

  const startTurn = useCallback(async (sessionId?: string): Promise<VoiceTurnResult | null> => {
    setActive(true)
    try {
      const r = await runVoiceTurn(sessionId)
      setUnavailable(false)
      return r
    } catch {
      setUnavailable(true)
      return null
    } finally {
      setActive(false)
      setState("idle")
    }
  }, [])

  return { state, active, unavailable, startTurn }
}
