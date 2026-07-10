import { describe, it, expect } from "vitest"
import { NAV_ITEMS, PRIMARY_NAV_IDS, primaryNavItems, overflowNavItems } from "./nav"

describe("NAV_ITEMS", () => {
  it("tem 9 seções, começando por chat", () => {
    expect(NAV_ITEMS.map((n) => n.id)).toEqual([
      "chat", "discord", "calendar", "system", "sessions", "memory", "reminders", "files", "vpn",
    ])
  })
  it("todo item tem label não-vazio e um ícone", () => {
    for (const item of NAV_ITEMS) {
      expect(item.label.length).toBeGreaterThan(0)
      expect(item.icon).toBeTruthy()
    }
  })
  it("ids são únicos", () => {
    const ids = NAV_ITEMS.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("split de nav (mobile)", () => {
  it("primaryNavItems: os 4 na ordem de PRIMARY_NAV_IDS", () => {
    expect(primaryNavItems().map((n) => n.id)).toEqual(["chat", "sessions", "files", "system"])
  })
  it("overflowNavItems: os outros 5 na ordem do NAV_ITEMS", () => {
    expect(overflowNavItems().map((n) => n.id)).toEqual([
      "discord", "calendar", "memory", "reminders", "vpn",
    ])
  })
  it("primary + overflow = todos os itens, sem duplicar", () => {
    const got = [...primaryNavItems(), ...overflowNavItems()].map((n) => n.id).sort()
    expect(got).toEqual(NAV_ITEMS.map((n) => n.id).sort())
  })
  it("todo id primário existe em NAV_ITEMS", () => {
    const ids = new Set(NAV_ITEMS.map((n) => n.id))
    for (const id of PRIMARY_NAV_IDS) expect(ids.has(id)).toBe(true)
  })
})
