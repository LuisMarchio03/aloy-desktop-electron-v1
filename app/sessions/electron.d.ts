export {}

declare global {
  interface Window {
    electronAPI?: {
      on?: (channel: string, cb: (...args: unknown[]) => void) => void
      send?: (channel: string, args: unknown) => void
      pickFolder?: () => Promise<string | null>
      getLanUrl?: () => Promise<string>
      openExternal?: (url: string) => Promise<void>
      webServer?: {
        start: () => Promise<{ running: boolean; url?: string; error?: string }>
        stop: () => Promise<{ running: boolean; url?: string; error?: string }>
        status: () => Promise<{ running: boolean; url?: string; error?: string }>
      }
    }
  }
}
