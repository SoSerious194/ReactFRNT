import { Card } from "@/components/ui/card";
import React from "react";
import { MessageType } from "./MessageSection";

const MessageDisplaySection = ({ message, isMe, isOptimistic }: { message: MessageType; isMe: boolean; isOptimistic: boolean }) => {
  return (
    <Card
      className={`
        relative
        p-4 
        max-w-[70%] 
        sm:max-w-[448px] 
        border-0 
        shadow-sm 
        rounded-2xl 
        break-words 
        hyphens-auto
        ${isMe ? "bg-green-500 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"}
        ${isOptimistic ? "opacity-70" : ""}
      `}
    >
      <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

      {/* Optimistic message indicator */}
      {isOptimistic && <div className="absolute -bottom-6 right-0 text-xs text-gray-400">Sending...</div>}
    </Card>
  );
};

export default MessageDisplaySection;
