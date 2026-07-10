import { describe, it, expect } from "vitest"
import { apply, hydrateSessions, initialState, setHistory } from "./sessions-reducer"
import type { CockpitState, ReducerEvent, SessionState } from "./sessions-types"

function makeState(): SessionState {
  return {
    id: "s1", task: "refatorar auth", cwd: "/p", model: null, platform: "claude-code",
    server: null, status: "idle",
    created_at: 1, last_activity: 1, files_touched: [], cost_usd: 0,
    sdk_session_id: null, transcript_path: null,
  }
}
function created(): ReducerEvent {
  return { type: "session.created", session_id: "s1", ...makeState() } as ReducerEvent
}

describe("apply", () => {
  it("session.created adiciona sessão, order e transcript vazio", () => {
    const s = apply(initialState, created())
    expect(s.sessions["s1"].task).toBe("refatorar auth")
    expect(s.order).toEqual(["s1"])
    expect(s.transcripts["s1"]).toEqual([])
  })

  it("session.created duas vezes não duplica no order", () => {
    let s = apply(initialState, created())
    s = apply(s, created())
    expect(s.order).toEqual(["s1"])
  })

  it("session.created preserva o campo server", () => {
    const ev = { type: "session.created", session_id: "s1", ...makeState(), server: "casa" } as ReducerEvent
    const s = apply(initialState, ev)
    expect(s.sessions["s1"].server).toBe("casa")
  })

  it("text.delta acumula no mesmo balão assistant enquanto streama", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "text.delta", session_id: "s1", text: "Olá " })
    s = apply(s, { type: "text.delta", session_id: "s1", text: "mundo" })
    expect(s.transcripts["s1"]).toEqual([{ kind: "assistant", text: "Olá mundo", streaming: true }])
  })

  it("tool.use finaliza o streaming e empurra um chip", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "text.delta", session_id: "s1", text: "lendo" })
    s = apply(s, { type: "tool.use", session_id: "s1", name: "Read", input: "session.py" })
    expect(s.transcripts["s1"]).toEqual([
      { kind: "assistant", text: "lendo", streaming: false },
      { kind: "tool", name: "Read", input: "session.py" },
    ])
  })

  it("files.touched empurra item e une em files_touched da sessão", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "files.touched", session_id: "s1", paths: ["a.py"] })
    s = apply(s, { type: "files.touched", session_id: "s1", paths: ["a.py", "b.py"] })
    expect(s.sessions["s1"].files_touched).toEqual(["a.py", "b.py"])
    expect(s.transcripts["s1"].filter((i) => i.kind === "files").length).toBe(2)
  })

  it("turn.completed acumula custo e empurra rodapé", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "text.delta", session_id: "s1", text: "ok" })
    s = apply(s, { type: "turn.completed", session_id: "s1", result: "done", cost_usd: 0.42 })
    expect(s.sessions["s1"].cost_usd).toBeCloseTo(0.42)
    const last = s.transcripts["s1"].at(-1)
    expect(last).toEqual({ kind: "turn", cost_usd: 0.42 })
  })

  it("session.status atualiza o status", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "session.status", session_id: "s1", status: "working" })
    expect(s.sessions["s1"].status).toBe("working")
  })

  it("local.user empurra mensagem do usuário", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "local.user", session_id: "s1", text: "muda isso" })
    expect(s.transcripts["s1"].at(-1)).toEqual({ kind: "user", text: "muda isso" })
  })

  it("evento malformado/desconhecido não quebra (never-crash)", () => {
    const s = apply(initialState, { type: "lixo", session_id: "x" } as unknown as ReducerEvent)
    expect(s).toBe(initialState)
  })

  it("evento pra sessão inexistente não cria estado fantasma de status", () => {
    const s = apply(initialState, { type: "session.status", session_id: "nope", status: "failed" })
    expect(s).toBe(initialState)
  })

  it("session.removed remove sessão de sessions, order e transcripts", () => {
    let s = apply(initialState, created())
    s = apply(s, { type: "text.delta", session_id: "s1", text: "olá" })
    s = apply(s, { type: "session.removed", session_id: "s1" })
    expect(s.sessions["s1"]).toBeUndefined()
    expect(s.order).toEqual([])
    expect(s.transcripts["s1"]).toBeUndefined()
  })

  it("session.removed com id desconhecido é no-op", () => {
    const s = apply(initialState, { type: "session.removed", session_id: "nope" })
    expect(s).toBe(initialState)
  })
})

describe("setHistory", () => {
  it("converte history em itens (assistant com tools vira balão + chips)", () => {
    const s: CockpitState = apply(initialState, created())
    const out = setHistory(s, "s1", [
      { role: "user", text: "oi", tools: [] },
      { role: "assistant", text: "resposta", tools: ["Read", "Edit"] },
    ])
    expect(out.transcripts["s1"]).toEqual([
      { kind: "user", text: "oi" },
      { kind: "assistant", text: "resposta", streaming: false },
      { kind: "tool", name: "Read", input: "" },
      { kind: "tool", name: "Edit", input: "" },
    ])
  })
})

describe("hydrateSessions", () => {
  it("popula sessões e order sem duplicar", () => {
    let s = hydrateSessions(initialState, [makeState()])
    s = hydrateSessions(s, [makeState()])
    expect(s.order).toEqual(["s1"])
    expect(s.sessions["s1"].task).toBe("refatorar auth")
  })
})

describe("platform round-trip", () => {
  it("preserva platform vindo de session.created", () => {
    const ev = {
      type: "session.created", session_id: "s1", id: "s1", task: "t", cwd: "/r",
      model: null, status: "idle", created_at: 0, last_activity: 0,
      files_touched: [], cost_usd: 0, sdk_session_id: null, transcript_path: null,
      platform: "opencode",
    } as unknown as Parameters<typeof apply>[1]
    const s = apply(initialState, ev)
    expect(s.sessions["s1"].platform).toBe("opencode")
  })
})
