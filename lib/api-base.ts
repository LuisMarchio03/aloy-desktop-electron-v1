import { resolveBackendHost } from "./api-host"
import { getToken } from "./pairing"

// Host do backend derivado da página atual: no celular = IP da LAN,
// no desktop/SSR = localhost. Nunca hardcodar em componente.
const host = resolveBackendHost(typeof window !== "undefined" ? window.location.hostname : undefined)

export const API_BASE = `http://${host}:8080`
export const WS_BASE = `ws://${host}:8080`
export const COMMANDS_URL = `${API_BASE}/commands`

// fetch com Bearer quando há token. Preserva a aridade quando NÃO há token
// (comportamento idêntico ao fetch atual → testes existentes seguem passando).
export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  if (!token) return init === undefined ? fetch(input) : fetch(input, init)
  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}

// anexa ?token= à URL de WebSocket quando há token (o browser não seta header em WS).
export function wsUrl(url: string): string {
  const token = getToken()
  if (!token) return url
  return url + (url.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token)
}
