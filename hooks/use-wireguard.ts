"use client"

import { useCallback, useEffect, useState } from "react"
import type { WireGuardStatus } from "@/lib/wireguard-types"
import { getWireguardStatus, wireguardDown, wireguardUp } from "@/lib/wireguard-api"

export function useWireguard() {
  const [status, setStatus] = useState<WireGuardStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStatus(await getWireguardStatus())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const up = useCallback(
    async (name: string) => {
      const r = await wireguardUp(name)
      await refresh()
      return r
    },
    [refresh],
  )

  const down = useCallback(
    async (name: string) => {
      const r = await wireguardDown(name)
      await refresh()
      return r
    },
    [refresh],
  )

  return { status, loading, error, refresh, up, down }
}
