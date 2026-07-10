export interface MemoryFact {
  id: number
  text: string
  source: string
  created_at: number
}

export interface MemoryData {
  enabled: boolean
  facts: MemoryFact[]
}
