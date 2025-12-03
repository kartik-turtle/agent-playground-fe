import { useEffect, useState } from "react";
import { ChatPanel } from "./ChatPanel"
import { ProfileConfig } from "./ProfileConfig";
import { SharedChatInput } from "./SharedChatInput";
import { useStore } from "../services/store";
import { initializeThreads } from "../services/threadService";
import { connectToWebSocket, sendMessage } from "../services/webSocketService";


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
  timestamp: string;
  files?: FileAttachment[];
  author?: string; // "user" for human messages, agent name for assistant messages
}

interface ChatInterfaceProps {

}


const ChatInterface = (props: ChatInterfaceProps) => {

    const [messagesV1, setMessagesV1] = useState<Message[]>([]);
    const [messagesV2, setMessagesV2] = useState<Message[]>([]);

    const [loadingV1, setLoadingV1] = useState(false);
    const [loadingV2, setLoadingV2] = useState(false);

    const {selectedAgent, sessionData, setNewBaseThreadChat, setNewThreadChat, setThreadIds, setUpdatePending} = useStore()
    console.log("state", useStore.getState())


    // Shared message handler - sends to both panels
    const handleSharedMessage = (content: string, files?: FileAttachment[], isInternalNote?: boolean) => {
        // Create messages for both panels with the same content and files
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const messageId = Date.now().toString();
        
        const userMessage: Message = {
            id: messageId,
            role: isInternalNote ? "system" : "user",
            content,
            timestamp,
            files,
            author: "user",
        };

        // if (files && files.length !== 0) {
        //     const promises = files.map(async file => {
        //         const threadId = sessionData![selectedAgent].threadId!
        //         const baseThreadId = sessionData![selectedAgent].baseThreadId!
        //         const formData1 = new FormData()
        //         const blob = await fetch(file.url).then(r => r.blob())
        //         formData1.append('file', blob)
        //         formData1.append('broker', 'turtlemint')
        //         formData1.append('threadId', threadId)
        //         const formData2 = new FormData()
        //         formData2.append('file', blob)
        //         formData2.append('broker', 'turtlemint')
        //         formData2.append('threadId', baseThreadId)
        //         const promise1 = apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.UPLOAD_THREAD_FILE, formData1)
        //         const promise2 = apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.UPLOAD_THREAD_FILE, formData2)
        //         const result = await Promise.all([promise1, promise2])
        //         return [{[threadId]}]
        //     })
        // }

        // Add message to both panels
        setNewBaseThreadChat(selectedAgent, { ...userMessage, id: messageId + "-v1" })
        setNewThreadChat(selectedAgent, { ...userMessage, id: messageId + "-v2" })

        if (!sessionData![selectedAgent].threadId || !sessionData![selectedAgent].baseThreadId) {
            initializeThreads()?.then(resp => {
                const [baseThreadDetails, threadDetails] = resp
                setThreadIds(selectedAgent, threadDetails.data.threadId, baseThreadDetails.data.threadId)
                setUpdatePending(true)
                const {sessionData} = useStore.getState()
                sendMessage(userMessage, sessionData![selectedAgent].threadId!)
                sendMessage(userMessage, sessionData![selectedAgent].baseThreadId!)
            })
            return
        }

        // setMessagesV1((prev) => [...prev, { ...userMessage, id: messageId + "-v1" }]);
        // setMessagesV2((prev) => [...prev, { ...userMessage, id: messageId + "-v2" }]);

        // Don't generate agent responses for internal notes
        if (isInternalNote) {
            return;
        }

        sendMessage(userMessage, sessionData![selectedAgent].threadId!)
        sendMessage(userMessage, sessionData![selectedAgent].baseThreadId!)

        // Generate separate agent responses for each version
        // setLoadingV1(true);
        // setLoadingV2(true);


        // Response for Version 1
        // setTimeout(() => {
        //   const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
        //   const assistantMessage: Message = {
        //     id: (Date.now() + 1).toString() + "-v1",
        //     role: "assistant",
        //     content: generateMockResponse(content, selectedTools, !!files && files.length > 0),
        //     timestamp: new Date(),
        //     author: agentName,
        //   };
        //   setMessagesV1((prev) => [...prev, assistantMessage]);
        //   setLoadingV1(false);
        // }, 1000 + Math.random() * 1000);

        // Response for Version 2
        //   setTimeout(() => {
        //     const agentName = MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || "AI";
        //     const assistantMessage: Message = {
        //       id: (Date.now() + 2).toString() + "-v2",
        //       role: "assistant",
        //       content: generateMockResponse(content, selectedTools, !!files && files.length > 0) + " This response uses a different prompt configuration.",
        //       timestamp: new Date(),
        //       author: agentName,
        //     };
        //     setMessagesV2((prev) => [...prev, assistantMessage]);
        //     setLoadingV2(false);
        //   }, 1200 + Math.random() * 1000);
    };

    useEffect(() => {
        if (sessionData?.[selectedAgent]?.baseThreadChats) {
            setMessagesV1(sessionData[selectedAgent].baseThreadChats)
        }
        else {
            setMessagesV1([])
        }
    }, [sessionData, selectedAgent])

    useEffect(() => {
        if(sessionData?.[selectedAgent]?.threadChats) {
            setMessagesV2(sessionData[selectedAgent].threadChats)
        }
        else {
            setMessagesV2([])
        }
    }, [sessionData, selectedAgent])

    return (
       <div className="flex-1 flex flex-col">
        {/* Profile Configuration */}
        <ProfileConfig/>
        {/* Split Chat Views */}
        <div className="flex-1 flex divide-x overflow-hidden">
          {/* Prompt Version 1 */}
          <div className="flex-1">
            <ChatPanel
              version="Prompt Version 1"
              messages={messagesV1}
              onSendMessage={() => {}}
              isLoading={loadingV1}
              isPromptEditable={false}
              hideInput={true}
            />
          </div>

          {/* Prompt Version 2 */}
          <div className="flex-1">
            <ChatPanel
              version="Prompt Version 2"
              messages={messagesV2}
              onSendMessage={() => {}}
              isLoading={loadingV2}
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
    )
}

export default ChatInterface
export {Message, FileAttachment}