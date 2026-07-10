"use client"

import { MoreHorizontal } from "lucide-react"
import { primaryNavItems, type SectionId } from "@/lib/nav"

export default function MobileNav({
  active,
  onSelect,
  onOpenMore,
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
  onOpenMore: () => void
}) {
  const items = primaryNavItems()
  return (
    <nav
      aria-label="Navegação"
      className="flex items-stretch border-t border-gray-800 bg-gray-950 pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => {
        const Icon = item.icon
        const on = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={on ? "page" : undefined}
            className={`flex-1 min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[10px] ${on ? "text-[#c4a8ff]" : "text-gray-400 hover:text-white"}`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        )
      })}
      <button
        onClick={onOpenMore}
        aria-label="Mais seções"
        className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-[10px] text-gray-400 hover:text-white"
      >
        <MoreHorizontal className="h-5 w-5" />
        <span>Mais</span>
      </button>
    </nav>
  )
}
