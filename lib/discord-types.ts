export interface DiscordRecent {
  user: string
  text: string
  ts: string
}

export interface DiscordChannel {
  name: string
  turns_today: number
}

export interface DiscordStatus {
  configured: boolean
  connected: boolean
  bot_user?: string | null
  latency_ms?: number | null
  guild_count?: number
  turns_today?: number
  users_today?: number
  recent?: DiscordRecent[]
  channels?: DiscordChannel[]
  mode?: string
}
