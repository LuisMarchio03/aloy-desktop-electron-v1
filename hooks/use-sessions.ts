"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  apply,
  hydrateSessions,
  initialState,
  setHistory,
} from "@/lib/sessions-reducer"
import {
  SESSIONS_WS_URL,
  createSession,
  deleteSession,
  getSessionHistory,
  interruptSession,
  listServers,
  listSessions,
  sendSessionMessage,
} from "@/lib/sessions-api"
import type { CockpitState, ReducerEvent, Server } from "@/lib/sessions-types"
import { wsUrl } from "@/lib/api-base"

type ConnState = "connecting" | "online" | "offline"

export function useSessions() {
  const [state, setState] = useState<CockpitState>(initialState)
  const [conn, setConn] = useState<ConnState>("connecting")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [servers, setServers] = useState<Server[]>([])

  const refreshServers = useCallback(async () => {
    try {
      setServers(await listServers())
    } catch {
      /* best-effort — lista de servidores é opcional */
    }
  }, [])

  useEffect(() => {
    void refreshServers()
  }, [refreshServers])

  const stateRef = useRef(state)
  stateRef.current = state
  const selectedRef = useRef(selectedId)
  selectedRef.current = selectedId
  const wsRef = useRef<WebSocket | null>(null)
  const retryCount = useRef(0)
  const closed = useRef(false)

  const dispatch = useCallback((ev: ReducerEvent) => {
    setState((s) => apply(s, ev))
  }, [])

  const resync = useCallback(async () => {
    try {
      const list = await listSessions()
      setState((s) => hydrateSessions(s, list))
      setConn("online")
      const sel = selectedRef.current
      if (sel) {
        try {
          const hist = await getSessionHistory(sel)
          setState((s) => (s.transcripts[sel]?.length ? s : setHistory(s, sel, hist)))
        } catch {
          /* history é best-effort */
        }
      }
    } catch {
      setConn("offline")
    }
  }, [])

  useEffect(() => {
    closed.current = false
    let timer: ReturnType<typeof setTimeout> | undefined

    function scheduleRetry() {
      const delay = Math.min(1000 * 2 ** retryCount.current, 15000)
      retryCount.current += 1
      timer = setTimeout(connect, delay)
    }

    function connect() {
      setConn((c) => (c === "online" ? c : "connecting"))
      let ws: WebSocket
      try {
        ws = new WebSocket(wsUrl(SESSIONS_WS_URL))
      } catch {
        scheduleRetry()
        return
      }
      wsRef.current = ws
      ws.onopen = () => {
        retryCount.current = 0
        void resync()
      }
      ws.onmessage = (e) => {
        try {
          dispatch(JSON.parse(e.data) as ReducerEvent)
        } catch {
          /* mensagem malformada — ignora */
        }
      }
      ws.onclose = () => {
        if (!closed.current) {
          setConn("offline")
          scheduleRetry()
        }
      }
      ws.onerror = () => {
        try {
          ws.close()
        } catch {
          /* já fechado */
        }
      }
    }

    connect()
    return () => {
      closed.current = true
      if (timer) clearTimeout(timer)
      try {
        wsRef.current?.close()
      } catch {
        /* noop */
      }
    }
  }, [dispatch, resync])

  const select = useCallback(async (id: string) => {
    setSelectedId(id)
    if (!stateRef.current.transcripts[id]?.length) {
      try {
        const hist = await getSessionHistory(id)
        setState((s) => (s.transcripts[id]?.length ? s : setHistory(s, id, hist)))
      } catch {
        /* sem history ainda */
      }
    }
  }, [])

  const create = useCallback(
    async (body: { task: string; cwd: string; model?: string | null; platform?: string; server?: string | null }) => {
      const id = await createSession(body)
      setSelectedId(id)
      return id
    },
    [],
  )

  const send = useCallback(
    async (id: string, text: string) => {
      dispatch({ type: "local.user", session_id: id, text })
      await sendSessionMessage(id, text)
    },
    [dispatch],
  )

  const interrupt = useCallback((id: string) => interruptSession(id), [])

  const remove = useCallback(async (id: string) => {
    await deleteSession(id)
    if (selectedRef.current === id) setSelectedId(null)
  }, [])

  const deselect = useCallback(() => setSelectedId(null), [])

  return { state, conn, selectedId, servers, refreshServers, select, deselect, create, send, interrupt, remove, retry: resync }
}
