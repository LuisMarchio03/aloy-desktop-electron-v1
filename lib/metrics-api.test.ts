import { describe, it, expect } from "vitest"
import { parseMetricsFrame, formatUptime, METRICS_WS_URL } from "./metrics-api"

describe("metrics-api", () => {
  it("METRICS_WS_URL aponta pro /ws/metrics", () => {
    expect(METRICS_WS_URL).toBe("ws://localhost:8080/ws/metrics")
  })

  it("parseMetricsFrame parseia um frame válido", () => {
    const frame = JSON.stringify({
      cpu_percent: 42.5, cpu_per_core: [10, 20], mem_used_gb: 3.2, mem_total_gb: 16,
      mem_percent: 20, disk_percent: 55, net_sent_mbps: 1.1, net_recv_mbps: 2.2,
      uptime_seconds: 3661, ip: "10.0.0.1", temps: [], gpu: [], top_processes: [], timestamp: 123,
    })
    const snap = parseMetricsFrame(frame)
    expect(snap?.cpu_percent).toBe(42.5)
    expect(snap?.mem_total_gb).toBe(16)
  })

  it("parseMetricsFrame devolve null em frame malformado", () => {
    expect(parseMetricsFrame("não é json")).toBeNull()
    expect(parseMetricsFrame(JSON.stringify({ foo: 1 }))).toBeNull()
  })

  it("formatUptime formata h/m", () => {
    expect(formatUptime(3661)).toBe("1h 1m")
    expect(formatUptime(90)).toBe("1m")
  })
})
