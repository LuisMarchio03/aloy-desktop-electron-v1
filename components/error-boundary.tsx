"use client"

import React from "react"

interface Props {
  children: React.ReactNode
  /** Rótulo pra identificar onde quebrou (ex.: a seção ativa). */
  label?: string
}

interface State {
  error: Error | null
}

/**
 * Error boundary de seção. Sem isto, um erro de render em qualquer seção/hook
 * derruba a árvore inteira do React — e a navegação "para de funcionar" até
 * reiniciar o app. Aqui o erro fica **contido**: a barra lateral segue viva,
 * a área de conteúdo mostra o erro (pra diagnóstico) e dá pra recuperar sem
 * reiniciar o processo (trocar de seção remonta este boundary via `key`).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Fica no console do DevTools com um prefixo fácil de achar.
    console.error(`[ALOY ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ""}]`, error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-950 to-black text-[#ededf5]">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-sm font-semibold text-[#f87171]">
            Esta seção{this.props.label ? ` (${this.props.label})` : ""} quebrou — mas o app segue de pé.
          </h2>
          <p className="text-[12px] text-[#a1a1b5]">
            A navegação continua funcionando (troque de seção na barra lateral). Se puder, copie o erro
            abaixo e me mande — é o que preciso pra corrigir a causa de vez.
          </p>
          <pre className="text-[11px] font-mono text-[#fca5a5] whitespace-pre-wrap break-words rounded-lg border p-3 max-h-72 overflow-auto"
               style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(20,18,31,0.6)" }}>
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={this.reset}
              className="text-white border-0 rounded-md px-3 py-1.5 text-sm"
              style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
            >
              Tentar de novo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md border px-3 py-1.5 text-sm text-[#ededf5]"
              style={{ borderColor: "rgba(124,58,237,0.35)" }}
            >
              Recarregar a interface
            </button>
          </div>
        </div>
      </div>
    )
  }
}
