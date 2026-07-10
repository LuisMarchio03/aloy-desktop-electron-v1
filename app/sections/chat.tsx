"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import VoiceVisualizer from "../voice-visualizer"
import { useVoice } from "@/hooks/use-voice"
import { COMMANDS_URL, apiFetch } from "@/lib/api-base"

export default function ChatSection({ isVoiceMode }: { isVoiceMode: boolean }) {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello, I'm Aloy. How can I assist you today?", isUser: false },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const { state: voiceState, active: voiceActive, unavailable: voiceUnavailable, startTurn } = useVoice()
  const [voiceSession, setVoiceSession] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const userMessage = input

    // Add user message
    setMessages([...messages, { text: userMessage, isUser: true }])
    setInput("")

    // Show typing indicator
    setIsTyping(true)

    try {
      // Make API call to get Aloy's response
      const response = await apiFetch(COMMANDS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API Error: ${errorData || 'Failed to get response from Aloy'}`)
      }

      const data = await response.json()
        console.log(data)

      // Add Aloy's response to messages
      setIsTyping(false)
      setMessages((prev) => [...prev, {
        text: data.message || "I apologize, but I received an invalid response format.",
        isUser: false,
      }])
    } catch (error) {
      // Handle error and show error message
      console.error('Error getting response from Aloy:', error)
      setIsTyping(false)
      setMessages((prev) => [...prev, {
        text: "I apologize, but I'm having trouble connecting to my backend services. Please check if the server is running.",
        isUser: false,
      }])
    }
  }

  const handleVoiceTurn = async () => {
    const r = await startTurn(voiceSession)
    if (!r) return
    if (r.session_id) setVoiceSession(r.session_id)
    if (r.transcript && !r.no_speech) {
      setMessages((prev) => [...prev, { text: r.transcript, isUser: true }])
    }
    setMessages((prev) => [...prev, { text: r.message || "Não entendi.", isUser: false }])
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-950 to-black">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-purple-900/20 border border-purple-900/30 flex items-center justify-center mr-3 mt-1">
                  <span className="text-xs text-purple-400">A</span>
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? "bg-gray-900/50 text-gray-100 border border-gray-800/50"
                    : "bg-gradient-to-br from-gray-900/80 to-gray-950/80 text-gray-200 border border-purple-900/20"
                }`}
              >
                {message.text}
              </div>
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-900/20 border border-blue-900/30 flex items-center justify-center ml-3 mt-1">
                  <span className="text-xs text-blue-400">U</span>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-purple-900/20 border border-purple-900/30 flex items-center justify-center mr-3 mt-1">
                <span className="text-xs text-purple-400">A</span>
              </div>
              <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 bg-gradient-to-br from-gray-900/80 to-gray-950/80 text-gray-200 border border-purple-900/20">
                <motion.div
                  className="flex space-x-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <span className="w-1.5 h-1.5 bg-purple-500/70 rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-purple-500/70 rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-purple-500/70 rounded-full"></span>
                </motion.div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="relative p-3 md:p-6 bg-gray-950/90 border-t border-gray-900/30">
        {/* Wake word detection animation */}
        <AnimatePresence>
          {voiceState === "listening" && (
            <motion.div
              className="absolute top-0 left-0 right-0 transform -translate-y-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="p-6 bg-gray-950/90 border-t border-gray-900/30">
                <div className="rounded-lg bg-gray-900/30 border border-purple-800/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-purple-500"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      />
                      <span className="text-xs text-purple-300">WAKE WORD DETECTED</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center py-4">
                    <motion.div
                      className="relative w-20 h-20 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-purple-500/30"
                        animate={{
                          scale: [1, 1.5, 1.8],
                          opacity: [0.8, 0.4, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeOut",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-purple-500/50"
                        animate={{
                          scale: [1, 1.3],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeOut",
                          delay: 0.2,
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-purple-900/30 border border-purple-500/50 flex items-center justify-center">
                        <span className="text-lg font-light text-purple-300">Aloy</span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center text-sm text-purple-300 mt-2">"Hey Aloy" detected</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice visualizer */}
        <AnimatePresence>
          {isVoiceMode && voiceState !== "idle" && (
            <motion.div
              className="absolute top-0 left-0 right-0 transform -translate-y-full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="p-6 bg-gray-950/90 border-t border-gray-900/30">
                <VoiceVisualizer state={voiceState} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isVoiceMode ? "Say 'Hey Aloy' or type your message..." : "Type your message..."}
            className="w-full rounded-full py-3 pl-5 pr-12 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-700/50 focus:border-purple-700/50"
            disabled={isVoiceMode && voiceState !== "idle"}
          />
          {isVoiceMode ? (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 ${
                voiceState !== "idle"
                  ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                  : "bg-purple-900/30 text-purple-400 hover:bg-purple-900/50"
              }`}
              onClick={handleVoiceTurn}
              disabled={voiceActive || voiceState !== "idle"}
              title={voiceUnavailable ? "Voz indisponível no backend" : "Falar com a Aloy"}
            >
              {voiceState !== "idle" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
