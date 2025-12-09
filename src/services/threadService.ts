import { Message } from "../types/common-types"
import AgentThreadClassificationMap from "../constants/agent-thread-mapping"
import { APIBase, APIEndpoints, APIMethod } from "../constants/api-endpoints"
import apiService from "./apiService"
import { useStore } from "./store"

const createThread = (isUseSessionId: boolean = false) => {
    const {partnerDetails, selectedAgent, sessionId} = useStore.getState()
    let payload: any = {
        'entityId': "",
        'populateSeeker': false,
        'status': 'NEW',
        'tenant': 'turtlemint',
        'threadClassification': AgentThreadClassificationMap[selectedAgent],
        'threadType': 'SUB_THREAD',
        'userId': partnerDetails.id,
        'threadParticipantData': [
            {
                'participantId': partnerDetails.id,
                'role': 'SEEKER',
                'participantType': partnerDetails.partnerType === "employee" ? "RM": "DP",
                'active': true,
                'name': partnerDetails.name
            }
        ],
        'threadMetadata': {
            'source': 'DRM'
        }
    }
    if (isUseSessionId) {
        payload.threadMetadata['aiAgentPlaygroundSessionId'] = sessionId
    }
    return apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.INTIALIZE_THREAD, payload)
}

const initializeThreads = () => {
    const {selectedAgent, sessionData} = useStore.getState()
    if (sessionData?.[selectedAgent] && sessionData[selectedAgent].threadId && sessionData[selectedAgent].baseThreadId) {
        return
    }
    const baseThread = createThread()
    const thread = createThread(true)
    return Promise.all([baseThread, thread])
}

const fetchChatHistory = (threadId: string) => {
    const payload = {page: 0, threadId}
    return apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.FETCH_CHAT_HISTORY, payload)
}

const fetchChats = (baseThreadId: string, threadId: string) => {
    const threadChatsPromise = fetchChatHistory(threadId)
    const baseThreadChatsPromise = fetchChatHistory(baseThreadId)
    return Promise.all([baseThreadChatsPromise, threadChatsPromise])
}

const readUpdateThreadStatus = (baseThreadId: string, threadId: string, userId: string) => {
    const baseThreadPromise = apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.UPDATE_THREAD_READ_STATUS, {
        'userId': userId, 'threadId': baseThreadId
    })
    const threadPromise = apiService(APIMethod.POST, APIBase.MINTPRO, APIEndpoints.UPDATE_THREAD_READ_STATUS, {
        "userId": userId,
        "threadId": threadId
    })
    Promise.all([baseThreadPromise, threadPromise]).then(() => {})
}

const formatChatMessageWithFiles = async (message: any) => {
    const {partnerDetails} = useStore.getState()
    let formatted: Message = {
        'id': message.id,
        'role': message.senderId === partnerDetails.id ? 'user' : 'assistant',
        'content': message.content,
        'author': message.sender,
        'timestamp': message.sentTime,
    }
    if (message.messageType === "FILE") {
        formatted['files'] = message.files.map((file: any) => ({
            'name': file.filename,
            'type': file.mimeType,
            'size': file.size,
            'id': file.id
        }))
    }
    return formatted
}

export {initializeThreads, fetchChats, formatChatMessageWithFiles as formatChatMessage, readUpdateThreadStatus}