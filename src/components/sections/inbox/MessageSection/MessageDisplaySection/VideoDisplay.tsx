import { Video } from "lucide-react";
import React from "react";

const VideoDisplay = ({ loading, error, fileUrl }: { loading: boolean; error: string | null; fileUrl: string | null }) => {
  return (
    <div className="space-y-2">
      <div className={`flex items-center space-x-3  bg-white border border-gray-200 rounded-xl  `}>
        {loading ? (
          <VideoDisplaySkeleton />
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
};

export default VideoDisplay;

const VideoDisplaySkeleton = () => (
  <div className="space-y-2 min-w-[300px]">
    <div className="relative">
      <div className="flex items-center justify-center w-full min-h-[250px] bg-gray-200 rounded-lg animate-pulse">
        <div className="flex flex-col items-center space-y-2">
          <Video className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
);
