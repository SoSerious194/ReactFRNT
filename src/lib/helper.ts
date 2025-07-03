import { v4 as uuidv4 } from "uuid";

export const getFileName = (file?: File) => {
  const uniqueId = uuidv4();

  if (!file) return { fileName: uniqueId, uniqueId };

  const extension = file.name.split(".").pop();
  const fileName = file.name.split(".").slice(0, -1).join(".").split(" ").join("-");

  return {
    fileName: `${fileName}.${extension}`,
    uniqueId: `${uniqueId}.${extension}`,
  };
};

export const formatMessageTime = (timestamp: string): string => {
  return new Date(timestamp)
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};
