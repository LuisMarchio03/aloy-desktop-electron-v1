import { describe, it, expect } from "vitest"
import { initialSidebarState, sidebarReducer } from "./sidebar-state"

describe("sidebarReducer", () => {
  it("toggleCollapse alterna collapsed", () => {
    const s1 = sidebarReducer(initialSidebarState, { type: "toggleCollapse" })
    expect(s1.collapsed).toBe(true)
    const s2 = sidebarReducer(s1, { type: "toggleCollapse" })
    expect(s2.collapsed).toBe(false)
  })
  it("openDrawer/closeDrawer setam drawerOpen", () => {
    const open = sidebarReducer(initialSidebarState, { type: "openDrawer" })
    expect(open.drawerOpen).toBe(true)
    const closed = sidebarReducer(open, { type: "closeDrawer" })
    expect(closed.drawerOpen).toBe(false)
  })
  it("não muta o estado de entrada", () => {
    const before = { ...initialSidebarState }
    sidebarReducer(initialSidebarState, { type: "toggleCollapse" })
    expect(initialSidebarState).toEqual(before)
  })
})
