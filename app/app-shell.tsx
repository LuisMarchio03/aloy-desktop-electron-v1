"use client"

import { useEffect, useState } from "react"
import { NAV_ITEMS, type SectionId } from "@/lib/nav"
import { useSidebar } from "@/hooks/use-sidebar"
import { useDiscord } from "@/hooks/use-discord"
import { useCalendar } from "@/hooks/use-calendar"
import { useNotifications } from "@/hooks/use-notifications"
import { ErrorBoundary } from "@/components/error-boundary"
import { captureTokenFromUrl } from "@/lib/pairing"
import Sidebar from "./sidebar"
import Topbar from "./topbar"
import MobileNav from "./mobile-nav"
import ChatSection from "./sections/chat"
import DiscordSection from "./sections/discord"
import CalendarSection from "./sections/calendar"
import SystemStatus from "./system-status"
import SessionsCockpit from "./sessions/cockpit"
import MemoryTab from "./memory-tab"
import RemindersTab from "./reminders-tab"
import FilesSection from "./sections/files"
import VpnSection from "./sections/vpn"

export default function AppShell() {
  useEffect(() => { captureTokenFromUrl() }, [])
  const [active, setActive] = useState<SectionId>("chat")
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const sidebar = useSidebar()
  const { status: discord, stale: discordStale } = useDiscord(active === "discord")
  const { data: calendar, loading: calLoading, error: calError, refresh: calRefresh } = useCalendar()
  useNotifications()

  const title = NAV_ITEMS.find((n) => n.id === active)?.label ?? "ALOY"

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-black text-foreground">
      <Sidebar
        items={NAV_ITEMS}
        active={active}
        onSelect={setActive}
        collapsed={sidebar.collapsed}
        isMobile={sidebar.isMobile}
        drawerOpen={sidebar.drawerOpen}
        onToggleCollapse={sidebar.toggleCollapse}
        onCloseDrawer={sidebar.closeDrawer}
        isVoiceMode={isVoiceMode}
        onToggleVoice={() => setIsVoiceMode((v) => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          discord={discord}
          calendar={calendar}
          isMobile={sidebar.isMobile}
          onOpenDrawer={sidebar.openDrawer}
        />
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Chat sempre montado (preserva histórico ao navegar); os demais montam sob demanda.
              Cada área tem seu error boundary: um erro de render numa seção fica contido ali,
              a barra lateral/navegação seguem vivas, e trocar de seção (key={active}) recupera. */}
          <div className={active === "chat" ? "flex-1 flex flex-col min-h-0" : "hidden"}>
            <ErrorBoundary label="chat">
              <ChatSection isVoiceMode={isVoiceMode} />
            </ErrorBoundary>
          </div>
          <ErrorBoundary key={active} label={active}>
            {active === "discord" && <DiscordSection discord={discord} discordStale={discordStale} />}
            {active === "calendar" && (
              <CalendarSection calendar={calendar} loading={calLoading} error={calError} refresh={calRefresh} />
            )}
            {active === "system" && <SystemStatus />}
            {active === "sessions" && <SessionsCockpit />}
            {active === "memory" && (
              <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black"><MemoryTab /></div>
            )}
            {active === "reminders" && (
              <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black"><RemindersTab /></div>
            )}
            {active === "files" && <FilesSection />}
            {active === "vpn" && <VpnSection />}
          </ErrorBoundary>
        </main>
        {sidebar.isMobile && (
          <MobileNav active={active} onSelect={setActive} onOpenMore={sidebar.openDrawer} />
        )}
      </div>
    </div>
  )
}
