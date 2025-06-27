import { PaperclipIcon } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendIcon } from 'lucide-react';
import { Dispatch,  RefObject, SetStateAction, useCallback, useState } from 'react';
import { sendMessage } from '@/app/inbox/action';
import { MessageType } from '../MessageSection/MessageSection';

interface MessageInputSectionProps {
  isLoadingAny: boolean;
  userId: string;
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  shouldScrollToBottom: RefObject<boolean>;
  conversationId: string;
  isNearBottom: boolean;
}
export function MessageInputSection({ isLoadingAny, userId, setMessages, shouldScrollToBottom, conversationId, isNearBottom }: MessageInputSectionProps) {

  const [newMessage, setNewMessage] = useState("");
  const canSendMessage = newMessage.trim().length > 0;

  const handleSend = useCallback(async () => {
    if (!canSendMessage) return;

    const messageContent = newMessage.trim();
    const optimisticMessage: MessageType = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      content: messageContent,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    if (isNearBottom) {
      shouldScrollToBottom.current = true;
    }

    try {
      const { success, message } = await sendMessage(conversationId, messageContent);

      if (!success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
        setNewMessage(messageContent); // Restore message
        throw new Error(message || "Failed to send message");
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    }
  }, [canSendMessage, newMessage, userId, isNearBottom, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <footer className="p-6 bg-white border-t pb-24">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="h-10 w-[30px] mr-4" aria-label="Attach file">
          <PaperclipIcon className="h-4 w-3.5" />
        </Button>
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
        <Button size="icon" className="h-12 w-10 ml-4 bg-green-500 hover:bg-green-600 disabled:opacity-50" onClick={handleSend} disabled={!canSendMessage || isLoadingAny} aria-label="Send message">
          <SendIcon className="h-4 w-4 text-white" />
        </Button>
      </div>
    </footer>
  );
};

export default MessageInputSection