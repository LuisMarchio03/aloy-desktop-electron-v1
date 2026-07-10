"use client"

import { useCallback, useEffect, useState } from "react"
import { getCalendarEvents } from "@/lib/calendar-api"
import type { CalendarData } from "@/lib/calendar-types"

export function useCalendar(days = 7) {
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setData(await getCalendarEvents(days))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}
