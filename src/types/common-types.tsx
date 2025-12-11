interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  files?: FileAttachment[]
  author?: string // "user" for human messages, agent name for assistant messages
}

export { type Message, type FileAttachment }
