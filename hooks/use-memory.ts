"use client"

import { useCallback, useEffect, useState } from "react"
import { getMemoryFacts } from "@/lib/memory-api"
import type { MemoryData } from "@/lib/memory-types"

export function useMemory(active: boolean) {
  const [data, setData] = useState<MemoryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setData(await getMemoryFacts())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (active) void refresh()
  }, [active, refresh])

  return { data, loading, error, refresh }
}
