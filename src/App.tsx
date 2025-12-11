import { AgentConfigPanel } from './components/AgentConfigPanel'
import SessionContext from './components/context/SessionContext'
import ChatInterface from './components/ChatInterface'

export default function App() {
  return (
    <div className='h-screen flex overflow-hidden bg-white'>
      {/* Left Panel - Agent Configuration */}
      <div className='w-80 flex-shrink-0'>
        <AgentConfigPanel />
      </div>

      {/* Right Section - Split Chat Views + Shared Input */}
      <ChatInterface />
      <SessionContext />
    </div>
  )
}
