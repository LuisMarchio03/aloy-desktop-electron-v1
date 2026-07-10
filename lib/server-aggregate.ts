import type { Server, SessionState } from "./sessions-types"

export interface ServerAggregate {
  id: string
  name: string
  online: boolean
  sessions: number
  cost: number
}

/**
 * Agrega as sessões por servidor (quantas rodam em cada um + custo somado +
 * online). Só servidores COM ≥1 sessão aparecem. Pura — alimenta a barra
 * agregada. `server` nulo cai em "local"; servidor removido → name=id, offline.
 */
export function aggregateByServer(servers: Server[], sessions: SessionState[]): ServerAggregate[] {
  const meta = new Map(servers.map((s) => [s.id, s]))
  const byId = new Map<string, ServerAggregate>()
  for (const sess of sessions) {
    const sid = sess.server ?? "local"
    let agg = byId.get(sid)
    if (!agg) {
      const m = meta.get(sid)
      agg = { id: sid, name: m?.name ?? sid, online: m?.online ?? false, sessions: 0, cost: 0 }
      byId.set(sid, agg)
    }
    agg.sessions += 1
    agg.cost += sess.cost_usd
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}
