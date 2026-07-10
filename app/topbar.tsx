"use client"

import { Menu } from "lucide-react"
import ApiStatus from "./api-status"
import type { DiscordStatus } from "@/lib/discord-types"
import type { CalendarData } from "@/lib/calendar-types"

export default function Topbar({
  title, discord, calendar, isMobile, onOpenDrawer,
}: {
  title: string
  discord: DiscordStatus | null
  calendar: CalendarData | null
  isMobile: boolean
  onOpenDrawer: () => void
}) {
  return (
    <header
      className={`flex items-center justify-between gap-3 min-h-12 shrink-0 px-4 border-b border-gray-800/50 bg-gray-950/80 ${isMobile ? "pt-[env(safe-area-inset-top)]" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <button
            onClick={onOpenDrawer}
            aria-label="Abrir menu"
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800/60"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-sm font-light tracking-wider text-white truncate">{title}</h2>
      </div>
      <ApiStatus discord={discord} calendar={calendar} />
    </header>
  )
}
