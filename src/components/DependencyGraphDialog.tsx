import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { SessionState } from 'services/store'
import GraphRenderer from './ui/graph-renderer'

interface Tool {
  name: string
  description: string
  type: 'tool' | 'agent'
  parent_id: string
  prompt?: string
}

interface DependencyGraphDialogProps {
  sessionData: SessionState
  selectedAgent: string
  isOpen: boolean
  onClose: () => void
  onEditTool: (tool: Tool) => void
}

export function DependencyGraphDialog({ sessionData, selectedAgent, isOpen, onClose }: DependencyGraphDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl-important h-[90vh] flex flex-col p-0'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-zinc-200'>
          <DialogTitle>Dependency Graph</DialogTitle>
          <p className='text-sm text-zinc-500 mt-1.5'>
            Visualize the relationships between agents, sub-agents, and tools
          </p>
        </DialogHeader>

        <div className='flex-1 p-6 overflow-hidden'>
          <GraphRenderer agent={selectedAgent} data={sessionData} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
