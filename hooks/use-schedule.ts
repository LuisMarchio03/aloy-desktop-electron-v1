"use client"

import { useCallback, useEffect, useState } from "react"
import { listSchedules, createSchedule, deleteSchedule } from "@/lib/schedule-api"
import type { ScheduleBody, ScheduleData } from "@/lib/schedule-types"

export function useSchedule(active: boolean) {
  const [data, setData] = useState<ScheduleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setData(await listSchedules())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (body: ScheduleBody) => {
    await createSchedule(body)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    await deleteSchedule(id)
    await refresh()
  }, [refresh])

  useEffect(() => {
    if (active) void refresh()
  }, [active, refresh])

  return { data, loading, error, refresh, create, remove }
}
