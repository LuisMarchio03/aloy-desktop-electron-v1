import type { TailscaleStatus } from "./vpn-types"

// Anexa ?token= a uma URL base (insere a barra se faltar; sem token → base inalterada).
export function pairedUrl(base: string, token: string | null): string {
  if (!base || !token) return base
  const sep = base.endsWith("/") ? "" : "/"
  return `${base}${sep}?token=${encodeURIComponent(token)}`
}

// URL do tailnet pra ESTE device: http://<100.x>:3000/?token= — ou null se o
// Tailscale não estiver conectado ou não houver um IPv4 100.x.
export function tailnetWebUrl(
  status: TailscaleStatus | null,
  token: string | null,
): string | null {
  if (!status || !status.available || status.backend_state !== "Running") return null
  const ip = status.self?.ips?.find((x) => x.startsWith("100."))
  if (!ip) return null
  return pairedUrl(`http://${ip}:3000`, token)
}
