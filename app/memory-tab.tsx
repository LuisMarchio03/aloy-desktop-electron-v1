"use client"

import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMemory } from "@/hooks/use-memory"

export default function MemoryTab() {
  const { data, loading, error, refresh } = useMemory(true)

  return (
    <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="text-sm font-medium text-white">Memória</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          className="h-7 rounded-full text-xs border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 px-2.5"
        >
          {loading ? "..." : "Atualizar"}
        </Button>
      </div>

      {data && !data.enabled ? (
        <div className="bg-gray-900/50 rounded border border-gray-800/30 p-3 text-xs text-gray-400">
          Memória desativada no backend (Ollama de embeddings indisponível).
        </div>
      ) : error && !loading ? (
        <div className="text-yellow-500 text-xs">Falha ao carregar a memória (backend indisponível).</div>
      ) : data?.enabled && data.facts.length === 0 && !loading ? (
        <div className="text-gray-500 text-xs">A Aloy ainda não guardou nada sobre você.</div>
      ) : (
        <div className="space-y-3">
          {(data?.facts ?? []).map((fact) => (
            <div key={fact.id} className="bg-gray-900/50 rounded border border-gray-800/30 p-3">
              <div className="text-sm text-white">{fact.text}</div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] bg-gray-800/50 rounded px-2 py-0.5 text-gray-400">{fact.source}</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(fact.created_at * 1000).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[10px] text-gray-500 mt-3">
        Para esquecer algo, peça no chat (ex.: "esquece que...").
      </div>
    </div>
  )
}
