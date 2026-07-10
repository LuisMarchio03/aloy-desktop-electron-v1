export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  description?: string
  location?: string
  all_day?: boolean
}

export interface CalendarData {
  configured: boolean
  events: CalendarEvent[]
}
