import React, { useRef, useState, useEffect, RefObject, SetStateAction, Dispatch } from "react";
import { FileText, X, Upload, Image, Volume2, Video, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { getFileName } from "@/lib/helper";
import { uploadFiles } from "@/lib/upload";
import { BUCKET_NAMES, MESSAGE_TYPES } from "@/lib/constant";
import { sendMediaMessage } from "@/app/inbox/@messages/action";
import { MessageContentType } from "@/types";

// File type configurations with icons
const ACCEPTED_FILE_TYPES = {
  documents: {
    types: ".pdf,.doc,.docx,.txt",
    icon: FileText,
    label: "Documents",
    color: "text-blue-600",
  },
  images: {
    types: ".jpg,.jpeg,.png,.gif,.webp,.svg",
    icon: Image,
    label: "Images",
    color: "text-purple-600",
  },
  audio: {
    types: ".mp3,.wav,.ogg,.m4a,.aac",
    icon: Volume2,
    label: "Audio",
    color: "text-orange-600",
  },
  video: {
    types: ".mp4,.avi,.mov,.wmv,.flv,.webm",
    icon: Video,
    label: "Video",
    color: "text-red-600",
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  isLoadingAny: boolean;
  conversationId: string;
  userId: string;
  setMessages: Dispatch<SetStateAction<MessageContentType[]>>;
  shouldScrollToBottom: RefObject<boolean>;
  isNearBottom: boolean;
}

interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
  isLoadingAny,
  conversationId,
  userId,
  setMessages,
  shouldScrollToBottom,
  isNearBottom,
}) => {
  const [activeTab, setActiveTab] = useState<keyof typeof ACCEPTED_FILE_TYPES>("documents");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file instanceof File) {
          const url = URL.createObjectURL(file);
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [selectedFiles]);

  // Clear files when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
    }
  }, [open]);

  // Validate file type
  const validateFileType = (file: File, category: keyof typeof ACCEPTED_FILE_TYPES): boolean => {
    const allowedTypes = ACCEPTED_FILE_TYPES[category].types.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  // Validate file size
  const validateFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  };

  // Comprehensive file validation
  const validateFiles = (files: File[]): FileValidationResult => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Check file type
      if (!validateFileType(file, activeTab)) {
        errors.push(`"${file.name}" is not a supported ${activeTab} file type.`);
        return;
      }

      // Check file size
      if (!validateFileSize(file)) {
        errors.push(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      // Check for duplicates
      const isDuplicate = selectedFiles.some(
        (existingFile) => existingFile.name === file.name && existingFile.size === file.size
      );
      if (isDuplicate) {
        errors.push(`"${file.name}" is already selected.`);
        return;
      }

      validFiles.push(file);
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file selection with validation
  const handleFileSelection = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validation = validateFiles(fileArray);

    const { length: errorCount } = validation.errors;

    if (errorCount > 0) {
      toast.error(
        errorCount === 1
          ? "The selected file exceeds the 5 MB size limit."
          : `${errorCount} files exceed the 5 MB size limit.`
      );
    }
    // Add only valid files
    const validFiles = fileArray.filter(
      (file) =>
        validateFileType(file, activeTab) &&
        validateFileSize(file) &&
        !selectedFiles.some((existing) => existing.name === file.name && existing.size === file.size)
    );

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file${validFiles.length !== 1 ? "s" : ""} added successfully`);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelection(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    const fileName = selectedFiles[index].name;
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success(`"${fileName}" removed`);
  };

  // Handle tab change
  const handleTabChange = (tab: keyof typeof ACCEPTED_FILE_TYPES) => {
    setActiveTab(tab);
    setSelectedFiles([]); // Clear files when switching tabs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle submit with better error handling
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    // Check for oversized files
    const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the 5MB limit: ${oversizedFiles.map((f) => f.name).join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      let bucketName;
      let messageType;

      if (activeTab === "images") {
        bucketName = BUCKET_NAMES.CONVERSATION_IMAGES;
        messageType = MESSAGE_TYPES.IMAGE;
      } else if (activeTab === "audio") {
        bucketName = BUCKET_NAMES.CONVERSATION_VOICE;
        messageType = MESSAGE_TYPES.VOICE;
      } else if (activeTab === "video") {
        bucketName = BUCKET_NAMES.CONVERSATION_VIDEO;
        messageType = MESSAGE_TYPES.VIDEO;
      } else if (activeTab === "documents") {
        bucketName = BUCKET_NAMES.CONVERSATION_FILES;
        messageType = MESSAGE_TYPES.FILE;
      } else {
        bucketName = BUCKET_NAMES.CONVERSATION_FILES;
        messageType = MESSAGE_TYPES.TEXT;
      }

      const files: { file: File; filePath: string; fileName: string }[] = [];
      const optimisticMessages: MessageContentType[] = [];

      for (const file of selectedFiles) {
        const { fileName, uniqueId } = getFileName(file);
        const filePath = conversationId + "/" + uniqueId;

        optimisticMessages.push({
          id: `temp-${Date.now() + Math.random()}`,
          sender_id: userId,
          message_type: messageType,
          file_path: filePath,
          file_name: fileName,
          content: "",
          created_at: new Date().toISOString(),
        });

        files.push({
          file,
          filePath,
          fileName,
        });
      }

      // Add optimistic messages
      setMessages((prev) => [...prev, ...optimisticMessages]);

      // Show upload progress toast
      toast.loading(`Uploading ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}...`, {
        id: "file-upload",
      });

      // Upload files
      const uploadedFiles = await uploadFiles(files, bucketName);

      if (!uploadedFiles.success) {
        // Remove optimistic messages if upload fails
        setMessages((prev) => prev.filter((msg) => !optimisticMessages.some((om) => om.id === msg.id)));
        toast.error(uploadedFiles.message || "Failed to upload files", { id: "file-upload" });
        return;
      }

      // Send media messages
      const sendMediaPromises = files.map((file) => {
        return sendMediaMessage(conversationId, file.filePath, file.fileName, messageType);
      });

      const results = await Promise.all(sendMediaPromises);

      // Handle results and remove optimistic messages
      const failedUploads: string[] = [];
      results.forEach((result, index) => {
        if (result.success) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessages[index]?.id));
        } else {
          failedUploads.push(files[index].fileName);
          // Remove failed optimistic message
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessages[index]?.id));
        }
      });

      if (failedUploads.length > 0) {
        toast.error(`Failed to send: ${failedUploads.join(", ")}`, { id: "file-upload" });
        return;
      }

      // Success
      toast.success(`${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""} sent successfully!`, {
        id: "file-upload",
      });
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred while uploading files. Please try again.";

      toast.error(errorMessage, { id: "file-upload" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  // Render file preview
  const renderFilePreview = (file: File, index: number) => {
    const fileUrl = URL.createObjectURL(file);
    const isOversized = file.size > MAX_FILE_SIZE;

    if (file.type.startsWith("image/")) {
      return (
        <div
          key={index}
          className={`relative group bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
            isOversized ? "border-red-300 bg-red-50" : "border-gray-200"
          }`}
        >
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={fileUrl}
              alt={file.name}
              className="w-full h-24 object-cover"
              onLoad={() => URL.revokeObjectURL(fileUrl)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
            {isOversized && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeFile(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all duration-200"
          >
            <X size={14} />
          </button>
          <div className="mt-2">
            <p className={`text-xs font-medium truncate ${isOversized ? "text-red-700" : "text-gray-800"}`}>{file.name}</p>
            <p className={`text-xs ${isOversized ? "text-red-600" : "text-gray-500"}`}>{formatFileSize(file.size)}</p>
          </div>
        </div>
      );
    }

    // For non-image files, show file icon and name
    const IconComponent = ACCEPTED_FILE_TYPES[activeTab].icon;
    return (
      <div
        key={index}
        className={`relative flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
          isOversized ? "border-red-300 bg-red-50" : "border-gray-200"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${isOversized ? "bg-red-100" : "bg-gray-50"} ${
            isOversized ? "text-red-600" : ACCEPTED_FILE_TYPES[activeTab].color
          }`}
        >
          <IconComponent size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isOversized ? "text-red-700" : "text-gray-800"}`}>{file.name}</p>
          <p className={`text-xs ${isOversized ? "text-red-600" : "text-gray-500"}`}>{formatFileSize(file.size)}</p>
        </div>
        {isOversized && <AlertCircle className="text-red-500" size={18} />}
        <button
          type="button"
          onClick={() => removeFile(index)}
          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all duration-200"
        >
          <X size={18} />
        </button>
      </div>
    );
  };

  const activeConfig = ACCEPTED_FILE_TYPES[activeTab];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">Upload Files</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* File Type Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(ACCEPTED_FILE_TYPES).map(([type, config]) => {
              const IconComponent = config.icon;
              const isActive = activeTab === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTabChange(type as keyof typeof ACCEPTED_FILE_TYPES)}
                  className={`flex justify-center items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-green-400 bg-green-50 scale-105"
                : "border-gray-300 hover:border-green-400 hover:bg-green-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 transition-colors duration-200 ${
                isDragging ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Upload size={18} className={isDragging ? "text-green-600" : "text-gray-500"} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isDragging ? "Drop your files here" : "Choose files to upload"}
            </h3>
            <p className="text-sm text-gray-600 mb-1">Drag and drop files here, or click to browse</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full mb-2">
              <activeConfig.icon size={14} className={activeConfig.color} />
              <span className="text-xs font-medium text-gray-700">{activeConfig.types}</span>
            </div>
            <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES[activeTab].types}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                  <Check size={14} className="text-green-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-800">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => renderFilePreview(file, index))}
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || isSubmitting || selectedFiles.some((f) => f.size > MAX_FILE_SIZE)}
              className="px-6 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                `Send ${selectedFiles.length} File${selectedFiles.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
