"use client"

import { useEffect, useRef } from "react"
import { NOTIFICATIONS_WS_URL, parseNotification } from "@/lib/notifications-api"
import { useToast } from "@/hooks/use-toast"
import { wsUrl } from "@/lib/api-base"

const TITLES: Record<string, string> = { schedule: "Lembrete", n8n: "Automação" }

export function useNotifications() {
  const { toast } = useToast()
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
        ws = new WebSocket(wsUrl(NOTIFICATIONS_WS_URL))
      } catch {
        scheduleRetry()
        return
      }
      wsRef.current = ws
      ws.onopen = () => { retry.current = 0 }
      ws.onmessage = (e) => {
        const n = parseNotification(typeof e.data === "string" ? e.data : "")
        if (n) toast({ title: TITLES[n.source] ?? "Aloy", description: n.text })
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
  }, [toast])
}
