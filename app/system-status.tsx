"use client"

import { motion } from "framer-motion"
import { Server, Activity, Bot, Database } from "lucide-react"
import { useMetrics } from "@/hooks/use-metrics"
import { useDiscord } from "@/hooks/use-discord"
import { useCalendar } from "@/hooks/use-calendar"
import { useHealth } from "@/hooks/use-health"
import { formatUptime } from "@/lib/metrics-api"

export default function SystemStatus() {
  const { metrics, status } = useMetrics(true)
  const { status: discord } = useDiscord(true)
  const { data: calendar } = useCalendar()
  const { data: health, error: healthError } = useHealth()

  const loading = status === "connecting" && metrics === null
  const pct = (v: number | null | undefined) => `${Math.min(100, Math.max(0, Math.round(v ?? 0)))}%`

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4 md:p-6 ">
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-t-2 border-gray-800 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Node.js Server Status */}
          <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Server className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-sm text-white">PC SERVER</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.span
                  className={`w-1.5 h-1.5 rounded-full ${status === "live" ? "bg-green-500" : "bg-yellow-500"}`}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <span className="text-xs text-gray-400">
                  {status === "live" ? "AO VIVO" : status === "closed" ? "OFFLINE" : "CONECTANDO"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="text-blue-300">{pct(metrics?.cpu_percent)}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: pct(metrics?.cpu_percent) }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Memory</span>
                  <span className="text-blue-300">
                    {(metrics?.mem_used_gb ?? 0).toFixed(1)}GB / {(metrics?.mem_total_gb ?? 0).toFixed(1)}GB
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: pct(metrics?.mem_percent) }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Network Upload</span>
                  <span className="text-blue-300">{(metrics?.net_sent_mbps ?? 0).toFixed(1)} MB/s</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 h-1 bg-blue-600 rounded-full"
                      animate={{
                        height: [1, Math.random() * 8 + 4, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.1,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Network Download</span>
                  <span className="text-blue-300">{(metrics?.net_recv_mbps ?? 0).toFixed(1)} MB/s</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 h-1 bg-blue-600 rounded-full"
                      animate={{
                        height: [1, Math.random() * 8 + 4, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.1,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>IP: {metrics?.ip || "—"}</span>
                <span>Aloy rodando há: {formatUptime(metrics?.uptime_seconds ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Discord Bot Status */}
          <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Bot className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-sm text-white">DISCORD BOT</h3>
              </div>
              <div className="flex items-center gap-1.5">


                {discord?.connected ? (
                  <>
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <span className="text-xs text-gray-400">ONLINE</span>
                  </>
                ) : (
                  <>
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <span className="text-xs text-gray-400">OFFLINE</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Connected Servers</span>
                  <span className="text-blue-300">{discord?.guild_count ?? 0}</span>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">API Latency</span>
                  <span className="text-blue-300">
                    {discord?.latency_ms != null ? `${Math.round(discord.latency_ms)}ms` : "—"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(100, Math.round((discord?.latency_ms ?? 0) / 3))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Turnos hoje</span>
                  <span className="text-blue-300">{discord?.turns_today ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 h-1 bg-blue-600 rounded-full"
                      animate={{
                        height: [1, Math.random() * 8 + 4, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.1,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Integrations Status */}
        <div className="mt-4 bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="h-4 w-4 text-purple-400 mr-2" />
              <h3 className="text-sm text-white">API INTEGRATIONS</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-900/30 border border-blue-900/50 flex items-center justify-center mr-1.5">
                    <span className="text-[8px] text-blue-400">G</span>
                  </div>
                  <span className="text-gray-300">Google Calendar</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status</span>
                {calendar?.configured ? (
                  <span className="text-green-400">Online</span>
                ) : (
                  <span className="text-red-400">Offline</span>
                )}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-900/30 border border-blue-900/50 flex items-center justify-center mr-1.5">
                    <span className="text-[8px] text-blue-400">D</span>
                  </div>
                  <span className="text-gray-300">Discord</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status</span>
                {discord?.connected ? (
                  <span className="text-green-400">Online</span>
                ) : (
                  <span className="text-red-400">Offline</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LLM Status (real via /health) */}
        <div className="mt-4 bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-purple-400 mr-2" />
              <h3 className="text-sm text-white">LLM STATUS</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${!healthError && health?.ollama === "up" ? "bg-green-500" : !healthError && health?.ollama === "down" ? "bg-red-500" : "bg-gray-600"}`} />
              <span className="text-xs text-gray-400">
                {!healthError && health?.ollama === "up" ? "ATIVO" : !healthError && health?.ollama === "down" ? "OFFLINE" : "—"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Modelo</span>
                <span className="text-purple-300">{!healthError ? (health?.model ?? "—") : "—"}</span>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded border border-gray-800/30 p-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Ollama</span>
                <span className="text-purple-300">{!healthError ? (health?.ollama ?? "—") : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
          <span>Last updated: Just now</span>
          <span className="text-blue-400 cursor-pointer hover:underline">View detailed logs</span>
        </div>
      </div>
    </div>
  )
}

