import type {
  CockpitState,
  HistoryItem,
  ReducerEvent,
  SessionState,
  TranscriptItem,
} from "./sessions-types"

export const initialState: CockpitState = { sessions: {}, order: [], transcripts: {} }

function last(items: TranscriptItem[]): TranscriptItem | undefined {
  return items[items.length - 1]
}

function finalizeStreaming(items: TranscriptItem[]): TranscriptItem[] {
  const l = last(items)
  if (l && l.kind === "assistant" && l.streaming) {
    return [...items.slice(0, -1), { ...l, streaming: false }]
  }
  return items
}

export function apply(state: CockpitState, ev: ReducerEvent): CockpitState {
  const sid = ev.session_id
  switch (ev.type) {
    case "session.created": {
      // ev é {type, session_id, ...SessionState}; extrai o estado.
      const { type: _t, session_id: _s, ...rest } = ev as unknown as Record<string, unknown>
      const s = rest as unknown as SessionState
      const exists = sid in state.sessions
      return {
        sessions: { ...state.sessions, [sid]: s },
        order: exists ? state.order : [...state.order, sid],
        transcripts: { ...state.transcripts, [sid]: state.transcripts[sid] ?? [] },
      }
    }
    case "session.status": {
      const s = state.sessions[sid]
      if (!s) return state
      return { ...state, sessions: { ...state.sessions, [sid]: { ...s, status: ev.status } } }
    }
    case "session.init": {
      const s = state.sessions[sid]
      if (!s) return state
      return {
        ...state,
        sessions: { ...state.sessions, [sid]: { ...s, sdk_session_id: ev.sdk_session_id } },
      }
    }
    case "session.ended": {
      // O status final já chega via session.status (FAILED/STOPPED); ended é só marcador.
      return state
    }
    case "session.removed": {
      if (!(sid in state.sessions)) return state
      const { [sid]: _s, ...sessions } = state.sessions
      const { [sid]: _t, ...transcripts } = state.transcripts
      return {
        sessions,
        order: state.order.filter((id) => id !== sid),
        transcripts,
      }
    }
    case "text.delta": {
      const items = state.transcripts[sid] ?? []
      const l = last(items)
      const next: TranscriptItem[] =
        l && l.kind === "assistant" && l.streaming
          ? [...items.slice(0, -1), { ...l, text: l.text + ev.text }]
          : [...items, { kind: "assistant", text: ev.text, streaming: true }]
      return { ...state, transcripts: { ...state.transcripts, [sid]: next } }
    }
    case "tool.use": {
      const items = finalizeStreaming(state.transcripts[sid] ?? [])
      const next: TranscriptItem[] = [...items, { kind: "tool", name: ev.name, input: ev.input }]
      return { ...state, transcripts: { ...state.transcripts, [sid]: next } }
    }
    case "files.touched": {
      const items: TranscriptItem[] = [
        ...(state.transcripts[sid] ?? []),
        { kind: "files", paths: ev.paths },
      ]
      const s = state.sessions[sid]
      const sessions = s
        ? {
            ...state.sessions,
            [sid]: {
              ...s,
              files_touched: Array.from(new Set([...s.files_touched, ...ev.paths])),
            },
          }
        : state.sessions
      return { ...state, sessions, transcripts: { ...state.transcripts, [sid]: items } }
    }
    case "turn.completed": {
      const items = finalizeStreaming(state.transcripts[sid] ?? [])
      const next: TranscriptItem[] = [...items, { kind: "turn", cost_usd: ev.cost_usd }]
      const s = state.sessions[sid]
      const sessions = s
        ? { ...state.sessions, [sid]: { ...s, cost_usd: s.cost_usd + ev.cost_usd } }
        : state.sessions
      return { ...state, sessions, transcripts: { ...state.transcripts, [sid]: next } }
    }
    case "local.user": {
      const items: TranscriptItem[] = [
        ...(state.transcripts[sid] ?? []),
        { kind: "user", text: ev.text },
      ]
      return { ...state, transcripts: { ...state.transcripts, [sid]: items } }
    }
    default:
      return state // never-crash: evento desconhecido/malformado
  }
}

export function setHistory(
  state: CockpitState,
  sid: string,
  history: HistoryItem[],
): CockpitState {
  const items: TranscriptItem[] = []
  for (const h of history) {
    if (h.role === "user") {
      items.push({ kind: "user", text: h.text })
    } else {
      if (h.text) items.push({ kind: "assistant", text: h.text, streaming: false })
      for (const t of h.tools ?? []) items.push({ kind: "tool", name: t, input: "" })
    }
  }
  return { ...state, transcripts: { ...state.transcripts, [sid]: items } }
}

export function hydrateSessions(state: CockpitState, list: SessionState[]): CockpitState {
  const sessions = { ...state.sessions }
  const order = [...state.order]
  const transcripts = { ...state.transcripts }
  for (const s of list) {
    sessions[s.id] = s
    if (!order.includes(s.id)) order.push(s.id)
    if (!(s.id in transcripts)) transcripts[s.id] = []
  }
  return { sessions, order, transcripts }
}
