export type SessionStatus = "working" | "idle" | "stopped" | "failed"

export type Platform = "claude-code" | "opencode"

export interface Server {
  id: string
  name: string
  url: string
  kind: string
  source: string
  editable: boolean
  online: boolean
  version: string | null
}

export interface ServerInput {
  name: string
  url: string
  kind: string
  username?: string | null
  password?: string | null
  token?: string | null
}

export interface SessionState {
  id: string
  task: string
  cwd: string
  model: string | null
  platform: Platform
  server: string | null
  status: SessionStatus
  created_at: number
  last_activity: number
  files_touched: string[]
  cost_usd: number
  sdk_session_id: string | null
  transcript_path: string | null
}

// Eventos do WebSocket /ws/sessions. Cada um chega como {type, session_id, ...payload}.
export type WsEvent =
  | ({ type: "session.created"; session_id: string } & SessionState)
  | { type: "session.init"; session_id: string; sdk_session_id: string | null }
  | { type: "text.delta"; session_id: string; text: string }
  | { type: "tool.use"; session_id: string; name: string; input: string }
  | { type: "files.touched"; session_id: string; paths: string[] }
  | { type: "turn.completed"; session_id: string; result: string | null; cost_usd: number }
  | { type: "session.status"; session_id: string; status: SessionStatus }
  | { type: "session.ended"; session_id: string; reason: string }
  | { type: "session.removed"; session_id: string }

// Evento local sintético (mensagem otimista do usuário), despachado pelo hook.
export type LocalUserEvent = { type: "local.user"; session_id: string; text: string }

export type ReducerEvent = WsEvent | LocalUserEvent

// Itens renderizados na transcrição.
export type TranscriptItem =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string; streaming: boolean }
  | { kind: "tool"; name: string; input: string }
  | { kind: "files"; paths: string[] }
  | { kind: "turn"; cost_usd: number }

export interface CockpitState {
  sessions: Record<string, SessionState>
  order: string[]
  transcripts: Record<string, TranscriptItem[]>
}

// Formato do GET /api/sessions/{id}/history.
export interface HistoryItem {
  role: "user" | "assistant"
  text: string
  tools: string[]
}
