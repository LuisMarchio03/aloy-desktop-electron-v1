"use client"

import { useEffect, useState } from "react"
import { getDiscordStatus } from "@/lib/discord-api"
import type { DiscordStatus } from "@/lib/discord-types"

export function useDiscord(active: boolean, intervalMs = 5000) {
  const [status, setStatus] = useState<DiscordStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    if (!active) return
    let cancelled = false

    const tick = async () => {
      try {
        const s = await getDiscordStatus()
        if (!cancelled) {
          setStatus(s)
          setStale(false)
        }
      } catch {
        if (!cancelled) setStale(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    void tick()
    const timer = setInterval(tick, intervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [active, intervalMs])

  return { status, loading, stale }
}
