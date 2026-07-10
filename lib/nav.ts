import {
  MessageSquare, Bot, Calendar, Server, SquareTerminal, Brain, Bell, FolderInput, Shield,
  type LucideIcon,
} from "lucide-react"

export type SectionId =
  | "chat" | "discord" | "calendar" | "system" | "sessions" | "memory" | "reminders" | "files" | "vpn"

export interface NavItem {
  id: SectionId
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "discord", label: "Discord", icon: Bot },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "system", label: "Sistema", icon: Server },
  { id: "sessions", label: "Sessões", icon: SquareTerminal },
  { id: "memory", label: "Memória", icon: Brain },
  { id: "reminders", label: "Lembretes", icon: Bell },
  { id: "files", label: "Arquivos", icon: FolderInput },
  { id: "vpn", label: "VPN", icon: Shield },
]

// Seções da barra de navegação inferior do mobile (na ordem exibida).
export const PRIMARY_NAV_IDS: SectionId[] = ["chat", "sessions", "files", "system"]

// As 4 primárias, na ordem de PRIMARY_NAV_IDS.
export function primaryNavItems(): NavItem[] {
  return PRIMARY_NAV_IDS.map((id) => NAV_ITEMS.find((n) => n.id === id)).filter(
    (n): n is NavItem => !!n,
  )
}

// O restante (vai pro ⋯/drawer), na ordem original do NAV_ITEMS.
export function overflowNavItems(): NavItem[] {
  return NAV_ITEMS.filter((n) => !PRIMARY_NAV_IDS.includes(n.id))
}
