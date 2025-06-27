import { PaperclipIcon, MicIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dispatch, RefObject, SetStateAction, useCallback, useState } from "react";
import { sendMessage } from "@/app/inbox/action";
import { MessageContentType } from "../MessageSection/MessageSection";
import { VoiceMessageInput } from "./MessageVoiceSend";
import MessageFileUploadSection from "./MessageFileUploadSection";

interface MessageInputSectionProps {
  isLoadingAny: boolean;
  userId: string;
  setMessages: Dispatch<SetStateAction<MessageContentType[]>>;
  shouldScrollToBottom: RefObject<boolean>;
  conversationId: string;
  isNearBottom: boolean;
}

export function MessageInputSection({ isLoadingAny, userId, setMessages, shouldScrollToBottom, conversationId, isNearBottom }: MessageInputSectionProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  const canSendMessage = newMessage.trim().length > 0;

  // Handle text message sending
  const handleSendText = useCallback(async () => {
    if (!canSendMessage) return;

    const messageContent = newMessage.trim();
    const optimisticMessage: MessageContentType = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      message_type: "text",
      content: messageContent,
      file_path: null,
      file_name: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    if (isNearBottom) {
      shouldScrollToBottom.current = true;
    }

    try {
      


      const { success, message } = await sendMessage(conversationId, messageContent);

      if (!success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
        setNewMessage(messageContent);
        throw new Error(message || "Failed to send message");
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    }
  }, [canSendMessage, newMessage, userId, isNearBottom, conversationId, setMessages, shouldScrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Switch to voice mode
  const handleVoiceModeToggle = useCallback(() => {
    setIsVoiceMode(true);
    setNewMessage("");
  }, []);

  // Exit voice mode
  const handleExitVoiceMode = useCallback(() => {
    setIsVoiceMode(false);
  }, []);

  // Render voice recording interface
  if (isVoiceMode) {
    return (
      <VoiceMessageInput
        isLoadingAny={isLoadingAny}
        userId={userId}
        setMessages={setMessages}
        conversationId={conversationId}
        isNearBottom={isNearBottom}
        shouldScrollToBottom={shouldScrollToBottom}
        onExitVoiceMode={handleExitVoiceMode}
      />
    );
  }

  // Render text input interface
  return (
    <footer className="p-6 bg-white border-t pb-24">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => setIsFileUploadOpen(true)} size="icon" className="h-10 w-[30px] mr-4" aria-label="Attach file">
          <PaperclipIcon className="h-4 w-3.5" />
        </Button>

        <MessageFileUploadSection open={isFileUploadOpen} onClose={() => setIsFileUploadOpen(false)} isLoadingAny={isLoadingAny} conversationId={conversationId} userId={userId} setMessages={setMessages} shouldScrollToBottom={shouldScrollToBottom} isNearBottom={isNearBottom}  />

        <div className="flex-1">
          <Input
            type="text"
            className="h-[50px] border-gray-300"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoadingAny}
          />
        </div>

        {/* Voice recording toggle button */}
        <Button variant="ghost" size="icon" className="h-10 w-[30px] mx-2" onClick={handleVoiceModeToggle} disabled={isLoadingAny} aria-label="Record voice message">
          <MicIcon className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          className="h-12 w-10 ml-2 bg-green-500 hover:bg-green-600 disabled:opacity-50"
          onClick={handleSendText}
          disabled={!canSendMessage || isLoadingAny}
          aria-label="Send message"
        >
          <SendIcon className="h-4 w-4 text-white" />
        </Button>
      </div>
    </footer>
  );
}

export default MessageInputSection;
