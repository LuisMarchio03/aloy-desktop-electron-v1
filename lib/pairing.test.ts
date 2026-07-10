import { describe, it, expect, beforeEach, vi } from "vitest"
import { getToken, setToken, clearToken, captureTokenFromUrl } from "./pairing"

function stubWindow(href: string) {
  const store: Record<string, string> = {}
  const replaceState = vi.fn()
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
    },
    location: { href, pathname: new URL(href).pathname, search: "", hash: "" },
    history: { replaceState },
  })
  return { store, replaceState }
}

describe("pairing", () => {
  beforeEach(() => vi.unstubAllGlobals())

  it("captura o token da URL, guarda e limpa a URL", () => {
    const { store, replaceState } = stubWindow("http://1.2.3.4:3000/?token=abc123")
    captureTokenFromUrl()
    expect(store.aloy_token).toBe("abc123")
    expect(replaceState).toHaveBeenCalled()
    const newUrl = replaceState.mock.calls[0][2] as string
    expect(newUrl).not.toContain("token")
  })

  it("sem ?token não faz nada", () => {
    const { store } = stubWindow("http://1.2.3.4:3000/")
    captureTokenFromUrl()
    expect(store.aloy_token).toBeUndefined()
  })

  it("get/set/clear", () => {
    stubWindow("http://x/")
    expect(getToken()).toBeNull()
    setToken("t"); expect(getToken()).toBe("t")
    clearToken(); expect(getToken()).toBeNull()
  })
})
