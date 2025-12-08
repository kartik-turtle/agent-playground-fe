import { useEffect, useState } from "react";
import { ChatPanel } from "./ChatPanel"
import { ProfileConfig } from "./ProfileConfig";
import { SharedChatInput } from "./SharedChatInput";
import { useStore } from "../services/store";
import { initializeThreads } from "../services/threadService";
import { sendMessage } from "../services/webSocketService";
import apiService from "../services/apiService";
import { APIBase, APIEndpoints, APIMethod } from "../constants/api-endpoints";


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

    const {selectedAgent, sessionData, setNewBaseThreadChat, setNewThreadChat, setThreadIds, setUpdatePending, setLoadingV1, setLoadingV2} = useStore()
    console.log("state", useStore.getState())


    const handleFileUpload = async (files: FileAttachment[]) => {
      const baseThreadFilesPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        const filePart = await fetch(file.url).then(async resp => {
           const blob = await resp.blob()
           return new File([blob], file.name, {'type': file.type})
        })
        formData.append('file', filePart)
        formData.append('broker', 'turtlemint')
        formData.append('threadId', sessionData![selectedAgent].baseThreadId!)
        return apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.UPLOAD_THREAD_FILE, formData)
      })

      const threadFilesPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        const filePart = await fetch(file.url).then(async resp => {
           const blob = await resp.blob()
           return new File([blob], file.name, {'type': file.type})
        })
        formData.append('file', filePart)
        formData.append('broker', 'turtlemint')
        formData.append('threadId', sessionData![selectedAgent].threadId!)
        return apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.UPLOAD_THREAD_FILE, formData)
      })

      const baseThreadFileData = await Promise.all(baseThreadFilesPromises)
      const threadFileData = await Promise.all(threadFilesPromises)
      const newBaseThreadFiles: FileAttachment[] = files.map((file, idx) => ({name: file.name, size: baseThreadFileData[idx].size, type: baseThreadFileData[idx].type, url: file.url, id: baseThreadFileData[idx].id}))
      const threadFilesData: FileAttachment[] = files.map((file, idx) => ({name: file.name, size: threadFileData[idx].size, type: threadFileData[idx].mimeType, url: file.url, id: threadFileData[idx].id}))
      return [newBaseThreadFiles, threadFilesData]
   }


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

        // Add message to both panels
        setNewBaseThreadChat(selectedAgent, { ...userMessage, id: messageId + "-v1" })
        setNewThreadChat(selectedAgent, { ...userMessage, id: messageId + "-v2" })

        setLoadingV1(selectedAgent, true)
        setLoadingV2(selectedAgent, true)

        if (!sessionData![selectedAgent].threadId || !sessionData![selectedAgent].baseThreadId) {
            initializeThreads()?.then(resp => {
                const [baseThreadDetails, threadDetails] = resp
                setThreadIds(selectedAgent, threadDetails.data.threadId, baseThreadDetails.data.threadId)
                setUpdatePending(true)
                const {sessionData} = useStore.getState()
                if (userMessage.files && userMessage.files.length !== 0) {
                  handleFileUpload(userMessage.files).then(([baseThreadFiles, threadFiles]) => {
                    sendMessage({ ...userMessage, files: baseThreadFiles}, sessionData![selectedAgent].baseThreadId!)
                    sendMessage({ ...userMessage, files: threadFiles}, sessionData![selectedAgent].threadId!)
                  })
                }
                else {
                  sendMessage(userMessage, sessionData![selectedAgent].baseThreadId!)
                  sendMessage(userMessage, sessionData![selectedAgent].threadId!)
                }
            })
            return
        }

        // Don't generate agent responses for internal notes
        if (isInternalNote) {
            return;
        }

        if (userMessage.files && userMessage.files.length !== 0) {
          handleFileUpload(userMessage.files).then(([baseThreadFiles, threadFiles]) => {
            sendMessage({ ...userMessage, files: baseThreadFiles}, sessionData![selectedAgent].baseThreadId!)
            sendMessage({ ...userMessage, files: threadFiles}, sessionData![selectedAgent].threadId!)
          })
        }
        else {
          sendMessage(userMessage, sessionData![selectedAgent].baseThreadId)
          sendMessage(userMessage, sessionData![selectedAgent].threadId)
        }

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
              isLoading={sessionData?.[selectedAgent]?.loadingV1 || false}
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
              isLoading={sessionData?.[selectedAgent]?.loadingV2 || false}
              isPromptEditable={true}
              hideInput={true}
            />
          </div>
        </div>

        {/* Shared Chat Input */}
        <SharedChatInput
          onSendMessage={handleSharedMessage}
          isLoading={sessionData?.[selectedAgent]?.loadingV1 || sessionData?.[selectedAgent]?.loadingV2 || false}
        />
      </div>
    )
}

export default ChatInterface
export {Message, FileAttachment}