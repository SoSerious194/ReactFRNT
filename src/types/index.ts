import {  Enums } from "./supabase";

export type UserRoleType = Enums<'role_type'>;


export type SearchParamsType = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};