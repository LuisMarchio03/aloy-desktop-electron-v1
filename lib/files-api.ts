import type { RemoteFile } from "./files-types"
import { API_BASE, apiFetch } from "./api-base"

export const FILES_HTTP_BASE = API_BASE

export async function listFiles(): Promise<RemoteFile[]> {
  const r = await apiFetch(`${FILES_HTTP_BASE}/api/files`)
  if (!r.ok) throw new Error(`list files falhou: ${r.status}`)
  const data = await r.json()
  return (data.files ?? []) as RemoteFile[]
}

export async function sendFileToDevice(serverId: string, file: File): Promise<void> {
  const form = new FormData()
  form.append("file", file)
  const r = await apiFetch(`${FILES_HTTP_BASE}/api/files/send/${serverId}`, {
    method: "POST",
    body: form,
  })
  if (!r.ok) throw new Error(`send falhou: ${r.status}`)
}

export async function deleteFile(name: string): Promise<void> {
  const r = await apiFetch(`${FILES_HTTP_BASE}/api/files/${encodeURIComponent(name)}`, {
    method: "DELETE",
  })
  if (!r.ok) throw new Error(`delete falhou: ${r.status}`)
}

export function fileDownloadUrl(name: string): string {
  return `${FILES_HTTP_BASE}/api/files/${encodeURIComponent(name)}`
}

export async function listRemoteFiles(serverId: string): Promise<RemoteFile[]> {
  const r = await apiFetch(`${FILES_HTTP_BASE}/api/files/remote/${encodeURIComponent(serverId)}`)
  if (!r.ok) throw new Error(`list remoto falhou: ${r.status}`)
  const data = await r.json()
  return (data.files ?? []) as RemoteFile[]
}

export function remoteFileDownloadUrl(serverId: string, name: string): string {
  return `${FILES_HTTP_BASE}/api/files/remote/${encodeURIComponent(serverId)}/${encodeURIComponent(name)}`
}

export async function deleteRemoteFile(serverId: string, name: string): Promise<void> {
  const r = await apiFetch(remoteFileDownloadUrl(serverId, name), { method: "DELETE" })
  if (!r.ok) throw new Error(`delete remoto falhou: ${r.status}`)
}

export interface ResumableOpts {
  chunkSize?: number
  onProgress?: (sent: number, total: number) => void
  signal?: AbortSignal
}

/**
 * Envia `file` para um dispositivo em chunks resumáveis (tus-lite, FT-3), via o
 * kernel local (que proxia pro remoto). Chama `onProgress(sent, total)` a cada
 * chunk. Se um PATCH falhar (blip de rede) ou o servidor responder 409, re-HEAD
 * pega o offset atual e retoma de onde parou — nunca reenvia o arquivo inteiro.
 */
export async function resumableSendToDevice(
  serverId: string,
  file: File,
  opts: ResumableOpts = {},
): Promise<void> {
  const chunkSize = opts.chunkSize ?? 1 << 20 // 1 MiB
  const total = file.size
  const base = `${FILES_HTTP_BASE}/api/files/remote-upload/${encodeURIComponent(serverId)}`

  const cr = await apiFetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: total }),
    signal: opts.signal,
  })
  if (!cr.ok) throw new Error(`criar upload falhou: ${cr.status}`)
  const { id } = await cr.json()
  const url = `${base}/${encodeURIComponent(id)}`

  const serverOffset = async (): Promise<number> => {
    const h = await apiFetch(url, { method: "HEAD", signal: opts.signal })
    if (!h.ok) throw new Error(`HEAD falhou: ${h.status}`)
    return Number(h.headers.get("upload-offset") ?? 0)
  }

  let offset = 0
  while (offset < total) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, total))
    let res: Response
    try {
      res = await apiFetch(url, {
        method: "PATCH",
        headers: { "Upload-Offset": String(offset) },
        body: chunk,
        signal: opts.signal,
      })
    } catch (e) {
      if (opts.signal?.aborted) throw e
      offset = await serverOffset() // retoma após blip de rede
      continue
    }
    if (res.status === 409) {
      const h = res.headers.get("upload-offset")
      offset = h != null ? Number(h) : await serverOffset()
      continue
    }
    if (!res.ok) throw new Error(`chunk falhou: ${res.status}`)
    const data = await res.json()
    offset = data.offset
    opts.onProgress?.(offset, total)
    if (data.done) return
  }
}
