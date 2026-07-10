"use client"

import { useReducer } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { initialSidebarState, sidebarReducer } from "@/lib/sidebar-state"

export function useSidebar() {
  const isMobile = useIsMobile()
  const [state, dispatch] = useReducer(sidebarReducer, initialSidebarState)
  return {
    isMobile,
    collapsed: state.collapsed,
    drawerOpen: state.drawerOpen,
    toggleCollapse: () => dispatch({ type: "toggleCollapse" }),
    openDrawer: () => dispatch({ type: "openDrawer" }),
    closeDrawer: () => dispatch({ type: "closeDrawer" }),
  }
}
