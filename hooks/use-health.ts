"use client"

import { useEffect, useState } from "react"
import { getHealth } from "@/lib/health-api"
import type { HealthStatus } from "@/lib/health-types"

export function useHealth(intervalMs = 10000) {
  const [data, setData] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      try {
        const h = await getHealth()
        if (!cancelled) {
          setData(h)
          setError(false)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void tick()
    const timer = setInterval(tick, intervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [intervalMs])

  return { data, loading, error }
}
