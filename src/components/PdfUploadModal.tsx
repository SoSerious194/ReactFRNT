"use client";

import React, { useState, useCallback } from "react";
import { UploadIcon, XIcon, FileIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcessedWorkout, PdfUploadState } from "@/types/workoutImport";

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutProcessed: (workoutData: ProcessedWorkout) => void;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onWorkoutProcessed,
}) => {
  const [uploadState, setUploadState] = useState<PdfUploadState>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    // For now, we'll use a simple approach - send the file to our API
    // and let the server handle PDF parsing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error("Failed to read file"));
            return;
          }

          // Convert to base64 for sending to API
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64 = btoa(String.fromCharCode(...uint8Array));

          resolve(base64);
        } catch (error) {
          console.error("Error reading file:", error);
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const processWorkoutPdf = async (pdfBase64: string) => {
    try {
      setUploadState("processing");
      setProgress(50);

      const response = await fetch("/api/process-workout-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfBase64 }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process PDF");
      }

      if (!result.success) {
        throw new Error(result.error || "Processing failed");
      }

      setProgress(100);

      // Transform the API response to our ProcessedWorkout format
      const processedWorkout: ProcessedWorkout = {
        metadata: result.data.metadata,
        blocks: result.data.blocks,
        unmatchedExercises: [], // Will be populated in exercise matching step
      };

      onWorkoutProcessed(processedWorkout);
      setUploadState("idle");
      setProgress(0);
      setError(null);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process PDF"
      );
      setUploadState("error");
      setProgress(0);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setUploadState("uploading");
    setError(null);
    setProgress(25);

    try {
      const pdfText = await extractTextFromPdf(file);
      setProgress(50);

      await processWorkoutPdf(pdfText);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
      setUploadState("error");
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const resetState = () => {
    setUploadState("idle");
    setDragActive(false);
    setError(null);
    setProgress(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Import Workout from PDF
            <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
              ✨ AI-Powered
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* AI Feature Description */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-purple-600 text-sm">🤖</span>
            <div className="text-sm text-purple-700">
              <p className="font-medium">AI-Powered Workout Extraction</p>
              <p className="text-purple-600 mt-1">
                Our AI intelligently extracts exercises, sets, reps, and timing from your PDF to automatically structure your workout.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${
              uploadState === "uploading" || uploadState === "processing"
                ? "pointer-events-none opacity-50"
                : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={
                uploadState === "uploading" || uploadState === "processing"
              }
            />

            <div className="text-center">
              {uploadState === "uploading" || uploadState === "processing" ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-600">
                    {uploadState === "uploading"
                      ? "Uploading PDF..."
                      : "🤖 AI is analyzing your workout..."}
                  </p>
                  {progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <UploadIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Drop your PDF here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircleIcon className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              • Upload Everfit PDF workouts to automatically create workouts
            </p>
            <p>• AI will analyze the workout structure and exercises</p>
            <p>• You'll be able to match exercises with your library</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {uploadState === "error" && (
              <Button onClick={() => resetState()}>Try Again</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
