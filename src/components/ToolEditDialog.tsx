import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useStore } from '../services/store'

interface Tool {
  name: string
  description: string
  type: 'tool' | 'agent'
  parent_id: string
}

export interface SaveTool {
  name: string
  agent: string
  description: string
  prompt?: {
    agent: string
    prompt: string
  }
}

interface ToolEditDialogProps {
  tool: (Tool & { baseDescription: string }) | null
  isOpen: boolean
  onClose: () => void
  onSave: (v2Data: SaveTool) => void
}

export function ToolEditDialog({ tool, isOpen, onClose, onSave }: ToolEditDialogProps) {
  const [v1Description, setV1Description] = useState('')
  const [v2Description, setV2Description] = useState('')
  const [v1Prompt, setV1Prompt] = useState('')
  const [v2Prompt, setV2Prompt] = useState('')

  // Initialize state when tool changes
  useEffect(() => {
    if (tool) {
      setV1Description(tool.baseDescription || '')
      setV2Description(tool.description || '')
      if (tool.type === 'agent') {
        const state = useStore.getState()
        setV1Prompt(state.sessionData![tool.name]!.basePrompt)
        setV2Prompt(state.sessionData![tool.name]!.prompt)
      }
    }
  }, [tool])

  if (!tool) return null

  const isAgent = tool.type === 'agent'

  const handleSave = () => {
    const v2Data = {
      description: v2Description,
      name: tool.name,
      agent: tool.parent_id,
      ...(isAgent && { prompt: { agent: tool.name, prompt: v2Prompt } })
    }
    onSave(v2Data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl-important h-[80vh] flex flex-col'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <DialogTitle>Edit Tool: {tool.name}</DialogTitle>
            {isAgent && (
              <Badge variant='outline' className='border-blue-200 text-blue-700 bg-blue-50'>
                Agent
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className='flex-1 flex gap-6 overflow-hidden'>
          {/* Version 1 */}
          <div className='flex-1 flex flex-col gap-4 overflow-auto'>
            <div className='flex items-center justify-between pb-2 border-b'>
              <h3 className='text-sm text-zinc-900'>Version 1 (Base Truth)</h3>
              <Badge variant='secondary' className='bg-zinc-100 text-zinc-600 border-0'>
                Read-only
              </Badge>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-xs text-zinc-700'>Description</Label>
                <Textarea
                  value={v1Description}
                  readOnly
                  className='min-h-[100px] font-mono text-xs bg-zinc-50 border-zinc-200 cursor-not-allowed resize-none'
                  placeholder='Tool description...'
                />
              </div>

              {isAgent && (
                <div className='space-y-2'>
                  <Label className='text-xs text-zinc-700'>Agent Prompt</Label>
                  <Textarea
                    value={v1Prompt}
                    readOnly
                    className='min-h-[300px] font-mono text-xs bg-zinc-50 border-zinc-200 cursor-not-allowed resize-none'
                    placeholder='Agent system prompt...'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className='w-px bg-zinc-200' />

          {/* Version 2 */}
          <div className='flex-1 flex flex-col gap-4 overflow-auto'>
            <div className='flex items-center justify-between pb-2 border-b'>
              <h3 className='text-sm text-zinc-900'>Version 2 (Editable)</h3>
              <Badge variant='secondary' className='bg-blue-100 text-blue-700 border-0'>
                Editable
              </Badge>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-xs text-zinc-700'>Description</Label>
                <Textarea
                  value={v2Description}
                  onChange={e => setV2Description(e.target.value)}
                  className='min-h-[100px] font-mono text-xs border-zinc-200 focus-visible:ring-zinc-300 resize-none'
                  placeholder='Tool description...'
                />
              </div>

              {isAgent && (
                <div className='space-y-2'>
                  <Label className='text-xs text-zinc-700'>Agent Prompt</Label>
                  <Textarea
                    value={v2Prompt}
                    onChange={e => setV2Prompt(e.target.value)}
                    className='min-h-[300px] font-mono text-xs border-zinc-200 focus-visible:ring-zinc-300 resize-none'
                    placeholder='Agent system prompt...'
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className='flex items-center justify-end gap-3 pt-4 border-t'>
          <Button variant='outline' onClick={onClose} className='border-zinc-200'>
            Cancel
          </Button>
          <Button onClick={handleSave} className='bg-zinc-900 hover:bg-zinc-800'>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
