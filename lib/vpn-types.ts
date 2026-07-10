export interface TailscaleNode {
  id: string | null
  hostname: string | null
  dns_name: string | null
  os: string | null
  online: boolean
  ips: string[]
  exit_node: boolean
  exit_node_option: boolean
  rx_bytes: number | null
  tx_bytes: number | null
  last_seen: string | null
}

export interface TailscaleStatus {
  available: boolean
  error?: string
  backend_state: string | null
  tailnet: string | null
  magic_dns_suffix: string | null
  self: TailscaleNode | null
  peers: TailscaleNode[]
}

export interface VpnActionResult {
  ok: boolean
  message: string
}

export interface TailnetDevice {
  id: string | null
  node_id: string | null
  hostname: string | null
  name: string | null
  os: string | null
  addresses: string[]
  last_seen: string | null
  update_available: boolean
  authorized: boolean
  online: boolean
  is_external: boolean
  user: string | null
  client_version: string | null
  created: string | null
  expires: string | null
  blocks_incoming: boolean
}

export interface TailnetDevices {
  available: boolean
  error?: string
  devices: TailnetDevice[]
}
