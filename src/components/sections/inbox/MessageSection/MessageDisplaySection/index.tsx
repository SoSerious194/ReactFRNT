import { Card } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { FileText, Download, Image as ImageIcon, Video, Mic, Play, Pause, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BUCKET_NAMES } from "@/lib/constant";
import { MessageContentType } from "../MessageSection/MessageSection";
import VoiceDisplay from "./VoiceDisplay";
import FileDisplay from "./FileDisplay";
import VideoDisplay from "./VideoDisplay";
import ImageDisplay from "./ImageDisplay";

interface MessageDisplaySectionProps {
  message: MessageContentType;
  isMe: boolean;
  isOptimistic: boolean;
}



const MessageDisplaySection = ({ message, isMe, isOptimistic }: MessageDisplaySectionProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate signed URL for files
  useEffect(() => {
    const getSignedUrl = async () => {
      if (!message.file_path || message.message_type === "text" || message.id.startsWith("temp-")) return;

      setLoading(true);
      setError(null);

      try {
        let bucketName = "";
        if (message.message_type === "voice") {
          bucketName = BUCKET_NAMES.CONVERSATION_VOICE;
        } else if (message.message_type === "image") {
          bucketName = BUCKET_NAMES.CONVERSATION_IMAGES;
        } else if (message.message_type === "file") {
          bucketName = BUCKET_NAMES.CONVERSATION_FILES;
        } else if (message.message_type === "video") {
          bucketName = BUCKET_NAMES.CONVERSATION_VIDEO;
        } else {
          bucketName = BUCKET_NAMES.CONVERSATION_FILES;
        }

        const supabase = createClient();
        const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(message.file_path, 3600);

        if (error) throw error;
        setFileUrl(data.signedUrl);
      } catch (err) {
        console.error("Error getting signed URL:", err);
        setError("Failed to load file");
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [message.file_path, message.message_type]);

  const renderMessageContent = () => {
    switch (message.message_type) {
      case "text":
        return <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;

      case "image":
        return <ImageDisplay loading={loading || isOptimistic} error={error} fileUrl={fileUrl} />;

      case "video":
        return <VideoDisplay loading={loading || isOptimistic} error={error} fileUrl={fileUrl} />;

      case "voice":
        return <VoiceDisplay message={message} loading={loading || isOptimistic} error={error} fileUrl={fileUrl} />;

      case "file":
        return <FileDisplay message={message} loading={loading || isOptimistic} error={error} fileUrl={fileUrl} />;

      default:
        return <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  if (message.message_type !== "text") {
    return (
      <Card
        className={`
          relative
          max-w-[70%] 
          sm:max-w-[448px]   
          border-0 
          shadow-sm 
          rounded-2xl 
          ${isOptimistic || loading ? "opacity-70" : ""}
        `}
      >
        {renderMessageContent()}
      </Card>
    );
  }

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
        ${isOptimistic || loading ? "opacity-70" : ""}
      `}
    >
      {renderMessageContent()}
    </Card>
  );
};

export default MessageDisplaySection;
