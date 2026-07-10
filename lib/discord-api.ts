import { API_BASE, apiFetch } from "./api-base"
import type { DiscordStatus } from "./discord-types"

export async function getDiscordStatus(): Promise<DiscordStatus> {
  const r = await apiFetch(`${API_BASE}/api/discord/status`)
  if (!r.ok) throw new Error(`discord status falhou: ${r.status}`)
  return (await r.json()) as DiscordStatus
}
