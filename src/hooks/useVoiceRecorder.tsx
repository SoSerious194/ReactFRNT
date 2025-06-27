import { useState, useEffect, useCallback, useRef } from "react";

export type RecordingState = "inactive" | "recording" | "paused" | "processing";

interface VoiceRecorderReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
  audioURL: string | null;
  duration: number; 
  hasMicrophonePermission: boolean | null;
  isSupported: boolean;
  audioBlob: Blob | null;
}

export const useVoiceRecorder = (): VoiceRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>("inactive");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  // Check browser support and permissions
  useEffect(() => {
    const checkSupport = (): boolean => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };

    const supported = checkSupport();
    setIsSupported(supported);

    if (!supported) {
      console.error("Browser doesn't support audio recording");
    }

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [audioURL]);

  // Update timer while recording
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    startTimeRef.current = Date.now() - pausedDurationRef.current * 1000;

    timerRef.current = window.setInterval(() => {
      const seconds = (Date.now() - startTimeRef.current) / 1000;
      setDuration(seconds);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      pausedDurationRef.current = duration;
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [duration]);

  // Request microphone permissions and start recording
  const requestPermissionAndStream = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setHasMicrophonePermission(true);
      return stream;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setHasMicrophonePermission(false);
      throw err;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) return;

    try {
      setRecordingState("recording");
      audioChunksRef.current = [];

      if (!streamRef.current) {
        streamRef.current = await requestPermissionAndStream();
      }

      if (!(streamRef.current instanceof MediaStream)) {
        throw new Error("Invalid MediaStream object");
      }

      // Safari-compatible configuration
      let options: MediaRecorderOptions = {
        audioBitsPerSecond: 128000,
      };

      // Try different MIME types for better browser compatibility
      const mimeTypes = ["audio/wav", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"];

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options.mimeType = mimeType;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      let chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (chunks.length === 0) return;

        try {
          // For Safari, convert to WAV format
          const mimeType = "audio/wav";
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

          // Combine chunks into a single blob
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });

          // Convert blob to array buffer
          const arrayBuffer = await blob.arrayBuffer();

          // Decode audio data
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create WAV blob
          const wavBlob = await convertToWav(audioBuffer);

          const url = URL.createObjectURL(wavBlob);
          setAudioBlob(wavBlob);
          setAudioURL(url);

          // Clear the chunks
          chunks = [];
        } catch (error) {
          console.error("Error processing audio:", error);
          // Fallback to original format if conversion fails
          const fallbackBlob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/wav" });
          const url = URL.createObjectURL(fallbackBlob);
          setAudioBlob(fallbackBlob);
          setAudioURL(url);
        }
      };

      // Use smaller timeslice for more frequent chunks in Safari
      mediaRecorder.start(100);

      startTimer();
      pausedDurationRef.current = 0;
      setDuration(0);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setRecordingState("inactive");
    }
  }, [isSupported, requestPermissionAndStream, startTimer]);

  const pauseRecording = useCallback(async () => {
    if (recordingState !== "recording") return;

    try {
      // Web: Use MediaRecorder pause
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.pause();
        setRecordingState("paused");
        stopTimer();
      }
    } catch (error) {
      console.error("Error pausing recording:", error);
    }
  }, [recordingState, stopTimer]);

  const resumeRecording = useCallback(async () => {
    if (recordingState !== "paused") return;

    try {
      // Web: normal resume if supported, else restart MediaRecorder
      if (!mediaRecorderRef.current?.resume) {
        if (streamRef.current) {
          const mediaRecorder = new MediaRecorder(streamRef.current);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.start(100);
        } else {
          await startRecording();
          return;
        }
      } else {
        mediaRecorderRef.current.resume();
      }

      setRecordingState("recording");
      startTimer();
    } catch (error) {
      console.error("Error resuming recording:", error);
    }
  }, [recordingState, startTimer, startRecording]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (["inactive", "processing"].includes(recordingState)) {
      return null;
    }

    stopTimer();
    setRecordingState("inactive");

    try {
      // Web implementation
      return new Promise((resolve) => {
        if (!mediaRecorderRef.current) {
          resolve(null);
          return;
        }

        const originalOnStop = mediaRecorderRef.current.onstop;
        mediaRecorderRef.current.onstop = (event) => {
          if (originalOnStop && mediaRecorderRef.current) {
            originalOnStop.call(mediaRecorderRef.current, event);
          }

          if (audioChunksRef.current.length === 0) {
            resolve(null);
            return;
          }

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          resolve(audioBlob);
        };

        mediaRecorderRef.current.stop();

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      return null;
    }
  }, [recordingState, stopTimer]);

  const resetRecording = useCallback(async () => {
    // Revoke old audio URL
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    // Stop web media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset recording state
    setAudioURL(null);
    setAudioBlob(null);
    setDuration(0);
    setRecordingState("inactive");
    pausedDurationRef.current = 0;

    // Clear any recorded chunks
    audioChunksRef.current = [];
  }, [audioURL]);

  // Helper function to convert AudioBuffer to WAV format
  const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChannels, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, length, true);

    // Write audio data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < audioBuffer.length) {
      for (let i = 0; i < numOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][pos]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(44 + offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  // Helper function to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return {
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
  };
};
