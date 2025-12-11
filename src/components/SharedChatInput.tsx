import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Send, Paperclip, X, FileText, Image as ImageIcon, StickyNote } from 'lucide-react'

interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface SharedChatInputProps {
  onSendMessage: (content: string, files?: FileAttachment[], isInternalNote?: boolean) => void
  isLoading: boolean
}

export function SharedChatInput({ onSendMessage, isLoading }: SharedChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const [isInternalNote, setIsInternalNote] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((inputValue.trim() || attachedFiles.length > 0) && !isLoading) {
      onSendMessage(inputValue, attachedFiles.length > 0 ? attachedFiles : undefined, isInternalNote)
      setInputValue('')
      setAttachedFiles([])
      setIsInternalNote(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: FileAttachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }))

    setAttachedFiles(prev => [...prev, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.url)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className='h-4 w-4' />
    }
    return <FileText className='h-4 w-4' />
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='border-t bg-white p-4 p-fixed'>
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className='mb-3 flex flex-wrap gap-2'>
          {attachedFiles.map(file => (
            <div
              key={file.id}
              className='flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-2 pr-1 max-w-[200px]'
            >
              <div className='text-zinc-600'>{getFileIcon(file.type)}</div>
              <div className='flex-1 min-w-0'>
                <div className='text-xs truncate font-medium'>{file.name}</div>
                <div className='text-xs text-zinc-500'>{formatFileSize(file.size)}</div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 hover:bg-zinc-200'
                onClick={() => handleRemoveFile(file.id)}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Message Type Toggle */}
      {isInternalNote && (
        <div className='mb-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700'>
          <StickyNote className='h-3.5 w-3.5' />
          <span>Composing internal note - will appear in both panels</span>
        </div>
      )}

      {/* Input Area */}
      <div className='flex items-center gap-2 max-w-6xl mx-auto'>
        <input
          ref={fileInputRef}
          type='file'
          multiple
          onChange={handleFileSelect}
          className='hidden'
          accept='image/*,.pdf,.doc,.docx,.txt,.json'
        />
        <Button
          variant='ghost'
          size='icon'
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title='Attach files'
          className='flex-shrink-0 h-10 w-10 rounded-full text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
        >
          <Paperclip className='h-5 w-5' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsInternalNote(!isInternalNote)}
          disabled={isLoading}
          title={isInternalNote ? 'Switch to regular message' : 'Switch to internal note'}
          className={`flex-shrink-0 h-10 w-10 rounded-full ${
            isInternalNote
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <StickyNote className='h-5 w-5' />
        </Button>
        <div className='flex-1 relative'>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isInternalNote ? 'Type your internal note (will appear in both panels)...' : 'Type a message'}
            disabled={isLoading}
            className='w-full h-11 pl-4 pr-12 rounded-full border-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-300 text-sm'
          />
          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
            size='icon'
            className='absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-800 disabled:bg-zinc-300'
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
