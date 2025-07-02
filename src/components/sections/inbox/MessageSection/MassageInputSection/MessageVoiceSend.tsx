import { Mic, Square, Play, Pause, Trash2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useCallback, useState, useEffect } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { uploadFile } from "@/lib/upload";
import { BUCKET_NAMES } from "@/lib/constant";
import { getFileName } from "@/lib/helper";
import { sendVoiceMessage } from "@/app/inbox/@messages/action";
import { MessageContentType } from "@/types";

interface VoiceMessageInputProps {
  isLoadingAny: boolean;
  userId: string;
  setMessages: Dispatch<SetStateAction<MessageContentType[]>>;
  conversationId: string;
  isNearBottom: boolean;
  shouldScrollToBottom: React.RefObject<boolean>;
  onExitVoiceMode: () => void;
}

export function VoiceMessageInput({
  isLoadingAny,
  userId,
  setMessages,
  conversationId,
  isNearBottom,
  shouldScrollToBottom,
  onExitVoiceMode,
}: VoiceMessageInputProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioPreviewElement, setAudioPreviewElement] = useState<HTMLAudioElement | null>(null);
  const [waveformBars] = useState(Array.from({ length: 20 }, () => Math.random()));

  const {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    audioURL,
    duration,
    hasMicrophonePermission,
    isSupported,
    audioBlob,
  } = useVoiceRecorder();

  const canSendVoice = audioBlob !== null && recordingState === "inactive";

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle voice message sending
  const handleSendVoice = useCallback(async () => {
    if (!canSendVoice || !audioBlob) return;

    const fileName = `voice_${getFileName()}.webm`;
    const filePath = `${conversationId}/${fileName}`;

    const optimisticMessage: MessageContentType = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      message_type: "voice",
      file_path: filePath,
      file_name: fileName,
      content: `🎵 Voice message (${formatDuration(duration)})`,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    onExitVoiceMode();

    if (isNearBottom) {
      shouldScrollToBottom.current = true;
    }

    try {
      const uploadResult = await uploadFile(audioBlob, filePath, BUCKET_NAMES.CONVERSATION_VOICE);

      if (uploadResult.success) {
        const result = await sendVoiceMessage(conversationId, filePath, fileName);
        if (!result.success) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
          throw new Error("Failed to send voice message");
        }
      }

      resetRecording();
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    }
  }, [
    canSendVoice,
    audioBlob,
    userId,
    duration,
    isNearBottom,
    conversationId,
    setMessages,
    shouldScrollToBottom,
    resetRecording,
    onExitVoiceMode,
  ]);

  // Handle voice recording controls
  const handleVoiceRecord = useCallback(async () => {
    switch (recordingState) {
      case "inactive":
        await startRecording();
        break;
      case "recording":
        pauseRecording();
        break;
      case "paused":
        await resumeRecording();
        break;
    }
  }, [recordingState, startRecording, pauseRecording, resumeRecording]);

  const handleStopRecording = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  const handleDiscardRecording = useCallback(() => {
    resetRecording();
    setIsPlayingPreview(false);
    if (audioPreviewElement) {
      audioPreviewElement.pause();
      audioPreviewElement.currentTime = 0;
    }
    onExitVoiceMode();
  }, [resetRecording, audioPreviewElement, onExitVoiceMode]);

  const handlePlayPreview = useCallback(() => {
    if (!audioURL) return;

    if (!audioPreviewElement) {
      const audio = new Audio(audioURL);
      setAudioPreviewElement(audio);
      audio.onended = () => setIsPlayingPreview(false);
      audio.onerror = () => setIsPlayingPreview(false);
      audio.play();
      setIsPlayingPreview(true);
    } else {
      if (isPlayingPreview) {
        audioPreviewElement.pause();
        setIsPlayingPreview(false);
      } else {
        audioPreviewElement.play();
        setIsPlayingPreview(true);
      }
    }
  }, [audioURL, audioPreviewElement, isPlayingPreview]);

  useEffect(() => {
    return () => {
      if (audioPreviewElement) {
        audioPreviewElement.pause();
        audioPreviewElement.src = "";
      }
    };
  }, [audioPreviewElement]);

  const getStatusMessage = () => {
    if (recordingState === "inactive" && !audioBlob) return "Tap to record";
    if (recordingState === "recording") return "Recording...";
    if (recordingState === "paused") return "Paused";
    if (recordingState === "inactive" && audioBlob) return "Ready to send";
    return "";
  };

  const getStatusColor = () => {
    if (recordingState === "recording") return "text-red-600";
    if (recordingState === "paused") return "text-amber-600";
    if (audioBlob) return "text-green-600";
    return "text-slate-600";
  };

  return (
    <div className="bg-white border-t border-slate-200 shadow-sm">
      {/* Compact Main Content */}
      <div className="px-4 py-4">
        {/* Status and Duration Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                recordingState === "recording"
                  ? "bg-red-500 animate-pulse"
                  : recordingState === "paused"
                  ? "bg-amber-500"
                  : audioBlob
                  ? "bg-green-500"
                  : "bg-slate-400"
              }`}
            />
            <span className={`text-sm ${getStatusColor()}`}>{getStatusMessage()}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
              {formatDuration(duration)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscardRecording}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Compact Waveform */}
        <div className="flex items-center justify-center space-x-1 mb-4 h-8">
          {waveformBars.slice(0, 30).map((height, index) => (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-200 ${
                recordingState === "recording" ? "bg-red-500 animate-pulse" : audioBlob ? "bg-green-500" : "bg-slate-300"
              }`}
              style={{
                height: `${recordingState === "recording" ? Math.random() * 20 + 6 : height * 15 + 6}px`,
                animationDelay: `${index * 50}ms`,
              }}
            />
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {/* Delete Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDiscardRecording}
            disabled={isLoadingAny}
            className="h-10 w-10 rounded-full border-red-200 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Main Record Button */}
          {!audioBlob && (
            <Button
              size="icon"
              className={`h-14 w-14 rounded-full transition-all duration-200 ${
                recordingState === "recording"
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={handleVoiceRecord}
              disabled={isLoadingAny}
            >
              {recordingState === "recording" ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>
          )}

          {/* Stop Button */}
          {(recordingState === "recording" || recordingState === "paused") && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleStopRecording}
              disabled={isLoadingAny}
              className="h-10 w-10 rounded-full border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}

          {/* Preview Button */}
          {audioBlob && (
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPreview}
              disabled={isLoadingAny}
              className={`h-10 w-10 rounded-full transition-all duration-200 ${
                isPlayingPreview
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isPlayingPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}

          {/* Send Button */}
          {audioBlob && (
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
              onClick={handleSendVoice}
              disabled={!canSendVoice || isLoadingAny}
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceMessageInput;
