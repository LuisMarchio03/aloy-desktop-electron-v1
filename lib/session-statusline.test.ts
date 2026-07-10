import { describe, it, expect } from "vitest"
import { describeActivity } from "./session-statusline"
import type { TranscriptItem } from "./sessions-types"

const tool: TranscriptItem = { kind: "tool", name: "bash", input: "ls" }
const streaming: TranscriptItem = { kind: "assistant", text: "oi", streaming: true }
const done: TranscriptItem = { kind: "assistant", text: "oi", streaming: false }
const files: TranscriptItem = { kind: "files", paths: ["/a.ts", "/b.ts"] }
const turn: TranscriptItem = { kind: "turn", cost_usd: 0.02 }

describe("describeActivity", () => {
  it("working + última ferramenta → nome da ferramenta", () => {
    expect(describeActivity("working", [done, tool])).toBe("ferramenta: bash")
  })
  it("working + assistant streamando → gerando resposta", () => {
    expect(describeActivity("working", [streaming])).toBe("gerando resposta…")
  })
  it("working + últimos arquivos → contagem", () => {
    expect(describeActivity("working", [files])).toBe("2 arquivo(s) tocados")
  })
  it("working sem itens → trabalhando", () => {
    expect(describeActivity("working", [])).toBe("trabalhando…")
  })
  it("idle + último turno → turno concluído", () => {
    expect(describeActivity("idle", [done, turn])).toBe("turno concluído")
  })
  it("idle sem itens → ociosa", () => {
    expect(describeActivity("idle", [])).toBe("ociosa")
  })
  it("failed → falhou", () => {
    expect(describeActivity("failed", [done])).toBe("falhou")
  })
  it("stopped → parada", () => {
    expect(describeActivity("stopped", [done])).toBe("parada")
  })
})
