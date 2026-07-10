export interface SidebarState {
  collapsed: boolean
  drawerOpen: boolean
}

export const initialSidebarState: SidebarState = {
  collapsed: false,
  drawerOpen: false,
}

export type SidebarAction =
  | { type: "toggleCollapse" }
  | { type: "openDrawer" }
  | { type: "closeDrawer" }

export function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case "toggleCollapse":
      return { ...state, collapsed: !state.collapsed }
    case "openDrawer":
      return { ...state, drawerOpen: true }
    case "closeDrawer":
      return { ...state, drawerOpen: false }
    default:
      return state
  }
}
