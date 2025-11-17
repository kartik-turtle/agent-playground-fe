import { useState } from "react";
import { AgentConfigPanel } from "./components/AgentConfigPanel";
import { ChatPanel } from "./components/ChatPanel";
import { SharedChatInput } from "./components/SharedChatInput";
import { ProfileConfig } from "./components/ProfileConfig";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
  author?: string; // "user" for human messages, agent name for assistant messages
}

const MOCK_AGENTS = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Most capable model, great for complex tasks and reasoning",
  },
  {
    id: "gpt-3.5",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient, ideal for most conversational tasks",
  },
  {
    id: "claude-3",
    name: "Claude 3 Opus",
    description: "Advanced model with strong analytical capabilities",
  },
];

const MOCK_TOOLS = [
  {
    id: "web-search",
    name: "Web Search",
    description: "Search the web for current information",
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Perform mathematical calculations",
  },
  {
    id: "code-interpreter",
    name: "Code Interpreter",
    description: "Execute Python code and analyze data",
  },
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Generate images from text descriptions",
  },
  {
    id: "file-reader",
    name: "File Reader",
    description: "Read and analyze file contents",
  },
];

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState("gpt-4");
  const [selectedTools, setSelectedTools] = useState<string[]>(["web-search", "calculator"]);

  const [promptV1, setPromptV1] = useState(
    "You are a helpful AI assistant. Answer questions clearly and concisely."
  );
  const [promptV2, setPromptV2] = useState(
    "You are an expert AI assistant with deep knowledge across various domains. Provide detailed, well-reasoned responses with examples when appropriate."
  );

  const [messagesV1, setMessagesV1] = useState<Message[]>([]);
  const [messagesV2, setMessagesV2] = useState<Message[]>([]);

  const [loadingV1, setLoadingV1] = useState(false);
  const [loadingV2, setLoadingV2] = useState(false);

  const [userProfile, setUserProfile] = useState(
    '{\n  "name": "John Doe",\n  "role": "Product Manager",\n  "preferences": {\n    "communication_style": "concise",\n    "expertise_level": "intermediate"\n  }\n}'
  );
  
  const [agentProfile, setAgentProfile] = useState(
    '{\n  "personality": "professional",\n  "tone": "friendly",\n  "response_style": "detailed",\n  "constraints": {\n    "max_response_length": 500\n  }\n}'
  );

  const generateMockResponse = (userMessage: string, tools: string[], hasFiles: boolean): string => {
    const fileContext = hasFiles ? " I can see the files you've attached." : "";
    const responses = [
      `Based on your question "${userMessage}", I'll help you with that.${fileContext} ${tools.length > 0 ? `I have access to ${tools.length} tools including ${tools.slice(0, 2).join(", ")}.` : ""}`,
      `That's an interesting question about "${userMessage}".${fileContext} Let me provide some insights.`,
      `I understand you're asking about "${userMessage}".${fileContext} Here's what I can tell you...`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessageV1 = (content: string, files?: FileAttachment[], isInternalNote?: boolean) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: isInternalNote ? "system" : "user",
      content,
      timestamp: new Date(),
      files,
      author: "user",
    };

    setMessagesV1((prev) => [...prev, userMessage]);

    // Don't generate AI response for internal notes
    if (isInternalNote) {
      return;
    }

    setLoadingV1(true);

    setTimeout(() => {
      const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(content, selectedTools, !!files && files.length > 0),
        timestamp: new Date(),
        author: agentName,
      };
      setMessagesV1((prev) => [...prev, assistantMessage]);
      setLoadingV1(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSendMessageV2 = (content: string, files?: FileAttachment[], isInternalNote?: boolean) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: isInternalNote ? "system" : "user",
      content,
      timestamp: new Date(),
      files,
      author: "user",
    };

    setMessagesV2((prev) => [...prev, userMessage]);

    // Don't generate AI response for internal notes
    if (isInternalNote) {
      return;
    }

    setLoadingV2(true);

    setTimeout(() => {
      const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(content, selectedTools, !!files && files.length > 0) + " This response uses a different prompt configuration.",
        timestamp: new Date(),
        author: agentName,
      };
      setMessagesV2((prev) => [...prev, assistantMessage]);
      setLoadingV2(false);
    }, 1200 + Math.random() * 1000);
  };

  // Shared message handler - sends to both panels
  const handleSharedMessage = (content: string, files?: FileAttachment[], isInternalNote?: boolean) => {
    // Create messages for both panels with the same content and files
    const timestamp = new Date();
    const messageId = Date.now().toString();
    
    const userMessage: Message = {
      id: messageId,
      role: isInternalNote ? "system" : "user",
      content,
      timestamp,
      files,
      author: "user",
    };

    // Add message to both panels
    setMessagesV1((prev) => [...prev, { ...userMessage, id: messageId + "-v1" }]);
    setMessagesV2((prev) => [...prev, { ...userMessage, id: messageId + "-v2" }]);

    // Don't generate AI responses for internal notes
    if (isInternalNote) {
      return;
    }

    // Generate separate AI responses for each version
    setLoadingV1(true);
    setLoadingV2(true);

    // Response for Version 1
    setTimeout(() => {
      const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString() + "-v1",
        role: "assistant",
        content: generateMockResponse(content, selectedTools, !!files && files.length > 0),
        timestamp: new Date(),
        author: agentName,
      };
      setMessagesV1((prev) => [...prev, assistantMessage]);
      setLoadingV1(false);
    }, 1000 + Math.random() * 1000);

    // Response for Version 2
    setTimeout(() => {
      const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString() + "-v2",
        role: "assistant",
        content: generateMockResponse(content, selectedTools, !!files && files.length > 0) + " This response uses a different prompt configuration.",
        timestamp: new Date(),
        author: agentName,
      };
      setMessagesV2((prev) => [...prev, assistantMessage]);
      setLoadingV2(false);
    }, 1200 + Math.random() * 1000);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Panel - Agent Configuration */}
      <div className="w-80 flex-shrink-0">
        <AgentConfigPanel
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}
          agents={MOCK_AGENTS}
          tools={MOCK_TOOLS}
        />
      </div>

      {/* Right Section - Split Chat Views + Shared Input */}
      <div className="flex-1 flex flex-col">
        {/* Profile Configuration */}
        <ProfileConfig
          userProfile={userProfile}
          onUserProfileChange={setUserProfile}
          agentProfile={agentProfile}
          onAgentProfileChange={setAgentProfile}
        />

        {/* Split Chat Views */}
        <div className="flex-1 flex divide-x overflow-hidden">
          {/* Prompt Version 1 */}
          <div className="flex-1">
            <ChatPanel
              version="Prompt Version 1"
              systemPrompt={promptV1}
              onSystemPromptChange={setPromptV1}
              messages={messagesV1}
              onSendMessage={handleSendMessageV1}
              isLoading={loadingV1}
              selectedTools={selectedTools}
              isPromptEditable={false}
              hideInput={true}
            />
          </div>

          {/* Prompt Version 2 */}
          <div className="flex-1">
            <ChatPanel
              version="Prompt Version 2"
              systemPrompt={promptV2}
              onSystemPromptChange={setPromptV2}
              messages={messagesV2}
              onSendMessage={handleSendMessageV2}
              isLoading={loadingV2}
              selectedTools={selectedTools}
              isPromptEditable={true}
              hideInput={true}
            />
          </div>
        </div>

        {/* Shared Chat Input */}
        <SharedChatInput
          onSendMessage={handleSharedMessage}
          isLoading={loadingV1 || loadingV2}
        />
      </div>
    </div>
  );
}