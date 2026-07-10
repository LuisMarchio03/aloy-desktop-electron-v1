"use client"

import { useCallback, useEffect, useState } from "react"
import type { RemoteFile } from "@/lib/files-types"
import {
  deleteFile,
  deleteRemoteFile,
  listFiles,
  listRemoteFiles,
  resumableSendToDevice,
  sendFileToDevice,
} from "@/lib/files-api"
import type { Server } from "@/lib/sessions-types"
import { listServers } from "@/lib/sessions-api"

export function useFiles() {
  const [files, setFiles] = useState<RemoteFile[]>([])
  const [devices, setDevices] = useState<Server[]>([])
  const [remoteFiles, setRemoteFiles] = useState<RemoteFile[]>([])
  const [remoteError, setRemoteError] = useState(false)
  const [remoteLoading, setRemoteLoading] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setFiles(await listFiles())
    } catch {
      /* best-effort */
    }
  }, [])

  const refreshDevices = useCallback(async () => {
    try {
      setDevices((await listServers()).filter((s) => s.kind === "aloy"))
    } catch {
      /* best-effort */
    }
  }, [])

  useEffect(() => {
    void refresh()
    void refreshDevices()
  }, [refresh, refreshDevices])

  const send = useCallback(async (serverId: string, file: File) => {
    await sendFileToDevice(serverId, file)
  }, [])

  // Envio resumável em chunks com progresso (FT-3). `onProgress` recebe 0..1.
  const sendResumable = useCallback(
    async (serverId: string, file: File, onProgress?: (frac: number) => void) => {
      await resumableSendToDevice(serverId, file, {
        onProgress: (sent, total) => onProgress?.(total ? sent / total : 1),
      })
    },
    [],
  )

  const remove = useCallback(async (name: string) => {
    await deleteFile(name)
    await refresh()
  }, [refresh])

  // Inbox de um dispositivo remoto (FT-2). Best-effort: erro/offline vira lista
  // vazia + flag, sem quebrar a UI.
  const refreshRemote = useCallback(async (serverId: string) => {
    if (!serverId) {
      setRemoteFiles([])
      setRemoteError(false)
      return
    }
    setRemoteLoading(true)
    setRemoteError(false)
    try {
      setRemoteFiles(await listRemoteFiles(serverId))
    } catch {
      setRemoteFiles([])
      setRemoteError(true)
    } finally {
      setRemoteLoading(false)
    }
  }, [])

  const removeRemote = useCallback(
    async (serverId: string, name: string) => {
      await deleteRemoteFile(serverId, name)
      await refreshRemote(serverId)
    },
    [refreshRemote],
  )

  return {
    files,
    devices,
    remoteFiles,
    remoteError,
    remoteLoading,
    refresh,
    refreshDevices,
    refreshRemote,
    send,
    sendResumable,
    remove,
    removeRemote,
  }
}
