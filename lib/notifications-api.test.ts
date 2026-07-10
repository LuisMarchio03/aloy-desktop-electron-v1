import { describe, it, expect } from "vitest"
import { parseNotification, NOTIFICATIONS_WS_URL } from "./notifications-api"

describe("notifications-api", () => {
  it("URL aponta pro /ws", () => {
    expect(NOTIFICATIONS_WS_URL).toBe("ws://localhost:8080/ws")
  })
  it("aceita notification válido", () => {
    const n = parseNotification(JSON.stringify({ event: "notification", source: "schedule", text: "hora do café" }))
    expect(n).toEqual({ source: "schedule", text: "hora do café" })
  })
  it("rejeita echo, malformado e sem text", () => {
    expect(parseNotification("echo: oi")).toBeNull()
    expect(parseNotification("{não json")).toBeNull()
    expect(parseNotification(JSON.stringify({ event: "notification", source: "x" }))).toBeNull()
    expect(parseNotification(JSON.stringify({ event: "other", text: "y" }))).toBeNull()
  })
})
