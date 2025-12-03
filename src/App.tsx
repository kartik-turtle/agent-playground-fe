import { useState } from "react";
import { AgentConfigPanel } from "./components/AgentConfigPanel";
import { ChatPanel } from "./components/ChatPanel";
import { SharedChatInput } from "./components/SharedChatInput";
import { ProfileConfig } from "./components/ProfileConfig";
import SessionContext from "./components/context/SessionContext";
import ChatInterface from "./components/ChatInterface";

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

export default function App() {

  const [promptV2, setPromptV2] = useState(
    "You are an expert AI assistant with deep knowledge across various domains. Provide detailed, well-reasoned responses with examples when appropriate."
  );

  const [messagesV1, setMessagesV1] = useState<Message[]>([]);
  const [messagesV2, setMessagesV2] = useState<Message[]>([]);

  const [loadingV1, setLoadingV1] = useState(false);
  const [loadingV2, setLoadingV2] = useState(false);

  console.log("render")
  
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

  //   setTimeout(() => {
  //     const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
  //     const assistantMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: "assistant",
  //       content: generateMockResponse(content, selectedTools, !!files && files.length > 0),
  //       timestamp: new Date(),
  //       author: agentName,
  //     };
  //     setMessagesV1((prev) => [...prev, assistantMessage]);
  //     setLoadingV1(false);
  //   }, 1000 + Math.random() * 1000);
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

  //   setTimeout(() => {
  //     const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
  //     const assistantMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: "assistant",
  //       content: generateMockResponse(content, selectedTools, !!files && files.length > 0) + " This response uses a different prompt configuration.",
  //       timestamp: new Date(),
  //       author: agentName,
  //     };
  //     setMessagesV2((prev) => [...prev, assistantMessage]);
  //     setLoadingV2(false);
  //   }, 1200 + Math.random() * 1000);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Panel - Agent Configuration */}
      <div className="w-80 flex-shrink-0">
        <AgentConfigPanel/>
      </div>

      {/* Right Section - Split Chat Views + Shared Input */}
      <ChatInterface/>
      <SessionContext/>
    </div>
  );
}