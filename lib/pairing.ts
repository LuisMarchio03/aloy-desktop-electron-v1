const KEY = "aloy_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(KEY)
}

export function setToken(t: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, t)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}

// No boot: se a URL trouxe ?token=, guarda e LIMPA a URL (não deixa o segredo no histórico).
export function captureTokenFromUrl(): void {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  const t = url.searchParams.get("token")
  if (!t) return
  setToken(t)
  url.searchParams.delete("token")
  window.history.replaceState({}, "", url.pathname + url.search + url.hash)
}
