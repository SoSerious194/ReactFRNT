import { ImageIcon } from "lucide-react";
import React from "react";

const ImageDisplay = ({ loading, error, fileUrl }: { loading: boolean; error: string | null; fileUrl: string | null }) => {
  return (
    <div className="space-y-2">
      <div className={`flex items-center  bg-white border border-gray-200 rounded-xl  `}>
        {loading ? (
          <ImageDisplaySkeleton />
        ) : error ? (
          <div className="flex items-center justify-center w-full h-48 bg-red-50 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : fileUrl ? (
          <img src={fileUrl} alt={"Image"} className="max-w-full h-auto rounded-lg shadow-sm" loading="lazy" />
        ) : null}
      </div>
    </div>
  );
};

export default ImageDisplay;

const ImageDisplaySkeleton = () => {
  return (
    <div className="space-y-2 min-w-[300px] ">
      <div className="relative">
        <div className="flex items-center justify-center w-full min-h-[250px] bg-gray-200 rounded-lg animate-pulse">
          <div className="flex flex-col items-center space-y-2">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
