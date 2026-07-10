"use client"

import { useEffect } from "react"

/**
 * Rede de segurança global (Next App Router). Se o shell inteiro (ou um hook
 * sempre-ligado) lançar no render, em vez do app congelar exigindo reiniciar o
 * processo, mostramos o erro e um botão que recupera a interface.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[ALOY GlobalError]", error)
  }, [error])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black p-6 text-[#ededf5]">
      <div className="max-w-2xl w-full space-y-4">
        <h1 className="text-base font-semibold text-[#f87171]">A interface do ALOY travou.</h1>
        <p className="text-[13px] text-[#a1a1b5]">
          Recuperei antes de congelar de vez — clique em "Recarregar". Se puder, copie o erro abaixo e me
          mande: é o que preciso pra corrigir a causa raiz (assim você para de precisar reiniciar).
        </p>
        <pre className="text-[11px] font-mono text-[#fca5a5] whitespace-pre-wrap break-words rounded-lg border p-3 max-h-72 overflow-auto"
             style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(20,18,31,0.6)" }}>
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="text-white border-0 rounded-md px-3 py-1.5 text-sm"
            style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
          >
            Recarregar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border px-3 py-1.5 text-sm text-[#ededf5]"
            style={{ borderColor: "rgba(124,58,237,0.35)" }}
          >
            Recarregar tudo
          </button>
        </div>
      </div>
    </div>
  )
}
