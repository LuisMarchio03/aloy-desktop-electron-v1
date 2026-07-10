export type ScheduleKind = "once" | "interval" | "daily"

export interface Schedule {
  id: number
  text: string
  kind: ScheduleKind
  channel: string
  contextual: boolean
  next_fire_at: number | null
  enabled: boolean
}

export interface ScheduleData {
  count: number
  schedules: Schedule[]
}

export interface ScheduleBody {
  text: string
  kind: ScheduleKind
  spec: Record<string, unknown>
  channel?: string
  contextual?: boolean
  prompt?: string
}
