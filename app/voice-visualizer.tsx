"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import type { VoiceState } from "@/lib/voice-api"

const LABELS: Record<string, string> = {
  idle: "Ocioso",
  listening: "Ouvindo…",
  transcribing: "Transcrevendo…",
  thinking: "Pensando…",
  speaking: "Falando…",
}

const DOT: Record<string, string> = {
  idle: "bg-gray-500",
  listening: "bg-red-500",
  transcribing: "bg-yellow-500",
  thinking: "bg-blue-500",
  speaking: "bg-purple-500",
}

export default function VoiceVisualizer({ state = "listening" }: { state?: VoiceState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, "rgba(76, 29, 149, 0.5)")
    gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.5)")
    gradient.addColorStop(1, "rgba(79, 70, 229, 0.5)")

    // Animation variables
    const bars = 60
    const barWidth = canvas.width / bars
    const maxBarHeight = canvas.height * 0.8
    const minBarHeight = canvas.height * 0.05

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw bars
      for (let i = 0; i < bars; i++) {
        // Generate random height with smooth transitions
        const time = Date.now() / 1000
        const seed = Math.sin(i * 0.15 + time) * 0.5 + 0.5
        const height = minBarHeight + seed * (maxBarHeight - minBarHeight)

        // Draw bar
        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth * 0.8, height)
      }

      // Continue animation
      requestAnimationFrame(animate)
    }

    // Start animation
    const animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900/30 border border-gray-800/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${DOT[state]}`}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
          <span className="text-xs text-gray-400">{LABELS[state]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">MIC DO SERVIDOR</span>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-24 rounded" />

      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">AUDIO STREAM:</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-3 bg-purple-600"
                animate={{
                  height: [3, 6, 12, 6, 3],
                  opacity: [0.3, 0.7, 1, 0.7, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">PROCESSANDO NO PC</span>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-blue-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </div>
    </div>
  )
}

