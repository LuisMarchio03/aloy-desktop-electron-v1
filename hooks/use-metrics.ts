"use client"

import { useEffect, useRef, useState } from "react"
import { METRICS_WS_URL, parseMetricsFrame } from "@/lib/metrics-api"
import type { MetricsSnapshot } from "@/lib/metrics-types"
import { wsUrl } from "@/lib/api-base"

type MetricsStatus = "connecting" | "live" | "closed"

export function useMetrics(enabled: boolean) {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null)
  const [status, setStatus] = useState<MetricsStatus>("connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const retry = useRef(0)
  const closed = useRef(false)

  useEffect(() => {
    if (!enabled) return
    closed.current = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const scheduleRetry = () => {
      const delay = Math.min(1000 * 2 ** retry.current, 15000)
      retry.current += 1
      timer = setTimeout(connect, delay)
    }

    function connect() {
      setStatus((s) => (s === "live" ? s : "connecting"))
      let ws: WebSocket
      try {
        ws = new WebSocket(wsUrl(METRICS_WS_URL))
      } catch {
        scheduleRetry()
        return
      }
      wsRef.current = ws
      ws.onopen = () => {
        retry.current = 0
      }
      ws.onmessage = (e) => {
        const snap = parseMetricsFrame(typeof e.data === "string" ? e.data : "")
        if (snap) {
          setMetrics(snap)
          setStatus("live")
        }
      }
      ws.onclose = () => {
        if (!closed.current) {
          setStatus("closed")
          scheduleRetry()
        }
      }
      ws.onerror = () => {
        try {
          ws.close()
        } catch {
          /* já fechado */
        }
      }
    }

    connect()
    return () => {
      closed.current = true
      if (timer) clearTimeout(timer)
      try {
        wsRef.current?.close()
      } catch {
        /* noop */
      }
    }
  }, [enabled])

  return { metrics, status }
}
