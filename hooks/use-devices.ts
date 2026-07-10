"use client"

import { useCallback, useEffect, useState } from "react"
import type { Device } from "@/lib/devices-types"
import { listDevices, deleteDevice, renameDevice } from "@/lib/devices-api"

export function useDevices(enabled: boolean) {
  const [devices, setDevices] = useState<Device[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setDevices(await listDevices())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    if (enabled) void refresh()
  }, [enabled, refresh])

  const revoke = useCallback(async (id: string) => { await deleteDevice(id); await refresh() }, [refresh])
  const rename = useCallback(async (id: string, name: string) => { await renameDevice(id, name); await refresh() }, [refresh])

  return { devices, error, refresh, revoke, rename }
}
