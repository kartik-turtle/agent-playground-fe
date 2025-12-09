import {create} from "zustand"
import { Message } from "../types/common-types"

interface Tool {
  name: string;
  description: string;
  type: "tool" | "agent";
  parent_id: string;
}

interface AgentState {
    prompt: string
    basePrompt: string
    selectedTools: string[]
    tools: Tool[]
    toolsDescription: {
        [index: string]: string
    }
    threadId: string | null
    baseThreadId: string | null
    threadChats?: Message[]
    baseThreadChats?: Message[]
    loadingV1: boolean 
    loadingV2: boolean
}

export interface SessionState {
   [index: string]: AgentState
}

interface StoreState {
    authToken: string | null
    partnerId: string | null
    userProfile: Record<string, any>
    agentProfile: Record<string, any>
    selectedAgent: string
    isUpdatePending: boolean
    partnerDetails: any
    agents: string[]
    defaultAgent: string | null
    sessionId: string
    sessionData: SessionState | null
    webSocketConnected: boolean,
    setPartnerId: (partnerId: string) => void
    setAuthToken: (token: string) => void
    setUserProfile: (value: Record<string, any>) => void
    setAgentProfile: (value: Record<string, any>) => void
    setSelectedAgent: (value: string) => void
    setSelectedTools: (agent: string, value: string[]) => void
    setPrompt: (agent: string, value: string) => void
    setToolDescription: (agent: string, name: string, value: string) => void,
    setThreadIds: (agent: string, threadId: string, baseThreadId: string) => void
    setPartnerDetails: (data: any) => void
    setAgents: (agents: string[], defaultAgent: string) => void
    setUpdatePending: (pending: boolean) => void
    setThreadChats: (agent: string, threadChats: Message[], baseThreadChats: Message[]) => void
    setNewThreadChat: (agent: string, chat: Message) => void
    setNewBaseThreadChat: (agent: string, chat: Message) => void
    setSessionData: (agent: string, data: Partial<AgentState> | AgentState) => void
    setSessionId: (sessionId: string) => void
    setLoadingV1: (agent: string, value: boolean) => void
    setLoadingV2: (agent: string, value: boolean) => void
    setWebSocketConnected: (value: boolean) => void
}

export const useStore = create<StoreState>((set) => ({
    authToken: null,
    partnerId: null,
    userProfile: {},
    agentProfile: {},
    selectedAgent: "",
    isUpdatePending: false,
    partnerDetails : null,
    agents: [],
    defaultAgent: null,
    sessionId: "",
    sessionData: null,
    webSocketConnected: false,
    setPartnerId: (partnerId) => set({partnerId: partnerId}),
    setAuthToken: (token) => set({authToken: token}),
    setUserProfile: (value) => set({userProfile: value}),
    setAgentProfile: (value) => set({agentProfile: value}),
    setSelectedAgent: (value) => set({selectedAgent: value}),
    setSelectedTools: (agent, value) => set(state => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, selectedTools: value}}})),
    setPrompt: (agent, value) => set(state => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, prompt: value}}})),
    setToolDescription: (agent, name, value) => set(state => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, toolsDescription: {...state.sessionData![agent]!.toolsDescription, [name]: value}}}})),
    setThreadIds: (agent, threadId, baseThreadId) => set(state => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, threadId: threadId, baseThreadId: baseThreadId}}})), 
    setPartnerDetails : (data) => set({partnerDetails: data}),
    setAgents: (agents, defaultAgent) => set({agents, defaultAgent}),
    setUpdatePending: (pending) => set({isUpdatePending: pending}),
    setThreadChats: (agent, threadChats, baseThreadChats) => set(state => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, threadChats: threadChats, baseThreadChats: baseThreadChats}}})),
    setNewThreadChat: (agent, chat) => set((state) => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, threadChats: [...(state.sessionData![agent]!.threadChats || []), chat]}}})),
    setNewBaseThreadChat: (agent, chat) => set((state) => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, baseThreadChats: [...(state.sessionData![agent]!.baseThreadChats || []), chat]}}})),
    setSessionData: (agent, data) => set((state) => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData?.[agent], ...(data as AgentState)}}})),
    setSessionId: (sessionId) => set({sessionId: sessionId}),
    setLoadingV1: (agent, value) => set((state) => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, loadingV1: value}}})),
    setLoadingV2: (agent, value) => set((state) => ({sessionData: {...state.sessionData, [agent]: {...state.sessionData![agent]!, loadingV2: value}}})),
    setWebSocketConnected: (value) => set({webSocketConnected: value})
}))
