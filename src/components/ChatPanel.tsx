import { useState, useRef, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Send,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  StickyNote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useStore } from "../services/store";
import { FileAttachment, Message } from "./ChatInterface";


interface ChatPanelProps {
  version: string;
  messages: Message[];
  onSendMessage: (
    content: string,
    files?: FileAttachment[],
    isInternalNote?: boolean,
  ) => void;
  isLoading: boolean;
  isPromptEditable?: boolean;
  hideInput?: boolean; // New prop to hide the input section
}

export function ChatPanel({
  version,
  messages,
  onSendMessage,
  isLoading,
  isPromptEditable = true,
  hideInput = false, // Default to false for backwards compatibility
}: ChatPanelProps) {

  const {sessionData, selectedAgent, setPrompt, setUpdatePending} = useStore()

  const [inputValue, setInputValue] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [tempPrompt, setTempPrompt] = useState("");
  const [isPromptExpanded, setIsPromptExpanded] =
    useState(false);
  const [showPromptDialog, setShowPromptDialog] =
    useState(false);
  const [attachedFiles, setAttachedFiles] = useState<
    FileAttachment[]
  >([]);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(messages)

  useEffect(() => {
    if (sessionData && sessionData[selectedAgent]) {
      setTempPrompt(sessionData[selectedAgent].prompt)
    }
  }, [sessionData])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages])

  const handleSend = () => {
    if (
      (inputValue.trim() || attachedFiles.length > 0) &&
      !isLoading
    ) {
      onSendMessage(
        inputValue,
        attachedFiles.length > 0 ? attachedFiles : undefined,
        isInternalNote,
      );
      setInputValue("");
      setAttachedFiles([]);
      setIsInternalNote(false);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FileAttachment[] = Array.from(files).map(
      (file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }),
    );

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      " " +
      sizes[i]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSavePrompt = () => {
    setUpdatePending(true)
    setPrompt(selectedAgent, tempPrompt);
    setIsEditingPrompt(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-900">{version}</h3>
            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-0">
              {sessionData ? sessionData[selectedAgent]?.selectedTools.length : 0} tools
            </Badge>
          </div>

          {/* System Prompt */}
          <Collapsible
            open={isPromptExpanded}
            onOpenChange={setIsPromptExpanded}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-zinc-500">
                  System Prompt{" "}
                  {!isPromptEditable && (
                    <span className="text-zinc-400">
                      (Base Truth)
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-1">
                  {isPromptEditable && (
                    <>
                      {!isEditingPrompt ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                          onClick={() => {
                            setTempPrompt(sessionData ? sessionData[selectedAgent]?.prompt : "");
                            setIsEditingPrompt(true);
                            setIsPromptExpanded(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                          onClick={handleSavePrompt}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-900"
                    onClick={() => setShowPromptDialog(true)}
                    title="View full prompt"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-900">
                      {isPromptExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              {/* Compact Preview */}
              {!isPromptExpanded && !isEditingPrompt && (
                <div className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-3 line-clamp-2">
                  {(sessionData ? (isPromptEditable ? sessionData[selectedAgent]?.prompt: sessionData[selectedAgent]?.basePrompt) : "") || "No system prompt set"}
                </div>
              )}

              {/* Expanded View */}
              <CollapsibleContent className="space-y-2">
                {isEditingPrompt && isPromptEditable ? (
                  <Textarea
                    value={tempPrompt}
                    onChange={(e) =>
                      setTempPrompt(e.target.value)
                    }
                    className="min-h-[200px] text-xs font-mono border-zinc-200 focus-visible:ring-zinc-400"
                    placeholder="Enter system prompt..."
                  />
                ) : (
                  <ScrollArea className="h-[200px] w-full">
                    <div className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-3 whitespace-pre-wrap font-mono">
                      {(sessionData ? (isPromptEditable ? sessionData[selectedAgent]?.prompt: sessionData[selectedAgent]?.basePrompt) : "") || "No system prompt set"}
                    </div>
                  </ScrollArea>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Full Prompt Dialog */}
        <Dialog
          open={showPromptDialog}
          onOpenChange={setShowPromptDialog}
        >
          <DialogContent className="max-w-6xl-important max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {version} - System Prompt
              </DialogTitle>
              <DialogDescription>
                {!isPromptEditable &&
                  "Base truth prompt (read-only)"}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] w-full">
              <div className="text-sm text-zinc-700 bg-zinc-50 border rounded-md p-4 whitespace-pre-wrap font-mono">
                {(sessionData ? (isPromptEditable ? sessionData[selectedAgent]?.prompt: sessionData[selectedAgent]?.basePrompt) : "") || "No system prompt set"}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 overflow-scroll">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-400 mt-12">
              <p className="text-sm">Start a conversation with the AI agent</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      message.role === "system"
                        ? "max-w-[85%] rounded-lg px-4 py-3 bg-amber-50 border border-amber-200 text-zinc-700"
                        : `max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-blue-50 text-zinc-800"
                              : "bg-zinc-100 text-zinc-800"
                          }`
                    }`}
                  >
                    {/* Message header */}
                    {message.role === "user" && (
                      <div className="mb-2">
                        <span className="text-xs text-zinc-500">
                          You
                        </span>
                      </div>
                    )}
                    {message.role === "assistant" && (
                      <div className="mb-2">
                        <span className="text-xs text-zinc-500">
                          {message.author || "AI"}
                        </span>
                      </div>
                    )}
                    {message.role === "system" && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <StickyNote className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs text-amber-700">
                          {message.author === "user"
                            ? "You"
                            : message.author}{" "}
                          (Internal Note)
                        </span>
                      </div>
                    )}

                    {/* Files */}
                    {message.files &&
                      message.files.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.files.map((file) => (
                            <div
                              key={file.id}
                              className={`flex items-center gap-3 p-2 rounded-lg ${
                                message.role === "user"
                                  ? "bg-blue-100"
                                  : message.role === "system"
                                    ? "bg-amber-100"
                                    : "bg-zinc-200"
                              }`}
                            >
                              {file.type.startsWith("image/") ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="h-16 w-16 object-cover rounded"
                                />
                              ) : (
                                <div
                                  className={
                                    message.role === "user"
                                      ? "text-blue-700"
                                      : "text-zinc-700"
                                  }
                                >
                                  {getFileIcon(file.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs truncate font-medium">
                                  {file.name}
                                </div>
                                <div
                                  className={`text-xs ${
                                    message.role === "user"
                                      ? "text-blue-600"
                                      : "text-zinc-500"
                                  }`}
                                >
                                  {formatFileSize(file.size)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Message content */}
                    {message.content && (
                      <div
                        className={`text-sm whitespace-pre-wrap leading-relaxed ${message.role === "system" ? "italic" : ""}`}
                      >
                        {message.content}
                      </div>
                    )}

                    <div
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-zinc-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} style={{'height': '77px'}}/>
            </>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input - Only show if not hidden */}
      {!hideInput && (
        <div className="p-4 border-t">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-zinc-100 rounded-md p-2 pr-1 max-w-[200px]"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="text-zinc-600">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Message Type Toggle */}
          {isInternalNote && (
            <div className="mb-2 flex items-center gap-2 px-2 py-1.5 bg-zinc-100 border-l-2 border-zinc-400 rounded-sm text-xs text-zinc-600">
              <StickyNote className="h-3.5 w-3.5" />
              <span>Composing internal note</span>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.json"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant={isInternalNote ? "default" : "outline"}
              size="icon"
              onClick={() => setIsInternalNote(!isInternalNote)}
              disabled={isLoading}
              title={
                isInternalNote
                  ? "Switch to regular message"
                  : "Switch to internal note"
              }
              className={
                isInternalNote
                  ? "bg-zinc-600 hover:bg-zinc-700"
                  : ""
              }
            >
              <StickyNote className="h-4 w-4" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isInternalNote
                  ? "Type your internal note..."
                  : "Type your message..."
              }
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={
                (!inputValue.trim() &&
                  attachedFiles.length === 0) ||
                isLoading
              }
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}