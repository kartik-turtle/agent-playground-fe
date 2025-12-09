import {Client} from "@stomp/stompjs"
import { useStore } from "./store"
import { APIBase, APIEndpoints } from "../constants/api-endpoints"
import { formatChatMessage } from "./threadService"
import { Message } from "../types/common-types"

let stompClient: Client | null = null

const subscribe = () => {
    const {webSocketConnected, partnerDetails} = useStore.getState()
    if (!stompClient || !webSocketConnected)
        return
    const topic = `/topic/${partnerDetails.id}`
    stompClient!.subscribe(topic, (message) => {
        const {sessionData, setNewThreadChat, setNewBaseThreadChat, setLoadingV1, setLoadingV2} = useStore.getState()
        const webSocketMessage = JSON.parse(message.body)
        console.log("Received message over websocket: ", webSocketMessage)
        console.log("state", useStore.getState())
        if (!webSocketMessage || !sessionData) 
            return
        if (webSocketMessage.type === "COMMUNICATION") {
            const newMsg = webSocketMessage.newMessage?.messages?.[0];
            if (newMsg && newMsg.senderId !== partnerDetails.id) {
                const threadId = webSocketMessage.threadInfo.id
                Object.entries(sessionData).forEach(([agent, data]) => {
                    if (data.baseThreadId === threadId) {
                        const existingMsg = sessionData[agent].baseThreadChats?.find(message => message.id === newMsg.id)
                        if (!existingMsg) {
                            console.log("received agent response for base thread: ", newMsg)
                            formatChatMessage(newMsg).then(formattedMsg => {
                                setLoadingV1(agent, false)
                                setNewBaseThreadChat(agent, formattedMsg)
                            })
                        }
                    }
                    if (data.threadId === threadId) {
                        const existingMsg = sessionData[agent].threadChats?.find(message => message.id === newMsg.id)
                        if (!existingMsg) {
                            console.log("received agent response for thread: ", newMsg)
                            formatChatMessage(newMsg).then(formattedMsg => {
                                setLoadingV2(agent, false)
                                setNewThreadChat(agent, formattedMsg)
                            })
                        }

                    }
                })
            }
        }
        else {
            console.log("Received message of other type: ", message.body)
        }
    })
}

const handleConnect = () => {
    console.log("Connected to WebSocket.");
    const {setWebSocketConnected} = useStore.getState()
    setWebSocketConnected(true)
    subscribe()
}

const connectToWebSocket = () => {
    const {webSocketConnected, setWebSocketConnected} = useStore.getState()
    if (stompClient && webSocketConnected)
        return

    stompClient = new Client({
        brokerURL: APIBase.MINTPRO + APIEndpoints.WEBSOCKET,
        onConnect: handleConnect,
        onDisconnect: (frame) => {
            console.log("Broker disconnected")
            setWebSocketConnected(false)
        },
        onStompError: (frame) => {
            setWebSocketConnected(false)
            console.error(`Broker reported error: ${frame.headers["message"]}`);
            console.error(`Additional details: ${frame.body}`);
        },
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
    })

    stompClient.activate();
    console.log(stompClient, "WebSocket client initialized");
}

const sendMessage = (message: Message, threadId: string) => {
    const {webSocketConnected, partnerDetails} = useStore.getState()
    if (!stompClient || !webSocketConnected)
        return
    try {
        stompClient.publish({
          destination: `/chat.send.${threadId}`,
          headers: {
            userId: partnerDetails.id,
            threadId: threadId,
            tenant: "turtlemint",
            channel: "SDK",
          },
          body: JSON.stringify({
            threadId: threadId,
            senderId: partnerDetails.id,
            content: message.content,
            channel: "SDK",
            messageType: message.files ? 'FILE' : 'TEXT',
            files: message.files?.map((file) => {
              return { id: file.id };
            }),
          }),
        });
        console.log(
          `Sent message to thread ${threadId}: ${message} : ${partnerDetails.id}`
        );
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}

export {connectToWebSocket, sendMessage}