"use client"

import { useState } from "react"
import { ChevronRight, FileText, Wrench } from "lucide-react"
import type { TranscriptItem } from "@/lib/sessions-types"

function ToolChip({ name, input }: { name: string; input: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="my-1.5 rounded-lg overflow-hidden"
      style={{
        border: "1px solid rgba(124,58,237,0.20)",
        background: "rgba(20,18,31,0.7)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        disabled={!input}
      >
        <Wrench className="h-3.5 w-3.5" style={{ color: "#22d3ee" }} />
        <span className="text-[12px] font-mono text-[#a1a1b5]">{name}</span>
        {input ? (
          <ChevronRight
            className="h-3.5 w-3.5 ml-auto text-[#8b8ba7] transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "none" }}
          />
        ) : null}
      </button>
      {open && input ? (
        <pre className="px-3 pb-2 text-[11px] font-mono text-[#8b8ba7] whitespace-pre-wrap break-words">
          {input}
        </pre>
      ) : null}
    </div>
  )
}

export function TranscriptView({ items }: { items: TranscriptItem[] }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-4">
      {items.map((it, i) => {
        if (it.kind === "user") {
          return (
            <div
              key={i}
              className="self-end max-w-[80%] rounded-2xl px-3 py-2"
              style={{
                background: "rgba(124,58,237,0.18)",
                border: "1px solid rgba(168,85,247,0.30)",
              }}
            >
              <p className="text-[13px] text-[#ededf5] whitespace-pre-wrap">{it.text}</p>
            </div>
          )
        }
        if (it.kind === "assistant") {
          return (
            <div key={i} className="self-start max-w-[85%]">
              <p className="text-[13px] leading-relaxed text-[#cfcfd8] whitespace-pre-wrap">
                {it.text}
                {it.streaming ? (
                  <span
                    className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse"
                    style={{
                      background: "#a855f7",
                      boxShadow: "0 0 6px rgba(168,85,247,0.70)",
                    }}
                  />
                ) : null}
              </p>
            </div>
          )
        }
        if (it.kind === "tool") {
          return <ToolChip key={i} name={it.name} input={it.input} />
        }
        if (it.kind === "files") {
          return (
            <div key={i} className="my-1 flex flex-wrap gap-1.5">
              {it.paths.map((p, j) => (
                <span
                  key={j}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono text-[#8b8ba7]"
                  style={{
                    border: "1px solid rgba(124,58,237,0.20)",
                    background: "rgba(20,18,31,0.7)",
                  }}
                >
                  <FileText className="h-3 w-3" style={{ color: "#a855f7" }} />
                  {p}
                </span>
              ))}
            </div>
          )
        }
        // it.kind === "turn"
        return (
          <div key={i} className="my-2 text-center">
            <span className="text-[10px] uppercase tracking-wide text-[#8b8ba7]">
              fim do turno · ${it.cost_usd.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
