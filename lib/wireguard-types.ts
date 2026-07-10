export interface WgPeer {
  public_key: string
  endpoint: string | null
  allowed_ips: string[]
  latest_handshake: number
  rx_bytes: number
  tx_bytes: number
  keepalive: string | null
}

export interface WgInterface {
  name: string
  public_key: string | null
  listen_port: number
  peers: WgPeer[]
}

export interface WireGuardStatus {
  available: boolean
  error?: string
  interfaces: WgInterface[]
}

export interface WgActionResult {
  ok: boolean
  message: string
}
