export type CockpitPane = "list" | "detail" | "split"

export function cockpitPane(opts: { isMobile: boolean; selectedId: string | null }): CockpitPane {
  if (!opts.isMobile) return "split"
  return opts.selectedId ? "detail" : "list"
}
