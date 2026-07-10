"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function SteeringInput({
  disabled,
  onSend,
}: {
  disabled: boolean
  onSend: (text: string) => Promise<void>
}) {
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    const t = text.trim()
    if (!t || busy) return
    setBusy(true)
    try {
      await onSend(t)
      setText("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="flex items-end gap-2 p-3 border-t"
      style={{ borderColor: "rgba(124,58,237,0.20)" }}
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            void submit()
          }
        }}
        disabled={disabled || busy}
        placeholder={disabled ? "sessão encerrada" : "dirigir esta sessão… (Enter envia)"}
        className="min-h-[44px] max-h-32 resize-none text-[13px] text-[#ededf5]"
        style={{
          background: "#0b0b12",
          borderColor: "rgba(124,58,237,0.20)",
        }}
      />
      <Button
        onClick={() => void submit()}
        disabled={disabled || busy || !text.trim()}
        className="h-11 px-3 text-white border-0"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
          boxShadow: "0 0 14px rgba(168,85,247,0.45)",
        }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
