"use client"

import { Power, Mic, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useHealth } from "@/hooks/use-health"
import type { NavItem, SectionId } from "@/lib/nav"
import pkg from "@/package.json"
import WebAccessButton from "./web-access"

export default function Sidebar({
  items, active, onSelect, collapsed, isMobile, drawerOpen,
  onToggleCollapse, onCloseDrawer, isVoiceMode, onToggleVoice,
}: {
  items: NavItem[]
  active: SectionId
  onSelect: (id: SectionId) => void
  collapsed: boolean
  isMobile: boolean
  drawerOpen: boolean
  onToggleCollapse: () => void
  onCloseDrawer: () => void
  isVoiceMode: boolean
  onToggleVoice: () => void
}) {
  const { data: health, error: healthError } = useHealth()
  // No desktop, rail (só ícone) quando collapsed. No mobile, largura cheia dentro do drawer.
  const showLabels = isMobile || !collapsed
  const backendDot = health && !healthError ? "bg-green-500" : healthError ? "bg-red-500" : "bg-gray-600"
  const llmDot = !healthError && health?.ollama === "up" ? "bg-green-500"
    : !healthError && health?.ollama === "down" ? "bg-red-500" : "bg-gray-600"

  const nav = (
    <nav className="flex flex-col h-full bg-gray-950/95 border-r border-gray-800/50">
      {/* brand */}
      <div className="flex items-center gap-2.5 h-14 px-3 shrink-0 border-b border-gray-800/40">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-purple-900/50 shrink-0">
          <Power className="w-4 h-4 text-purple-400" />
        </div>
        {showLabels && <span className="text-lg font-light tracking-wider text-white">ALOY</span>}
      </div>

      {/* nav items */}
      <div className="flex-1 overflow-y-auto py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); if (isMobile) onCloseDrawer() }}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "text-white bg-purple-900/20 border-l-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-900/60 border-l-2 border-transparent"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {showLabels && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </div>

      {/* footer: mini-saúde + voz (SEM settings — removido na Fatia A) */}
      <div className="shrink-0 border-t border-gray-800/40 p-3 space-y-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${backendDot}`} />{showLabels && "Backend"}</span>
          <span className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${llmDot}`} />{showLabels && "LLM"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><Mic className="h-3.5 w-3.5" />{showLabels && "Voz"}</span>
          <Switch checked={isVoiceMode} onCheckedChange={onToggleVoice} className="data-[state=checked]:bg-purple-700 h-5 w-9" />
        </div>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir" : "Recolher"}
            className="w-full flex items-center justify-center py-1.5 rounded-md text-gray-500 hover:text-white hover:bg-gray-900/60"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
        <WebAccessButton showLabel={showLabels} />
        {showLabels && <div className="text-[10px] text-gray-600 text-center pt-1">ALOY v{pkg.version}</div>}
      </div>
    </nav>
  )

  if (isMobile) {
    // drawer off-canvas
    return (
      <>
        {drawerOpen && <div className="fixed inset-0 z-40 bg-black/60" onClick={onCloseDrawer} />}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {nav}
        </div>
      </>
    )
  }
  return <div className={`${collapsed ? "w-16" : "w-56"} shrink-0 transition-[width]`}>{nav}</div>
}
