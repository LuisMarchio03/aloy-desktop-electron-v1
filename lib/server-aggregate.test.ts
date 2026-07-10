import { describe, it, expect } from "vitest"
import { aggregateByServer } from "./server-aggregate"
import type { Server, SessionState } from "./sessions-types"

function srv(id: string, over: Partial<Server> = {}): Server {
  return { id, name: id, url: "http://x", kind: "opencode", source: "config",
    editable: false, online: true, version: null, ...over }
}
function sess(over: Partial<SessionState>): SessionState {
  return {
    id: "s", task: "t", cwd: "/x", model: null, platform: "opencode", server: null,
    status: "working", created_at: 0, last_activity: 0, files_touched: [], cost_usd: 0,
    sdk_session_id: null, transcript_path: null, ...over,
  }
}

describe("aggregateByServer", () => {
  it("sem sessões → vazio", () => {
    expect(aggregateByServer([srv("local")], [])).toEqual([])
  })

  it("agrupa por servidor com contagem e custo somado", () => {
    const servers = [srv("local", { name: "local" }), srv("pcb", { name: "PC-B", online: false })]
    const sessions = [
      sess({ id: "a", server: "local", cost_usd: 0.01 }),
      sess({ id: "b", server: "local", cost_usd: 0.02 }),
      sess({ id: "c", server: "pcb", cost_usd: 0.05 }),
    ]
    const out = aggregateByServer(servers, sessions)
    const byId = Object.fromEntries(out.map((a) => [a.id, a]))
    expect(byId["local"]).toMatchObject({ name: "local", sessions: 2, online: true })
    expect(byId["local"].cost).toBeCloseTo(0.03)
    expect(byId["pcb"]).toMatchObject({ name: "PC-B", sessions: 1, online: false })
    expect(byId["pcb"].cost).toBeCloseTo(0.05)
  })

  it("server null cai em 'local'", () => {
    const out = aggregateByServer([srv("local")], [sess({ server: null, cost_usd: 0.1 })])
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe("local")
  })

  it("server desconhecido (removido) → name=id, offline", () => {
    const out = aggregateByServer([], [sess({ server: "sumiu" })])
    expect(out[0]).toMatchObject({ id: "sumiu", name: "sumiu", online: false, sessions: 1 })
  })
})
