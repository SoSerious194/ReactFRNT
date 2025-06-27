import { Card } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { FileText, Download, Image as ImageIcon, Video, Mic, Play, Pause, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BUCKET_NAMES } from "@/lib/constant";
import { MessageContentType } from "./MessageSection";


interface MessageDisplaySectionProps {
  message: MessageContentType;
  isMe: boolean;
  isOptimistic: boolean;
}

const MessageDisplaySection = ({ message, isMe, isOptimistic }: MessageDisplaySectionProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate signed URL for files
  useEffect(() => {
    const getSignedUrl = async () => {
      if (!message.file_path || message.message_type === "text") return;

      setLoading(true);
      setError(null);

      try {


        let bucketName = ""
        if(message.message_type === "voice"){
          bucketName = BUCKET_NAMES.CONVERSATION_VOICE
        }else if(message.message_type === "image"){
          bucketName = BUCKET_NAMES.CONVERSATION_IMAGES
        }else if(message.message_type === "file"){
          bucketName = BUCKET_NAMES.CONVERSATION_FILES
        }else if(message.message_type === "video"){
          bucketName = BUCKET_NAMES.CONVERSATION_VIDEO
        }else{
          bucketName = BUCKET_NAMES.CONVERSATION_FILES
        }


        const supabase =  createClient();
        const { data, error } = await supabase.storage
          .from(bucketName) 
          .createSignedUrl(message.file_path, 3600); 

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

  const handleDownload = async () => {
    if (!fileUrl || !message.file_name) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = message.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const toggleAudioPlayback = () => {
    const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case "text":
        return <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;

      case "image":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>}
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-lg animate-pulse">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center w-full h-48 bg-red-50 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              ) : fileUrl ? (
                <img src={fileUrl} alt={message.file_name || "Image"} className="max-w-full h-auto rounded-lg shadow-sm" loading="lazy" />
              ) : null}
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>}
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-lg animate-pulse">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center w-full h-48 bg-red-50 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              ) : fileUrl ? (
                <video src={fileUrl} controls className="max-w-full h-auto rounded-lg shadow-sm" preload="metadata">
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>
          </div>
        );

      case "voice":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : error ? (
                <div className="text-red-500 text-sm">{error}</div>
              ) : (
                <>
                  <button
                    onClick={toggleAudioPlayback}
                    className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    disabled={!fileUrl}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Voice Message</p>
                    <p className="text-xs text-gray-500">{message.file_name}</p>
                  </div>
                  <Mic className="w-5 h-5 text-gray-400" />
                  {fileUrl && <audio id={`audio-${message.id}`} src={fileUrl} onEnded={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />}
                </>
              )}
            </div>
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : error ? (
                <div className="text-red-500 text-sm">{error}</div>
              ) : (
                <>
                  <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{message.file_name}</p>
                    <p className="text-xs text-gray-500">File attachment</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                    disabled={!fileUrl}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        );

      default:
        return <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

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
      {renderMessageContent()}

      {/* Optimistic message indicator */}
      {isOptimistic && (
        <div className="absolute -bottom-6 right-0 text-xs text-gray-400 flex items-center space-x-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Sending...</span>
        </div>
      )}
    </Card>
  );
};

export default MessageDisplaySection;
