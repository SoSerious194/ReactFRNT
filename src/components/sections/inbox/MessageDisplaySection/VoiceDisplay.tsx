import { Play, Pause, Volume2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { MessageContentType } from "../MessageSection/MessageSection";
import { Slider } from "@/components/ui/slider";

const VoiceDisplay = ({ error, loading, fileUrl, message }: { error: string | null; loading: boolean; fileUrl: string | null; message: MessageContentType }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudioPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && value.length > 0) {
      const newTime = value[0];
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [fileUrl]);

  return (
    <div className="min-w-[320px] max-w-md">
      <div className={`flex items-center space-x-3 p-3  bg-white border border-gray-200 rounded-xl  `}>
        {loading ? (
          <VoiceDisplaySkeleton />
        ) : error ? (
          <>
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <Volume2 className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Audio Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </>
        ) : (
          <>
            {/* Play/Pause Button */}
            <button
              onClick={toggleAudioPlayback}
              disabled={!fileUrl}
              className={`flex  cursor-pointer items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                !fileUrl
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isPlaying
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">Voice Message</span>
                {duration > 0 && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{isPlaying ? formatTime(currentTime) : formatTime(duration - currentTime)}</span>}
              </div>

              {/* Progress Section */}
              {fileUrl && (
                <div className="space-y-2 mb-2">
                  <Slider value={[currentTime]} onValueChange={handleSliderChange} max={duration || 100} min={0} step={0.1} className="w-full cursor-pointer" />
                </div>
              )}
            </div>

            {/* Hidden Audio Element */}
            {fileUrl && <audio ref={audioRef} id={`audio-${message.id}`} src={fileUrl} preload="metadata" />}
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceDisplay;

const VoiceDisplaySkeleton = () => {
  return (
    <div className="flex items-center space-x-3 w-full animate-pulse">
      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-12 h-4 bg-gray-200 rounded" />
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
};
