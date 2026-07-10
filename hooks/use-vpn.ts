"use client"

import { useCallback, useEffect, useState } from "react"
import type { TailnetDevices, TailscaleStatus } from "@/lib/vpn-types"
import {
  getTailnetDevices,
  getTailscaleStatus,
  tailscaleDown,
  tailscaleUp,
  setExitNode as apiSetExitNode,
  clearExitNode as apiClearExitNode,
} from "@/lib/vpn-api"

export function useVpn() {
  const [status, setStatus] = useState<TailscaleStatus | null>(null)
  const [devices, setDevices] = useState<TailnetDevices | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setStatus(await getTailscaleStatus())
    } catch {
      // rota 404 (ALOY_VPN_ENABLED desligado no kernel) ou kernel offline →
      // estado sintético "indisponível" pra UI mostrar a dica, sem spammar erro.
      setStatus({
        available: false,
        error: "VPN indisponível no kernel (ALOY_VPN_ENABLED=1?) ou kernel offline",
        backend_state: null,
        tailnet: null,
        magic_dns_suffix: null,
        self: null,
        peers: [],
      })
    }
    try {
      setDevices(await getTailnetDevices())
    } catch {
      setDevices(null) /* best-effort: API do tailnet não configurada / rota off */
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const up = useCallback(async () => {
    setBusy(true)
    try {
      return await tailscaleUp()
    } finally {
      setBusy(false)
      await refresh()
    }
  }, [refresh])

  const down = useCallback(async () => {
    setBusy(true)
    try {
      return await tailscaleDown()
    } finally {
      setBusy(false)
      await refresh()
    }
  }, [refresh])

  const setExitNode = useCallback(async (node: string) => {
    setBusy(true)
    try {
      return await apiSetExitNode(node)
    } finally {
      setBusy(false)
      await refresh()
    }
  }, [refresh])

  const clearExitNode = useCallback(async () => {
    setBusy(true)
    try {
      return await apiClearExitNode()
    } finally {
      setBusy(false)
      await refresh()
    }
  }, [refresh])

  return { status, devices, busy, refresh, up, down, setExitNode, clearExitNode }
}
