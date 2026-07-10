// Deriva o host do backend a partir do hostname da página atual.
// Retorna o hostname quando é "real"; cai em "localhost" quando vazio/ausente
// ou "-" (protocolo app://- do Electron empacotado).
export function resolveBackendHost(hostname: string | null | undefined): string {
  if (!hostname || hostname === "-") return "localhost"
  return hostname
}
