export interface HealthStatus {
  status: "ok" | "degraded"
  ollama: "up" | "down"
  model: string
}
