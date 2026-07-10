export interface MetricsSnapshot {
  cpu_percent: number
  cpu_per_core: number[]
  mem_used_gb: number
  mem_total_gb: number
  mem_percent: number
  disk_percent: number | null
  net_sent_mbps: number
  net_recv_mbps: number
  uptime_seconds: number
  ip: string
  temps: Record<string, unknown>[]
  gpu: Record<string, unknown>[]
  top_processes: Record<string, unknown>[]
  timestamp: number
}
