import { Download } from "lucide-react";
import { FileText } from "lucide-react";
import React from "react";
import { MessageContentType } from "@/types";

const FileDisplay = ({ message, loading, error, fileUrl }: { message: MessageContentType; loading: boolean; error: string | null; fileUrl: string | null }) => {
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

  return (
    <div className="space-y-2">
      <div className={`flex items-center space-x-3 p-3  bg-white border border-gray-200 rounded-xl  `}>
        {loading ? (
          <FileDisplaySkeleton />
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <FileText className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{message.file_name}</p>
              <p className="text-xs text-gray-500">File attachment</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex cursor-pointer items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              disabled={!fileUrl}
            >
              <Download className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDisplay;

const FileDisplaySkeleton = () => {
  return (
    <div className="space-y-2 min-w-[300px]">
      <div className="flex items-center space-x-3  bg-gray-50 rounded-lg">
        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 animate-pulse"></div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
