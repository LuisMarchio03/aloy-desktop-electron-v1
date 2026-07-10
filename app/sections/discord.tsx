"use client"

import { Bot } from "lucide-react"
import type { DiscordStatus } from "@/lib/discord-types"

export default function DiscordSection({
  discord,
  discordStale,
}: {
  discord: DiscordStatus | null
  discordStale: boolean
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black">
      {discord && !discord.configured ? (
        <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4 md:p-6 text-center text-sm text-gray-400">
          Discord não configurado. Defina <span className="text-blue-300">ALOY_DISCORD_BOT_TOKEN</span> no backend.
        </div>
      ) : (
        <>
          <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Bot className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-sm font-medium text-white">Discord Bot Status</h3>
                {discordStale && <span className="ml-2 text-[10px] text-yellow-500">(desatualizado)</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${discord?.connected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs text-gray-400">{discord?.connected ? "ONLINE" : "OFFLINE"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-400">Bot Activity</span>
                  <span className="text-blue-300">Ativo em {discord?.guild_count ?? 0} servidores</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-800/50 rounded p-2 text-xs text-center">
                    <div className="text-blue-300 font-medium">{discord?.turns_today ?? 0}</div>
                    <div className="text-gray-500 mt-1">Turnos hoje</div>
                  </div>
                  <div className="flex-1 bg-gray-800/50 rounded p-2 text-xs text-center">
                    <div className="text-blue-300 font-medium">{discord?.users_today ?? 0}</div>
                    <div className="text-gray-500 mt-1">Usuários</div>
                  </div>
                  <div className="flex-1 bg-gray-800/50 rounded p-2 text-xs text-center">
                    <div className="text-blue-300 font-medium">{discord?.latency_ms != null ? `${Math.round(discord.latency_ms)}ms` : "—"}</div>
                    <div className="text-gray-500 mt-1">Latência</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-400">Mensagens recentes</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto terminal-text">
                  {(discord?.recent ?? []).length === 0 && (
                    <div className="text-xs text-gray-500">Nenhuma mensagem recente.</div>
                  )}
                  {(discord?.recent ?? []).map((r, i) => (
                    <div key={i} className="text-xs bg-gray-800/50 rounded p-2">
                      <span className="text-green-400">{r.user}:</span>{" "}
                      <span className="text-gray-300">{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-400">Canais</span>
                </div>
                <div className="space-y-2">
                  {(discord?.channels ?? []).length === 0 && (
                    <div className="text-xs text-gray-500">Sem atividade em canais hoje.</div>
                  )}
                  {(discord?.channels ?? []).map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-xs gap-2">
                      <div className="flex items-center min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 shrink-0" />
                        <span className="text-gray-300 truncate">{c.name}</span>
                      </div>
                      <span className="text-gray-500 shrink-0">{c.turns_today} turnos hoje</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
