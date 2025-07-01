import { Enums, Tables } from "./supabase";

export type UserRoleType = Enums<"role_type">;

export type MessageType = Enums<"message_type">;

export type SearchParamsType = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type MessageContentType = Omit<Tables<'messages'>, 'conversation_id'>;