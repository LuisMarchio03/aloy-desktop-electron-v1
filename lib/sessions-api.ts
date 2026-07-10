import type { HistoryItem, Server, ServerInput, SessionState } from "./sessions-types"
import { API_BASE, WS_BASE, apiFetch } from "./api-base"

export const SESSIONS_HTTP_BASE = API_BASE
export const SESSIONS_WS_URL = `${WS_BASE}/ws/sessions`

const JSON_HEADERS = { "Content-Type": "application/json" }

export async function listSessions(): Promise<SessionState[]> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions`)
  if (!r.ok) throw new Error(`list sessions falhou: ${r.status}`)
  const data = await r.json()
  return (data.sessions ?? []) as SessionState[]
}

export async function listServers(): Promise<Server[]> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/servers`)
  if (!r.ok) throw new Error(`list servers falhou: ${r.status}`)
  const data = await r.json()
  return (data.servers ?? []) as Server[]
}

export async function addServer(body: ServerInput): Promise<string> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/servers`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`add server falhou: ${r.status}`)
  return (await r.json()).id as string
}

export async function updateServer(id: string, body: ServerInput): Promise<void> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/servers/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`update server falhou: ${r.status}`)
}

export async function deleteServer(id: string): Promise<void> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/servers/${id}`, { method: "DELETE" })
  if (!r.ok) throw new Error(`delete server falhou: ${r.status}`)
}

export async function testServer(id: string): Promise<{ online: boolean; version: string | null }> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/servers/${id}/test`, { method: "POST" })
  if (!r.ok) throw new Error(`test server falhou: ${r.status}`)
  return r.json()
}

export async function createSession(body: {
  task: string
  cwd: string
  model?: string | null
  platform?: string
  server?: string | null
}): Promise<string> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`create session falhou: ${r.status}`)
  const data = await r.json()
  return data.id as string
}

export async function sendSessionMessage(id: string, text: string): Promise<void> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/${id}/messages`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ text }),
  })
  if (!r.ok) throw new Error(`send message falhou: ${r.status}`)
}

export async function interruptSession(id: string): Promise<void> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/${id}/interrupt`, {
    method: "POST",
  })
  if (!r.ok) throw new Error(`interrupt falhou: ${r.status}`)
}

export async function getSessionHistory(id: string): Promise<HistoryItem[]> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/${id}/history`)
  if (!r.ok) throw new Error(`history falhou: ${r.status}`)
  const data = await r.json()
  return (data.history ?? []) as HistoryItem[]
}

export async function deleteSession(id: string): Promise<void> {
  const r = await apiFetch(`${SESSIONS_HTTP_BASE}/api/sessions/${id}`, { method: "DELETE" })
  if (!r.ok) throw new Error(`delete session falhou: ${r.status}`)
}
