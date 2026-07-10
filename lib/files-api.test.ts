import { describe, it, expect, vi, afterEach } from "vitest"
import {
  listFiles,
  sendFileToDevice,
  deleteFile,
  fileDownloadUrl,
  listRemoteFiles,
  remoteFileDownloadUrl,
  deleteRemoteFile,
  resumableSendToDevice,
  FILES_HTTP_BASE,
} from "./files-api"

afterEach(() => vi.restoreAllMocks())

describe("files-api", () => {
  it("listFiles retorna o array de arquivos", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ files: [{ name: "a.txt", size: 3, mtime: 1 }] }),
    })) as unknown as typeof fetch)
    const out = await listFiles()
    expect(out[0].name).toBe("a.txt")
  })

  it("sendFileToDevice faz POST multipart no dispositivo", async () => {
    let url = ""
    let method = ""
    vi.stubGlobal("fetch", vi.fn(async (u: string, init: RequestInit) => {
      url = u
      method = init.method as string
      return { ok: true }
    }) as unknown as typeof fetch)
    const file = new File([new Uint8Array([1, 2, 3])], "x.bin")
    await sendFileToDevice("pcb", file)
    expect(url).toBe(`${FILES_HTTP_BASE}/api/files/send/pcb`)
    expect(method).toBe("POST")
  })

  it("deleteFile faz DELETE", async () => {
    let method = ""
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: RequestInit) => {
      method = init.method as string
      return { ok: true }
    }) as unknown as typeof fetch)
    await deleteFile("a.txt")
    expect(method).toBe("DELETE")
  })

  it("fileDownloadUrl monta a url (nome escapado)", () => {
    expect(fileDownloadUrl("a b.txt")).toBe(`${FILES_HTTP_BASE}/api/files/a%20b.txt`)
  })

  it("listRemoteFiles busca o inbox do dispositivo e retorna o array", async () => {
    let url = ""
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      url = u
      return { ok: true, json: async () => ({ files: [{ name: "r.txt", size: 6, mtime: 2 }] }) }
    }) as unknown as typeof fetch)
    const out = await listRemoteFiles("pcb")
    expect(url).toBe(`${FILES_HTTP_BASE}/api/files/remote/pcb`)
    expect(out[0].name).toBe("r.txt")
  })

  it("remoteFileDownloadUrl monta a url (nome escapado)", () => {
    expect(remoteFileDownloadUrl("pcb", "a b.txt")).toBe(
      `${FILES_HTTP_BASE}/api/files/remote/pcb/a%20b.txt`,
    )
  })

  it("deleteRemoteFile faz DELETE na url do inbox remoto", async () => {
    let url = ""
    let method = ""
    vi.stubGlobal("fetch", vi.fn(async (u: string, init: RequestInit) => {
      url = u
      method = init.method as string
      return { ok: true }
    }) as unknown as typeof fetch)
    await deleteRemoteFile("pcb", "a b.txt")
    expect(url).toBe(`${FILES_HTTP_BASE}/api/files/remote/pcb/a%20b.txt`)
    expect(method).toBe("DELETE")
  })

  it("resumableSendToDevice cria e envia em chunks, reportando progresso", async () => {
    const patched: number[] = []
    let created = false
    vi.stubGlobal("fetch", vi.fn(async (u: string, init: any) => {
      if (init.method === "POST") {
        created = true
        expect(u).toBe(`${FILES_HTTP_BASE}/api/files/remote-upload/pcb`)
        return { ok: true, json: async () => ({ id: "u1", offset: 0 }) }
      }
      if (init.method === "PATCH") {
        expect(u).toBe(`${FILES_HTTP_BASE}/api/files/remote-upload/pcb/u1`)
        const off = Number(init.headers["Upload-Offset"])
        patched.push(off)
        const offset = off + 2
        return { ok: true, status: 200, json: async () => ({ offset, done: offset >= 6 }) }
      }
      return { ok: true }
    }) as unknown as typeof fetch)

    const file = new File([new Uint8Array([1, 2, 3, 4, 5, 6])], "big.bin")
    const prog: number[] = []
    await resumableSendToDevice("pcb", file, { chunkSize: 2, onProgress: (s) => prog.push(s) })
    expect(created).toBe(true)
    expect(patched).toEqual([0, 2, 4])
    expect(prog).toEqual([2, 4, 6])
  })

  it("resumableSendToDevice retoma via HEAD após um PATCH falhar", async () => {
    let failedOnce = false
    const patched: number[] = []
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
      if (init.method === "POST") return { ok: true, json: async () => ({ id: "u1", offset: 0 }) }
      if (init.method === "HEAD") return { ok: true, headers: new Headers({ "upload-offset": "2" }) }
      if (init.method === "PATCH") {
        const off = Number(init.headers["Upload-Offset"])
        if (!failedOnce && off === 0) {
          failedOnce = true
          throw new Error("network blip")
        }
        patched.push(off)
        const offset = off + 2
        return { ok: true, status: 200, json: async () => ({ offset, done: offset >= 4 }) }
      }
      return { ok: true }
    }) as unknown as typeof fetch)

    const file = new File([new Uint8Array([1, 2, 3, 4])], "x.bin")
    await resumableSendToDevice("pcb", file, { chunkSize: 2 })
    // PATCH@0 falhou → HEAD reportou offset 2 → retomou de 2
    expect(patched).toEqual([2])
  })

  it("resumableSendToDevice com arquivo vazio só faz o create (backend finaliza)", async () => {
    const methods: string[] = []
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: any) => {
      methods.push(init.method)
      if (init.method === "POST") {
        return { ok: true, json: async () => ({ id: "u1", offset: 0, done: true, name: "empty.txt" }) }
      }
      return { ok: true }
    }) as unknown as typeof fetch)
    const file = new File([], "empty.txt")
    await resumableSendToDevice("pcb", file, { chunkSize: 2 })
    expect(methods).toEqual(["POST"]) // nenhum PATCH
  })
})
