"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Bot, Calendar, Cpu } from "lucide-react"
import { useHealth } from "@/hooks/use-health"
import type { DiscordStatus } from "@/lib/discord-types"
import type { CalendarData } from "@/lib/calendar-types"

type ChipState = "up" | "down" | "unknown"

function Chip({ icon, label, state, detail }: {
  icon: ReactNode
  label: string
  state: ChipState
  detail?: string
}) {
  const color = state === "up" ? "bg-green-500" : state === "down" ? "bg-red-500" : "bg-gray-600"
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        {icon}
        <motion.span
          className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${color}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
      <span className="text-gray-400 hidden md:inline">{label}</span>
      {detail && <span className="text-gray-600 hidden lg:inline">{detail}</span>}
    </div>
  )
}

export default function ApiStatus({
  discord,
  calendar,
}: {
  discord: DiscordStatus | null
  calendar: CalendarData | null
}) {
  const { data: health, error: healthError } = useHealth()

  const llm: ChipState = healthError || health == null ? "unknown" : health.ollama === "up" ? "up" : "down"
  const google: ChipState = calendar == null || !calendar.configured ? "unknown" : "up"
  const disc: ChipState = discord == null || !discord.configured ? "unknown" : discord.connected ? "up" : "down"
  const operational = [llm, google, disc].filter((s) => s === "up").length

  return (
    <div className="flex items-center gap-2 sm:gap-3 text-xs min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Chip icon={<Cpu className="h-3.5 w-3.5 text-purple-400" />} label="LLM" state={llm} detail={health?.model} />
        <Chip icon={<Calendar className="h-3.5 w-3.5 text-blue-400" />} label="GOOGLE" state={google} />
        <Chip icon={<Bot className="h-3.5 w-3.5 text-blue-400" />} label="DISCORD" state={disc} />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-gray-500 hidden lg:inline">API STATUS:</span>
        <span className={operational === 3 ? "text-green-400" : "text-yellow-400"}>
          {operational}/3<span className="hidden sm:inline"> operacional</span>
        </span>
      </div>
    </div>
  )
}
