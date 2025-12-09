import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../services/store";
import { debounce, getItemFromLocalStorage } from "../services/utils";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { SessionState } from "../services/store"
import { SaveTool, ToolEditDialog } from "./ToolEditDialog";
import { Button } from "./ui/button";
import GraphRenderer from "./ui/graph-renderer";

interface Tool {
  name: string;
  description: string;
  type: "tool" | "agent";
  parent_id: string;
}

interface ToolItemProps {
  tool: Tool;
  children?: Tool[];
  selectedTools: string[];
  onToolToggle: (toolName: string, allChildNames: string[]) => void;
  onEditTool: (tool: Tool & {baseDescription: string}) => void;
  level?: number;
  allTools: Tool[];
}

const generateToolId = (parent_id: string, toolName: string) => {
    return parent_id + "#" + toolName
}

function ToolItem({ tool, children = [], selectedTools, onToolToggle, onEditTool, level = 0, allTools }: ToolItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isAgent = tool.type === "agent";
  const hasChildren = children.length > 0;
  const isChecked = selectedTools.includes(tool.parent_id + "#" + tool.name);
  

  // Get all descendant tool names recursively
  const getAllDescendantNames = (items: Tool[]): string[] => {
    const names: string[] = [];
    items.forEach(item => {
      names.push(generateToolId(item.parent_id, item.name));
      const itemChildren = allTools.filter(t => t.type === 'agent' && t.parent_id === item.name);
      names.push(...getAllDescendantNames(itemChildren));
    });
    return names;
  };

  const allChildNames = getAllDescendantNames(children);

  const handleToggle = () => {
    onToolToggle(generateToolId(tool.parent_id, tool.name), allChildNames);
  };

  const getToolDescription = (agent: string, name: string) => {
    const state = useStore.getState()
    return state.sessionData![agent]!.toolsDescription[name]
  }

  return (
    <div className="space-y-1.5">
      <div 
        className={`group py-2 px-3 rounded-md hover:bg-zinc-50 transition-colors ${
          level > 0 ? 'ml-6' : ''
        }`}
      >
        <div className="flex items-start space-x-2.5">
          {isAgent && hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-0.5 p-0 hover:bg-zinc-100 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-zinc-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              )}
            </button>
          )}
          {(!isAgent || !hasChildren) && <div className="w-4" />}
          
          <Checkbox
            id={generateToolId(tool.parent_id, tool.name)}
            checked={isChecked}
            onCheckedChange={handleToggle}
            className="mt-0.5 border-zinc-300 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <label
              htmlFor={tool.name}
              className="block"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm text-zinc-900 truncate">{tool.name}</span>
                {isAgent && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-blue-200 text-blue-700 bg-blue-50 flex-shrink-0"
                  >
                    Agent
                  </Badge>
                )}
                <Button
                  onClick={(e: any) => {
                    e.preventDefault();
                    onEditTool({...tool, 'baseDescription': tool.description, 'description': getToolDescription(tool.parent_id, tool.name)!});
                  }}
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 flex-shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5 text-zinc-600" />
                </Button>
              </div>
              <div className="text-xs text-zinc-500 line-clamp-2">
                {getToolDescription(tool.parent_id, tool.name)}
              </div>
            </label>
          </div>
        </div>
      </div>

      {isAgent && hasChildren && isExpanded && (
        <div className="space-y-1.5">
          {children.map((childTool) => {
            const grandChildren = allTools.filter(t => t.parent_id === childTool.name);
            return (
              <ToolItem
                key={childTool.name}
                tool={childTool}
                children={grandChildren}
                selectedTools={selectedTools}
                onToolToggle={onToolToggle}
                onEditTool={onEditTool}
                level={level + 1}
                allTools={allTools}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


export function AgentConfigPanel() {

  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [editingTool, setEditingTool] = useState<Tool & {baseDescription: string} | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false);

  const {setSelectedAgent: setSelectedAgentStore, setSelectedTools: setSelectedToolsStore, setUpdatePending, setPrompt, setToolDescription, defaultAgent, agents, sessionData} = useStore()

  const updatePending = useMemo(() => debounce(setUpdatePending, 1500), [])
  console.log(sessionData)

  const handleToolToggle = (toolName: string, allChildNames: string[]) => {
    if (selectedTools.includes(toolName)) {
      // Uncheck the tool and all its children
      const toolsToRemove = [toolName, ...allChildNames];
      const tools = selectedTools.filter((name) => !toolsToRemove.includes(name))
      setSelectedTools(tools)
      Object.entries(sessionData || {}).forEach(([agent, agentConfig]) => {
        const agentTools = agentConfig.tools.filter(tool => tools.includes(generateToolId(tool.parent_id, tool.name))).map(tool => tool.name)
        setSelectedToolsStore(agent, agentTools)
      })
    } else {
      const tools = [...selectedTools, toolName, ...allChildNames]
      setSelectedTools([...selectedTools, toolName, ...allChildNames])
      Object.entries(sessionData || {}).forEach(([agent, agentConfig]) => {
        const agentTools = agentConfig.tools.filter(tool => tools.includes(generateToolId(tool.parent_id, tool.name))).map(tool => tool.name)
        setSelectedToolsStore(agent, agentTools)
      })
    }
    updatePending(true)
  };

  const handleEditTool = (tool: Tool & {baseDescription: string}) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  const handleSaveTool = (data: SaveTool) => {
    // if (onToolUpdate) {
    //   onToolUpdate(toolName, v1Data, v2Data);
    // }
    if (data.prompt) {
       setPrompt(data.prompt.agent, data.prompt.prompt)
    }
    setToolDescription(data.agent, data.name, data.description)
    updatePending(true)
    setIsDialogOpen(false);
    setEditingTool(null);
  };

  const handleAgentChange = (agent: string) => {
    setSelectedAgent(agent)
    setSelectedAgentStore(agent)
  }

  const initSelectedTools = (sessionData: SessionState) => {
    let tools: string[] = []
    Object.entries(sessionData).forEach(([_, value]) => {
      value.tools.forEach(tool => {
        if (value.selectedTools.includes(tool.name)) {
          tools.push(generateToolId(tool.parent_id, tool.name))
        }
      })
    })
    return tools
  }

  useEffect(() => {
    const sessionId = getItemFromLocalStorage('sessionId')
    if(defaultAgent && !sessionId) {
       setSelectedAgent(defaultAgent)
       setSelectedAgentStore(defaultAgent)
    }
  }, [defaultAgent])

  useEffect(() => {
    if(sessionData?.[selectedAgent]) {
       const tools = initSelectedTools(sessionData)
       setSelectedTools(tools)
    }
  }, [sessionData, selectedAgent])

  useEffect(() => {
    const selectedAgent = useStore.getState().selectedAgent
    if (selectedAgent) {
       setSelectedAgent(selectedAgent)
    }
  }, [sessionData])

  // Get root level tools (tools that belong to the selected agent)
  const rootTools = sessionData?.[selectedAgent]?.tools || []
  const allTools = Object.values(sessionData || {}).flatMap(agentConfig => agentConfig.tools)

  return (
    <>
      <div className="h-full flex flex-col bg-white border-r border-zinc-200">
        <div className="p-6 border-b border-zinc-200 bg-white">
          <h2 className="mb-1 text-zinc-900">Agent Configuration</h2>
          <p className="text-zinc-500 text-sm">
            Configure your AI agent and available tools
          </p>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 pb-0 space-y-6">
            {/* Agent Selection */}
            <div className="space-y-3">
              <Label htmlFor="agent-select" className="text-sm text-zinc-700">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={handleAgentChange}>
                <SelectTrigger id="agent-select" className="border-zinc-200 focus:ring-zinc-300">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-zinc-200" />

            {/* Tools Selection Header */}
            <div className="flex items-center justify-between" style={{marginLeft: "calc(var(--spacing) * -6)"}}>
              <button
                onClick={() => setIsToolsCollapsed(!isToolsCollapsed)}
                className="flex items-center gap-2 hover:bg-zinc-50 rounded px-2 py-1 -ml-2 transition-colors"
              >
                {isToolsCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-600" />
                )}
                <Label className="text-sm text-zinc-700 cursor-pointer">Available Tools</Label>
              </button>
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-0">{sessionData?.[selectedAgent]?.selectedTools.length} selected</Badge>
            </div>
          </div>
          
          {/* Scrollable Tools List */}
          {!isToolsCollapsed && (<ScrollArea className="flex-1 pb-6">
            <div className="space-y-1 pt-3" style={{maxHeight: 'calc(100vh - 285px)', overflowY: 'scroll'}}>
              {rootTools.map((tool) => {
                const childTools = tool.type === 'agent' ? sessionData?.[tool.name]?.tools || [] : []
                return (
                  <ToolItem
                    key={tool.name}
                    tool={tool}
                    children={childTools}
                    selectedTools={selectedTools}
                    onToolToggle={handleToolToggle}
                    onEditTool={handleEditTool}
                    level={0}
                    allTools={allTools}
                  />
                );
              })}
            </div>
          </ScrollArea>)}
          {sessionData && (
            <div className="graph-renderer">
              <GraphRenderer agent={selectedAgent} data={sessionData}/>
            </div>
          )}
        </div>
      </div>
      <ToolEditDialog
        tool={editingTool}
        isOpen={isDialogOpen}
        onSave={handleSaveTool}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}