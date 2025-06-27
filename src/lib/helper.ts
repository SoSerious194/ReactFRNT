import { v4 as uuidv4 } from "uuid";

export const getFileName = (file?: File) => {
    const uniqueId = uuidv4();


  if (!file) return uniqueId;

  
  const extension = file.name.split(".").pop();
  const fileName = file.name.split(".").slice(0, -1).join(".");

  return `${fileName}-${uniqueId}.${extension}`;
};

