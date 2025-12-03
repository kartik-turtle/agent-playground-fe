enum APIMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT"
}

//TODO: get from turtle-configs
enum APIBase {
    MINTPRO = "https://app.cellular.turtle-feature.com",
    DRM = "http://localhost:8000"
}

enum APIEndpoints {
    PARTNER_DETAILS_API = "/api/v2/partners/",
    INTIALIZE_THREAD = "/api/mintpro/helpcenter/v2/thread/initialize",
    FETCH_CHAT_HISTORY = "/api/mintpro/helpcenter/v2/recentChat/messages/v2",
    UPDATE_THREAD_READ_STATUS = "/api/mintpro/helpcenter/v2/recentChat/update-read-status",
    UPLOAD_THREAD_FILE = "/api/mintpro/helpcenter/v2/file/upload",
    GET_AGENTS = "/api/agent-playground/agents",
    CREATE_SESSION = "/api/agent-playground/create_session",
    UPDATE_SESSION = "/api/agent-playground/update_session",
    GET_SESSION = "/api/agent-playground/session",
    ADD_AGENT_TO_SESSION = "/api/agent-playground/new_agent",
    WEBSOCKET = "/api/helpcenter/v2/websocketApp"
}

export {APIMethod, APIBase, APIEndpoints}