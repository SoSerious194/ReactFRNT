import { MessageType, UserRoleType } from "@/types";

export const USER_ROLES: Record<string, UserRoleType> = {
  CLIENT: 'Client' ,
  COACH: 'Coach',
} as const;


export const BUCKET_NAMES = {
  CONVERSATION_FILES: "conversation-files",
  CONVERSATION_VOICE: "conversation-voice",
  CONVERSATION_IMAGES: "conversation-images",
  CONVERSATION_VIDEO: "conversation-video",
} as const;


export const MESSAGE_TYPES: Record<string, MessageType> = {
  IMAGE: "image",
  VOICE: "voice",
  VIDEO: "video",
  FILE: "file",
  TEXT: "text",
} as const;




