export interface Device {
  id: string
  name: string
  created_at: string
  last_seen: string | null
}

export interface NewDevice {
  id: string
  token: string
}
