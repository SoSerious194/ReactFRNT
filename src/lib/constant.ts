import { UserRoleType } from "@/types";

export const USER_ROLES: Record<string, UserRoleType> = {
  CLIENT: 'Client' ,
  COACH: 'Coach',
} as const;


export const BUCKET_NAMES = {
  CONVERSATION_FILES: "conversation-files",
  CONVERSATION_VOICE: "conversation-voice",
  CONVERSATION_IMAGES: "conversation-images",
} as const;




