import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface Agent {
  id: string;
  name: string;
  description: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface AgentConfigPanelProps {
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
  selectedTools: string[];
  onToolsChange: (toolIds: string[]) => void;
  agents: Agent[];
  tools: Tool[];
}

export function AgentConfigPanel({
  selectedAgent,
  onAgentChange,
  selectedTools,
  onToolsChange,
  agents,
  tools,
}: AgentConfigPanelProps) {
  const handleToolToggle = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      onToolsChange(selectedTools.filter((id) => id !== toolId));
    } else {
      onToolsChange([...selectedTools, toolId]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-zinc-200">
      <div className="p-6 border-b border-zinc-200 bg-white">
        <h2 className="mb-1 text-zinc-900">Agent Configuration</h2>
        <p className="text-zinc-500 text-sm">
          Configure your AI agent and available tools
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Agent Selection */}
          <div className="space-y-3">
            <Label htmlFor="agent-select" className="text-sm text-zinc-700">Select Agent</Label>
            <Select value={selectedAgent} onValueChange={onAgentChange}>
              <SelectTrigger id="agent-select" className="border-zinc-200 focus:ring-zinc-300">
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAgent && (
              <p className="text-sm text-zinc-500">
                {agents.find((a) => a.id === selectedAgent)?.description}
              </p>
            )}
          </div>

          <Separator className="bg-zinc-200" />

          {/* Tools Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-zinc-700">Available Tools</Label>
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-0">{selectedTools.length} selected</Badge>
            </div>
            <div className="space-y-3">
              {tools.map((tool) => (
                <Card key={tool.id} className="p-4 border-zinc-200 shadow-none hover:bg-zinc-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={tool.id}
                      checked={selectedTools.includes(tool.id)}
                      onCheckedChange={() => handleToolToggle(tool.id)}
                      className="mt-0.5 border-zinc-300"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={tool.id}
                        className="cursor-pointer"
                      >
                        <div className="text-sm mb-1 text-zinc-900">{tool.name}</div>
                        <div className="text-xs text-zinc-500">
                          {tool.description}
                        </div>
                      </label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}