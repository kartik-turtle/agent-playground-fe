import { useEffect, useState } from 'react'
import { useStore } from '../../services/store'
import apiService from '../../services/apiService'
import { APIBase, APIEndpoints, APIMethod } from '../../constants/api-endpoints'
import { getItemFromLocalStorage, setItemToLocalStorage } from '../../services/utils'
import { fetchChats, formatChatMessage, readUpdateThreadStatus } from '../../services/threadService'
import { connectToWebSocket } from '../../services/webSocketService'

export default function SessionContext() {
  const {
    userProfile,
    agentProfile,
    partnerId,
    selectedAgent,
    sessionData,
    isUpdatePending,
    partnerDetails,
    webSocketConnected,
    sessionId,
    defaultAgent,
    setSessionData,
    setAgents,
    setUpdatePending,
    setUserProfile,
    setAgentProfile,
    setPartnerId,
    setSelectedAgent,
    setThreadChats,
    setSessionId
  } = useStore()
  const [isCreateSession, setCreateSession] = useState<boolean>(false)

  useEffect(() => {
    if (partnerDetails) {
      apiService(APIMethod.GET, APIBase.DRM, APIEndpoints.GET_AGENTS).then(resp => {
        setAgents(resp.agents, resp.defaultAgent)
      })
    }
  }, [partnerDetails])

  useEffect(() => {
    const sessionId = getItemFromLocalStorage('sessionId')
    if (sessionId) {
      const url = APIEndpoints.GET_SESSION + `?sessionId=${sessionId}`
      apiService(APIMethod.GET, APIBase.DRM, url).then(data => {
        Object.entries(data.playground_data.data).forEach(([agent, value]: any) => {
          let toolsDescription: any = {}
          value.tools.forEach((tool: any) => {
            toolsDescription[tool.name] = tool.description
          })
          setSessionData(agent, {
            selectedTools: value.tools.filter((tool: any) => tool.is_active).map((tool: any) => tool.name),
            toolsDescription: toolsDescription,
            basePrompt: value.base_prompt,
            prompt: value.prompt,
            tools: value.base_tools,
            threadId: value.thread_id,
            baseThreadId: value.base_thread_id,
            loadingV1: false,
            loadingV2: false
          })
          setUserProfile(data.user_profile)
          setAgentProfile(data.agent_profile)
          setPartnerId(data.partner_id)
          setSessionId(sessionId)
          setSelectedAgent(agent)
        })
      })
    } else {
      setCreateSession(true)
    }
  }, [])

  useEffect(() => {
    if (isCreateSession && partnerDetails && selectedAgent) {
      apiService(APIMethod.POST, APIBase.DRM, APIEndpoints.CREATE_SESSION, {
        partner_id: partnerId,
        agent: selectedAgent,
        user_profile: userProfile,
        agent_profile: agentProfile
      }).then(data => {
        Object.entries(data.playground_data.data).forEach(([agent, value]: any) => {
          setItemToLocalStorage('sessionId', data.session_id)
          setSelectedAgent(defaultAgent!)
          let toolsDescription: any = {}
          value.tools.forEach((tool: any) => {
            toolsDescription[tool.name] = tool.description
          })
          setSessionId(data.session_id)
          setSessionData(agent, {
            selectedTools: value.tools.filter((tool: any) => tool.is_active).map((tool: any) => tool.name),
            toolsDescription: toolsDescription,
            basePrompt: value.base_prompt,
            prompt: value.prompt,
            tools: value.tools,
            threadId: value.thread_id,
            baseThreadId: value.base_thread_id,
            loadingV1: false,
            loadingV2: false
          })
        })
      })
      setCreateSession(false)
    }
  }, [isCreateSession, partnerDetails, selectedAgent])

  useEffect(() => {
    if (selectedAgent && sessionData && !sessionData[selectedAgent]) {
      apiService(APIMethod.POST, APIBase.DRM, APIEndpoints.ADD_AGENT_TO_SESSION, {
        session_id: sessionId,
        agent: selectedAgent
      }).then(data => [
        Object.entries(data.playground_data.data).forEach(([agent, value]: any) => {
          let toolsDescription: any = {}
          value.tools.forEach((tool: any) => {
            toolsDescription[tool.name] = tool.description
          })
          setSessionData(agent, {
            selectedTools: value.tools.filter((tool: any) => tool.is_active).map((tool: any) => tool.name),
            toolsDescription: toolsDescription,
            basePrompt: value.base_prompt,
            prompt: value.prompt,
            tools: value.base_tools,
            threadId: value.thread_id,
            baseThreadId: value.base_thread_id,
            loadingV1: false,
            loadingV2: false
          })
        })
      ])
    }
  }, [sessionData, selectedAgent])

  useEffect(() => {
    if (isUpdatePending && sessionData?.[selectedAgent]) {
      setUpdatePending(false)
      let updatedSessionData: any = {}
      Object.entries(sessionData).forEach(([agent, value]) => {
        const tools = value.tools.map(tool => {
          if (value.selectedTools.includes(tool.name)) {
            return { ...tool, is_active: true, description: value.toolsDescription[tool.name] }
          } else {
            return { ...tool, is_active: false, description: value.toolsDescription[tool.name] }
          }
        })
        updatedSessionData[agent] = {
          prompt: value.prompt,
          tools: tools,
          thread_id: value.threadId,
          base_thread_id: value.baseThreadId
        }
      })
      apiService(APIMethod.POST, APIBase.DRM, APIEndpoints.UPDATE_SESSION, {
        session_id: sessionId,
        partner_id: partnerId,
        user_profile: userProfile,
        agent_profile: agentProfile,
        session_data: updatedSessionData
      }).then(data => {
        Object.entries(data.playground_data.data).forEach(([agent, value]: any) => {
          let toolsDescription: any = {}
          value.tools.forEach((tool: any) => {
            toolsDescription[tool.name] = tool.description
          })
          setSessionData(agent, {
            selectedTools: value.tools.filter((tool: any) => tool.is_active).map((tool: any) => tool.name),
            toolsDescription: toolsDescription,
            basePrompt: value.base_prompt,
            prompt: value.prompt,
            tools: value.base_tools,
            threadId: value.thread_id,
            baseThreadId: value.base_thread_id
          })
        })
      })
    }
  }, [isUpdatePending])

  useEffect(() => {
    if (
      sessionData?.[selectedAgent] &&
      sessionData[selectedAgent].threadId &&
      sessionData[selectedAgent].baseThreadId &&
      partnerDetails &&
      !sessionData[selectedAgent].threadChats &&
      !sessionData[selectedAgent].baseThreadChats
    ) {
      fetchChats(sessionData[selectedAgent].baseThreadId, sessionData[selectedAgent].threadId).then(
        ([baseThreadChats, threadChats]) => {
          const baseThreadFormattedChats = baseThreadChats.data.messageList
            .flatMap((messageGroup: any) => messageGroup.messages)
            .map(async (message: any) => await formatChatMessage(message))
          const threadFormattedChats = threadChats.data.messageList
            .flatMap((messageGroup: any) => messageGroup.messages)
            .map(async (message: any) => await formatChatMessage(message))
          Promise.all(baseThreadFormattedChats).then(baseChats => {
            baseChats.reverse()
            Promise.all(threadFormattedChats).then(threadChats => {
              threadChats.reverse()
              setThreadChats(selectedAgent, threadChats, baseChats)
            })
          })
        }
      )
      readUpdateThreadStatus(
        sessionData[selectedAgent].baseThreadId,
        sessionData[selectedAgent].threadId,
        partnerDetails.id
      )
    }
  }, [selectedAgent, partnerDetails])

  useEffect(() => {
    if (!webSocketConnected && partnerDetails) {
      connectToWebSocket()
    }
  }, [webSocketConnected, partnerDetails])

  return <></>
}
